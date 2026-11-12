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

// iPhones decode H.264 in hardware and show nothing above level ~5.2
// (boardal-ride.mp4 shipped at 6.2 and was a black tile on iOS).
test('every site video is H.264 level 4.2 or lower so iPhones can play it', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const vids = walk(pub('')).filter((f) => f.endsWith('.mp4'));
  expect(vids.length).toBeGreaterThan(0);
  const tooHigh = vids.filter((f) => {
    const buf = fs.readFileSync(f);
    const at = buf.indexOf('avcC');
    return at < 0 || buf[at + 7] > 42; // avcC: version, profile, compat, level
  }).map((f) => path.relative(pub(''), f));
  expect(tooHigh).toEqual([]);
});
