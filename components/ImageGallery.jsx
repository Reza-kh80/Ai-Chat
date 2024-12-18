import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, X, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogPortal,
    DialogOverlay
} from "@/ui_template/ui/dialog";

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

    return (
        <div className="mt-4">
            {/* Main Gallery Grid */}
            <div className="grid grid-cols-12 gap-2 h-72">
                {displayedImages.map((imageUrl, index) => (
                    <div
                        key={index}
                        onClick={() => openImageModal(index)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer group
                                  ${index === 0 ? 'col-span-12 md:col-span-6 row-span-2' :
                                'col-span-6 md:col-span-3 row-span-1'} 
                                  transition-transform duration-300 ease-out hover:scale-[1.02]`}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
                                      transition-opacity duration-300">
                            <button
                                onClick={(e) => handleDownload(e, imageUrl)}
                                className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 
                                         hover:bg-white transition-all transform hover:scale-110"
                            >
                                <Download className="w-5 h-5 text-gray-800" />
                            </button>
                        </div>
                    </div>
                ))}
                {hasMoreImages && (
                    <div
                        onClick={() => openImageModal(3)}
                        className="col-span-6 md:col-span-3 row-span-1 relative rounded-xl 
                                 overflow-hidden bg-gray-100 dark:bg-gray-800 group cursor-pointer"
                    >
                        <Image
                            src={remainingImages[0]}
                            alt="More images"
                            fill
                            className="object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center 
                                      bg-black/40 group-hover:bg-black/50 transition-all">
                            <div className="text-center text-white">
                                <Eye className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">
                                    +{remainingImages.length} more
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="fixed inset-0 z-50 p-0 w-screen h-screen max-w-none bg-black/95">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Navigation Buttons */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('prev');
                            }}
                            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 
                                     transition-all transform hover:scale-110"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('next');
                            }}
                            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 
                                     transition-all transform hover:scale-110"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Main Image */}
                        <div className="relative w-[90vw] h-[80vh] flex items-center justify-center">
                            <Image
                                src={images[selectedImageIndex]}
                                alt={`Full size image ${selectedImageIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                            />

                            {/* Image Controls */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button
                                    onClick={(e) => handleDownload(e, images[selectedImageIndex])}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 
                                             transition-all transform hover:scale-110"
                                >
                                    <Download className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full 
                                         bg-white/10 hover:bg-white/20 transition-all 
                                         transform hover:scale-110"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full 
                                          bg-white/10 text-white text-sm">
                                {selectedImageIndex + 1} / {images.length}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImageGallery;