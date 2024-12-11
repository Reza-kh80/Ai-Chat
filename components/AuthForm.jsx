import { Dumbbell, Mail, Lock } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { Input } from '@/ui_template/ui/input';
import { Label } from '@/ui_template/ui/label';
import { Card } from '@/ui_template/ui/card';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { showToast } from '@/ui_template/ui/toast';
import axiosInstance from '@/lib/axiosInstance';

const AuthForm = () => {
    const { push } = useRouter();
    const [isFlipped, setIsFlipped] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '' });

    // Add validation states
    const [errors, setErrors] = useState({
        login: { email: '', password: '' },
        signup: { email: '', password: '', confirmPassword: '' }
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Reset errors
        setErrors({ ...errors, login: { email: '', password: '' } });

        // Validate
        let hasErrors = false;
        const newErrors = { email: '', password: '' };

        if (!loginData.email) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        } else if (!validateEmail(loginData.email)) {
            newErrors.email = 'Please enter a valid email';
            hasErrors = true;
        }

        if (!loginData.password) {
            newErrors.password = 'Password is required';
            hasErrors = true;
        } else if (loginData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors({ ...errors, login: newErrors });
            return;
        }

        try {
            const response = await axiosInstance.post('/users/login', loginData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({ email: response.data.email, active: true }));
            showToast({ message: response?.data?.message, type: "success" });
            push('/ai-chat');
        } catch (error) {
            showToast({ message: error.response?.data?.message || "Login failed", type: "error" });
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // Reset errors
        setErrors({ ...errors, signup: { email: '', password: '', confirmPassword: '' } });

        // Validate
        let hasErrors = false;
        const newErrors = { email: '', password: '', confirmPassword: '' };

        if (!signupData.email) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        } else if (!validateEmail(signupData.email)) {
            newErrors.email = 'Please enter a valid email';
            hasErrors = true;
        }

        if (!signupData.password) {
            newErrors.password = 'Password is required';
            hasErrors = true;
        } else if (signupData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            hasErrors = true;
        }

        if (!signupData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            hasErrors = true;
        } else if (signupData.password !== signupData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors({ ...errors, signup: newErrors });
            return;
        }

        try {
            const response = await axiosInstance.post('/users/signup', signupData);
            showToast({ message: "Account created successfully!", type: "success" });
            setIsFlipped(false);
        } catch (error) {
            showToast({ message: error.response?.data?.message || "Registration failed", type: "error" });
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-6xl h-[600px] flex rounded-xl shadow-2xl overflow-hidden">
                {/* Image Section */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src="Images/back2.webp"
                        alt="Fitness"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-blue-600/80 mix-blend-multiply" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
                        <Dumbbell size={48} className="mb-6" />
                        <h2 className="text-4xl font-bold mb-4">Welcome to FitTech AI</h2>
                        <p className="text-lg text-center opacity-90">
                            Transform your fitness journey with the power of AI
                        </p>
                    </div>
                </div>

                {/* Auth Section */}
                <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
                    <div className={`w-full max-w-md transition-transform duration-700 ${isFlipped ? 'scale-0' : 'scale-100'}`}>
                        {!isFlipped ? (
                            <Card className="p-8 shadow-lg">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Login</h2>
                                <form onSubmit={handleLogin} noValidate className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-3.5 h-5 w-5 text-gray-400">
                                                <Mail size={20} />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                className="h-12 w-full pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            />
                                            {errors.login.email && (
                                                <p className="text-sm text-red-500 mt-1">{errors.login.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-3.5 h-5 w-5 text-gray-400">
                                                <Lock size={20} />
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                className="h-12 w-full pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            />
                                            {errors.login.password && (
                                                <p className="text-sm text-red-500 mt-1">{errors.login.password}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700">
                                        Login
                                    </Button>
                                </form>
                                <p className="mt-4 text-center text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setIsFlipped(true)}
                                        className="text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </Card>
                        ) : null}
                    </div>

                    <div className={`w-full max-w-md absolute transition-transform duration-700 ${!isFlipped ? 'scale-0' : 'scale-100'}`}>
                        {isFlipped ? (
                            <Card className="p-8 shadow-lg">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign Up</h2>
                                <form onSubmit={handleSignup} noValidate className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-3.5 h-5 w-5 text-gray-400">
                                                <Mail size={20} />
                                            </div>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="Enter your email"
                                                className="h-12 w-full pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={signupData.email}
                                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            />
                                            {errors.signup.email && (
                                                <p className="text-sm text-red-500 mt-1">{errors.signup.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-3.5 h-5 w-5 text-gray-400">
                                                <Lock size={20} />
                                            </div>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="Create a password"
                                                className="h-12 w-full pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={signupData.password}
                                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            />
                                            {errors.signup.password && (
                                                <p className="text-sm text-red-500 mt-1">{errors.signup.password}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-3.5 h-5 w-5 text-gray-400">
                                                <Lock size={20} />
                                            </div>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="Confirm your password"
                                                className="h-12 w-full pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={signupData.confirmPassword}
                                                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                            />
                                            {errors.signup.confirmPassword && (
                                                <p className="text-sm text-red-500 mt-1">{errors.signup.confirmPassword}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700">
                                        Sign Up
                                    </Button>
                                </form>
                                <p className="mt-4 text-center text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setIsFlipped(false)}
                                        className="text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Login
                                    </button>
                                </p>
                            </Card>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;