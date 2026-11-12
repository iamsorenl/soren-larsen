import moments from '../moments.json';

const SECTIONS = ['about', 'experience', 'projects', 'education', 'contact'];
const CAROUSEL = ['Headshot1', 'Expressive', 'HalfDome', 'Headshot2', 'Turtle', 'Peru', 'SlugFest', 'Surf', 'caffeine_hack', 'Poster_Presentation', 'FrontierTower'];

test('four moments, each with at least one item', () => {
    expect(moments).toHaveLength(4);
    moments.forEach((m) => expect(m.items.length).toBeGreaterThan(0));
});

test('every target points at a real section and tab', () => {
    const targets = moments.filter((m) => m.target).map((m) => m.target);
    targets.forEach((t) => expect(SECTIONS).toContain(t.section));
    targets.filter((t) => t.tab).forEach((t) => expect(['play', 'research']).toContain(t.tab));
});

test('no media is used twice, and none repeats a hero carousel photo', () => {
    const srcs = moments.flatMap((m) => m.items.map((i) => i.src));
    expect(new Set(srcs).size).toBe(srcs.length);
    srcs.forEach((s) => CAROUSEL.forEach((c) => expect(s).not.toContain(c)));
});
