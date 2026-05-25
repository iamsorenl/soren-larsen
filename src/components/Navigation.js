import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
    ListItemButton,
    ListItemText,
    useTheme,
    useMediaQuery,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Brightness4,
    Brightness7,
    SettingsBrightness,
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

const navigationItems = [
    { label: 'About', id: 'about' },
    { label: 'Experience', id: 'experience' },
    { label: 'Projects', id: 'projects' },
    { label: 'Skills', id: 'skills' },
    { label: 'Education', id: 'education' },
    { label: 'Contact', id: 'contact' },
];

function HideOnScroll({ children }) {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
};

const Navigation = () => {
    const [activeSection, setActiveSection] = useState('about');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { setLightMode, setDarkMode, setSystemMode, isDark } = useThemeMode();

    useEffect(() => {
        const handleScroll = () => {
            const sections = navigationItems.map((item) => document.getElementById(item.id));
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
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
        setMobileOpen(false);
    };

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleThemeMenuOpen = (event) => setThemeMenuAnchor(event.currentTarget);
    const handleThemeMenuClose = () => setThemeMenuAnchor(null);

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

    const surfaceBg = isDark ? 'rgba(10, 14, 39, 0.72)' : 'rgba(255, 255, 255, 0.78)';

    const drawer = (
        <Box sx={{ width: 260, height: '100%', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleDrawerToggle} aria-label="Close navigation">
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navigationItems.map((item) => {
                    const active = activeSection === item.id;
                    return (
                        <ListItem key={item.id} disablePadding>
                            <ListItemButton
                                onClick={() => scrollToSection(item.id)}
                                aria-current={active ? 'page' : undefined}
                                sx={{
                                    color: active ? 'primary.main' : 'text.primary',
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <>
            <HideOnScroll>
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        backgroundColor: surfaceBg,
                        backdropFilter: 'blur(12px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                        borderBottom: (t) => `1px solid ${t.palette.divider}`,
                        color: 'text.primary',
                        boxShadow: 'none',
                    }}
                >
                    <Toolbar>
                        <Typography
                            component="div"
                            sx={{
                                flexGrow: 1,
                                fontFamily: '"Fraunces", "Times New Roman", serif',
                                fontWeight: 600,
                                fontSize: '1.25rem',
                                color: 'text.primary',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Soren Larsen
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                onClick={handleThemeMenuOpen}
                                aria-label="Change theme"
                                sx={{ color: 'text.primary' }}
                            >
                                {isDark ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>

                            {isMobile ? (
                                <IconButton
                                    aria-label="Open navigation"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{ color: 'text.primary' }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {navigationItems.map((item) => {
                                        const active = activeSection === item.id;
                                        return (
                                            <Button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                aria-current={active ? 'page' : undefined}
                                                sx={{
                                                    color: active ? 'primary.main' : 'text.secondary',
                                                    fontWeight: active ? 600 : 500,
                                                    borderBottom: '2px solid',
                                                    borderColor: active ? 'primary.main' : 'transparent',
                                                    borderRadius: 0,
                                                    px: 1.5,
                                                    minWidth: 0,
                                                    '&:hover': {
                                                        backgroundColor: 'transparent',
                                                        color: 'primary.main',
                                                    },
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        );
                                    })}
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
                        minWidth: 150,
                    },
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
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 260,
                        backgroundColor: 'background.paper',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navigation;
