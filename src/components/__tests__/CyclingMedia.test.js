import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import CyclingMedia from '../CyclingMedia';

const img = (alt) => ({ type: 'image', src: `/media/${alt}.jpg`, alt });
const vid = (alt) => ({ type: 'video', src: `/media/${alt}.mp4`, poster: `/media/${alt}.jpg`, alt });

const mockMatchMedia = (reduced, hover = false) => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: (reduced && query.includes('prefers-reduced-motion')) || (hover && query.includes('(hover: hover)')),
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
const active = () => screen.getByRole('group', { name: 't' }).getAttribute('data-active-alt');

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

test('pause button stops cycling and toggles its name', () => {
    mockMatchMedia(false);
    jest.useFakeTimers();
    render(<CyclingMedia items={[img('a'), img('b')]} intervalMs={1000} label="t" />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    act(() => jest.advanceTimersByTime(5000));
    expect(active()).toBe('a');
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
});

test('next and previous move and wrap', () => {
    mockMatchMedia(false);
    render(<CyclingMedia items={[img('a'), img('b')]} label="t" />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(active()).toBe('b');
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(active()).toBe('b');
});

test('pausing pauses the active video', () => {
    mockMatchMedia(false);
    mockInView();
    const pause = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    render(<CyclingMedia items={[vid('v')]} label="t" />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(pause).toHaveBeenCalled();
    jest.restoreAllMocks();
});

test('inner images keep their own alt', () => {
    mockMatchMedia(false);
    render(<CyclingMedia items={[img('a'), img('b')]} label="t" />);
    expect(screen.getByRole('img', { name: 'a' })).toBeTruthy();
});

test('counter shows position and updates', () => {
    mockMatchMedia(false);
    render(<CyclingMedia items={[img('a'), img('b')]} label="t" counter />);
    expect(screen.getByText('1 / 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 / 2')).toBeTruthy();
});

test('reduced motion: arrows still work, no pause button', () => {
    mockMatchMedia(true);
    render(<CyclingMedia items={[img('a'), img('b')]} label="t" />);
    expect(screen.queryByRole('button', { name: 'Pause slideshow' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(active()).toBe('b');
});

test('small tiles get only the pause button, no arrows', () => {
    mockMatchMedia(false);
    render(<CyclingMedia items={[img('a'), img('b')]} label="t" small />);
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Pause slideshow' })).toBeTruthy();
});

test('a parent can hold the slideshow paused on hover', () => {
    mockMatchMedia(false);
    jest.useFakeTimers();
    render(<CyclingMedia items={[img('a'), img('b')]} intervalMs={1000} label="t" hovered />);
    act(() => jest.advanceTimersByTime(3000));
    expect(active()).toBe('a');
});

describe('mouse devices: video plays only on hover', () => {
    beforeEach(() => {
        jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    });
    afterEach(() => jest.restoreAllMocks());

    test('shows the poster until hovered, then plays the video', () => {
        mockMatchMedia(false, true);
        mockInView();
        render(<CyclingMedia items={[vid('v'), img('a')]} label="t" />);
        expect(screen.queryByLabelText('v')).toBeNull();
        fireEvent.mouseEnter(screen.getByRole('group', { name: 't' }));
        expect(screen.getByLabelText('v').tagName).toBe('VIDEO');
    });

    test('hovering an image slide jumps to the video', () => {
        jest.useFakeTimers();
        mockMatchMedia(false, true);
        mockInView();
        render(<CyclingMedia items={[img('a'), vid('v')]} intervalMs={1000} label="t" />);
        expect(active()).toBe('a');
        fireEvent.mouseEnter(screen.getByRole('group', { name: 't' }));
        expect(active()).toBe('v');
    });

    test('a parent hover plays the video too', () => {
        mockMatchMedia(false, true);
        mockInView();
        render(<CyclingMedia items={[vid('v'), img('a')]} label="t" hovered />);
        expect(screen.getByLabelText('v').tagName).toBe('VIDEO');
    });

    test('the video plays through once, then the next slide shows', () => {
        mockMatchMedia(false, true);
        mockInView();
        render(<CyclingMedia items={[vid('v'), img('a')]} label="t" />);
        fireEvent.mouseEnter(screen.getByRole('group', { name: 't' }));
        const v = screen.getByLabelText('v');
        expect(v.loop).toBe(false);
        fireEvent.ended(v);
        expect(active()).toBe('a');
    });
});

test('touch devices: video plays in view without hover, then advances when it ends', () => {
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    mockMatchMedia(false);
    mockInView();
    render(<CyclingMedia items={[vid('v'), img('a')]} label="t" />);
    fireEvent.ended(screen.getByLabelText('v'));
    expect(active()).toBe('a');
    jest.restoreAllMocks();
});

test('touch devices: the timer does not cut a playing video short', () => {
    jest.useFakeTimers();
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    mockMatchMedia(false);
    mockInView();
    render(<CyclingMedia items={[vid('v'), img('a')]} intervalMs={1000} label="t" />);
    act(() => { jest.advanceTimersByTime(5000); });
    expect(active()).toBe('v');
    jest.restoreAllMocks();
});
