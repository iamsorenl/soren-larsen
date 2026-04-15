import React from 'react';
import { Box } from '@mui/material';
import EnhancedCertifications from '../components/EnhancedCertifications';
import { mockCertifications } from './mockData';

const withLayout = (Story) => (
    <Box sx={{ p: 2, maxWidth: 960 }}>
        <Story />
    </Box>
);

const meta = {
    title: 'Components/EnhancedCertifications',
    component: EnhancedCertifications,
    decorators: [withLayout],
    argTypes: {
        certifications: {
            control: 'object',
            description:
                'Array of certification records (shape matches src/data/certifications.json)'
        }
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Grid of certification cards. Accepts a `certifications` prop so stories can preview different issuer/type combinations without editing production data.'
            }
        }
    }
};

export default meta;

export const Default = {
    args: {
        certifications: mockCertifications
    }
};

export const SingleCertification = {
    name: 'Single certification',
    args: {
        certifications: [mockCertifications[0]]
    }
};

export const Empty = {
    name: 'Empty state',
    args: {
        certifications: []
    }
};
