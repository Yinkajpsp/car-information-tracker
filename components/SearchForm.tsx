'use client';

import { useState } from 'react';

interface SearchFormProps {
    onSearch: (reg: string) => void;
    isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [reg, setReg] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reg.trim()) {
            onSearch(reg.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
            <div>
                <label htmlFor="reg" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Registration
                </label>
                <div className="relative">
                    <input
                        id="reg"
                        type="text"
                        value={reg}
                        onChange={(e) => setReg(e.target.value.toUpperCase())}
                        placeholder="ENTER REG"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg py-3 px-4 uppercase font-mono tracking-wider border"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={isLoading || !reg.trim()}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                    </span>
                ) : (
                    'Check MOT Status'
                )}
            </button>
        </form>
    );
}
