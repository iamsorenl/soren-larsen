import React from 'react';
import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { GitHub, LinkedIn, Email } from '@mui/icons-material';
import contactInfo from '../data/contact';

const CopyrightCard = () => {
    const currentYear = new Date().getFullYear();
    const { github, linkedin, email } = contactInfo[0];

    const links = [
        {
            label: 'GitHub',
            href: github,
            icon: <GitHub fontSize="small" />,
            external: true,
        },
        {
            label: 'LinkedIn',
            href: linkedin,
            icon: <LinkedIn fontSize="small" />,
            external: true,
        },
        {
            label: 'Email',
            href: `mailto:${email}`,
            icon: <Email fontSize="small" />,
            external: false,
        },
    ];

    return (
        <Box
            component="footer"
            sx={{
                mt: 2,
                py: 3,
                px: { xs: 2, md: 3 },
                borderTop: (t) => `1px solid ${t.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            <Stack direction="row" spacing={0.5}>
                {links.map((link) => (
                    <Tooltip key={link.label} title={link.label} arrow>
                        <IconButton
                            component="a"
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            aria-label={link.label}
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            {link.icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </Stack>
            <Typography variant="body2" color="text.secondary">
                © {currentYear} Soren Larsen
            </Typography>
        </Box>
    );
};

export default CopyrightCard;
