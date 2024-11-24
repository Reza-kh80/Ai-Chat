import React, { Fragment } from 'react';
import Head from 'next/head';

// import ui components
import { Toaster } from '@/ui_template/ui/toaster';
const Layout = ({ title, children }) => {
    return (
        <Fragment>
            <Head>
                <title>{`AI – ${title}`}</title>
            </Head>
            <div className='d-flex flex-column justify-content-between align-items-center'>
                {children}
                <Toaster />
            </div>
        </Fragment>
    )
}

export default Layout;