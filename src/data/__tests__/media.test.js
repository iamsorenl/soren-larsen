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
