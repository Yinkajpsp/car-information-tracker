'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import VehicleCard from '@/components/VehicleCard';
import { MotResult } from '@/lib/types';
import { generateMotReminderIcs } from '@/lib/ics';

export default function Home() {
  const [mot, setMot] = useState<MotResult | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (reg: string) => {
    setIsLoading(true);
    setError(undefined);
    setMot(null);

    try {
      const response = await fetch(`/api/mot?reg=${encodeURIComponent(reg)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch MOT data');
      }

      setMot(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Car MOT Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Check your vehicle's MOT status and set reminders instantly.
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <VehicleCard
          mot={mot}
          error={error}
          onDownloadIcs={mot ? handleDownloadIcs : undefined}
        />
      </div>
    </main>
  );
}
