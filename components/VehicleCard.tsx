'use client';

import { useState } from 'react';
import { MotResult } from '@/lib/types';

interface VehicleCardProps {
    mot: MotResult | null;
    error?: string;
    onDownloadIcs?: () => void;
}

export default function VehicleCard({ mot, error, onDownloadIcs }: VehicleCardProps) {
    const [expandedYear, setExpandedYear] = useState<string | null>(null);

    if (error) {
        return (
            <div className="w-full max-w-md mx-auto mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center animate-fade-in">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Finding Vehicle</h3>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!mot) return null;

    // Derive status from expiry date
    const expiryDate = new Date(mot.motExpiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: 'VALID' | 'SOON' | 'EXPIRED' = 'VALID';
    const statusLower = mot.motStatus.toLowerCase();

    if (statusLower === 'invalid' || statusLower === 'expired' || diffDays < 0) {
        status = 'EXPIRED';
    } else if (diffDays <= 30) {
        status = 'SOON';
    }

    return (
        <div className={`
      bg-white rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 transform hover:scale-[1.02]
      ${status === 'VALID' ? 'border-green-100 shadow-green-50' : ''}
      ${status === 'SOON' ? 'border-amber-100 shadow-amber-50' : ''}
      ${status === 'EXPIRED' ? 'border-red-100 shadow-red-50' : ''}
    `}>
            {/* Header */}
            <div className={`
        px-6 py-4 flex justify-between items-center
        ${status === 'VALID' ? 'bg-green-50/50' : ''}
        ${status === 'SOON' ? 'bg-amber-50/50' : ''}
        ${status === 'EXPIRED' ? 'bg-red-50/50' : ''}
      `}>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium tracking-wide">Registration</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">{mot.registration}</span>
                </div>

                {/* Status Badge */}
                <div className={`
          px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
          ${status === 'VALID' ? 'bg-green-100 text-green-700 border border-green-200' : ''}
          ${status === 'SOON' ? 'bg-amber-100 text-amber-700 border border-amber-200' : ''}
          ${status === 'EXPIRED' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
        `}>
                    {status === 'VALID' && 'Valid'}
                    {status === 'SOON' && 'Expiring Soon'}
                    {status === 'EXPIRED' && 'Expired'}
                </div>
            </div>

            {/* History Summary Badges */}
            {mot.motHistorySummary && (
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/30">
                    <div className="p-3 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total</p>
                        <p className="text-lg font-black text-gray-900">{mot.motHistorySummary.totalTests}</p>
                    </div>
                    <div className="p-3 text-center">
                        <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Passed</p>
                        <p className="text-lg font-black text-green-700">{mot.motHistorySummary.passedTests}</p>
                    </div>
                    <div className="p-3 text-center">
                        <p className="text-xs text-red-600 uppercase tracking-wider font-bold">Failed</p>
                        <p className="text-lg font-black text-red-700">{mot.motHistorySummary.failedTests}</p>
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="space-y-6">

                    {/* Expiry Date */}
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${status === 'EXPIRED' ? 'bg-red-100' : 'bg-blue-50'}`}>
                            <svg className={`w-6 h-6 ${status === 'EXPIRED' ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Expiry Date</p>
                            <p className={`text-xl font-bold ${status === 'EXPIRED' ? 'text-red-600' : 'text-gray-900'}`}>
                                {mot.motExpiryDate}
                            </p>
                            {status === 'VALID' && diffDays > 0 && (
                                <p className="text-xs text-green-600 font-medium mt-1">{diffDays} days remaining</p>
                            )}
                            {status === 'SOON' && (
                                <p className="text-xs text-amber-600 font-medium mt-1">Expires in {diffDays} days</p>
                            )}
                            {status === 'EXPIRED' && (
                                <p className="text-xs text-red-600 font-medium mt-1">Expired {Math.abs(diffDays)} days ago</p>
                            )}
                        </div>
                    </div>

                    {/* Mileage */}
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-indigo-50">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Mileage</p>
                            <p className="text-lg font-bold text-gray-900">
                                {mot.odometerValue ? `${mot.odometerValue} miles` : 'Mileage unavailable'}
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Make / Model */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">Make</p>
                            <p className="font-semibold text-gray-700">{mot.make}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">Model</p>
                            <p className="font-semibold text-gray-700">{mot.model}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        Last MOT Full Details
                    </h4>

                    <div className="space-y-4">
                        {/* Primary Test Info */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Completed Date</span>
                                <span className="font-medium text-gray-900">{mot.lastTestDate || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Test Result</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wide
                            ${mot.lastTestResult === 'PASSED' ? 'bg-green-100 text-green-700' :
                                        mot.lastTestResult === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {mot.lastTestResult || 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Odometer</span>
                                <span className="font-medium text-gray-900">
                                    {mot.lastTestMileage ? `${mot.lastTestMileage} ${mot.lastTestMileageUnit || 'miles'}` : 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Mot Test Number</span>
                                <span className="font-medium text-gray-900 font-mono text-xs">{mot.motTestNumber || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Station & Location (Placeholders) */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-gray-500 uppercase tracking-wide mb-1">Test Station</p>
                                <p className="font-medium text-gray-700">{mot.testStationName || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase tracking-wide mb-1">Location</p>
                                <p className="font-medium text-gray-700">{mot.testLocation || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase tracking-wide mb-1">Next Due</p>
                                <p className="font-medium text-gray-700">{mot.nextMotDueDate || 'Unknown'}</p>
                            </div>
                        </div>

                        {/* Emissions Data */}
                        {mot.emissions && (
                            <div className="border border-gray-100 rounded-lg p-3">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Emissions</p>
                                <div className="grid grid-cols-2 gap-y-2 text-xs">
                                    <div className="flex justify-between mr-2">
                                        <span className="text-gray-500">CO2</span>
                                        <span className="font-medium">{mot.emissions.co2 || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between ml-2">
                                        <span className="text-gray-500">HC</span>
                                        <span className="font-medium">{mot.emissions.hydrocarbons || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between mr-2">
                                        <span className="text-gray-500">Lambda</span>
                                        <span className="font-medium">{mot.emissions.lambda || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between ml-2">
                                        <span className="text-gray-500">CO</span>
                                        <span className="font-medium">{mot.emissions.monoxide || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Faults & Defects */}
                        {mot.faults && (
                            <div className="space-y-3 pt-2">
                                {/* Dangerous */}
                                {(mot.faults.dangerous.length > 0) && (
                                    <div className="bg-red-50 p-3 rounded-md">
                                        <p className="text-xs text-red-700 font-bold uppercase mb-2">Dangerous Faults</p>
                                        <ul className="list-disc list-inside text-xs text-red-800 space-y-1">
                                            {mot.faults.dangerous.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {(mot.faults.dangerous.length === 0) && (
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Dangerous Faults</span>
                                        <span>None / Unknown</span>
                                    </div>
                                )}

                                {/* Major */}
                                {(mot.faults.major.length > 0) && (
                                    <div className="bg-amber-50 p-3 rounded-md">
                                        <p className="text-xs text-amber-700 font-bold uppercase mb-2">Major Faults</p>
                                        <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                                            {mot.faults.major.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {(mot.faults.major.length === 0) && (
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Major Faults</span>
                                        <span>None / Unknown</span>
                                    </div>
                                )}

                                {/* Minor */}
                                {(mot.faults.minor.length > 0) && (
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <p className="text-xs text-blue-700 font-bold uppercase mb-2">Minor Faults</p>
                                        <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                                            {mot.faults.minor.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {(mot.faults.minor.length === 0) && (
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Minor Faults</span>
                                        <span>None / Unknown</span>
                                    </div>
                                )}

                                {/* Advisories */}
                                {(mot.faults.advisories.length > 0) && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Advisories</p>
                                        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                            {mot.faults.advisories.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Download ICS Button */}
                {onDownloadIcs && status !== 'EXPIRED' && (
                    <button
                        onClick={onDownloadIcs}
                        className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <span>Add to Calendar</span>
                    </button>
                )}
            </div>


            {/* Collapsible History */}
            {
                mot.motHistory && mot.motHistory.length > 0 && (
                    <div className="border-t border-gray-100">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900">Full MOT History</h4>
                        </div>
                        <div>
                            {Object.entries(
                                mot.motHistory.reduce((acc, item) => {
                                    const date = new Date(item.completedDate);
                                    const year = isNaN(date.getTime()) ? 'Unknown' : date.getFullYear().toString();
                                    if (!acc[year]) acc[year] = [];
                                    acc[year].push(item);
                                    return acc;
                                }, {} as Record<string, typeof mot.motHistory>)
                            )
                                .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                                .map(([year, items]) => (
                                    <div key={year} className="border-b border-gray-100 last:border-0">
                                        <button
                                            onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                                            className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <span className="font-bold text-gray-700">{year}</span>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-gray-400 font-medium">{items.length} tests</span>
                                                <svg
                                                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedYear === year ? 'rotate-180' : ''}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>

                                        {expandedYear === year && (
                                            <div className="bg-gray-50/50 px-4 pb-4 space-y-4">
                                                {items.map((test, idx) => (
                                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className={`
                                                                inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide mb-1
                                                                ${test.testResult === 'PASSED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                            `}>
                                                                    {test.testResult}
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">{test.completedDate}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-gray-900">{test.odometerValue} {test.odometerUnit}</p>
                                                                <p className="text-xs text-gray-400 font-mono mt-1">Ref: {test.motTestNumber}</p>
                                                            </div>
                                                        </div>

                                                        {test.defects && test.defects.length > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <p className="text-xs font-bold text-gray-700 mb-1">Defects & Notices:</p>
                                                                <ul className="space-y-1">
                                                                    {test.defects.map((defect, dIdx) => (
                                                                        <li key={dIdx} className="text-xs text-gray-600 flex items-start">
                                                                            <span className="mr-2">•</span>
                                                                            <span>{defect}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
