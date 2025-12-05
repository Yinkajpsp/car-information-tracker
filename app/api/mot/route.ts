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
    } else if (normalizedReg === 'EXPIRED') {
        mockData = {
            registration: reg.toUpperCase(),
            make: 'FORD',
            model: 'FOCUS',
            motExpiryDate: '2023-01-01', // Expired
            lastTestDate: '2022-01-01',
            advisories: ['Tyre worn close to legal limit/from previous year', 'Brake pad warning light on']
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
            advisories: []
        };
    }

    return NextResponse.json(mockData);
}
