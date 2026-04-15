import ProjectPopUpCard from '../components/ProjectPopUpCard';
import { mockProject, mockShortProject } from './mockData';

const meta = {
    title: 'Components/ProjectPopUpCard',
    component: ProjectPopUpCard,
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Whether the dialog is visible'
        },
        onClose: {
            action: 'closed',
            description: 'Fires when the user dismisses the dialog'
        },
        project: {
            control: 'object',
            description: 'Project record matching src/data/projects.json shape'
        }
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Modal dialog that shows full project details. Fully prop-driven — pass any project-shaped object to preview different content.'
            }
        }
    }
};

export default meta;

export const Default = {
    args: {
        open: true,
        project: mockProject
    }
};

export const ShortDescription = {
    name: 'Short description',
    args: {
        open: true,
        project: mockShortProject
    }
};

export const Closed = {
    name: 'Closed (hidden)',
    args: {
        open: false,
        project: mockProject
    }
};
