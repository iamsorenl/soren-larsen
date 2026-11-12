// Only Soren-approved media goes here, keyed by experience.image:
//   MediaItem[] (cycled by CyclingMedia), 'causality-anim', or 'github-graph'.
const experienceImages = {
    'gray-whale': [
        { type: 'video', src: '/media/experience/gray-whale-loop.mp4', poster: '/media/experience/gray-whale-loop.jpg', alt: 'Surfing the Gray Whale event at Surf Ranch' },
        { type: 'image', src: '/images/developer-camp-team.jpg', alt: 'Soren with the Gray Whale team at Developer Camp' },
    ],
    boardal: [
        { type: 'video', src: '/media/experience/boardal-wave.mp4', poster: '/media/experience/boardal-wave.jpg', alt: 'Soren surfing in a Boardal reel' },
        { type: 'image', src: '/media/experience/boardal-feed.jpg', alt: 'The Boardal marketplace feed' },
        { type: 'image', src: '/media/experience/boardal-filter.jpg', alt: 'Filtering boards by volume in Boardal' },
    ],
    causality: 'causality-anim',
    'self-employed': 'github-graph',
};
export default experienceImages;
