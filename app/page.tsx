'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import VehicleCard from '@/components/VehicleCard';
import VehicleDetailsCard from '@/components/VehicleDetailsCard';
import VehicleImagesCard from '@/components/VehicleImagesCard'; // Added
import { MotResult, VehicleExtraInfo } from '@/lib/types';
import { generateMotReminderIcs } from '@/lib/ics';

export default function Home() {
  const [reg, setReg] = useState(''); // Changed from parameter to state
  const [mot, setMot] = useState<MotResult | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleExtraInfo | null>(null);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]); // New state
  const [loading, setLoading] = useState(false); // Renamed from isLoading
  const [loadingImages, setLoadingImages] = useState(false); // New loading state
  const [error, setError] = useState(''); // Changed type and default
  const [recentRegs, setRecentRegs] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false); // New state for hydration

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentRegs');
      if (saved) {
        try {
          setRecentRegs(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent searches', e);
        }
      }
    }
    setHasHydrated(true); // Mark as hydrated
  }, []);

  const addToHistory = (newReg: string) => { // Updated parameter name
    const normalizedReg = newReg.trim().toUpperCase(); // Use newReg
    setRecentRegs(prev => {
      // Remove existing occurrence if any, then add to front
      const filtered = prev.filter(r => r !== normalizedReg);
      const updated = [normalizedReg, ...filtered].slice(0, 5);

      localStorage.setItem('recentRegs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (searchReg: string) => { // Updated parameter name
    setLoading(true); // Renamed from setIsLoading
    setLoadingImages(true); // Start image loading
    setError(''); // Changed to empty string
    setMot(null);
    setVehicleInfo(null);
    setVehicleImages([]); // Reset images

    // Update input if triggered by click
    if (searchReg !== reg) setReg(searchReg);

    try {
      const res = await fetch(`/api/vehicle-info?reg=${encodeURIComponent(searchReg)}`); // Use searchReg, renamed response to res
      const data = await res.json();

      if (!res.ok) { // Use res.ok
        if (res.status === 404) {
          setError('Vehicle not found. Please check the registration.'); // Updated error message
        } else if (res.status === 500) {
          setError('System error. Please try again later.'); // Updated error message
        } else {
          setError(data.error || 'An unexpected error occurred.'); // Updated error message
        }
        setLoading(false); // Set loading to false on error
        setLoadingImages(false); // Set image loading to false on error
        return;
      }

      setMot(data.mot);
      setVehicleInfo(data.vehicle);
      addToHistory(searchReg); // Use searchReg
      setLoading(false); // Main data loaded

      // Fetch images in background
      if (data.vehicle) {
        const { make, model, yearOfManufacture, bodyType } = data.vehicle;
        const query = new URLSearchParams({
          make,
          model,
          year: yearOfManufacture?.toString() || '',
          bodyType: bodyType || ''
        });

        fetch(`/api/vehicle-images?${query.toString()}`)
          .then(imgRes => imgRes.json())
          .then(imgData => {
            setVehicleImages(imgData.images || []);
            setLoadingImages(false);
          })
          .catch(err => {
            console.error("Image fetch error", err);
            setVehicleImages([]);
            setLoadingImages(false);
          });
      } else {
        setLoadingImages(false);
      }

    } catch (err: any) {
      setError('Network error. Check your connection.'); // Updated error message
      setLoading(false); // Set loading to false on error
      setLoadingImages(false); // Set image loading to false on error
    }
  };

  const handleDownloadIcs = () => {
    if (mot) { // Changed condition
      const icsContent = generateMotReminderIcs(mot);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob); // Changed window.URL to URL
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mot-reminder-${mot.registration}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-gray-900">
              MOT<span className="text-blue-600">TRACKER</span>
            </h1>
          </div>
          <a href="#" className="hidden md:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">Documentation</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">

        {/* Search Section */}
        <section className="max-w-xl mx-auto mb-10 mt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Check Your Vehicle</h2>
            <p className="text-gray-500">Enter your registration number to get comprehensive MOT history, vehicle details, and images.</p>
          </div>

          <SearchForm
            onSearch={handleSearch}
            isLoading={loading}
          />

          {/* Recent Searches */}
          {hasHydrated && recentRegs.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider py-1.5">Recent:</span>
              {recentRegs.map(r => (
                <button
                  key={r}
                  onClick={() => handleSearch(r)}
                  className="bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full transition-all shadow-sm"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start animate-fade-in-up">
            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-800">Search Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Grid - 3 Columns now */}
        {mot && vehicleInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-7xl mx-auto animate-fade-in-up">
            {/* 1. MOT Card */}
            <div className="md:col-span-1">
              <VehicleCard
                mot={mot}
                onDownloadIcs={handleDownloadIcs}
              />
            </div>

            {/* 2. Details Card */}
            <div className="md:col-span-1">
              <VehicleDetailsCard info={vehicleInfo} />
            </div>

            {/* 3. Images Card (Google Custom Search) */}
            <div className="md:col-span-1 h-full">
              <VehicleImagesCard
                vehicle={{
                  make: vehicleInfo.make,
                  model: vehicleInfo.model,
                  year: vehicleInfo.yearOfManufacture || undefined
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MOT Tracker. Data provided by DVSA & CheckCarDetails.
          </p>
        </div>
      </footer>

    </div>
  );
}
