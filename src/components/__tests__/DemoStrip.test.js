import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DemoStrip from '../DemoStrip';
import DemoTile from '../DemoTile';
import projects from '../../data/projects.json';

const play = projects.filter((p) => p.tab === 'play');

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
        constructor(cb) {
            this.cb = cb;
        }
        observe(el) {
            this.cb([{ isIntersecting: true, target: el }]);
        }
        disconnect() {}
    };
};

afterEach(() => {
    delete window.matchMedia;
    delete window.IntersectionObserver;
});

test('renders four tiles linking out', () => {
    mockMatchMedia(false);
    render(<DemoStrip />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    links.forEach((a, i) => {
        expect(a).toHaveAttribute('target', '_blank');
        expect(a).toHaveAttribute('rel', 'noopener noreferrer');
        expect(a).toHaveAttribute('href', play[i].demo || play[i].video);
    });
    expect(screen.getAllByText('Play')).toHaveLength(3);
    expect(screen.getAllByText('Watch')).toHaveLength(1);
});

test('reduced motion shows posters only', () => {
    mockMatchMedia(true);
    mockInView();
    const project = { ...play[0], preview: { poster: '/p.jpg', video: '/v.mp4' } };
    const { container } = render(<DemoTile project={project} />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('video')).toBeNull();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('img')).toHaveAttribute('src', '/p.jpg');
});

test('video mounts only once in view when motion is allowed', () => {
    mockMatchMedia(false);
    const project = { ...play[0], preview: { poster: '/p.jpg', video: '/v.mp4' } };
    const { container: c1, unmount } = render(<DemoTile project={project} />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(c1.querySelector('video')).toBeNull();
    unmount();
    mockInView();
    const { container: c2 } = render(<DemoTile project={project} />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(c2.querySelector('video')).not.toBeNull();
});

test('tile without preview still renders title and link', () => {
    mockMatchMedia(false);
    render(<DemoTile project={play[1]} />);
    expect(screen.getByText(play[1].title)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', play[1].video);
});

test('broken poster hides the img and keeps the title fallback', () => {
    mockMatchMedia(true);
    const project = { ...play[0], preview: { poster: '/missing.jpg' } };
    const { container } = render(<DemoTile project={project} />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    fireEvent.error(container.querySelector('img'));
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText(project.title)).toBeInTheDocument();
});
