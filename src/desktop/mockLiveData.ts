// src/desktop/mockLiveData.ts

import { LiveCheckRow } from './types';

/**
 * Mock live check data for the desktop Live Monitor view.
 * This bypasses the main app's facility context requirements.
 */

const GROUPS = ['Alpha', 'Beta', 'Gamma', 'Delta'];
const UNIT_PREFIXES = ['A', 'B', 'C', 'D'];

const createLiveCheck = (
    id: string,
    residentName: string,
    location: string,
    status: 'overdue' | 'due' | 'upcoming',
    timerText: string,
    options: {
        hasHighRisk?: boolean;
        riskType?: string;
        lastCheckTime?: string;
        supervisorNote?: string;
        group?: string;
        unit?: string;
    } = {}
): LiveCheckRow => {
    const timerSeverity = status === 'overdue' ? 'alert' : status === 'due' ? 'warning' : 'info';

    // Derive group and unit uniquely
    const getRoomNum = (loc: string) => {
        const parts = loc.split(/[- ]/);
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart, 10) || 0;
    };

    const roomNum = getRoomNum(location);
    const groupIdx = roomNum % 4; // 0, 1, 2, 3
    const derivedGroup = options.group || GROUPS[groupIdx];

    // Unit suffix based on room range (1xx = 1, 2xx = 2, etc.)
    const unitSuffix = Math.floor(roomNum / 100) % 4 + 1;
    const derivedUnit = options.unit || `${UNIT_PREFIXES[groupIdx]}${unitSuffix}`;

    return {
        id,
        status,
        timerText,
        timerSeverity,
        location,
        residents: [{ id: `res-${id}`, name: residentName, location }],
        hasHighRisk: options.hasHighRisk || false,
        riskType: options.riskType,
        group: derivedGroup,
        unit: derivedUnit,
        lastCheckTime: options.lastCheckTime || null,
        lastCheckOfficer: 'Brett Corbin',
        supervisorNote: options.supervisorNote,
        originalCheck: null as never,
    };
};

// Generate realistic times relative to now
const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

const generateData = (): LiveCheckRow[] => {
    const data: LiveCheckRow[] = [];

    // 1. Critical Overdue Checks — Room 102 has 4 consecutive missed checks
    data.push(createLiveCheck('live-1', 'Jeff Siemens', '102', 'overdue', 'Missed 12m', {
        lastCheckTime: minutesAgo(42),
        group: 'Alpha',
        unit: 'A',
    }));
    data.push(createLiveCheck('live-2', 'Brett Corbin', '102', 'overdue', 'Missed 8m', {
        hasHighRisk: true,
        riskType: 'Suicide Watch',
        lastCheckTime: minutesAgo(38),
        group: 'Alpha',
        unit: 'A',
    }));
    data.push(createLiveCheck('live-2b', 'Marcus Rivera', '102', 'overdue', 'Missed 5m', {
        lastCheckTime: minutesAgo(35),
        group: 'Alpha',
        unit: 'A',
    }));
    data.push(createLiveCheck('live-2c', 'Tyrone Washington', '102', 'overdue', 'Missed 3m', {
        hasHighRisk: true,
        riskType: 'Medical Watch',
        lastCheckTime: minutesAgo(33),
        group: 'Alpha',
        unit: 'A',
    }));

    // Additional overdue in other rooms
    data.push(createLiveCheck('live-2d', 'Sarah Jenkins', '205', 'overdue', 'Missed 2m', {
        lastCheckTime: minutesAgo(32),
        group: 'Beta',
        unit: 'B',
    }));

    // 2. Due Checks
    for (let i = 3; i <= 9; i++) {
        data.push(createLiveCheck(`live-${i}`, `Resident ${i}`, `20${i}`, 'due', 'Due in 2m', {
            lastCheckTime: minutesAgo(28),
        }));
    }

    // 3. Upcoming Checks (Large dataset for loading simulation)
    const names = ['Jalpa Mazmudar', 'Aggressive Andy', 'Michael Scott', 'Jim Halpert', 'Pam Beesly', 'Dwight Schrute', 'Angela Martin', 'Kevin Malone', 'Oscar Martinez', 'Stanley Hudson'];
    const rooms = ['101', '102', '201', '202', '301', '302', '401', '402'];

    for (let i = 10; i <= 124; i++) {
        const name = names[i % names.length];
        const room = rooms[i % rooms.length];
        const isHighRisk = i % 15 === 0;

        data.push(createLiveCheck(
            `live-${i}`,
            `${name} ${Math.floor(i / 10)}`,
            `${room}`,
            'upcoming',
            `Due in ${10 + (i % 50)}m`,
            {
                lastCheckTime: minutesAgo(16),
                hasHighRisk: isHighRisk,
                riskType: isHighRisk ? 'Random Assessment' : undefined
            }
        ));
    }

    return data;
};

