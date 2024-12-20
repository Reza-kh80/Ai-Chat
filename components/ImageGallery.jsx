import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, X, Download, ChevronLeft, ChevronRight, Expand, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay
} from "@/ui_template/ui/dialog";
import { cn } from "@/lib/utils";

const ImageGallery = ({ images }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const displayedImages = images?.slice(0, 4) || [];
    const remainingImages = images?.slice(4) || [];
    const hasMoreImages = remainingImages.length > 0;

    const handleDownload = (e, imageUrl) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = "_blank"
        link.download = imageUrl.split('/').pop() || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setIsOpen(true);
    };

    const navigate = (direction) => {
        setIsZoomed(false);
        setSelectedImageIndex((prev) => {
            if (direction === 'next') {
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

    const modalVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.2 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        },
        exit: (direction) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        })
    };

    return (
        <div className="mt-4">
            {/* Main Gallery Grid */}
            <motion.div
                className="grid grid-cols-12 gap-3 h-[32rem]"
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
                        key={index}
                        variants={gridItemVariants}
                        onClick={() => openImageModal(index)}
                        className={cn(
                            "relative rounded-2xl overflow-hidden cursor-pointer group",
                            index === 0
                                ? 'col-span-12 md:col-span-6 row-span-2'
                                : 'col-span-12 md:col-span-3 row-span-1'
                        )}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
                                <motion.button
                                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <Expand className="w-5 h-5 text-gray-800" />
                                </motion.button>
                                <motion.button
                                    onClick={(e) => handleDownload(e, imageUrl)}
                                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <Download className="w-5 h-5 text-gray-800" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {hasMoreImages && (
                    <motion.div
                        variants={gridItemVariants}
                        onClick={() => openImageModal(4)}
                        className="col-span-12 md:col-span-3 row-span-1 relative rounded-2xl 
                                 overflow-hidden cursor-pointer group"
                    >
                        <Image
                            src={remainingImages[0]}
                            alt="More images"
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="text-center text-white">
                                <Eye className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-lg font-medium">
                                    +{remainingImages.length} more
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Enhanced Modal */}
            <AnimatePresence>
                {isOpen && (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogPortal>
                            <DialogOverlay
                                className="fixed inset-0 bg-black/98 z-50 backdrop-blur-lg"
                                onClick={() => {
                                    if (isZoomed) {
                                        setIsZoomed(false);
                                    } else {
                                        setIsOpen(false);
                                    }
                                }}
                            >
                                <motion.div
                                    variants={modalVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="fixed inset-0 z-50"
                                    onKeyDown={handleKeyDown}
                                >
                                    <DialogContent className="h-full flex items-center justify-center p-4 outline-none [&>button]:hidden">
                                        <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
                                            {/* Navigation Buttons with Improved Contrast */}
                                            <AnimatePresence>
                                                {!isZoomed && (
                                                    <>
                                                        <motion.button
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('prev');
                                                            }}
                                                            className="absolute left-4 z-50 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
                                                        >
                                                            <ChevronLeft className="w-6 h-6 text-white" />
                                                        </motion.button>
                                                        <motion.button
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('next');
                                                            }}
                                                            className="absolute right-4 z-50 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
                                                        >
                                                            <ChevronRight className="w-6 h-6 text-white" />
                                                        </motion.button>
                                                    </>
                                                )}
                                            </AnimatePresence>

                                            {/* Main Image Container - remains the same */}
                                            <motion.div
                                                key={selectedImageIndex}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                variants={slideVariants}
                                                className={cn(
                                                    "relative w-full h-[85vh] flex items-center justify-center",
                                                    isZoomed && "cursor-zoom-out"
                                                )}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={images[selectedImageIndex]}
                                                        alt={`Full size image ${selectedImageIndex + 1}`}
                                                        fill
                                                        className={cn(
                                                            "object-contain transition-transform duration-300",
                                                            isZoomed && "scale-150"
                                                        )}
                                                        priority
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Controls Overlay */}
                                            <AnimatePresence>
                                                {!isZoomed && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 20 }}
                                                        className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="px-4 py-2 rounded-full bg-gray-800/80 backdrop-blur-sm text-white text-sm">
                                                                {selectedImageIndex + 1} / {images.length}
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() => setIsZoomed(!isZoomed)}
                                                                className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
                                                            >
                                                                <ZoomIn className="w-5 h-5 text-white" />
                                                            </motion.button>
                                                        </div>

                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={(e) => handleDownload(e, images[selectedImageIndex])}
                                                            className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
                                                        >
                                                            <Download className="w-5 h-5 text-white" />
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Close Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => setIsOpen(false)}
                                                className="absolute top-4 right-4 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
                                            >
                                                <X className="w-6 h-6 text-white" />
                                            </motion.button>
                                        </div>
                                    </DialogContent>
                                </motion.div>
                            </DialogOverlay>
                        </DialogPortal>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageGallery;


/*
import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay
} from "@/ui_template/ui/dialog";
import { cn } from "@/lib/utils";

const ImageGallery = ({ images }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const displayedImages = images?.slice(0, 3) || [];
    const remainingImages = images?.slice(3) || [];
    const hasMoreImages = remainingImages.length > 0;

    const handleDownload = (e, imageUrl) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageUrl.split('/').pop() || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setIsOpen(true);
    };

    const navigate = (direction) => {
        setSelectedImageIndex((prev) => {
            if (direction === 'next') {
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

    // Animation variants
    const gridItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
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
                        key={index}
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
                            sizes="(max-width: 768px) 100vw, 50vw"
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

            <AnimatePresence>
                {isOpen && (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogPortal>
                            <DialogOverlay
                                className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <motion.div
                                    variants={modalVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="fixed inset-0 z-50"
                                    onKeyDown={handleKeyDown}
                                >
                                    <DialogContent className="h-full flex items-center justify-center p-4 outline-none [&>button]:hidden">
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
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                variants={slideVariants}
                                                className="relative w-full h-[80vh] flex items-center justify-center"
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={images[selectedImageIndex]}
                                                        alt={`Full size image ${selectedImageIndex + 1}`}
                                                        fill
                                                        className="object-contain"
                                                        priority
                                                    />
                                                </div>
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
                                                    onClick={(e) => handleDownload(e, images[selectedImageIndex])}
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
                                    </DialogContent>
                                </motion.div>
                            </DialogOverlay>
                        </DialogPortal>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageGallery;
*/