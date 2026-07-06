const TEST_FEEDBACK_ANSWERED_KEY = 'testFeedbackAnsweredAt';
const TEST_FEEDBACK_PROMPT_POSTPONED_UNTIL_KEY = 'testFeedbackPromptPostponedUntil';
const TEST_FEEDBACK_PROMPT_POSTPONE_MS = 24 * 60 * 60 * 1000;

const readTimestamp = (key: string) => {
  try {
    if (typeof localStorage === 'undefined') return 0;
    const value = Number(localStorage.getItem(key) ?? 0);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

const writeTimestamp = (key: string, value: number) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage errors.
  }
};

export const markTestFeedbackAnswered = () => {
  const now = Date.now();
  writeTimestamp(TEST_FEEDBACK_ANSWERED_KEY, now);
  writeTimestamp(TEST_FEEDBACK_PROMPT_POSTPONED_UNTIL_KEY, 0);
};

export const postponeTestFeedbackPrompt = () => {
  writeTimestamp(TEST_FEEDBACK_PROMPT_POSTPONED_UNTIL_KEY, Date.now() + TEST_FEEDBACK_PROMPT_POSTPONE_MS);
};

export const shouldShowTestFeedbackPrompt = () => {
  if (readTimestamp(TEST_FEEDBACK_ANSWERED_KEY) > 0) return false;
  const postponedUntil = readTimestamp(TEST_FEEDBACK_PROMPT_POSTPONED_UNTIL_KEY);
  return postponedUntil <= Date.now();
};
