// Maximum tokens to include from a README (chars/4 heuristic)
export const README_MAX_TOKENS = 1500;

// Caps on client-supplied chat messages (input validation)
export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_CHARS = 8000;

// KV TTL for cached README sections (24 hours)
export const README_CACHE_TTL_SECONDS = 86400;

// User turns joined into the fact-retrieval query, so follow-ups keep context
export const RETRIEVAL_USER_TURNS = 3;
