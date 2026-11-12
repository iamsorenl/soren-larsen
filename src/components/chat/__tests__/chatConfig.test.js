import { ERROR_COPY, rateLimitedCopy } from '../chatConfig';

test('rateLimitedCopy interpolates the Retry-After seconds', () => {
    expect(rateLimitedCopy(45)).toBe("You're sending messages quickly — try again in 45 seconds.");
});

test('rateLimitedCopy falls back to the generic copy without a countdown', () => {
    expect(rateLimitedCopy(0)).toBe(ERROR_COPY.rateLimited);
    expect(rateLimitedCopy(undefined)).toBe(ERROR_COPY.rateLimited);
});

test('every error kind has copy, including badRequest', () => {
    for (const kind of ['network', 'upstream', 'rateLimited', 'serviceBusy', 'serviceCapacity', 'tooLarge', 'badRequest']) {
        expect(typeof ERROR_COPY[kind]).toBe('string');
        expect(ERROR_COPY[kind].length).toBeGreaterThan(0);
    }
});

test('starter prompts invite the skills question now that the section is gone', () => {
    const { STARTER_PROMPTS } = require('../chatConfig');
    expect(STARTER_PROMPTS).toHaveLength(4);
    expect(STARTER_PROMPTS).toContain('What does he work with?');
});
