import React, { useEffect, useState } from 'react';
import SmallNavbar from './SmallNavbar';
import LargeNavbar from './LargeNavbar';

function Navbar() {
    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 960);

    const handleResize = () => {
        setIsScreenSmall(window.innerWidth <= 960);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isScreenSmall ? <SmallNavbar /> : <LargeNavbar />;
}

export default Navbar;