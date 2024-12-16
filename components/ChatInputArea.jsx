import React from 'react';
import { Send, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { Textarea } from '@/ui_template/ui/textarea';
import Image from 'next/image';

const ChatInputArea = ({
    prompt,
    selectedImage,
    textDirection,
    isLoading,
    onSetPrompt,
    onSetSelectedImage,
    onSubmitMessage,
    onImageUpload,
    fileInputRef
}) => {
    return (
        <div className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={onSubmitMessage} className="max-w-3xl mx-auto relative">
                <div className="relative">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 z-10">
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                        {selectedImage && (
                            <Button
                                onClick={() => onSetSelectedImage(null)}
                                className="p-1 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => onSetPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSubmitMessage(e);
                            }
                        }}
                        placeholder="Ask anything..."
                        rows="1"
                        className={`pl-12 pr-16 py-4 flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none 
        text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none w-full
        ${textDirection === 'rtl' ? 'text-right' : 'text-left'
                            }`}
                        dir={textDirection}
                        style={{
                            minHeight: '3rem',
                        }}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                        <Button
                            type="submit"
                            disabled={isLoading || (!prompt.trim() && !selectedImage)}
                            className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500
                    hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg 
                    shadow-lg transition-all duration-200 disabled:opacity-50"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                {selectedImage && (
                    <div className="mt-2 relative">
                        <div className="relative w-32 h-32">
                            <Image
                                src={selectedImage}
                                alt="Upload preview"
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onImageUpload}
                    accept="image/*"
                    className="hidden"
                />
            </form>
        </div>
    );
};

export default ChatInputArea;