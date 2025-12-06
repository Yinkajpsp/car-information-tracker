'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import VehicleCard from '@/components/VehicleCard';
import VehicleDetailsCard from '@/components/VehicleDetailsCard';
import { MotResult, VehicleExtraInfo } from '@/lib/types';
import { generateMotReminderIcs } from '@/lib/ics';

export default function Home() {
  const [mot, setMot] = useState<MotResult | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleExtraInfo | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const [recentRegs, setRecentRegs] = useState<string[]>([]);

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
  }, []);

  const addToHistory = (reg: string) => {
    const normalizedReg = reg.trim().toUpperCase();
    setRecentRegs(prev => {
      // Remove existing occurrence if any, then add to front
      const filtered = prev.filter(r => r !== normalizedReg);
      const updated = [normalizedReg, ...filtered].slice(0, 5);

      localStorage.setItem('recentRegs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (reg: string) => {
    setIsLoading(true);
    setError(undefined);
    setMot(null);
    setVehicleInfo(null);

    try {
      const response = await fetch(`/api/vehicle-info?reg=${encodeURIComponent(reg)}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No vehicle record found for that registration');
        } else if (response.status === 500) {
          throw new Error('Unable to reach the service, please try again later');
        } else {
          throw new Error(data.error || 'An unexpected error occurred. Please try again.');
        }
      }

      setMot(data.mot);
      setVehicleInfo(data.vehicle);
      addToHistory(reg);


    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!mot) return;

    const icsContent = generateMotReminderIcs(mot);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mot-reminder-${mot.registration}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Car MOT Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Check your vehicle's MOT status and set reminders instantly.
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {recentRegs.length > 0 && (
          <div className="mt-6 mb-8">
            <p className="text-sm text-gray-500 mb-2 text-center">Recent searches:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentRegs.map(reg => (
                <button
                  key={reg}
                  onClick={() => handleSearch(reg)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className={!vehicleInfo ? "md:col-span-2 md:max-w-md md:mx-auto w-full" : "w-full"}>
            <VehicleCard
              mot={mot}
              error={error}
              onDownloadIcs={mot ? handleDownloadIcs : undefined}
            />
          </div>

          {vehicleInfo && !error && (
            <div className="w-full mt-8 md:mt-0">
              <VehicleDetailsCard info={vehicleInfo} />
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
