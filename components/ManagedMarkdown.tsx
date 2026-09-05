import React from 'react';

const inlinePattern = /(\[[^\]]+\]\((?:https:\/\/|mailto:)[^)]+\)|https:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

const renderInline = (value: string) => value.split(inlinePattern).filter(Boolean).map((part, index) => {
  const markdownLink = part.match(/^\[([^\]]+)\]\(((?:https:\/\/|mailto:)[^)]+)\)$/i);
  const plainUrl = part.match(/^https:\/\/[^\s]+$/i);
  const email = part.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
  if (markdownLink) {
    return <a key={`${part}-${index}`} href={markdownLink[2]} target={markdownLink[2].startsWith('https://') ? '_blank' : undefined} rel="noreferrer" className="underline">{markdownLink[1]}</a>;
  }
  if (plainUrl) {
    return <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="underline">{part}</a>;
  }
  if (email) {
    return <a key={`${part}-${index}`} href={`mailto:${part}`} className="underline">{part}</a>;
  }
  return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
});

const ManagedMarkdown: React.FC<{ value: string }> = ({ value }) => {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const text = paragraphLines.join(' ').trim();
    if (text) blocks.push(<p key={`p-${blocks.length}`} className="text-base font-bold leading-relaxed text-[var(--theme-text-2)]">{renderInline(text)}</p>);
    paragraphLines = [];
  };
  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-6 text-base font-bold leading-relaxed text-[var(--theme-text-2)] marker:text-[var(--theme-primary)]">
        {listItems.map((item, index) => <li key={`${item}-${index}`}>{renderInline(item)}</li>)}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push(<h2 key={`h2-${blocks.length}`} className="aurora-section-title pt-3 text-2xl">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push(<h3 key={`h3-${blocks.length}`} className="text-xl font-black text-[var(--theme-text)]">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith('- ')) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
    } else if (!trimmed) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphLines.push(trimmed);
    }
  });
  flushParagraph();
  flushList();

  return <div className="space-y-4">{blocks}</div>;
};

export default ManagedMarkdown;
