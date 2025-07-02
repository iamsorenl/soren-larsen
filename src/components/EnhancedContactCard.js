import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    TextField,
    Stack,
    IconButton,
    Link,
    Tooltip,
    Divider,
    Alert,
    Snackbar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    ContactMail,
    Phone,
    Email,
    GitHub,
    LinkedIn,
    Description,
    Send,
    Person,
    Subject,
    Message
} from '@mui/icons-material';
import contactInfo from '../data/contact';
import resumePDF from '../data/SorenLarsenResume.pdf';

const EnhancedContactCard = () => {
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
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { phone, email, github, linkedin } = contactInfo[0];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            setAlertMessage('Please fill in all required fields.');
            setAlertSeverity('error');
            setShowAlert(true);
            return;
        }

        // Create mailto link with form data
        const subject = formData.subject || 'Contact from Portfolio Website';
        const body = `Hi Soren,

${formData.message}

Best regards,
${formData.name}
${formData.email}`;

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        // Show success message
        setAlertMessage('Opening your email client...');
        setAlertSeverity('success');
        setShowAlert(true);

        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    const contactMethods = [
        {
            icon: <Phone />,
            label: 'Phone',
            value: phone,
            action: () => window.location.href = `tel:${phone}`,
            color: '#4caf50'
        },
        {
            icon: <Email />,
            label: 'Email',
            value: email,
            action: () => window.location.href = `mailto:${email}`,
            color: '#2196f3'
        },
        {
            icon: <GitHub />,
            label: 'GitHub',
            value: 'github.com/iamsorenl',
            action: () => window.open(github, '_blank'),
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#333333'
        },
        {
            icon: <LinkedIn />,
            label: 'LinkedIn',
            value: 'linkedin.com/in/soren-larsen',
            action: () => window.open(linkedin, '_blank'),
            color: '#0077b5'
        }
    ];

    return (
        <Card 
            sx={{ 
                backgroundColor: 'primary.main', 
                color: 'primary.contrastText', 
                height: '100%', 
                width: '100%', 
                mb: 1, 
                borderRadius: '16px',
                background: (theme) => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                    : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ContactMail sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Contact
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
                    {/* Contact Information */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Get In Touch
                        </Typography>
                        
                        <Card 
                            sx={{ 
                                backgroundColor: 'background.paper',
                                backdropFilter: 'blur(10px)',
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                mb: 3
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Stack spacing={2}>
                                    {contactMethods.map((method, index) => (
                                        <Box key={index}>
                                            <Button
                                                onClick={method.action}
                                                sx={{
                                                    width: '100%',
                                                    justifyContent: 'flex-start',
                                                    textTransform: 'none',
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                    }
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        color: method.color,
                                                        mr: 2
                                                    }}
                                                >
                                                    {method.icon}
                                                </Box>
                                                <Box sx={{ textAlign: 'left' }}>
                                                    <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                                        {method.label}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {method.value}
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                    </Box>

                    {/* Contact Form */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Send a Message
                        </Typography>
                        
                        <Card 
                            sx={{ 
                                backgroundColor: 'background.paper',
                                backdropFilter: 'blur(10px)',
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Stack spacing={2}>
                                        <TextField
                                            name="name"
                                            label="Your Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            inputProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            InputLabelProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                                                }
                                            }}
                                            sx={{
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: theme.palette.primary.main
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: theme.palette.primary.main
                                                    }
                                                }
                                            }}
                                        />
                                        
                                        <TextField
                                            name="email"
                                            label="Your Email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            inputProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            InputLabelProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                                                }
                                            }}
                                            sx={{
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: theme.palette.primary.main
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: theme.palette.primary.main
                                                    }
                                                }
                                            }}
                                        />
                                        
                                        <TextField
                                            name="subject"
                                            label="Subject (Optional)"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <Subject sx={{ mr: 1, color: 'text.secondary' }} />,
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            inputProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            InputLabelProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                                                }
                                            }}
                                            sx={{
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: theme.palette.primary.main
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: theme.palette.primary.main
                                                    }
                                                }
                                            }}
                                        />
                                        
                                        <TextField
                                            name="message"
                                            label="Your Message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            fullWidth
                                            multiline
                                            rows={4}
                                            InputProps={{
                                                startAdornment: <Message sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            inputProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                                                }
                                            }}
                                            InputLabelProps={{
                                                style: {
                                                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                                                }
                                            }}
                                            sx={{
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: theme.palette.primary.main
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: theme.palette.primary.main
                                                    }
                                                }
                                            }}
                                        />
                                        
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<Send />}
                                            fullWidth
                                            sx={{
                                                py: 1.5,
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                mt: 2
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

export default EnhancedContactCard;
