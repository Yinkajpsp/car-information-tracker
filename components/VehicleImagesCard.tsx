import React, { useState, useEffect } from 'react';

interface VehicleImagesCardProps {
    vehicle: {
        make: string;
        model: string;
        year?: number;
    } | null;
}

interface ImageResult {
    url: string;
    thumbnailUrl: string;
    title: string;
}

const VIEWS = ['Front', 'Rear', 'Side', 'Interior'];

export default function VehicleImagesCard({ vehicle }: VehicleImagesCardProps) {
    const [view, setView] = useState('Front');
    const [images, setImages] = useState<ImageResult[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch images when vehicle or view changes
    useEffect(() => {
        if (!vehicle) return;

        const fetchImages = async () => {
            setLoading(true);
            setImages([]);
            setSelectedImage(null);

            try {
                const query = new URLSearchParams({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year?.toString() || '',
                    view: view
                });

                const res = await fetch(`/api/vehicle-images?${query.toString()}`);
                const data = await res.json();

                if (data.images && data.images.length > 0) {
                    setImages(data.images);
                    setSelectedImage(data.images[0].url);
                } else {
                    setImages([]);
                }
            } catch (error) {
                console.error("Failed to fetch images", error);
            } finally {
                setLoading(false);
                setHasSearched(true);
            }
        };

        fetchImages();
    }, [vehicle, view]);

    if (!vehicle) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full fade-in" style={{ animationDelay: '200ms' }}>
            {/* Header with View Tabs */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Vehicle {view}</h2>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex space-x-2 overflow-x-auto pb-1 hide-scrollbar">
                    {VIEWS.map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap
                                ${view === v
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-grow flex flex-col">
                {loading ? (
                    <div className="flex-grow flex items-center justify-center h-56 bg-gray-50 rounded-lg animate-pulse">
                        <p className="text-gray-400 font-medium">Loading {view} views...</p>
                    </div>
                ) : images.length > 0 && selectedImage ? (
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative w-full h-56 bg-gray-100 rounded-lg overflow-hidden shadow-sm group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selectedImage}
                                alt={`${vehicle.make} ${vehicle.model} ${view}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* Thumbnails Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img.url)}
                                    className={`relative h-16 rounded-md overflow-hidden border-2 transition-all 
                                        ${selectedImage === img.url
                                            ? 'border-indigo-500 ring-2 ring-indigo-100'
                                            : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.thumbnailUrl}
                                        alt={`Thumbnail ${idx}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : hasSearched ? (
                    <div className="flex-grow flex flex-col items-center justify-center h-56 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className="text-gray-400 font-medium text-sm">No images found for this view</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
