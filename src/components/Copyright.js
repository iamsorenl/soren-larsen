import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CopyrightIcon from '@mui/icons-material/Copyright';

const CopyrightCard = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CardContent>
                <Stack direction='row' alignItems='center' textAlign='center' spacing={0.5}>
                    <Typography variant="h6" color="primary.contrastText">
                        Copyright
                    </Typography>
                    <CopyrightIcon />
                    <Typography variant="h6" color="primary.contrastText">
                        Soren Larsen {currentYear}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default CopyrightCard;
