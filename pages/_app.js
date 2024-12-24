import { ThemeProvider } from "@/contexts/ThemeContext ";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import Head from "next/head";
import axiosInstance from "@/lib/axiosInstance";
import nookies from 'nookies';
import MessageLoader from "@/components/MessageLoader";

function MyApp({ Component, pageProps, isAuthenticated }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const router = useRouter();

  const APP_NAME = "FitTech AI";
  const APP_DESCRIPTION = "A smart fitness assistant combining AI with personalized workout and health recommendations.";

  useEffect(() => {
    // Handle route change events
    const handleStart = () => setIsRouteChanging(true);
    const handleComplete = () => setIsRouteChanging(false);
    const handleError = () => setIsRouteChanging(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  useEffect(() => {
    const handleClientSideRouting = async () => {
      try {
        const publicRoutes = ['/', '/authentication'];

        if (!isAuthenticated) {
          if (!publicRoutes.includes(router.pathname)) {
            // Store the shared ID if the path matches /shared/[id]
            if (typeof window !== 'undefined' && router.pathname === '/shared/[id]' && router.query.id) {
              localStorage.setItem('sharedId', router.query.id);
            }
            router.push('/authentication');
          }
        } else if (publicRoutes.includes(router.pathname)) {
          router.push('/ai-chat');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Store the shared ID in case of error as well
        if (typeof window !== 'undefined' && router.pathname === '/shared/[id]' && router.query.id) {
          localStorage.setItem('sharedId', router.query.id);
        }
        router.push('/authentication');
      } finally {
        setIsLoading(false);
      }
    };

    handleClientSideRouting();

    const handleRouteChange = () => {
      handleClientSideRouting();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, isAuthenticated]);

  // Rest of the code remains the same...
  const LoadingScreen = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
      <div className="text-center">
        <MessageLoader />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content={APP_DESCRIPTION} />

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

      {/* Show loading screen during initial load */}
      {isLoading && <LoadingScreen />}

      {/* Show loading screen during route changes */}
      {isRouteChanging && <LoadingScreen />}

      {/* Main content */}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const { ctx } = appContext;
  let pageProps = {};

  // Get the cookies from the context
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  const verifyToken = async (token) => {
    try {
      const response = await axiosInstance.get('/users/verify-auth', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  let isAuthenticated = false;

  if (token) {
    isAuthenticated = await verifyToken(token);

    // If token is invalid, clear it from cookies
    if (!isAuthenticated && ctx.res) {
      nookies.destroy(ctx, 'token');
      nookies.destroy(ctx, 'user');
    }
  }

  // If Component.getInitialProps exists, call it
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(ctx);
  }

  return { pageProps, isAuthenticated };
};

export default MyApp;