import moments from '../moments.json';

const SECTIONS = ['about', 'experience', 'projects', 'education', 'contact'];
const CAROUSEL = ['Headshot1', 'Expressive', 'HalfDome', 'Headshot2', 'Turtle', 'Peru', 'SlugFest', 'Surf', 'caffeine_hack', 'Poster_Presentation', 'FrontierTower'];

test('four moments, each with at least one item', () => {
    expect(moments).toHaveLength(4);
    moments.forEach((m) => expect(m.items.length).toBeGreaterThan(0));
});

test('every target points at a real section and tab', () => {
    moments.filter((m) => m.target).forEach(({ target }) => {
        expect(SECTIONS).toContain(target.section);
        if (target.tab) expect(['play', 'research']).toContain(target.tab);
    });
});

test('no media is used twice, and none repeats a hero carousel photo', () => {
    const srcs = moments.flatMap((m) => m.items.map((i) => i.src));
    expect(new Set(srcs).size).toBe(srcs.length);
    srcs.forEach((s) => CAROUSEL.forEach((c) => expect(s).not.toContain(c)));
});
