import { ThemeProvider } from "@/contexts/ThemeContext ";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const APP_NAME = "FitTech AI";
  const APP_DESCRIPTION = "A smart fitness assistant combining AI with personalized workout and health recommendations.";

  useEffect(() => {
    const checkAuth = () => {
      try {
        const publicRoutes = ['/', '/authentication'];
        const activeUser = JSON.parse(localStorage.getItem('user') || '{"active": false}');
        const token = localStorage.getItem('token');

        if ((!activeUser.active || !token) && !publicRoutes.includes(router.pathname)) {
          router.push('/authentication');
          return;
        }

        if (activeUser.active && token && publicRoutes.includes(router.pathname)) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/authentication');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleRouteChange = () => {
      checkAuth();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content={APP_DESCRIPTION} />
        <title>{APP_NAME}</title>

        {/* PWA essential tags */}
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/Logo.png" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
