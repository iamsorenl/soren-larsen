import React, { useEffect, useState } from 'react';
import SmallNavbar from './SmallNavbar';
import LargeNavbar from './LargeNavbar';

function Navbar() {
    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 960);

    const handleResize = () => {
        setIsScreenSmall(window.innerWidth <= 1280);
    };

    useEffect(() => {
        // Add event listener to handle window resize
        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isScreenSmall ? <SmallNavbar /> : <LargeNavbar />;
}

export default Navbar;