export const mockLiveChecks: LiveCheckRow[] = generateData();

// Export the total count constant
export const TOTAL_LIVE_RECORDS = 8914;

// Pagination helper to simulate async fetch
export function loadLiveChecksPage(
    cursor: number,
    pageSize: number,
    filter?: { search?: string; group?: string; unit?: string }
): Promise<{ data: LiveCheckRow[]; nextCursor: number | null }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Apply filtering to the entire conceptual dataset (for mock purposes)
            // In a real app, this would be handled by the database.
            let allFiltered = mockLiveChecks;

            if (filter) {
                allFiltered = allFiltered.filter(check => {
                    const searchLower = filter.search?.toLowerCase() || '';
                    const matchesResident = check.residents.some(r => r.name.toLowerCase().includes(searchLower));
                    const matchesLocation = check.location.toLowerCase().includes(searchLower);

                    if (filter.search && !matchesResident && !matchesLocation) return false;

                    // Group & Unit Filters
                    if (filter.group && filter.group !== 'all' && check.group !== filter.group) return false;
                    if (filter.unit && filter.unit !== 'all' && check.unit !== filter.unit) return false;

                    return true;
                });
            }

            // For the mock, we simulate that there are many more generated rows
            // that fit the filter. If search is blank and group/unit are 'all', we use TOTAL_LIVE_RECORDS.
            // Otherwise, we just use the filtered length of the base mock data.
            const isFiltering = filter && (filter.search || filter.group !== 'all' || filter.unit !== 'all');
            const totalCount = isFiltering ? allFiltered.length : TOTAL_LIVE_RECORDS;

            let data: LiveCheckRow[] = [];

            // Paging the filtered data
            if (cursor < allFiltered.length) {
                data = allFiltered.slice(cursor, Math.min(cursor + pageSize, allFiltered.length));
            }

            // Fill remaining with generated data IF NOT filtering
            const remainingNeeded = pageSize - data.length;
            if (!isFiltering && remainingNeeded > 0 && cursor + data.length < TOTAL_LIVE_RECORDS) {
                const startIndex = cursor + data.length;
                const generateCount = Math.min(remainingNeeded, TOTAL_LIVE_RECORDS - startIndex);

                const generated = Array.from({ length: generateCount }, (_, i) => {
                    const idx = startIndex + i;
                    const status = 'upcoming' as LiveCheckRow['status'];
                    const timerSeverity = 'info' as LiveCheckRow['timerSeverity'];

                    return {
                        id: `gen-live-${idx}`,
                        status,
                        timerText: `Due in ${10 + (idx % 50)}m`,
                        timerSeverity,
                        location: `${100 + (idx % 200)}`,
                        residents: [{ id: `res-gen-${idx}`, name: `Resident ${idx}`, location: `${100 + (idx % 200)}` }],
                        hasHighRisk: idx % 15 === 0,
                        riskType: idx % 15 === 0 ? 'Random Assessment' : undefined,
                        group: GROUPS[idx % 4],
                        unit: `${UNIT_PREFIXES[idx % 4]}${(idx % 200) / 100 | 0 + 1}`,
                        lastCheckTime: new Date(Date.now() - 16 * 60000).toISOString(),
                        lastCheckOfficer: 'Brett Corbin',
                        supervisorNote: undefined,
                        originalCheck: null as never,
                    } as LiveCheckRow;
                });
                data = [...data, ...generated];
            }

            const nextCursor = cursor + data.length < totalCount ? cursor + data.length : null;
            resolve({ data, nextCursor });
        }, 1500); // Simulate network delay
    });
}

/**
 * Calculates total counts for the Live View tab badges based on filters.
 * In a real app, this would be a single lightweight API call.
 */
export function getLiveCounts(filter: { search: string; group?: string; unit?: string }): { missed: number; due: number } {
    // For mock purposes, we iterate the base mock checks + simulate the rest of the 8914
    // since the generation is deterministic (idx % 3).

    // 1. Count base mock checks (which are more realistic)
    let missed = 0;
    let due = 0;

    mockLiveChecks.forEach(check => {
        // Apply search filter
        const searchLower = filter.search.toLowerCase();
        const matchesResident = check.residents.some(r => r.name.toLowerCase().includes(searchLower));
        const matchesLocation = check.location.toLowerCase().includes(searchLower);


        if (filter.search && !matchesResident && !matchesLocation) return;

        // Group & Unit Filters
        if (filter.group !== 'all' && check.group !== filter.group) return;
        if (filter.unit !== 'all' && check.unit !== filter.unit) return;

        if (check.status === 'overdue') missed++;
        else if (check.status === 'due') due++;
    });

    // 2. Estimate or calculate the remaining generated checks (from mockLiveChecks.length to TOTAL_LIVE_RECORDS)
    // All generated records are now 'pending', so they contribute 0 to missed/due.
    return { missed, due };
}
