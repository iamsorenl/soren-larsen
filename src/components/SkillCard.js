import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import skills from '../data/skills';

const SkillCard = () => {
    const sections = [
        { title: 'Languages', data: skills.languages },
        { title: 'AI / LLM Systems', data: skills.aiLlmSystems },
        { title: 'Backend / APIs', data: skills.backendApis },
        { title: 'Frontend', data: skills.frontend },
        { title: 'Infra / DevOps', data: skills.infraDevops },
        { title: 'Developer Workflows', data: skills.developerWorkflows },
        { title: 'Applied NLP', data: skills.appliedNlp },
    ];

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', height: '100%', width: '100%', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant='h5' mb={3.5}>Skills</Typography>
                {sections.map((section, index) => (
                    <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant='body1' color='text.secondary'>{section.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ul>
                                {section.data.map((item, itemIndex) => (
                                    <li key={itemIndex} style={{ marginBottom: '8px', marginLeft: '16px' }}>
                                        <Typography variant='body2' color='text.secondary'>{typeof item === 'object' ? item.name : item}</Typography>
                                    </li>
                                ))}
                            </ul>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    );
};

export default SkillCard;
