# Commands used
Playwright 1.65 installed in scratchpad (`npm i playwright@1.65.0 && npx playwright install chromium`); script `record.js` in this dir.
Record (1280x800 recordVideo, raw webm into raw/<slug>.webm):
    NODE_PATH=<scratchpad>/pw/node_modules node record.js          # ONLY=stockpulse to redo one
Encode (trim 0.5 s of load, 10 s, 640 wide, muted), CRF 32 fit all under 300 KB:
    ffmpeg -ss 0.5 -t 10 -i raw/<slug>.webm -vf scale=640:-2 -an -c:v libx264 -crf 32 -movflags +faststart <slug>.mp4
Posters (frame from the mp4):
    ffmpeg -ss 1.5 -i slac.mp4 -vframes 1 -q:v 4 slac.jpg      (same for league)
    ffmpeg -ss 4 -i stockpulse.mp4 -vframes 1 -q:v 4 stockpulse.jpg   (1.5 s was just the empty landing page)
