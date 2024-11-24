import React, { useState, useEffect } from 'react';

// impprt components
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';

const settings = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('active');
        setUser(storedUser);
    }, []);

    return (
        <Layout title='Settings'>
            <Settings user={user} />
        </Layout>
    );
};

export default settings;