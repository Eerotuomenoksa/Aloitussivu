import { mkdir, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'visual-check-report');
const VITE_BIN = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');

const viewports = [
  { name: 'small-android', width: 360, height: 740 },
  { name: 'iphone', width: 390, height: 844 },
  { name: 'large-phone', width: 412, height: 915 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'small-laptop', width: 1366, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 },
];

const pages = [
  { name: 'etusivu', path: '/index.html' },
  { name: 'yllapito', path: '/ehdotukset.html' },
  { name: 'linkit', path: '/linkit.html' },
];

const uiScales = [100, 125, 150];

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
  child.on('exit', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
  });
});

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 4173;
    server.close(() => resolve(port));
  });
  server.on('error', reject);
});

const waitForServer = async (url, timeoutMs = 15000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Wait and try again.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not answer at ${url}`);
};

const startPreview = async () => {
  const port = await getFreePort();
  const child = spawn(process.execPath, [VITE_BIN, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);
  return {
    baseUrl,
    stop: () => {
      if (!child.killed) child.kill();
    },
  };
};

const collectLayoutIssues = async (page) => page.evaluate(() => {
  const tolerance = 2;
  const ignoredTags = new Set(['HTML', 'BODY', 'SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'NOSCRIPT']);

  const isVisible = (element) => {
    if (element.closest('.sr-only')) return false;
    if (element.closest('.overflow-x-auto')) return false;
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  };

  const selectorFor = (element) => {
    if (element.id) return `#${element.id}`;
    const testId = element.getAttribute('data-tour') || element.getAttribute('aria-label');
    if (testId) return `${element.tagName.toLowerCase()}[${element.getAttribute('data-tour') ? 'data-tour' : 'aria-label'}="${testId.slice(0, 40)}"]`;
    const classes = [...element.classList].slice(0, 3).join('.');
    return classes ? `${element.tagName.toLowerCase()}.${classes}` : element.tagName.toLowerCase();
  };

  const textFrom = (element) => (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  const elements = [...document.querySelectorAll('*')].filter((element) => !ignoredTags.has(element.tagName) && isVisible(element));
  const horizontalOverflow = Math.max(
    0,
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
    document.body.scrollWidth - document.body.clientWidth
  );

  const elementOverflows = elements
    .filter((element) => {
      const text = textFrom(element);
      if (!text) return false;
      const style = window.getComputedStyle(element);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') return false;
      return element.scrollWidth > element.clientWidth + tolerance || element.scrollHeight > element.clientHeight + tolerance;
    })
    .slice(0, 30)
    .map((element) => ({
      type: 'element-overflow',
      selector: selectorFor(element),
      text: textFrom(element),
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));

  const viewportOverflows = elements
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const text = textFrom(element);
      if (!text) return false;
      return rect.left < -tolerance || rect.right > window.innerWidth + tolerance;
    })
    .slice(0, 30)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        type: 'viewport-overflow',
        selector: selectorFor(element),
        text: textFrom(element),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        viewportWidth: window.innerWidth,
      };
    });

  const textOverflows = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent?.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const parent = node.parentElement;
    if (!parent || ignoredTags.has(parent.tagName) || !isVisible(parent)) continue;

    const parentRect = parent.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()];
    range.detach();

    for (const rect of rects) {
      if (
        rect.width > 0
        && rect.height > 0
        && (
          rect.left < parentRect.left - tolerance
          || rect.right > parentRect.right + tolerance
        )
      ) {
        textOverflows.push({
          type: 'text-overflow',
          selector: selectorFor(parent),
          text: text.slice(0, 120),
          textRect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
          },
          parentRect: {
            left: Math.round(parentRect.left),
            right: Math.round(parentRect.right),
            top: Math.round(parentRect.top),
            bottom: Math.round(parentRect.bottom),
          },
        });
        break;
      }
    }
    if (textOverflows.length >= 30) break;
  }

  return {
    horizontalOverflow,
    issues: [
      ...(horizontalOverflow > tolerance ? [{ type: 'page-horizontal-overflow', pixels: horizontalOverflow }] : []),
      ...elementOverflows,
      ...viewportOverflows,
      ...textOverflows,
    ],
  };
});

const main = async () => {
  await mkdir(REPORT_DIR, { recursive: true });
  await run(process.execPath, [VITE_BIN, 'build']);

  const preview = await startPreview();
  const browser = await chromium.launch();
  const results = [];

  try {
    for (const targetPage of pages) {
      for (const viewport of viewports) {
        for (const uiScale of uiScales) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 1,
          });

          await context.addInitScript((scale) => {
            window.localStorage.setItem('uiScale', String(scale));
            window.localStorage.setItem('isDarkMode', 'false');
          }, uiScale);

          const page = await context.newPage();
          const label = `${targetPage.name}-${viewport.name}-${uiScale}`;
          const url = `${preview.baseUrl}${targetPage.path}`;
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(1500);
          await page.screenshot({
            path: path.join(REPORT_DIR, `${label}.png`),
            fullPage: true,
          });

          const result = await collectLayoutIssues(page);
          results.push({
            label,
            page: targetPage.name,
            path: targetPage.path,
            viewport,
            uiScale,
            ...result,
          });

          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    preview.stop();
  }

  const failing = results.filter((result) => result.issues.length > 0);
  const summary = {
    checkedAt: new Date().toISOString(),
    pages,
    viewports,
    uiScales,
    totalChecks: results.length,
    failingChecks: failing.length,
    results,
  };

  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(summary, null, 2), 'utf8');

  if (failing.length > 0) {
    console.error(`Visual check found ${failing.length}/${results.length} checks with layout issues.`);
    for (const result of failing.slice(0, 20)) {
      console.error(`- ${result.label}: ${result.issues.length} issue(s)`);
      for (const issue of result.issues.slice(0, 3)) {
        console.error(`  ${issue.type}: ${issue.selector || ''} ${issue.text || ''}`.trim());
      }
    }
    console.error(`Full report: ${path.join(REPORT_DIR, 'report.json')}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Visual check passed (${results.length} checks).`);
  console.log(`Screenshots and report: ${REPORT_DIR}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
