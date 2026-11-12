// Only Soren-approved media goes here, keyed by experience.image:
//   MediaItem[] (cycled by CyclingMedia), { pair: [img, img] }, 'boardal-squares', 'causality-anim', 'slug-anim', or 'github-graph'.
// Crops from .superpowers/crops-2026-11-11-v2.json.
const experienceImages = {
    'gray-whale': [
        { type: 'video', src: '/media/experience/gray-whale-loop.mp4', poster: '/media/experience/gray-whale-loop.jpg', alt: 'Surfing the Gray Whale event at Surf Ranch' },
        { type: 'image', src: '/media/moments/devcamp-talk.jpg', alt: 'Soren giving a talk on the power of agents at Developer Camp' },
        { type: 'image', src: '/media/moments/devcamp-crowd.jpg', pos: '64.5% 51.5%', alt: 'The Developer Camp crowd' },
        { type: 'image', src: '/images/developer-camp-team.jpg', pos: '50% 42.1%', alt: 'Soren with the Gray Whale team at Developer Camp' },
        { type: 'image', src: '/media/moments/surf-ranch-barrel.jpg', pos: '1.8% 48.7%', alt: 'Soren in the barrel at the surf ranch wave pool' },
    ],
    // Two panels side by side; phones show only the first.
    onda: {
        pair: [
            { src: '/media/experience/onda-booth.jpg', pos: '50% 30%', alt: 'Soren and a teammate at the Onda booth, under the Score your perfect wave banner' },
            { src: '/media/experience/onda-app.jpg', pos: '50% 0%', alt: 'Onda app spot page with waves, wind and tide for Pleasure Point' },
        ],
    },
    boardal: 'boardal-squares',
    causality: 'causality-anim',
    baskin: 'slug-anim',
    'self-employed': 'github-graph',
};

// Two square clips for the Boardal tile (riding first; phones show only it).
export const boardalClips = [
    { src: '/media/experience/boardal-ride.mp4', poster: '/media/experience/boardal-ride.jpg', alt: 'Soren surfing in a Boardal reel, slowed down' },
    { src: '/media/experience/boardal-tip.mp4', poster: '/media/experience/boardal-tip.jpg', alt: 'Soren giving a surf tip in a Boardal reel' },
];
// In-app Boardal screens, 1 s loops (reel DACZSzDSRT1 at 14.5 s and 10 s), shown either side of the clips.
export const boardalApp = [
    { src: '/media/experience/boardal-app-feed.mp4', poster: '/media/experience/boardal-app-feed.jpg', alt: 'Boardal app feed with boards matched to saved preferences' },
    { src: '/media/experience/boardal-app-filters.mp4', poster: '/media/experience/boardal-app-filters.jpg', alt: 'Boardal search filters for volume and board type' },
];
export default experienceImages;
