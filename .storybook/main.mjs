/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-themes', '@storybook/preset-create-react-app'],
    framework: {
        name: '@storybook/react-webpack5',
        options: {}
    },
    docs: {
        autodocs: 'tag'
    },
    staticDirs: ['../public']
};

export default config;
