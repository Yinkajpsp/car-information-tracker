import { VehicleExtraInfo } from '@/lib/types';

interface VehicleDetailsCardProps {
    info: VehicleExtraInfo | null;
}

export default function VehicleDetailsCard({ info }: VehicleDetailsCardProps) {
    if (!info) return null;

    return (
        <div className="w-full bg-white shadow-lg rounded-xl overflow-hidden animate-fade-in flex flex-col h-full">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Vehicle Details</h2>
                {info.makeLogoUrl ? (
                    <div className="h-8 w-8 relative">
                        <img
                            src={info.makeLogoUrl}
                            alt="Make Logo"
                            className="h-full w-full object-contain"
                            // Fallback for broken images if needed, but simplistic for now
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                ) : (
                    <span className="text-2xl">🚗</span>
                )}
            </div>

            <div className="p-6 flex-grow">
                <div className="space-y-6">

                    {/* Key Specs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                {info.make} {info.model}
                            </h3>
                            {info.registrationPlace && (
                                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                                    Reg: {info.registrationPlace}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Year</p>
                            <p className="font-medium text-gray-900">{info.yearOfManufacture || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Body Type</p>
                            <p className="font-medium text-gray-900">{info.bodyType || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Colour</p>
                            <p className="font-medium text-gray-900">{info.colour || 'Unknown'}</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Engine & Ecology */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Engine & Ecology</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs">Engine</span>
                                <span className="font-medium">
                                    {info.engineCapacity ? `${info.engineCapacity} cc` : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Fuel</span>
                                <span className="font-medium">{info.fuelType || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">CO₂</span>
                                <span className="font-medium">{info.co2Emissions ? `${info.co2Emissions} g/km` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Tax Status</span>
                                <span className="font-medium">
                                    {info.taxStatus || 'N/A'}
                                    {info.taxDueDate && <span className="block text-xs text-gray-400">Due: {info.taxDueDate}</span>}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Economy & Value */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Est. MPG</p>
                            <p className="font-medium text-gray-900">
                                {info.mpg ? `${info.mpg} mpg` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Est. Value</p>
                            <p className="font-bold text-green-700 text-base">
                                {info.estimatedValue
                                    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(info.estimatedValue)
                                    : 'Unknown'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
