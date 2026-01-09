/**
 * OpenSky Network API Proxy
 * Edge Function to fetch aircraft states within a bounding box
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface OpenSkyState {
    icao24: string;
    callsign: string | null;
    origin_country: string;
    time_position: number | null;
    last_contact: number;
    longitude: number | null;
    latitude: number | null;
    baro_altitude: number | null;
    on_ground: boolean;
    velocity: number | null;
    true_track: number | null;
    vertical_rate: number | null;
    sensors: number[] | null;
    geo_altitude: number | null;
    squawk: string | null;
    spi: boolean;
    position_source: number;
}

interface OpenSkyResponse {
    time: number;
    states: (string | number | boolean | null)[][] | null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const minLat = searchParams.get('minLat') ?? '24.396308';
    const maxLat = searchParams.get('maxLat') ?? '49.384358';
    const minLon = searchParams.get('minLon') ?? '-125.0';
    const maxLon = searchParams.get('maxLon') ?? '-66.93457';

    const url = `https://opensky-network.org/api/states/all?lamin=${minLat}&lamax=${maxLat}&lomin=${minLon}&lomax=${maxLon}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 10 }, // Cache for 10 seconds
        });

        if (!response.ok) {
            // OpenSky has rate limits - return empty state gracefully
            if (response.status === 429) {
                return NextResponse.json({
                    aircraft: [],
                    timestamp: Date.now(),
                    error: 'Rate limited - please wait',
                }, { status: 200 });
            }
            throw new Error(`OpenSky API error: ${response.status}`);
        }

        const data: OpenSkyResponse = await response.json();

        // Transform raw states array to typed Aircraft objects
        const aircraft = (data.states ?? []).map((state) => ({
            icao24: state[0] as string,
            callsign: (state[1] as string | null)?.trim() || null,
            originCountry: state[2] as string,
            longitude: state[5] as number | null,
            latitude: state[6] as number | null,
            altitude: state[7] as number | null, // baro_altitude in meters
            onGround: state[8] as boolean,
            velocity: state[9] as number | null, // m/s
            heading: state[10] as number | null, // true_track in degrees
            verticalRate: state[11] as number | null,
        }));

        return NextResponse.json({
            aircraft,
            timestamp: data.time * 1000, // Convert to milliseconds
            count: aircraft.length,
        });
    } catch (error) {
        console.error('OpenSky API error:', error);
        return NextResponse.json({
            aircraft: [],
            timestamp: Date.now(),
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
