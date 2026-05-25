import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const SectionHeader = ({ eyebrow, title, icon, accent }) => (
    <Box sx={{ mb: 3 }}>
        <Typography
            variant="overline"
            sx={{
                fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
                color: accent,
                letterSpacing: '0.14em',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'block',
                lineHeight: 1,
            }}
        >
            {eyebrow}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75 }}>
            {icon && (
                <Box
                    aria-hidden="true"
                    sx={{
                        mr: 1.5,
                        color: accent,
                        fontSize: 32,
                        display: 'inline-flex',
                        '& > *': { fontSize: 'inherit' },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography
                variant="h4"
                component="h2"
                sx={{
                    fontFamily: '"Fraunces", "Times New Roman", serif',
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    lineHeight: 1.15,
                }}
            >
                {title}
            </Typography>
        </Box>
    </Box>
);

SectionHeader.propTypes = {
    eyebrow: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    accent: PropTypes.string,
};

export default SectionHeader;
