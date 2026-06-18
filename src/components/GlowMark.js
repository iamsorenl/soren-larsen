import React from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';

import monogramGlow from '../images/marks/monogram-glow.hdr.avif';
import monogramLight from '../images/marks/monogram-light.png';
import accentGlow from '../images/marks/accent-glow.hdr.avif';
import accentLight from '../images/marks/accent-light.png';

// Each mark has a glowing white HDR-AVIF (for dark mode, where it physically
// glows on HDR displays) and a solid-indigo PNG (for light mode, where a white
// glow would be invisible).
const SOURCES = {
    monogram: { glow: monogramGlow, light: monogramLight },
    accent: { glow: accentGlow, light: accentLight },
};

const GlowMark = ({ variant, alt, size, sx }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const src = isDark ? SOURCES[variant].glow : SOURCES[variant].light;
    return (
        <Box
            component="img"
            src={src}
            alt={alt}
            aria-hidden={alt ? undefined : 'true'}
            sx={{ height: size, width: 'auto', display: 'block', ...sx }}
        />
    );
};

GlowMark.propTypes = {
    variant: PropTypes.oneOf(['monogram', 'accent']).isRequired,
    alt: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sx: PropTypes.object,
};

GlowMark.defaultProps = {
    alt: '',
    size: 32,
    sx: {},
};

export default GlowMark;
