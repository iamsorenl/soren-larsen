import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    TextField,
    Stack,
    Alert,
    Snackbar,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ContactMail,
    Phone,
    Email,
    GitHub,
    LinkedIn,
    Send,
} from '@mui/icons-material';
import contactInfo from '../data/contact';
import {
    ACCENT_PALETTE,
    SECTION_ACCENTS,
    resolveAccent,
} from '../theme/accents';
import SectionHeader from './SectionHeader';

const SubHeading = ({ children, accent }) => (
    <Typography
        variant="overline"
        sx={{
            fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
            color: accent,
            letterSpacing: '0.14em',
            fontSize: '0.7rem',
            fontWeight: 600,
            display: 'block',
            mb: 1.5,
        }}
    >
        {children}
    </Typography>
);

const ContactCard = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { phone, email, github, linkedin } = contactInfo[0];

    const sectionAccent = resolveAccent(SECTION_ACCENTS.contact, isDark);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            setAlertMessage('Please fill in all required fields.');
            setAlertSeverity('error');
            setShowAlert(true);
            return;
        }

        const subject = formData.subject || 'Contact from Portfolio Website';
        const body = `Hi Soren,

${formData.message}

Best regards,
${formData.name}
${formData.email}`;

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        setAlertMessage('Opening your email client...');
        setAlertSeverity('success');
        setShowAlert(true);

        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const contactMethods = [
        {
            icon: <Phone fontSize="small" />,
            label: 'Phone',
            value: phone,
            href: `tel:${phone}`,
            accent: resolveAccent(ACCENT_PALETTE.sage, isDark),
            external: false,
        },
        {
            icon: <Email fontSize="small" />,
            label: 'Email',
            value: email,
            href: `mailto:${email}`,
            accent: resolveAccent(ACCENT_PALETTE.indigo, isDark),
            external: false,
        },
        {
            icon: <GitHub fontSize="small" />,
            label: 'GitHub',
            value: 'github.com/iamsorenl',
            href: github,
            accent: resolveAccent(ACCENT_PALETTE.coral, isDark),
            external: true,
        },
        {
            icon: <LinkedIn fontSize="small" />,
            label: 'LinkedIn',
            value: 'linkedin.com/in/soren-larsen',
            href: linkedin,
            accent: resolveAccent(ACCENT_PALETTE.cyan, isDark),
            external: true,
        },
    ];

    const fieldSx = {
        '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
        '& .MuiOutlinedInput-root': {
            backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': {
                borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(0, 0, 0, 0.4)',
            },
            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
        },
    };

    const innerPanelSx = {
        flex: 1,
        p: 2.5,
        borderRadius: '12px',
        border: (t) => `1px solid ${t.palette.divider}`,
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <Card
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                border: (t) =>
                    `1px solid ${
                        t.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.08)'
                    }`,
            }}
        >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <SectionHeader
                    eyebrow="Contact"
                    title="Get in touch"
                    icon={<ContactMail />}
                    accent={sectionAccent}
                />

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 2,
                        alignItems: 'stretch',
                    }}
                >
                    {/* Get In Touch */}
                    <Box sx={innerPanelSx}>
                        <SubHeading accent={sectionAccent}>Direct</SubHeading>
                        <Stack spacing={0.5}>
                            {contactMethods.map((method) => (
                                <Button
                                    key={method.label}
                                    component="a"
                                    href={method.href}
                                    target={method.external ? '_blank' : undefined}
                                    rel={method.external ? 'noopener noreferrer' : undefined}
                                    sx={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        py: 1,
                                        px: 1.25,
                                        borderRadius: 1.5,
                                        color: 'text.primary',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: isDark
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(0, 0, 0, 0.04)',
                                            transform: 'translateX(2px)',
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            mr: 1.5,
                                            backgroundColor: `${method.accent}22`,
                                            color: method.accent,
                                        }}
                                    >
                                        {method.icon}
                                    </Avatar>
                                    <Box sx={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.secondary',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                lineHeight: 1.2,
                                                display: 'block',
                                            }}
                                        >
                                            {method.label}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.primary',
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {method.value}
                                        </Typography>
                                    </Box>
                                </Button>
                            ))}
                        </Stack>
                    </Box>

                    {/* Send a Message */}
                    <Box sx={innerPanelSx}>
                        <SubHeading accent={sectionAccent}>Send a Message</SubHeading>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            aria-label="Contact form"
                        >
                            <Stack spacing={1.5}>
                                <TextField
                                    name="name"
                                    label="Your Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                />
                                <TextField
                                    name="email"
                                    label="Your Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                />
                                <TextField
                                    name="subject"
                                    label="Subject (Optional)"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                />
                                <TextField
                                    name="message"
                                    label="Your Message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    sx={fieldSx}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Send />}
                                    fullWidth
                                    sx={{
                                        py: 1.25,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        mt: 0.5,
                                    }}
                                >
                                    Send Message
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                <Snackbar
                    open={showAlert}
                    autoHideDuration={6000}
                    onClose={() => setShowAlert(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setShowAlert(false)}
                        severity={alertSeverity}
                        sx={{ width: '100%' }}
                    >
                        {alertMessage}
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
};

export default ContactCard;
