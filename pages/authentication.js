import { LogIn, Lock, ArrowRight } from 'lucide-react';
import Link from "next/link";
import React from 'react';

const auth = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md transform transition-all hover:scale-[1.01]">
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />
                    <div className="relative p-8">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-purple-50 dark:bg-purple-900/20 p-3">
                                <Lock className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Authentication Required
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Please log in to access the chat area and start your conversation
                            </p>

                            <Link href="/" className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200" />
                                <button className="relative flex items-center justify-center w-full px-8 py-3 bg-white dark:bg-gray-900 rounded-lg leading-none">
                                    <span className="flex items-center text-purple-500 dark:text-purple-400 transition duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                                        <LogIn className="mr-2 h-5 w-5" />
                                        Sign In Now
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default auth;