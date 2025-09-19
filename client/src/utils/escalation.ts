export interface AnalysisLike {
  anxietyLevel?: number;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'crisis';
  escalationDetected?: boolean;
}

const RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'overdose',
  'hurt myself', 'jump off', 'no reason to live'
];

export const shouldEscalate = (
  lastUserText: string,
  analysis?: AnalysisLike,
  recentWindowHighLevelCount = 0
): boolean => {
  const text = (lastUserText || '').toLowerCase().trim();

  // Hard gate: explicit risk language
  const explicit = RISK_KEYWORDS.some(k => text.includes(k));
  if (explicit) return true;

  // Otherwise require BOTH: high objective level + negative context,
  // and ignore common dismissive phrases
  const lowContent = /^(ok(ay)?|k|no|nothing|fine|whatever|i don['’]t want to talk|leave me alone|i'?m good)$/.test(text);
  if (lowContent) return false;

  const a = analysis || {};
  const high = (a.anxietyLevel ?? 0) >= 9 || a.sentiment === 'crisis' || a.escalationDetected === true;

  // Also require recent accumulation (rate limiting)
  const accumulated = recentWindowHighLevelCount >= 2;

  return high && accumulated; // must be both high and repeated
};