import { SOFT_SUMMARIZE_AT_TOKENS, KEEP_TAIL_TOKENS } from './chatConfig';

// English ≈ 4 chars/token. Per-message overhead approximates the role + JSON
// envelope the model sees. Mirrors the worker's estimator so frontend and
// worker agree on what "too big" means.
const PER_MESSAGE_OVERHEAD = 8;

export function estimateMessageTokens(message) {
    return Math.ceil((message.content || '').length / 4) + PER_MESSAGE_OVERHEAD;
}

export function totalChatTokens(messages) {
    let total = 0;
    for (const m of messages) total += estimateMessageTokens(m);
    return total;
}

// Walks from the newest message backward, accumulating tokens. Everything
// older than KEEP_TAIL_TOKENS gets compacted into a summary. Returns null when
// the conversation is small enough or when there's nothing meaningful to
// summarize (e.g., one giant message).
export function planCompaction(messages) {
    if (totalChatTokens(messages) < SOFT_SUMMARIZE_AT_TOKENS) return null;
    let running = 0;
    let splitIndex = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
        running += estimateMessageTokens(messages[i]);
        if (running >= KEEP_TAIL_TOKENS) {
            splitIndex = i;
            break;
        }
    }
    if (splitIndex <= 0) return null;
    return {
        toSummarize: messages.slice(0, splitIndex),
        keep: messages.slice(splitIndex),
    };
}
