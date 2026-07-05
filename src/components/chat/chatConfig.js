export const WORKER_URL = process.env.REACT_APP_CHAT_WORKER_URL || 'http://localhost:8787';

export const GREETING = "Hi — I'm Soren's Assistant. Here are a few things I can help with:";

export const SUGGESTED_PROMPTS = [
    "What was Soren's most recent role?",
    'What NLP projects has he worked on?',
    "What's his tech stack?",
    'How do I get in touch?',
];

// Chat-history compaction. Token-based, not turn-based: short banter shouldn't
// trigger an unnecessary summarize and a single long paste shouldn't be allowed
// to coast past a turn-count threshold. Estimator is chars/4 (English).
export const SOFT_SUMMARIZE_AT_TOKENS = 1500;
export const KEEP_TAIL_TOKENS = 600;

// Largest single message worth sending. A message over this can never succeed:
// the 413 recovery path summarizes *prior* turns, which can't shrink the new
// message itself (planCompaction returns null when there's nothing older to
// fold away). Matches SOFT_SUMMARIZE_AT_TOKENS so "one message eats the whole
// soft budget" short-circuits locally instead of two guaranteed 413s.
export const MAX_USER_MESSAGE_TOKENS = SOFT_SUMMARIZE_AT_TOKENS;

export const ERROR_COPY = {
    network: "Couldn't reach the assistant. Try again in a moment.",
    upstream: 'Something went wrong on my end. Please try again.',
    rateLimited: "You're sending messages quickly — try again in a minute.",
    serviceBusy: 'The assistant is briefly overloaded. Try again in a moment.',
    serviceCapacity: "The assistant has hit today's free-tier limit and is resting. Please try again in a few hours.",
    tooLarge: 'This conversation has gotten too long for me to handle. Use the clear button (top right) to start a fresh chat.',
    badRequest: "I couldn't process that message. Please rephrase it and try again.",
};

// Rate-limit copy with the worker's Retry-After seconds interpolated. Falls
// back to the generic ERROR_COPY.rateLimited when no countdown is known.
export function rateLimitedCopy(retryAfterSec) {
    if (!retryAfterSec || retryAfterSec <= 0) return ERROR_COPY.rateLimited;
    return `You're sending messages quickly — try again in ${retryAfterSec} seconds.`;
}
