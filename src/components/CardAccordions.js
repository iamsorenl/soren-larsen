import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

const CardAccordions = ({ title, content }) => {
    const [expanded, setExpanded] = useState(false);

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={handleAccordionChange}
            sx={{
                borderRadius: '12px',
                boxShadow: 'none',
                '&:before': {
                    display: 'none',
                },
                '&.Mui-expanded': {
                    margin: '0',
                },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${title}-content`}
                id={`${title}-header`}
                sx={{
                    borderBottom: 'none',
                    backgroundColor: 'transparent',
                }}
            >
                <Typography variant="subtitle1">{title}</Typography>
            </AccordionSummary>
            <AccordionDetails
                sx={{
                    display: 'block',
                    borderRadius: '0 0 12px 12px',
                    padding: '8px 16px',
                    backgroundColor: expanded ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                }}
            >
                <Typography variant="body2">{content}</Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default CardAccordions;