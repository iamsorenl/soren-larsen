export const WORKER_URL = process.env.REACT_APP_CHAT_WORKER_URL || 'http://localhost:8787';

export const GREETING = "Hi — I'm Soren's Assistant. Here are a few things I can help with:";

export const SUGGESTED_PROMPTS = [
    "What was Soren's most recent role?",
    'What NLP projects has he worked on?',
    "What's his tech stack?",
    'How do I get in touch?',
];

export const SUMMARIZE_AFTER_TURNS = 8;
export const KEEP_TAIL_TURNS = 4;

export const ERROR_COPY = {
    network: "Couldn't reach the assistant. Try again in a moment.",
    upstream: 'Something went wrong on my end. Please try again.',
    rateLimited: "You're sending messages quickly — try again in a minute.",
};
