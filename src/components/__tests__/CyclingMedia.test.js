import React from 'react';
import { render, screen, act } from '@testing-library/react';
import CyclingMedia from '../CyclingMedia';

const img = (alt) => ({ type: 'image', src: `/media/${alt}.jpg`, alt });
const vid = (alt) => ({ type: 'video', src: `/media/${alt}.mp4`, poster: `/media/${alt}.jpg`, alt });

const mockMatchMedia = (reduced) => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: reduced && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }));
};
const mockInView = () => {
    window.IntersectionObserver = class {
        constructor(cb) { this.cb = cb; }
        observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
        disconnect() {}
    };
};
const active = () => screen.getByRole('img', { name: 't' }).getAttribute('data-active-alt');

afterEach(() => {
    jest.useRealTimers();
    delete window.matchMedia;
    delete window.IntersectionObserver;
});

test('shows the first item, then the next after intervalMs, then wraps', () => {
    mockMatchMedia(false);
    jest.useFakeTimers();
    render(<CyclingMedia items={[img('a'), img('b')]} intervalMs={1000} label="t" />);
    expect(active()).toBe('a');
    act(() => jest.advanceTimersByTime(1000));
    expect(active()).toBe('b');
    act(() => jest.advanceTimersByTime(1000));
    expect(active()).toBe('a');
});

test('reduced motion: first still only, never advances, no video', () => {
    mockMatchMedia(true);
    mockInView();
    jest.useFakeTimers();
    render(<CyclingMedia items={[vid('v'), img('b')]} intervalMs={1000} label="t" />);
    act(() => jest.advanceTimersByTime(10000));
    expect(active()).toBe('v');
    expect(screen.queryByLabelText('v')).toBeNull(); // no <video>
});

test('video item shows its poster until in view (no IntersectionObserver in jsdom)', () => {
    mockMatchMedia(false);
    render(<CyclingMedia items={[vid('v')]} label="t" />);
    expect(screen.getByAltText('v')).toHaveAttribute('src', '/media/v.jpg');
    expect(screen.queryByLabelText('v')).toBeNull(); // no <video>
});

test('video item plays muted once in view', () => {
    mockMatchMedia(false);
    mockInView();
    render(<CyclingMedia items={[vid('v')]} label="t" />);
    const v = screen.getByLabelText('v');
    expect(v).toHaveAttribute('src', '/media/v.mp4');
    expect(v.muted).toBe(true);
});

test('single item sets no interval', () => {
    mockMatchMedia(false);
    jest.useFakeTimers();
    render(<CyclingMedia items={[img('a')]} label="t" />);
    expect(jest.getTimerCount()).toBe(0);
});

test('empty items renders nothing', () => {
    mockMatchMedia(false);
    const { container } = render(<CyclingMedia items={[]} label="t" />);
    expect(container).toBeEmptyDOMElement();
});
