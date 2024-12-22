import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    light: 'light',
    dark: 'dark'
};

export const languages = {
    en: 'en',
    fa: 'fa'
};

// Add direction mapping
const languageDirections = {
    en: 'ltr',
    fa: 'rtl'
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || themes.light;
        }
        return themes.light;
    });

    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('lang') || languages.en;
        }
        return languages.en;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Handle theme
        root.classList.remove(...Object.values(themes));
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        // Handle language and direction
        root.setAttribute('lang', language);
        root.setAttribute('dir', languageDirections[language]);
        localStorage.setItem('lang', language);
    }, [language]);

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            language,
            setLanguage,
            direction: languageDirections[language]
        }}>
            {children}
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