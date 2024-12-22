import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

const ImageGallery = ({ images }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    
    const displayedImages = images?.slice(0, 3) || [];
    const remainingImages = images?.slice(3) || [];
    const hasMoreImages = remainingImages.length > 0;

    const handleDownload = async (e, imageUrl) => {
        e.stopPropagation();
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = imageUrl.split('/').pop() || 'image';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setIsOpen(true);
    };

    const navigate = (dir) => {
        setDirection(dir === 'next' ? 1 : -1);
        setSelectedImageIndex((prev) => {
            if (dir === 'next') {
                return (prev + 1) % images.length;
            } else {
                return prev === 0 ? images.length - 1 : prev - 1;
            }
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') navigate('prev');
        if (e.key === 'ArrowRight') navigate('next');
        if (e.key === 'Escape') setIsOpen(false);
    };

    const gridItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="mt-4">
            <motion.div
                className="grid grid-cols-12 gap-2 h-72"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
            >
                {displayedImages.map((imageUrl, index) => (
                    <motion.div
                        key={imageUrl}
                        variants={gridItemVariants}
                        onClick={() => openImageModal(index)}
                        className={cn(
                            "relative rounded-xl overflow-hidden cursor-pointer group",
                            index === 0
                                ? 'col-span-12 md:col-span-6 row-span-2'
                                : 'col-span-6 md:col-span-3 row-span-1'
                        )}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index === 0}
                        />
                        <motion.div
                            className="absolute inset-0 bg-black/20"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                        >
                            <motion.button
                                onClick={(e) => handleDownload(e, imageUrl)}
                                className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90"
                                whileHover={{ scale: 1.1 }}
                            >
                                <Download className="w-5 h-5 text-gray-800" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                ))}

                {hasMoreImages && (
                    <motion.div
                        variants={gridItemVariants}
                        onClick={() => openImageModal(3)}
                        className="col-span-6 md:col-span-3 row-span-1 relative rounded-xl 
                                 overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                    >
                        <Image
                            src={remainingImages[0]}
                            alt="More images"
                            fill
                            className="object-cover opacity-60"
                        />
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/40"
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            <div className="text-center text-white">
                                <Eye className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">
                                    +{remainingImages.length} more
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>

            {/* Custom Modal instead of shadcn Dialog */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onKeyDown={handleKeyDown}
                        >
                            <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('prev');
                                    }}
                                    className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </motion.button>

                                <motion.div
                                    key={selectedImageIndex}
                                    initial={{ opacity: 0, x: direction * 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -direction * 100 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative w-full h-[80vh]"
                                >
                                    <Image
                                        src={images[selectedImageIndex]}
                                        alt={`Full size image ${selectedImageIndex + 1}`}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </motion.div>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('next');
                                    }}
                                    className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </motion.button>

                                <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4">
                                    <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                                        {selectedImageIndex + 1} / {images.length}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(e, images[selectedImageIndex]);
                                        }}
                                        className="p-3 rounded-full bg-white/10 hover:bg-white/20"
                                    >
                                        <Download className="w-5 h-5 text-white" />
                                    </motion.button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageGallery;