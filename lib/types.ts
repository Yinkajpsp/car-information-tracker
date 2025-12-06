// lib/types.ts

// Vehicle details used by the UI (right-hand card)
export interface VehicleExtraInfo {
    makeLogoUrl: string | null;
    make: string;
    model: string;
    yearOfManufacture: number | null;
    bodyType: string | null;
    fuelType: string | null;
    colour: string | null;
    engineCapacity: number | null;
    co2Emissions: number | null;
    taxStatus: string | null;
    taxDueDate: string | null;
    registrationPlace: string | null;
    mpg: number | null;
    estimatedValue: number | null;
}

// MOT result + history info used by the MOT card
export interface MotResult {
    registration: string;
    make: string;
    model: string;

    motStatus: string;
    motExpiryDate: string;
    motTestNumber: string;
    odometerValue: string;
    advisories: string[];
    firstUsedDate: string;

    mileage?: number;
    // Last MOT summary fields
    lastTestDate?: string;
    lastTestExpiryDate?: string;
    lastTestResult?: string;
    lastTestMileage?: string;
    lastTestMileageUnit?: string;

    // Extra metadata
    testStationName?: string;
    testLocation?: string;
    nextMotDueDate?: string;

    // Emissions
    emissions?: {
        co2?: string;
        hydrocarbons?: string;
        lambda?: string;
        monoxide?: string;
    };

    // Faults & Defects
    faults?: {
        dangerous: string[];
        major: string[];
        minor: string[];
        advisories: string[];
    };

    lastTestDefects?: { type: string; text: string }[];

    // History
    motHistory?: MotHistoryItem[];
    motHistorySummary?: MotHistorySummary;
}

export interface MotHistoryItem {
    motTestNumber: string;
    completedDate: string;
    expiryDate: string;
    odometerValue: string;
    odometerUnit: string;
    testResult: string;
    defects: string[];
}

export interface MotHistorySummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
}