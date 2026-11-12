import fs from 'fs';
import path from 'path';
import { collectMediaPaths } from '../mediaPaths';

const pub = (p) => path.join(__dirname, '../../../public', p);

test('every media path referenced in data exists in public/', () => {
    const missing = collectMediaPaths().filter((p) => !fs.existsSync(pub(p)));
    expect(missing).toEqual([]);
});

test('no shipped media file is over the size cap', () => {
    const big = collectMediaPaths().filter((p) => {
        const cap = p.endsWith('.mp4') ? 3.5e6 : p.endsWith('.pdf') ? 10e6 : 1e6;
        return fs.existsSync(pub(p)) && fs.statSync(pub(p)).size > cap;
    });
    expect(big).toEqual([]);
});

test('no shipped video carries an audio track', () => {
    const withAudio = collectMediaPaths().filter((p) => p.endsWith('.mp4') && fs.existsSync(pub(p))
        && fs.readFileSync(pub(p)).includes(Buffer.from('soun')));
    expect(withAudio).toEqual([]);
});

test('no media file is used in two places', () => {
    // eslint-disable-next-line global-require
    const heroPhotos = require('../heroPhotos').default;
    const experienceImages = require('../experienceImages').default;
    const projects = require('../projects.json');
    const education = require('../education.json');
    const srcs = [
        ...heroPhotos.map((m) => m.src),
        ...Object.values(experienceImages).filter(Array.isArray).flat().map((m) => m.src),
        ...projects.flatMap((p) => [p.preview && (p.preview.video || p.preview.poster), ...(p.slides || []).map((m) => m.src)]),
        ...education.flatMap((e) => (e.media || []).map((m) => m.src)),
    ].filter(Boolean);
    const dupes = srcs.filter((s, i) => srcs.indexOf(s) !== i);
    expect(dupes).toEqual([]);
    expect(heroPhotos).toHaveLength(9);
});
