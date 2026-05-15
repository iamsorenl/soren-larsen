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

export const ERROR_COPY = {
    network: "Couldn't reach the assistant. Try again in a moment.",
    upstream: 'Something went wrong on my end. Please try again.',
    rateLimited: "You're sending messages quickly — try again in a minute.",
    serviceBusy: 'The assistant is briefly overloaded. Try again in a moment.',
    serviceCapacity: "The assistant has hit today's free-tier limit and is resting. Please try again in a few hours.",
    tooLarge: 'This conversation has gotten too long for me to handle. Use the clear button (top right) to start a fresh chat.',
};
