import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    useScrollTrigger,
    Slide,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    useTheme,
    useMediaQuery,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Brightness4,
    Brightness7,
    SettingsBrightness
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

const navigationItems = [
    { label: 'About', id: 'about' },
    { label: 'Projects', id: 'projects' },
    { label: 'Experience', id: 'experience' },
    { label: 'Skills', id: 'skills' },
    { label: 'Education', id: 'education' },
    { label: 'Contact', id: 'contact' }
];

function HideOnScroll({ children }) {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

const Navigation = () => {
    const [activeSection, setActiveSection] = useState('about');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { mode, setLightMode, setDarkMode, setSystemMode, isDark } = useThemeMode();

    useEffect(() => {
        const handleScroll = () => {
            const sections = navigationItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(navigationItems[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        setMobileOpen(false);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleThemeMenuOpen = (event) => {
        setThemeMenuAnchor(event.currentTarget);
    };

    const handleThemeMenuClose = () => {
        setThemeMenuAnchor(null);
    };

    const handleThemeChange = (themeMode) => {
        switch (themeMode) {
            case 'light':
                setLightMode();
                break;
            case 'dark':
                setDarkMode();
                break;
            case 'system':
                setSystemMode();
                break;
            default:
                break;
        }
        handleThemeMenuClose();
    };

    const drawer = (
        <Box sx={{ width: 250, height: '100%', bgcolor: 'primary.main' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleDrawerToggle} sx={{ color: 'primary.contrastText' }}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navigationItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        sx={{
                            color: 'primary.contrastText',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <ListItemText 
                            primary={item.label}
                            sx={{
                                '& .MuiListItemText-primary': {
                                    fontWeight: activeSection === item.id ? 'bold' : 'normal'
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <HideOnScroll>
                <AppBar 
                    position="fixed" 
                    sx={{ 
                        backgroundColor: 'rgba(26, 35, 126, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <Toolbar>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                flexGrow: 1,
                                fontWeight: 'bold',
                                color: 'primary.contrastText'
                            }}
                        >
                            Soren Larsen
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                onClick={handleThemeMenuOpen}
                                sx={{ color: 'primary.contrastText' }}
                            >
                                {isDark ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                            
                            {isMobile ? (
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                >
                                    <MenuIcon />
                                </IconButton>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {navigationItems.map((item) => (
                                        <Button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            sx={{
                                                color: 'primary.contrastText',
                                                fontWeight: activeSection === item.id ? 'bold' : 'normal',
                                                borderBottom: activeSection === item.id ? '2px solid' : 'none',
                                                borderRadius: 0,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                                }
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>

            <Menu
                anchorEl={themeMenuAnchor}
                open={Boolean(themeMenuAnchor)}
                onClose={handleThemeMenuClose}
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: 'background.paper',
                        minWidth: 150
                    }
                }}
            >
                <MenuItem 
                    onClick={() => handleThemeChange('light')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <Brightness7 fontSize="small" />
                    Light
                </MenuItem>
                <MenuItem 
                    onClick={() => handleThemeChange('dark')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <Brightness4 fontSize="small" />
                    Dark
                </MenuItem>
                <MenuItem 
                    onClick={() => handleThemeChange('system')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <SettingsBrightness fontSize="small" />
                    System
                </MenuItem>
            </Menu>

            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: 250,
                        backgroundColor: 'primary.main'
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navigation;
