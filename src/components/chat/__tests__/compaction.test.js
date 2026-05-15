import {
    estimateMessageTokens,
    totalChatTokens,
    planCompaction,
} from '../compaction';
import { SOFT_SUMMARIZE_AT_TOKENS, KEEP_TAIL_TOKENS } from '../chatConfig';

// Construct a message whose estimated token count lands near `targetTokens`.
// 4 chars/token + 8 overhead, so target N tokens needs (N - 8) * 4 chars.
function msg(role, targetTokens) {
    const charCount = Math.max(0, (targetTokens - 8) * 4);
    return { role, content: 'x'.repeat(charCount) };
}

describe('estimateMessageTokens', () => {
    test('empty content still has per-message overhead', () => {
        expect(estimateMessageTokens({ role: 'user', content: '' })).toBe(8);
    });

    test('null content does not crash', () => {
        expect(estimateMessageTokens({ role: 'user', content: null })).toBe(8);
    });

    test('content scales as chars/4', () => {
        expect(estimateMessageTokens({ role: 'user', content: 'xxxx' })).toBe(9);
        expect(estimateMessageTokens({ role: 'user', content: 'x'.repeat(40) })).toBe(18);
    });
});

describe('totalChatTokens', () => {
    test('empty array sums to 0', () => {
        expect(totalChatTokens([])).toBe(0);
    });

    test('sums each message including overhead', () => {
        const messages = [msg('user', 100), msg('assistant', 100)];
        expect(totalChatTokens(messages)).toBe(200);
    });
});

describe('planCompaction', () => {
    test('returns null for an empty conversation', () => {
        expect(planCompaction([])).toBeNull();
    });

    test('returns null when total tokens are below the soft threshold', () => {
        // 5 tiny turns
        const messages = Array.from({ length: 5 }, (_, i) =>
            msg(i % 2 === 0 ? 'user' : 'assistant', 50)
        );
        expect(planCompaction(messages)).toBeNull();
    });

    test('returns a plan once the soft threshold is crossed', () => {
        // 8 turns at 250 tokens each = 2000 total, comfortably over 1500 cap
        const messages = Array.from({ length: 8 }, (_, i) =>
            msg(i % 2 === 0 ? 'user' : 'assistant', 250)
        );
        const plan = planCompaction(messages);
        expect(plan).not.toBeNull();
        expect(plan.toSummarize.length + plan.keep.length).toBe(8);
        expect(plan.keep.length).toBeGreaterThan(0);
        expect(plan.toSummarize.length).toBeGreaterThan(0);
    });

    test('keep tail covers at least KEEP_TAIL_TOKENS worth of recent turns', () => {
        const messages = Array.from({ length: 10 }, (_, i) =>
            msg(i % 2 === 0 ? 'user' : 'assistant', 200)
        );
        const plan = planCompaction(messages);
        expect(plan).not.toBeNull();
        expect(totalChatTokens(plan.keep)).toBeGreaterThanOrEqual(KEEP_TAIL_TOKENS);
    });

    test('toSummarize contains the oldest turns, keep contains the newest', () => {
        // Each message ~325 tokens; 5 messages ≈ 1625 tokens, comfortably over
        // the 1500-token soft threshold.
        const pad = 'x'.repeat(1300);
        const messages = [
            { role: 'user', content: 'OLDEST' + pad },
            { role: 'assistant', content: 'reply 0' + pad },
            { role: 'user', content: 'middle' + pad },
            { role: 'assistant', content: 'reply 1' + pad },
            { role: 'user', content: 'NEWEST' + pad },
        ];
        const plan = planCompaction(messages);
        expect(plan).not.toBeNull();
        expect(plan.toSummarize[0].content.startsWith('OLDEST')).toBe(true);
        expect(plan.keep[plan.keep.length - 1].content.startsWith('NEWEST')).toBe(true);
    });

    test('returns null when a single huge message means no useful split exists', () => {
        // One enormous message — splitIndex resolves to 0, which yields null.
        const messages = [msg('user', SOFT_SUMMARIZE_AT_TOKENS + 500)];
        expect(planCompaction(messages)).toBeNull();
    });

    test('threshold gating is deterministic just under the cap', () => {
        // Build a conversation just under the soft cap — should NOT trigger.
        const target = SOFT_SUMMARIZE_AT_TOKENS - 20;
        const messages = [msg('user', target / 2), msg('assistant', target / 2)];
        expect(planCompaction(messages)).toBeNull();
    });

    test('threshold gating is deterministic just over the cap', () => {
        // Just over the soft cap with enough turns to split meaningfully.
        const target = SOFT_SUMMARIZE_AT_TOKENS + 200;
        const perTurn = target / 6;
        const messages = Array.from({ length: 6 }, (_, i) =>
            msg(i % 2 === 0 ? 'user' : 'assistant', perTurn)
        );
        expect(planCompaction(messages)).not.toBeNull();
    });
});
