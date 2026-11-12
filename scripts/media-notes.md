# Pass 3 media: how the web copies in public/media were made

Originals stay outside the repo. Rebuild a copy with the command next to it.

## Stills (`python3 scripts/webcopy.py SRC DST`: EXIF-rotate, <=1600px, JPEG q80)
| Copy | Source |
|---|---|
| moments/devcamp-talk.jpg | public/images/developer-camp-talk.jpg |
| moments/devcamp-crowd.jpg | public/images/developer-camp.jpg |
| moments/hackathon-table.jpg | public/images/slac-team.jpg |
| moments/surf-ranch-laugh.jpg | ~/Desktop/Archive/ACTAI media/Copy of DSC09810.JPEG |
| moments/surf-ranch-barrel.jpg | ~/Desktop/Archive/ACTAI media/IMG_0391.jpg |
| moments/longboard.jpg | ~/Pictures/IMG_9824.jpg |
| moments/poster-demo.jpg | ~/Desktop/CarbonBridge/images for linkeidn post/IMG_3678.JPG |
| education/hooding.jpg | same folder, IMG_3674.JPG |
| education/poster-talk.jpg | same folder, IMG_3689.JPG |
| education/redwoods.jpg | ~/Documents/School/Grad Photos/HIC_0512-ZF-2851-30610-1-001-032.jpg |

## Video loops (H.264, no audio, `-crf 26 -preset slow -movflags +faststart`)
- experience/gray-whale-loop.mp4: `-ss 60 -t 8 -i public/videos/gray-whale-surf-ranch-720p.mp4 -vf scale=-2:480 -crf 30`
- experience/boardal-wave.mp4: Instagram reel C90xFCBywPS (`yt-dlp`), `-ss 3.8 -t 2 -vf "crop=720:405:0:0,setpts=1.5*PTS"` (top band, above the burned-in captions)
- projects/no-ragrets.mp4: YouTube 2yX1e5xogUQ, `-ss 84 -t 8 -vf scale=-2:540`
- projects/edumuse.mp4: YouTube LAdN2gNdSyM, `-ss 108 -t 8 -vf scale=-2:540`

## Posters and stills from video (`ffmpeg -ss T -i SRC -frames:v 1 -q:v 3`)
- experience/gray-whale-loop.jpg, boardal-wave.jpg, projects/no-ragrets.jpg: first second of their loop
- projects/edumuse.jpg: YouTube LAdN2gNdSyM at 26 s (title card), scale=-2:540
- experience/boardal-feed.jpg (5.7 s), boardal-filter.jpg (11.4 s): Instagram reel DACZSzDSRT1, `crop=iw:iw*9/16:0:0`. Only 360x640 is available from Instagram.
- projects/sentinel.jpg: https://i.ytimg.com/vi/4D9yiXNAT0k/maxresdefault.jpg

## Write-ups
- writeups/ptb-transformer.pdf: Report.pdf from iamsorenl/Language-Modeling-on-Penn-Treebank (identical to the local copy)
- writeups/transformer-qa.pdf: ~/Desktop/NLP Classes & Projects/NLP 203/A2/NLP_203_Assignment_2.pdf
- writeups/nmt.pdf: ~/Desktop/NLP Classes & Projects/NLP 203/A1/NLP_203_Assignment_1.pdf
