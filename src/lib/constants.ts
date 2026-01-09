/**
 * Constants for YAP-IT Monitor
 */

// Update intervals (in milliseconds)
export const UPDATE_INTERVALS = {
    POLYMARKET: 30000,    // 30 seconds
    OPENSKY: 10000,       // 10 seconds
    TRANSIT: 30000,       // 30 seconds
    SOCIAL: 60000,        // 60 seconds
} as const;

// API endpoints
export const API_ENDPOINTS = {
    POLYMARKET: '/api/polymarket',
    OPENSKY: 'https://opensky-network.org/api',
    SEPTA: 'https://www3.septa.org/api',
    MTA: '/api/transit/mta',
    UTA: '/api/transit/uta',
    BLUESKY: 'https://bsky.social/xrpc',
} as const;

// Flight map bounds
export const MAP_BOUNDS = {
    US: {
        center: [39.8283, -98.5795] as [number, number],
        zoom: 4,
    },
    EUROPE: {
        center: [50.1109, 10.4515] as [number, number],
        zoom: 4,
    },
    ASIA: {
        center: [35.8617, 104.1954] as [number, number],
        zoom: 3,
    },
    GLOBAL: {
        center: [20, 0] as [number, number],
        zoom: 2,
    },
} as const;

// Polymarket categories
export const POLYMARKET_CATEGORIES = [
    { id: 'politics', label: 'Politics', color: '#dc2626' },
    { id: 'crypto', label: 'Crypto', color: '#f59e0b' },
    { id: 'sports', label: 'Sports', color: '#22c55e' },
    { id: 'tech', label: 'Tech', color: '#3b82f6' },
    { id: 'unusual', label: 'Unusual', color: '#a855f7' },
] as const;

// Transit cities
export const TRANSIT_CITIES = {
    philadelphia: { label: 'Philadelphia', api: 'septa' },
    newyork: { label: 'New York', api: 'mta' },
    saltlake: { label: 'Salt Lake City', api: 'uta' },
} as const;

// Transit stations per city
export const TRANSIT_STATIONS = {
    philadelphia: [
        { id: 'Suburban Station', name: 'Suburban Station' },
        { id: '30th Street Station', name: '30th Street Station' },
        { id: 'Jefferson Station', name: 'Jefferson Station' },
        { id: 'Temple University', name: 'Temple University' },
        { id: 'North Philadelphia', name: 'North Philadelphia' },
        { id: 'Airport Terminal E-F', name: 'Airport Terminal E-F' },
        { id: 'Trenton', name: 'Trenton' },
    ],
    newyork: [
        { id: 'Times Sq-42 St', name: 'Times Sq-42 St' },
        { id: 'Grand Central-42 St', name: 'Grand Central-42 St' },
        { id: 'Penn Station', name: 'Penn Station' },
        { id: '14 St-Union Sq', name: '14 St-Union Sq' },
        { id: 'Fulton St', name: 'Fulton St' },
        { id: 'Atlantic Ave-Barclays Ctr', name: 'Atlantic Ave-Barclays Ctr' },
    ],
    saltlake: [
        { id: 'Salt Lake Central', name: 'Salt Lake Central' },
        { id: 'Gallivan Plaza', name: 'Gallivan Plaza' },
        { id: 'Courthouse', name: 'Courthouse' },
        { id: 'Temple Square', name: 'Temple Square' },
        { id: 'Arena', name: 'Arena' },
        { id: 'University South Campus', name: 'University South Campus' },
    ],
} as const;

// Default stations per city
export const DEFAULT_STATIONS = {
    philadelphia: 'Suburban Station',
    newyork: 'Times Sq-42 St',
    saltlake: 'Salt Lake Central',
} as const;

