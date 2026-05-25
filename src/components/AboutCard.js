import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import about from '../data/about';

const AboutCard = () => {
    const paragraphs = about[0].about.split('\n\n').slice(1);

    return (
        <Card
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                border: (theme) =>
                    `1px solid ${
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.08)'
                    }`,
            }}
        >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2}>
                    {paragraphs.map((p, i) => (
                        <Typography
                            key={i}
                            variant="body1"
                            sx={{
                                color: 'text.primary',
                                lineHeight: 1.7,
                                fontSize: { xs: '1rem', md: '1.0625rem' },
                            }}
                        >
                            {p}
                        </Typography>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default AboutCard;
