import { NextRequest, NextResponse } from 'next/server';
import { MotResult } from '@/lib/types';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const reg = searchParams.get('reg');

    if (!reg) {
        return NextResponse.json({ error: 'Registration number is required' }, { status: 400 });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data logic
    const normalizedReg = reg.toUpperCase().replace(/\s/g, '');

    // Basic mock database based on registration endings or specific codes
    let mockData: MotResult;

    if (normalizedReg === 'ERROR') {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    } else if (normalizedReg === 'SERVER_ERROR') {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } else if (normalizedReg === 'EXPIRED') {
    } else if (normalizedReg === 'EXPIRED') {
        mockData = {
            registration: reg.toUpperCase(),
            make: 'FORD',
            model: 'FOCUS',
            motExpiryDate: '2023-01-01', // Expired
            lastTestDate: '2022-01-01',
            firstUsedDate: '2015-06-01',
            mileage: 120000,
            advisories: ['Tyre worn close to legal limit/from previous year', 'Brake pad warning light on']
        };
    } else if (normalizedReg === 'SOON') {
        const soonDate = new Date();
        soonDate.setDate(soonDate.getDate() + 15);
        mockData = {
            registration: reg.toUpperCase(),
            make: 'VAUXHALL',
            model: 'CORSA',
            motExpiryDate: soonDate.toISOString().split('T')[0], // Expiring soon
            lastTestDate: new Date().toISOString().split('T')[0],
            firstUsedDate: '2018-09-01',
            mileage: 50000,
            advisories: []
        };
    } else {
        // Default happy path
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        mockData = {
            registration: reg.toUpperCase(),
            make: 'TESLA',
            model: 'MODEL 3',
            motExpiryDate: futureDate.toISOString().split('T')[0],
            lastTestDate: new Date().toISOString().split('T')[0],
            firstUsedDate: '2019-03-01',
            mileage: 72500,
            advisories: []
        };
    }

    return NextResponse.json(mockData);
}