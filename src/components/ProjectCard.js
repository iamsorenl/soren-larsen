import React from 'react';
import CardAccordions from './CardAccordions';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

const ProjectCard = ({ cardTitle, startDate, endDate, description, tools, cardLink }) => {
    return (
        <Card sx={{ width: '100%', border: '1px solid #ccc', mb: 1 }}>
            <CardContent>
                <Typography variant="h6">{cardTitle}</Typography>
                <Link href={cardLink} underline="hover" color="inherit" variant="body2">
                    {cardLink}
                </Link>
                <Stack direction="row" spacing={1}>
                    <Typography variant="body2">{startDate}</Typography>
                    <Typography variant="body2">{"-"}</Typography>
                    <Typography variant="body2">{endDate}</Typography>
                </Stack>
                <CardAccordions title="Description" content={description} />
                <CardAccordions title="Tools" content={tools.join(', ')} />
            </CardContent>
        </Card>
    );
};

export default ProjectCard;
