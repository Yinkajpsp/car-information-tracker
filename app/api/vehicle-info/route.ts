// app/api/vehicle-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VehicleExtraInfo, MotResult } from '@/lib/types';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // Accept reg, vrm or registration
    const regRaw =
        searchParams.get('reg') ||
        searchParams.get('vrm') ||
        searchParams.get('registration');

    if (!regRaw) {
        return NextResponse.json(
            { error: 'Registration required' },
            { status: 400 }
        );
    }

    // Normalise VRM
    const reg = regRaw.toUpperCase().replace(/\s+/g, '');

    const apiKey = process.env.CHECKCARDETAILS_API_KEY;
    if (!apiKey) {
        console.error('CHECKCARDETAILS_API_KEY is missing');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    try {
        // Build endpoint URLs
        const vehicleUrl = `https://api.checkcardetails.co.uk/vehicledata/vehicleregistration?apikey=${encodeURIComponent(
            apiKey
        )}&vrm=${encodeURIComponent(reg)}`;

        const motUrl = `https://api.checkcardetails.co.uk/vehicledata/mot?apikey=${encodeURIComponent(
            apiKey
        )}&vrm=${encodeURIComponent(reg)}`;

        // Fetch both in parallel
        const [vehicleRes, motRes] = await Promise.all([
            fetch(vehicleUrl, { cache: 'no-store' }),
            fetch(motUrl, { cache: 'no-store' }),
        ]);

        if (!vehicleRes.ok || !motRes.ok) {
            console.error(
                'Vehicle/MOT API status:',
                vehicleRes.status,
                motRes.status
            );
            return NextResponse.json(
                { error: 'Failed to fetch vehicle data' },
                { status: 500 }
            );
        }

        const vehicleData = await vehicleRes.json();
        const motData = await motRes.json();

        // ------------------------
        // VEHICLE DATA PROCESSING
        // ------------------------

        const make =
            vehicleData.make ??
            vehicleData.Make ??
            'Unknown';

        const model =
            vehicleData.model ??
            vehicleData.Model ??
            'Unknown';

        const fuelType =
            vehicleData.fuelType ??
            vehicleData.FuelType ??
            'Unknown';

        const co2 =
            vehicleData.co2Emissions ??
            vehicleData.Co2Emissions ??
            null;

        const colour =
            vehicleData.colour ??
            vehicleData.Colour ??
            null;

        const engineCapacity =
            vehicleData.engineCapacity ??
            (vehicleData.EngineCapacity
                ? parseInt(vehicleData.EngineCapacity, 10)
                : null);

        const yearOfManufacture: number | null =
            vehicleData.yearOfManufacture ??
            (vehicleData.YearOfManufacture
                ? parseInt(vehicleData.YearOfManufacture, 10)
                : null);

        const bodyType =
            vehicleData.bodyType ??
            vehicleData.wheelplan ??
            vehicleData.BodyType ??
            null;

        const registrationPlace =
            vehicleData.registrationPlace ??
            vehicleData.RegistrationPlace ??
            null;

        const taxStatus =
            vehicleData.tax?.taxStatus ??
            vehicleData.taxStatus ??
            null;

        const taxDueDate =
            vehicleData.tax?.taxDueDate ??
            vehicleData.taxDueDate ??
            null;

        const makeLogoUrl =
            make && make !== 'Unknown'
                ? `https://logo.clearbit.com/${make
                    .toLowerCase()
                    .replace(/\s/g, '')}.com`
                : null;

        // Very rough MPG estimate from CO₂
        let mpg: number | null = null;
        if (
            co2 &&
            (fuelType.toLowerCase().includes('petrol') ||
                fuelType.toLowerCase().includes('diesel'))
        ) {
            mpg = Math.round(6760 / co2);
        }

        // Rough estimated value based on age
        const currentYear = new Date().getFullYear();
        const year = yearOfManufacture ?? currentYear - 5;
        const age = currentYear - year;

        let estimatedValue = 30000 * Math.pow(0.85, age);
        if (make.toUpperCase().includes('BMW')) {
            estimatedValue *= 1.2;
        }

        const vehicle: VehicleExtraInfo = {
            makeLogoUrl,
            make,
            model,
            yearOfManufacture,
            bodyType,
            fuelType,
            colour,
            engineCapacity,
            co2Emissions: co2,
            taxStatus,
            taxDueDate,
            registrationPlace,
            mpg,
            estimatedValue: Math.round(estimatedValue),
        };

        // --------------------
        // MOT DATA PROCESSING
        // --------------------

        const historyRaw =
            Array.isArray(motData.motHistory)
                ? motData.motHistory
                : Array.isArray(motData.MotHistory)
                    ? motData.MotHistory
                    : [];

        const latestTest = historyRaw.length > 0 ? historyRaw[0] : null;

        const motStatus =
            motData.motStatus ??
            motData.MotStatus ??
            'Unknown';

        const motExpiryDate =
            motData.motDueDate ??
            motData.motExpiryDate ??
            motData.MotExpiryDate ??
            motData.MotMobilityExpiryDate ??
            'Unknown';

        const odometerValue =
            latestTest?.odometerValue ??
            latestTest?.OdometerValue ??
            'Unknown';

        const advisories =
            latestTest?.defects
                ? (latestTest.defects as any[]).map(
                    (d) => d.text || d.description || d
                )
                : latestTest?.Notices
                    ? (latestTest.Notices as any[]).map(
                        (n) => n.text || n.Notice || n
                    )
                    : [];

        const lastTestDate =
            latestTest?.testDate ??
            latestTest?.TestDate ??
            latestTest?.completedDate ??
            latestTest?.CompletedDate ??
            'Unknown';

        const lastTestResult =
            latestTest?.testResult ??
            latestTest?.TestResult ??
            'Unknown';

        const lastTestMileage =
            latestTest?.odometerValue ??
            latestTest?.OdometerValue ??
            latestTest?.odometerReading ??
            latestTest?.OdometerReading ??
            'Unknown';

        const lastTestMileageUnit =
            latestTest?.odometerUnit ??
            latestTest?.OdometerUnit ??
            'miles';

        const lastTestDefects =
            latestTest?.defects
                ? (latestTest.defects as any[]).map((d) => ({
                    type: d.type || 'Advisory',
                    text: d.text || d.description || 'Unknown defect',
                }))
                : latestTest?.Notices
                    ? (latestTest.Notices as any[]).map((n) => ({
                        type: 'Advisory',
                        text: n.text || n.Notice || n,
                    }))
                    : [];

        // Categorize faults
        const faults = {
            dangerous: [] as string[],
            major: [] as string[],
            minor: [] as string[],
            advisories: [] as string[]
        };

        if (latestTest?.defects) {
            (latestTest.defects as any[]).forEach((d) => {
                const type = (d.type || '').toLowerCase();
                const text = d.text || d.description || 'Unknown';
                if (type.includes('dangerous')) faults.dangerous.push(text);
                else if (type.includes('major')) faults.major.push(text);
                else if (type.includes('minor')) faults.minor.push(text);
                else faults.advisories.push(text);
            });
        } else if (latestTest?.Notices) {
            // Fallback for Notices - usually advisories
            (latestTest.Notices as any[]).forEach((n) => {
                faults.advisories.push(n.text || n.Notice || n);
            });
        }

        // Expanded Fields Parsing with explicit 'Unknown' fallback
        const testStationName = latestTest?.motTestStation ?? latestTest?.MotTestStation ?? 'Unknown';
        const testLocation = 'Unknown'; // Placeholder as requested (API often doesn't give full address)
        const nextMotDueDate = motExpiryDate; // Usually same as main expiry if it's the latest

        const emissions = {
            co2: latestTest?.co2 ?? latestTest?.Co2 ?? 'Unknown',
            hydrocarbons: latestTest?.hydrocarbons ?? latestTest?.Hydrocarbons ?? 'Unknown',
            lambda: latestTest?.lambda ?? latestTest?.Lambda ?? 'Unknown',
            monoxide: latestTest?.monoxide ?? latestTest?.Monoxide ?? 'Unknown',
        };

        const mot: MotResult = {
            registration: reg,
            make,
            model,
            motStatus,
            motExpiryDate,
            motTestNumber:
                latestTest?.motTestNumber ??
                latestTest?.MotTestNumber ??
                'N/A',
            odometerValue:
                latestTest?.odometerValue ??
                latestTest?.OdometerValue ??
                latestTest?.odometerReading ??
                latestTest?.OdometerReading ??
                'Unknown',
            advisories,
            firstUsedDate: yearOfManufacture
                ? `${yearOfManufacture}-01-01`
                : 'Unknown',
            lastTestDate: formatDate(lastTestDate),
            lastTestResult,
            lastTestMileage,
            lastTestMileageUnit,
            lastTestDefects,
            // New Expanded Fields
            testStationName,
            testLocation,
            nextMotDueDate,
            emissions,
            faults
        };

        return NextResponse.json({ vehicle, mot });
    } catch (error) {
        console.error('Vehicle API error:', error);
        return NextResponse.json(
            { error: 'Failed to process vehicle request' },
            { status: 500 }
        );
    }
}

// Helper to format date nicely if raw API is ISO
function formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'Unknown') return 'Unknown';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch (e) {
        return dateStr;
    }
}