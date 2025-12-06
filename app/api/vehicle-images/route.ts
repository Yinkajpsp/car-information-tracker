import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year') || '';
    // 'view' param: Front, Rear, Side, Interior
    const view = searchParams.get('view') || 'front';

    if (!make || !model) {
        return NextResponse.json({ images: [] });
    }

    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_CX_ID;

    if (!apiKey || !cx) {
        console.warn('GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX_ID is missing.');
        return NextResponse.json({ images: [] });
    }

    // Construct query e.g., "2017 BMW M4 front view"
    const query = `${year} ${make} ${model} ${view} view`.trim();
    const googleUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=4`;

    try {
        const response = await fetch(googleUrl);

        if (!response.ok) {
            console.error('Google CSE API failed:', response.status);
            return NextResponse.json({ images: [] });
        }

        const data = await response.json();

        // Parse results
        const images = (data.items || []).map((item: any) => ({
            url: item.link,
            thumbnailUrl: item.image?.thumbnailLink || item.link,
            title: item.title
        }));

        return NextResponse.json({ images });

    } catch (error) {
        console.error('Error fetching car images:', error);
        return NextResponse.json({ images: [] });
    }
}
