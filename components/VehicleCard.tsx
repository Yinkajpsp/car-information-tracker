import { MotResult } from '@/lib/types';

interface VehicleCardProps {
    mot: MotResult | null;
    error?: string;
    onDownloadIcs?: () => void;
}

export default function VehicleCard({ mot, error, onDownloadIcs }: VehicleCardProps) {
    if (error) {
        return (
            <div className="w-full max-w-md mx-auto mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center animate-fade-in">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Finding Vehicle</h3>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!mot) return null;

    const expiryDate = new Date(mot.motExpiryDate);
    const now = new Date();

    // Calculate difference in days
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusColor = '';
    let statusText = '';
    let dateColor = '';

    if (diffDays < 0) {
        statusColor = 'text-red-700 bg-red-100 border-red-200';
        statusText = 'EXPIRED';
        dateColor = 'text-red-700 font-bold';
    } else if (diffDays <= 30) {
        statusColor = 'text-amber-700 bg-amber-100 border-amber-200';
        statusText = 'EXPIRING SOON';
        dateColor = 'text-amber-700 font-bold';
    } else {
        statusColor = 'text-green-700 bg-green-100 border-green-200';
        statusText = 'VALID';
        dateColor = 'text-green-700 font-bold';
    }

    // Format dates for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full max-w-md mx-auto mt-8 bg-white shadow-lg rounded-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{mot.make} {mot.model}</h2>
                    <p className="text-sm font-mono text-gray-500 font-bold tracking-wider">{mot.registration}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                    {statusText}
                </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Last Test</p>
                        <p className="font-medium text-gray-900">{formatDate(mot.lastTestDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Expiry Date</p>
                        <p className={`font-medium ${dateColor}`}>
                            {formatDate(mot.motExpiryDate)}
                        </p>
                    </div>
                </div>

                {mot.advisories.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Advisories from last test:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {mot.advisories.map((advisory, index) => (
                                <li key={index} className="pl-1">{advisory}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {onDownloadIcs && diffDays >= 0 && (
                    <button
                        onClick={onDownloadIcs}
                        className="w-full mt-4 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Set Reminder
                    </button>
                )}
            </div>
        </div>
    );
}
