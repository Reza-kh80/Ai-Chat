import React from 'react';
import { Moon, Sun, Waves } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { useTheme, themes } from '@/contexts/ThemeContext ';

const Settings = ({ user }) => {
    const { theme, setTheme } = useTheme();

    const themeIcons = {
        [themes.light]: <Sun className="h-4 w-4 text-primary-700 dark:text-primary-100 ocean:text-accent-100" />,
        [themes.dark]: <Moon className="h-4 w-4 text-primary-700 dark:text-primary-100 ocean:text-accent-100" />,
        [themes.ocean]: <Waves className="h-4 w-4 text-primary-700 dark:text-primary-100 ocean:text-accent-100" />
    };

    const nextTheme = () => {
        const themeValues = Object.values(themes);
        const currentIndex = themeValues.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themeValues.length;
        setTheme(themeValues[nextIndex]);
    };

    return (
        <div className="p-4 mt-auto border-t border-primary-200 dark:border-primary-800 ocean:border-accent-800">
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    onClick={nextTheme}
                    className="w-full flex items-center justify-around p-2 space-x-2 
                    hover:bg-primary-100 dark:hover:bg-primary-800 ocean:hover:bg-accent-700
                    text-primary-900 dark:text-primary-50 ocean:text-accent-50"
                >
                    {themeIcons[theme]}
                    <span className="ml-2">Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                </Button>

                {user && (
                    <div className="flex items-center space-x-3 p-2 mt-2 
                    bg-primary-100 dark:bg-primary-800 ocean:bg-accent-800 rounded-lg">
                        <div className="w-8 h-8 rounded-full 
                        bg-primary-200 dark:bg-primary-700 ocean:bg-accent-700 
                        text-primary-900 dark:text-primary-50 ocean:text-accent-50
                        flex items-center justify-center">
                            {user?.[0]}
                        </div>
                        <span className="text-primary-900 dark:text-primary-50 ocean:text-accent-50">
                            {user}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;