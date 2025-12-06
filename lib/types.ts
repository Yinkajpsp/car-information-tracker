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
    // New fields for Last MOT section
    lastTestDate?: string;
    lastTestExpiryDate?: string;
    lastTestResult?: string;
    lastTestMileage?: string;
    lastTestMileageUnit?: string;

    // Expanded Fields
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
}