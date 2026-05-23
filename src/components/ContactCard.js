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
    useMediaQuery
} from '@mui/material';
import {
    ContactMail,
    Phone,
    Email,
    GitHub,
    LinkedIn,
    Send
} from '@mui/icons-material';
import contactInfo from '../data/contact';

const ContactCard = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { phone, email, github, linkedin } = contactInfo[0];

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
            action: () => { window.location.href = `tel:${phone}`; },
            color: '#4caf50'
        },
        {
            icon: <Email fontSize="small" />,
            label: 'Email',
            value: email,
            action: () => { window.location.href = `mailto:${email}`; },
            color: '#2196f3'
        },
        {
            icon: <GitHub fontSize="small" />,
            label: 'GitHub',
            value: 'github.com/iamsorenl',
            action: () => window.open(github, '_blank'),
            color: isDark ? '#ffffff' : '#333333'
        },
        {
            icon: <LinkedIn fontSize="small" />,
            label: 'LinkedIn',
            value: 'linkedin.com/in/soren-larsen',
            action: () => window.open(linkedin, '_blank'),
            color: '#0077b5'
        }
    ];

    const fieldSx = {
        '& .MuiInputLabel-root.Mui-focused': {
            color: theme.palette.primary.main
        },
        '& .MuiOutlinedInput-root': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)'
            },
            '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
            }
        }
    };

    const innerPanelSx = {
        backgroundColor: 'background.paper',
        backdropFilter: 'blur(10px)',
        border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <Card
            sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                height: '100%',
                width: '100%',
                mb: 1,
                borderRadius: '16px',
                background: (t) => t.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                    : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                    <ContactMail sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Contact
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 2,
                        alignItems: 'stretch'
                    }}
                >
                    {/* Get In Touch */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="overline" sx={{ mb: 1, fontWeight: 700, letterSpacing: 1, opacity: 0.85 }}>
                            Get In Touch
                        </Typography>
                        <Card sx={innerPanelSx}>
                            <CardContent sx={{ p: 1.5, flex: 1, '&:last-child': { pb: 1.5 } }}>
                                <Stack spacing={0.5}>
                                    {contactMethods.map((method, index) => (
                                        <Button
                                            key={index}
                                            onClick={method.action}
                                            sx={{
                                                width: '100%',
                                                justifyContent: 'flex-start',
                                                textTransform: 'none',
                                                py: 1,
                                                px: 1.5,
                                                borderRadius: 1.5,
                                                color: 'text.primary',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                                    transform: 'translateX(2px)'
                                                }
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    mr: 1.5,
                                                    backgroundColor: `${method.color}22`,
                                                    color: method.color
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
                                                        display: 'block'
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
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {method.value}
                                                </Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Send a Message */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="overline" sx={{ mb: 1, fontWeight: 700, letterSpacing: 1, opacity: 0.85 }}>
                            Send a Message
                        </Typography>
                        <Card sx={innerPanelSx}>
                            <CardContent sx={{ p: 2, flex: 1, '&:last-child': { pb: 2 } }}>
                                <Box component="form" onSubmit={handleSubmit}>
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
                                                mt: 0.5
                                            }}
                                        >
                                            Send Message
                                        </Button>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
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
