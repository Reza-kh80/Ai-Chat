import { ThemeProvider } from "@/contexts/ThemeContext ";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const publicRoutes = ['/', '/authentication'];
        const activeUser = JSON.parse(localStorage.getItem('user') || '{"active": false}');
        const token = localStorage.getItem('token');

        if ((!activeUser.active || !token) && !publicRoutes.includes(router.pathname)) {
          router.push('/authentication');
          setIsLoading(false);
          return;
        }

        if (activeUser.active && token && publicRoutes.includes(router.pathname)) {
          router.push('/');
          setIsLoading(false);
          return;
        }

      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/authentication');
      }
      setIsLoading(false);
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
    return null;
  }

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;