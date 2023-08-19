import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
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
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${title}-content`}
                id={`${title}-header`}
                classes={{ root: 'custom-summary' }}
            >
                <IconButton size="small" color="primary">
                    <InfoIcon />
                </IconButton>
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
