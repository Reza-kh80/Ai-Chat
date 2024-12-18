import React, { useState, useEffect } from 'react';
import { parseCookies } from 'nookies';

// import components
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';
import MessageLoader from '@/components/MessageLoader';

const settings = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const cookies = parseCookies();
        const storedUser = JSON.parse(cookies.user);
        setUser(storedUser);
    }, []);

    // Add a check for when user is null
    if (!user) {
        return (
            <Layout title='Settings'>
                <MessageLoader />
            </Layout>
        );
    }

    return (
        <Layout title='Settings'>
            <Settings
                email={user.email}
                active={user.active}
            />
        </Layout>
    );
};

export default settings;