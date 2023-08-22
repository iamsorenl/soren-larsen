import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const ReadMoreText = ({ text, maxWords }) => {
    const theme = useTheme();
    const [showMore, setShowMore] = useState(false);

    const wordsArray = text.split(' ');
    const truncatedText = showMore ? wordsArray.join(' ') : wordsArray.slice(0, maxWords).join(' ');

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div>
            <Typography variant="body2">
                {truncatedText}
                {wordsArray.length > maxWords && (
                    <span
                        style={{ color: theme.palette.primary.main, cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={toggleShowMore}
                    >
                        {showMore ? ' Less' : ' More'}
                    </span>
                )}
            </Typography>
        </div>
    );
};

export default ReadMoreText;
