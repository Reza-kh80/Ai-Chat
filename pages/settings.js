import React, { useState, useEffect } from 'react';

// import components
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';

const settings = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log(storedUser);
        setUser(storedUser);
    }, []);

    // Add a check for when user is null
    if (!user) {
        return (
            <Layout title='Settings'>
                <div>Loading...</div>
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