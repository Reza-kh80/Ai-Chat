import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toaster } from '@/ui_template/ui/toaster';

const ThemeContext = createContext();

export const themes = {
    light: 'light',
    dark: 'dark'
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || themes.light;
        }
        return themes.light;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(...Object.values(themes));
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
            <Toaster />
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};