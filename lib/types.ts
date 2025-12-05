export interface MotResult {
    registration: string;
    make: string;
    model: string;
    motExpiryDate: string; // ISO date string YYYY-MM-DD
    lastTestDate: string; // ISO date string YYYY-MM-DD
    advisories: string[];
}
