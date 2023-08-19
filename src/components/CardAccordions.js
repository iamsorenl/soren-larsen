import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import '../CardAccordions.css';

const CardAccordions = ({ title, content }) => {
    const [expanded, setExpanded] = useState(false);

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={handleAccordionChange}
            classes={{ root: 'custom-accordion' }}
        >
            <AccordionSummary
                aria-controls={`${title}-content`}
                id={`${title}-header`}
                classes={{ root: 'custom-summary' }}
            >
                <ExpandMoreIcon className={`expand-icon ${expanded ? 'expanded' : ''}`} />
                <Typography variant="subtitle1">{title}</Typography>
            </AccordionSummary>
            <AccordionDetails
                classes={{ root: 'custom-details' }}
            >
                <Typography variant="body2">{content}</Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default CardAccordions;