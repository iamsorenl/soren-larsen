import projects from '../projects.json';

const research = projects.filter((p) => p.tab === 'research');

test('Research holds No RAGrets, EduMUSE and the three NLP projects, in order', () => {
    expect(research.map((p) => p.title)).toEqual([
        'No RAGrets',
        'EduMUSE',
        'Transformer language model on Penn Treebank',
        'Transformer QA: robustness and domain adaptation',
        'Neural machine translation, French to English',
    ]);
});

test('no project was removed (15 before pass 3, 3 added)', () => {
    expect(projects).toHaveLength(18);
});

test('SLAC has no photo (that photo is a hero moment now) and keeps the X-ray laser link', () => {
    const slac = projects.find((p) => p.title.startsWith('SLAC'));
    expect(slac.photo).toBeUndefined();
    expect(slac.links.map((l) => l.url)).toContain('https://www.youtube.com/watch?v=kUeraeIkTmo');
});

test('no banned strings', () => {
    expect(JSON.stringify(projects)).not.toMatch(/devpost\.com\/software|sentinal|Causality Labs/i);
});

test('explore links, when present, point at GitHub Pages', () => {
    projects.filter((p) => p.explore).forEach((p) => expect(p.explore).toMatch(/^https:\/\/iamsorenl\.github\.io\//));
});

test('NLP cards carry a write-up and real results', () => {
    research.filter((p) => p.results).forEach((p) => {
        expect(p.writeup).toMatch(/^\/writeups\/.+\.pdf$/);
        const bars = p.results.groups ? p.results.groups.flatMap((g) => g.bars) : p.results.bars;
        expect(bars.length).toBeGreaterThan(1);
        expect(p.results.headline).toBeTruthy();
    });
    const qa = research.find((p) => p.slug === 'transformer-qa');
    expect(qa.results.bars).toEqual([['Fake 2050 founding', 98.01], ['Fake Jedi home', 5.54], ['Nonsense text', 0.02]]);
});
