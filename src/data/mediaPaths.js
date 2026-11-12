import projects from './projects.json';
import experienceImages, { boardalClips, boardalApp } from './experienceImages';
import heroPhotos from './heroPhotos';
import education from './education.json';

// Every data file that references files in public/. Add new ones here.
const SOURCES = [projects, experienceImages, boardalClips, boardalApp, heroPhotos, education];

const PATH_RE = /"(\/(?:media|images|previews|writeups)\/[^"]+)"/g;

export function collectMediaPaths() {
    const found = new Set();
    for (const m of JSON.stringify(SOURCES).matchAll(PATH_RE)) found.add(m[1]);
    return [...found];
}
