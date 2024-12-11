import React from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { useTheme, themes } from '@/contexts/ThemeContext ';
import { useRouter } from 'next/router';
import { showToast } from '@/ui_template/ui/toast';
import axiosInstance from '@/lib/axiosInstance';

const Settings = ({ email, active }) => {
    const { theme, setTheme } = useTheme();
    const { push } = useRouter();

    const themeIcons = {
        [themes.light]: <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />,
        [themes.dark]: <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />,
    };

    const nextTheme = () => {
        const themeValues = Object.values(themes);
        const currentIndex = themeValues.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themeValues.length;
        setTheme(themeValues[nextIndex]);
    };

    const handleLogOut = () => {
        axiosInstance.post('/users/logout')
            .then((res) => {
                if (res.status === 200) {
                    localStorage.setItem('user', JSON.stringify({ email: '', active: false }));
                    localStorage.removeItem('token');
                    showToast({ message: res?.data?.message, type: "success" });
                    push('/');
                } else if (res.status === 404) {
                    showToast({ message: "User not found!", type: "error" });
                }
            })
            .catch((err) => {
                console.error("Logout error:", err);
                showToast({
                    message: err.response?.data?.message || "An error occurred. Please try again.",
                    type: "error"
                });
            });
    };
    return (
        <div className="px-6 py-5 mt-auto border-t border-primary-200/30 dark:border-primary-800/30 ocean:border-accent-800/30 backdrop-blur-sm">
            <div className="space-y-5">
                <Button
                    variant="ghost"
                    onClick={nextTheme}
                    className="group w-full flex items-center justify-between px-4
                    rounded-xl transition-all duration-300 ease-in-out
                    bg-primary-50/50 dark:bg-primary-900/50 ocean:bg-accent-900/50
                    hover:bg-primary-100 dark:hover:bg-primary-800/80 ocean:hover:bg-accent-800/80
                    text-primary-900 dark:text-primary-50 ocean:text-accent-50
                    shadow-sm hover:shadow-md py-9"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg 
                        bg-primary-100 dark:bg-primary-800 ocean:bg-accent-800
                        group-hover:bg-primary-200 dark:group-hover:bg-primary-700 ocean:group-hover:bg-accent-700">
                            {themeIcons[theme]}
                        </div>
                        <span className="font-medium">
                            {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
                        </span>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded-full 
                    bg-primary-100 dark:bg-primary-800 ocean:bg-accent-800
                    group-hover:bg-primary-200 dark:group-hover:bg-primary-700 ocean:group-hover:bg-accent-700">
                        Toggle
                    </div>
                </Button>

                {active && (
                    <div className="flex items-center justify-between p-4 
                    bg-primary-50/50 dark:bg-primary-900/50 ocean:bg-accent-900/50 
                    rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full 
                            bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 
                            ocean:from-accent-600 ocean:to-accent-800
                            text-white font-medium
                            flex items-center justify-center shadow-inner">
                                {email?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-primary-900 dark:text-primary-50 ocean:text-accent-50">
                                    {email}
                                </span>
                                <span className="text-xs text-primary-600 dark:text-primary-400 ocean:text-accent-400">
                                    Active Now
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg
                            bg-primary-100/50 dark:bg-primary-800/50 ocean:bg-accent-800/50
                            hover:bg-red-100 hover:text-red-600
                            dark:hover:bg-red-900/50 dark:hover:text-red-400
                            ocean:hover:bg-red-900/50 ocean:hover:text-red-400"
                            onClick={handleLogOut}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;