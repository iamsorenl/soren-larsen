import React from 'react';

const Welcome = () => (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Component Playground</h1>
        <p>
            Storybook is wired up. Stories live in <code>src/**/*.stories.{'{js,jsx}'}</code>.
            Theme and demo-data wiring come in SOR-16 and SOR-17.
        </p>
    </div>
);

export default {
    title: 'Welcome',
    component: Welcome
};

export const Default = { args: {} };
