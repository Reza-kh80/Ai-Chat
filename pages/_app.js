import { ThemeProvider } from "@/contexts/ThemeContext ";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import Head from "next/head";
import axiosInstance from "@/lib/axiosInstance";

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const APP_NAME = "FitTech AI";
  const APP_DESCRIPTION = "A smart fitness assistant combining AI with personalized workout and health recommendations.";

  const verifyToken = async (token) => {
    try {
      const response = await axiosInstance.get('/users/verify-auth');

      const data = await response.data;
      return data.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const publicRoutes = ['/', '/authentication'];
        const token = localStorage.getItem('token');
        const activeUser = JSON.parse(localStorage.getItem('user') || '{"active": false}');

        if (!token || !activeUser.active) {
          if (!publicRoutes.includes(router.pathname)) {
            router.push('/authentication');
          }
          setIsLoading(false);
          return;
        }

        // Verify token validity
        const isTokenValid = await verifyToken(token);

        if (!isTokenValid) {
          // Clear invalid token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!publicRoutes.includes(router.pathname)) {
            router.push('/authentication');
          }
        } else if (publicRoutes.includes(router.pathname)) {
          router.push('/ai-chat'); // or your main authenticated route
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