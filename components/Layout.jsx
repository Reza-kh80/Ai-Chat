import React, { Fragment } from 'react';
import Head from 'next/head';


const Layout = ({ title, children }) => {
    return (
        <Fragment>
            <Head>
                <title>{`AI – ${title}`}</title>
            </Head>
            <div className='d-flex flex-column justify-content-between align-items-center'>
                {children}
            </div>
        </Fragment>
    )
}

export default Layout;