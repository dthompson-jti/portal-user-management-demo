import { LiveCheckRow, HistoricalCheck, DesktopFilter } from '../../desktop/types';
import { SafetyCheckReview } from '../../types';
import { getStableHash, getOperationalState, getActiveStory } from './simulationConfig';

const FACILITY_CONFIG = [
    {
        group: 'Cedar',
        units: ['Cedar Intake', 'Cedar Assessment']
    },
    {
        group: 'Oak',
        units: ['Oak Integrated', 'Oak Enhanced', 'Oak Secure']
    },
    {
        group: 'Maple',
        units: ['Maple General', 'Maple Transitional']
    },
    {
        group: 'Pine',
        units: ['Pine Honors', 'Pine Re-entry']
    }
];

export const RESIDENT_NAMES = [
    'James Wilson', 'Maria Garcia', 'Robert Taylor', 'Linda Johnson', 'Michael Brown',
    'Elizabeth Davis', 'William Miller', 'Susan Wilson', 'David Moore', 'Jessica Taylor',
    'John Anderson', 'Karen Thomas', 'Christopher Jackson', 'Nancy White', 'Matthew Harris',
    'Sarah Martin', 'Daniel Thompson', 'Lisa Garcia', 'Anthony Martinez', 'Dorothy Robinson',
    'Kevin Clark', 'Sandra Rodriguez', 'Paul Lewis', 'Donna Lee', 'Mark Walker',
    'Betty Hall', 'George Allen', 'Margaret Young', 'Kenneth Hernandez', 'Ruth King',
    'Edward Wright', 'Sharon Lopez', 'Ronald Hill', 'Michelle Scott', 'Timothy Green',
    'Laura Adams', 'Jason Baker', 'Sarah Gonzalez', 'Jeffrey Nelson', 'Kimberly Carter',
    'Gary Mitchell', 'Deborah Perez', 'Nicholas Roberts', 'Jessica Turner', 'Eric Phillips',
    'Shirley Campbell', 'Stephen Parker', 'Cynthia Evans', 'Andrew Edwards', 'Angela Collins',
    'Raymond Stewart', 'Melissa Sanchez', 'Joshua Morris', 'Brenda Rogers', 'Dennis Reed',
    'Amy Cook', 'Jerry Morgan', 'Anna Bell', 'Tyler Murphy', 'Rebecca Bailey',
    'Aaron Rivera', 'Virginia Cooper', 'Henry Richardson', 'Kathleen Cox', 'Douglas Howard',
    'Martha Ward', 'Peter Torres', 'Debra Peterson', 'Walter Gray', 'Amanda Ramirez',
    'Harold James', 'Stephanie Watson', 'Jose Brooks', 'Carolyn Kelly', 'Adam Sanders',
    'Christine Price', 'Nathan Bennett', 'Janet Wood', 'Lawrence Chen', 'Catherine Barnes',
    'Arthur Ross', 'Frances Henderson', 'Ryan Coleman', 'Ann Jenkins', 'Joe Perry',
    'Alice Powell', 'Juan Long', 'Julie Patterson', 'Jack Hughes', 'Heather Flores',
    'Albert Washington', 'Teresa Butler', 'Jonathan Simmons', 'Doris Foster', 'Justin Gonzales',
    'Sara Bryant', 'Terry Alexander', 'Gloria Russell', 'Gerald Griffin', 'Evelyn Diaz',
    'Keith Hayes', 'Jean Myers', 'Samuel Ford', 'Cheryl Hamilton', 'Willie Graham',
    'Mildred Sullivan', 'Ralph Wallace', 'Katherine Woods', 'Roy Cole', 'Joan West',
    'Benjamin Jordan', 'Ashley Owens', 'Bruce Reynolds', 'Judith Fisher', 'Brandon Ellis',
    'Rose Harrison', 'Harry Gibson', 'Janice Mcdonald', 'Wayne Cruz', 'Kelly Marshall',
    'Billy Ortiz', 'Nicole Gomez', 'Steve Murray', 'Judy Freeman', 'Louis Wells',
    'Christina Webb', 'Eugene Simpson', 'Kathy Stevens', 'Russell Tucker', 'Theresa Porter',
    'Bobby Hunter', 'Beverly Hicks', 'Philip Crawford', 'Denise Henry', 'Johnny Boyd',
    'Marilyn Mason', 'Christian Morales', 'Amber Kennedy', 'Isaiah Warren', 'Danielle Dixon',
    'Frank Ramos', 'Brittany Reyes', 'Scott Burns', 'Diana Gordon', 'Eric Shaw',
    'Jane Holmes', 'Randy Rice', 'Lori Robertson', 'Victor Hunt', 'Tiffany Black',
    'Roy Daniels', 'Crystal Palmer', 'Willie Mills', 'Julia Nichols', 'Ray Grant',
    'Ruby Knight', 'Bobby Ferguson', 'Paula Rose', 'Jesse Stone', 'Kelly Meyer',
    'Lillian Watkins', 'Ernest Jenkins', 'Annie Berry', 'Phillip Barker', 'Liza Andrews',
    'Gregory Payne', 'Irene Pearson', 'Joshua Garrett', 'Bonnie Burton', 'Sean Fuller',
    'Alice Lynch', 'Fred Dean', 'Jeanette Gilbert', 'Bradley Soto', 'Florence Vargas',
    'Philip Moreno', 'Nellie Jimenez', 'Eugene Franklin', 'Hazel Lawson', 'Shawn Johnston',
    'Mabel Lane', 'Stanley Mendez', 'Eileen Harvey', 'Jacob Little', 'Gladys Burton',
    'Clarence Stanley', 'Edna Nguyen', 'Leonard Stephens', 'Bernice George', 'Franklin Hunt',
    'Gertrude Chapman', 'Harvey Berry', 'Beulah Howell', 'Theodore Spencer', 'Ethel Gardner',
    'Curtis Stephens', 'Vera Payne', 'Melvin Pierce', 'Charlene Watkins', 'Mitchell Murray',
    'Bessie Simmons', 'Clinton Lucas', 'Dora Rhodes', 'Rufus Weaver', 'Edith Wagner',
    'Gilbert Willis', 'Verna Foster', 'Gene Arnold', 'Lois Chapman', 'Willard Elliott',
    'Inez Duncan', 'Lester Knight', 'Lorene Bishop', 'Horace Porter', 'Mamie Hudson',
    'Duane Snyder', 'Lydia Perkins', 'Ross Mccoy', 'Nettie Oliver', 'Ivan Montgomery',
    'Eula Blair', 'Guy Lawson', 'Sally Coleman', 'Max Wade', 'Estella Rhodes',
    'Floyd Jennings', 'Olive Barker', 'Hubert Garrett', 'Phoebe Franklin', 'Alvin Stevenson',
    'Lela Weber', 'Julian Yates', 'Vesta Glover', 'Herman Mcbride', 'Wilda Huffman',
    'Everett Mckenzie', 'Goldie Goodman', 'Sidney Massey', 'Roxie Holloway', 'Chester Hubbard',
    'Hattie Daniel', 'Oliver Vance', 'Leila Stark', 'Wesley Preston', 'Ollie Calhoun',
    'Claude Rowland', 'Bertie Merritt', 'Leon Hull', 'Lottie Blackwell', 'Milton Sellers',
    'Myra Gentry', 'Irving Sexton', 'Alta Calhoun', 'Percy Browning', 'Della Whitehead',
    'Oscar Singleton', 'Callie Mayo', 'Felix Pate', 'Eula Bullock', 'Elmer Mcknight',
    'Leona Cherry', 'Leland Moon', 'Iva Gamble', 'Arthur Kirby', 'Nelle Mcintosh',
    'Julius Hardin', 'Etta Carver', 'Cecil Whitehead', 'Lula Dalton', 'Marshall Maynard',
    'Effie Mcgee', 'Salvador Burgess', 'Lilly Small', 'Freddie Branch', 'Opal Hensley',
    'Clifford Harmon', 'Ora Best', 'Emil Merritt', 'Essie Britt', 'Cornelius Davenport',
    'Iva Christian', 'Aubrey Bond', 'Elnora Mcpherson', 'Wallace Glass', 'Fannie Bullock',
    'Alonzo Pruitt', 'Ollie Shepherd', 'Roderick Vinson', 'Veda Dotson', 'Emmett House',
];

export const OFFICER_NAMES = [
    'Brett Corbin', 'Jeff Siemens', 'Jalpa Mazmudar',
    'Sarah Jenkins', 'John Doe', 'Alice Miller', 'Robert Smith'
];

export const REVIEWER_NAMES = [
    'Dave Thompson', 'Sarah Jenkins', 'Jeff Siemens', 'Robert Smith', 'Admin User'
];

const NOTE_SNIPPETS = [
    'Resident is sleeping.', 'Resident is awake and alert.', 'Room is tidy.',
    'Resident refused check.', 'Resident is in common area.', 'Checked vitals.',
];

// Seeded random for consistent results between refreshes
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const seededSecond = (seed: number) => Math.floor(seededRandom(seed) * 60);

// Room Definition
interface RoomDef {
    id: string;
    residents: { id: string; name: string; location: string; hasHighRisk?: boolean; hasMedicalWatch?: boolean }[];
    location: string;
    group: string;
    unit: string;
}

// Generate rooms with 1-2 residents each
const ROOMS: RoomDef[] = ((): RoomDef[] => {
    const rooms: RoomDef[] = [];
    const usedNames = new Set<string>();

    let globalSeed = 0;

    // Create random but repeatable assignments
    FACILITY_CONFIG.forEach((config) => {
        config.units.forEach((unitName) => {
            // ~6-8 rooms per unit
            const numRooms = 6 + Math.floor(seededRandom(globalSeed++) * 3);

            for (let i = 0; i < numRooms; i++) {
                const roomNum = 100 + i;
                const locationDisplay = `${roomNum}`; // Hotel style: just "100"
                const roomId = `room-${unitName.replace(/\s+/g, '-')}-${roomNum}`;

                // Deterministic count based on loop
                const seed = globalSeed * 100 + i;
                const isDouble = (seededRandom(seed) > 0.6); // 40% doubles
                const residentCount = isDouble ? 2 : 1;

                const roomResidents: { id: string; name: string; location: string; hasHighRisk?: boolean; hasMedicalWatch?: boolean; otherRisks?: string[] }[] = [];

                // FORCE: Make rooms 2 and 5 explicitly Paired MW for visibility (using approximate index)
                const globalRoomIndex = rooms.length;
                const isForcedPaired = (globalRoomIndex === 2 || globalRoomIndex === 5);

                // Decide if this room is a "Paired MW" room. Force it or random chance.
                const isPairedMW = isForcedPaired || (residentCount === 2 && (seed % 10 === 0));

                // If forced paired, ensure count is 2
                const finalResidentCount = isForcedPaired ? 2 : residentCount;

                for (let r = 0; r < finalResidentCount; r++) {
                    // Pick names that haven't been used
                    let nameIdx = (seed * 7 + r) % RESIDENT_NAMES.length;
                    while (usedNames.has(RESIDENT_NAMES[nameIdx])) {
                        nameIdx = (nameIdx + 1) % RESIDENT_NAMES.length;
                    }
                    const name = RESIDENT_NAMES[nameIdx];
                    usedNames.add(name);

                    // Assign High Risk
                    let hasHighRisk = !isPairedMW && ((seed + r) % 8 === 0);
                    let hasMedicalWatch = isPairedMW;

                    // Assign Other Risks (Assaultive, Flight Risk) for variety (approx 5% chance)
                    let otherRisks: string[] | undefined = undefined;
                    const randomVal = seededRandom(seed * 13 + r);

                    if (randomVal > 0.95) {
                        otherRisks = ['Flight Risk'];
                    } else if (randomVal > 0.90 && randomVal <= 0.95) {
                        otherRisks = ['Assaultive'];
                    }

                    // Manual override for Victor Hunt to ensure we see the [+2] case
                    if (name === 'Victor Hunt') {
                        hasHighRisk = true;
                        hasMedicalWatch = true;
                        otherRisks = ['Flight Risk', 'Assaultive']; // Total 4 statuses test
                    }
                    // Override for Bobby Ferguson
                    if (name === 'Bobby Ferguson') {
                        hasHighRisk = true;
                        hasMedicalWatch = true;
                        otherRisks = undefined;
                    }
                    // Override for Flight Risk test (Single + Other) - Removed for Bobby
                    if (name === 'Bobby Ferguson' && !hasMedicalWatch) {
                        hasHighRisk = true;
                        otherRisks = ['Flight Risk'];
                    }

                    roomResidents.push({
                        id: `res-${roomId}-${r}`,
                        name,
                        location: locationDisplay, // "100"
                        hasHighRisk,
                        hasMedicalWatch,
                        otherRisks
                    });
                }

                rooms.push({
                    id: roomId,
                    residents: roomResidents,
                    location: locationDisplay,
                    group: config.group,
                    unit: unitName
                });
            }
        });
    });
    return rooms;
})();

interface RiskProfile {
    missedProb: number;
    commentFailProb: number;
    tier: 'punctual' | 'good' | 'critical';
}

const getUnitProfile = (group: string, unit: string): RiskProfile => {
    // Critical: Cedar Intake (High volatility)
    if (unit.includes('Intake')) {
        return { missedProb: 0.180, commentFailProb: 0.65, tier: 'critical' };
    }

    // Punctual: Pine Honors (Best behavior)
    if (group === 'Pine') {
        return { missedProb: 0, commentFailProb: 0, tier: 'punctual' };
    }

    // Good: Everyone else
    return { missedProb: 0.02, commentFailProb: 0.1, tier: 'good' };
};



/**
 * CORE DATA GENERATOR
 * 
 * For 60 rooms, spread scheduled times across the full hour:
 * - Room 0  → :00
 * - Room 1  → :01
 * - Room 59 → :59
 * 
 * At any given time, this creates a natural mix:
 * - Rooms with times in the past → Overdue
 * - Rooms within 5 mins of now   → Due  
 * - Rooms in the future          → Upcoming
 */
export const generateEnhancedData = () => {
    const liveData: LiveCheckRow[] = [];
    const historicalData: HistoricalCheck[] = [];

    const now = new Date();
    const MS_PER_MINUTE = 60000;
    const CHECK_INTERVAL_MINS = 15;
    const HISTORY_HOURS = 48;

    ROOMS.forEach((room, roomIdx) => {
        const officer = OFFICER_NAMES[roomIdx % OFFICER_NAMES.length];

        // --- SIMULATION MODE ---
        // 1. Get baseline operational state (Time of Day etc)
        const opState = getOperationalState(now.toISOString());
        // 2. Get unit-specific story (Lockdown etc)
        const storyMode = getActiveStory(room.unit, now.toISOString());

        const profile = getUnitProfile(room.group, room.unit);

        let targetDelta: number;
        // Use a stable seed for this specific window/room
        const windowStartTime = new Date(now);
        windowStartTime.setMinutes(roomIdx, 0, 0); // Spreading rooms across the hour
        const stableSeed = getStableHash(room.id + windowStartTime.toDateString());
        const rand = seededRandom(stableSeed);

        // Lockdown Story: Cluster rooms into Overdue
        if (storyMode === 'LOCKDOWN') {
            targetDelta = 25 + (stableSeed % 15); // Forced Overdue
        } else if (opState.mode === 'SHIFT_CHANGE' && rand < 0.3) {
            targetDelta = 10 + (stableSeed % 10); // Shift change jank
        } else if (profile.tier === 'punctual' || opState.mode === 'NIGHT') {
            // Night or Punctual: Mostly Upcoming
            targetDelta = -10 - (stableSeed % 20);
        } else if (profile.tier === 'good') {
            // Good: Upcoming or Due
            targetDelta = rand < 0.7 ? -10 : 2;
        } else {
            // Critical: Balanced mix
            if (rand < 0.2) targetDelta = -15;
            else if (rand < 0.5) targetDelta = 2;
            else targetDelta = 20;
        }

        const scheduledTime = new Date(now.getTime() - targetDelta * MS_PER_MINUTE);
        scheduledTime.setSeconds(seededSecond(stableSeed + 17), 0);

        // Calculate how many minutes ago (positive) or in the future (negative) this check is
        const deltaMinutes = Math.floor((now.getTime() - scheduledTime.getTime()) / MS_PER_MINUTE);

        // Determine Live status based on time difference
        let liveStatus: 'upcoming' | 'due' | 'overdue';
        let timerText: string;
        let timerSeverity: 'alert' | 'warning' | 'info';

        if (deltaMinutes > 15) {
            // More than 15 mins past scheduled time
            liveStatus = 'overdue';
            timerText = `Missed ${deltaMinutes}m`;
            timerSeverity = 'alert';
        } else if (deltaMinutes > 5) {
            // 6-15 mins past scheduled time
            liveStatus = 'overdue';
            timerText = `Missed ${deltaMinutes}m`;
            timerSeverity = 'alert';
        } else if (deltaMinutes >= 0) {
            // 0-5 mins past scheduled time (grace period) → Due
            liveStatus = 'due';
            timerText = deltaMinutes === 0 ? 'Due now' : `Due ${deltaMinutes}m ago`;
            timerSeverity = 'warning';
        } else if (deltaMinutes >= -5) {
            // 1-5 mins before scheduled time → Due soon
            liveStatus = 'due';
            timerText = `Due in ${Math.abs(deltaMinutes)}m`;
            timerSeverity = 'warning';
        } else {
            // More than 5 mins before scheduled time → Upcoming
            liveStatus = 'upcoming';
            timerText = `Due in ${Math.abs(deltaMinutes)}m`;
            timerSeverity = 'info';
        }

        // Calculate missed check count
        let missedCheckCount = 0;
        if (liveStatus === 'overdue') {
            // 1 check is base. Additional checks every 15 mins if they are also > 5 mins overdue
            missedCheckCount = 1 + Math.max(0, Math.floor((deltaMinutes - 6) / 15));
        }

        // Add to Live data (ONE check per room)
        liveData.push({
            id: `live-${room.id}`,
            status: liveStatus,
            timerText,
            timerSeverity,
            location: room.location,
            residents: room.residents, // All residents
            hasHighRisk: room.residents.some((_, i) => (roomIdx + i) % 7 === 0),
            group: room.group,
            unit: room.unit,
            lastCheckTime: null,
            lastCheckOfficer: null,
            missedCheckCount,
            originalCheck: {
                id: `check-${room.id}`,
                correlationGuid: `guid-live-${room.id}`,
                type: 'scheduled',
                status: liveStatus === 'upcoming' ? 'pending' : (liveStatus === 'due' ? 'due' : 'missed'),
                residents: room.residents,
                scheduledStartTime: scheduledTime.toISOString(),
                scheduledEndTime: scheduledTime.toISOString(),
                dueDate: scheduledTime.toISOString(),
                generationId: 1,
                baseInterval: 15
            },
        });

        // Generate historical rows per resident
        room.residents.forEach((resident, resIdx) => {
            // Historical checks for this resident
            const historyStart = new Date(now.getTime() - HISTORY_HOURS * 60 * MS_PER_MINUTE);
            historyStart.setMinutes(scheduledTime.getMinutes(), 0, 0);

            let slotTime = new Date(historyStart);
            let slotIndex = 0;

            const scheduledWindowEnd = new Date(scheduledTime);
            scheduledWindowEnd.setSeconds(0, 0);

            while (slotTime < scheduledWindowEnd) {
                const checkId = `hist-${room.id}-${resIdx}-${slotIndex}`;
                const slotSeed = getStableHash(`${resident.id}-${room.id}-${slotIndex}`);
                const scheduledSlotTime = new Date(slotTime);
                scheduledSlotTime.setSeconds(seededSecond(slotSeed), 0);
                const scheduledTimeISO = scheduledSlotTime.toISOString();

                // --- SLOT LEVEL SIMULATION ---
                const slotOpState = getOperationalState(scheduledTimeISO);
                const slotStory = getActiveStory(room.unit, scheduledTimeISO);
                const resSeed = getStableHash(resident.id + scheduledTimeISO);
                const randomVal = seededRandom(resSeed);

                const checkAgeHours = (now.getTime() - scheduledSlotTime.getTime()) / (60 * 60 * 1000);
                const decayFactor = Math.exp(-checkAgeHours / 24); // More historical data visibility

                // Missed Logic: Influenced by Story, Cadence, and Unit Profile
                let isMissed = false;
                if (slotStory === 'LOCKDOWN') {
                    isMissed = true;
                } else {
                    const baseProb = profile.missedProb * slotOpState.missedProbabilityScale;
                    isMissed = randomVal < (baseProb * decayFactor);
                }

                // Variance Logic: Influenced by Cadence
                const variance = isMissed
                    ? Infinity
                    : Math.floor((seededRandom(resSeed + 1) * 10 - 2) * slotOpState.varianceMultiplier);

                const status: 'completed' | 'missed' | 'completed-late' = isMissed
                    ? 'missed'
                    : (variance > 0 ? 'completed-late' : 'completed');

                const actualTime = isMissed ? null : new Date(scheduledSlotTime.getTime() + variance * MS_PER_MINUTE).toISOString();
                const officerNote = (slotIndex % 4 === 0) ? NOTE_SNIPPETS[slotIndex % NOTE_SNIPPETS.length] : undefined;

                const commentRandomVal = seededRandom(resSeed + 2);
                const commentThreshold = checkAgeHours < 4 ? 0.95 : (profile.commentFailProb * decayFactor * slotOpState.noteProbabilityScale);
                const shouldHaveComment = commentRandomVal > commentThreshold;

                // IA Alignment: correlationGuid links events (STABLE HASH)
                const correlationGuid = `guid-${getStableHash(room.id + resident.id + scheduledTimeISO)}`;

                // IA Alignment: Supervisor Review Entity
                let supervisorReview: SafetyCheckReview | undefined = undefined;
                if (isMissed && shouldHaveComment) {
                    const reason = slotStory === 'LOCKDOWN' ? 'Unit Lockdown' : (randomVal < 0.5 ? 'Medical Emergency' : 'Staff Shortage');
                    supervisorReview = {
                        id: `rev-${checkId}`,
                        safetyCheckId: checkId,
                        reason,
                        notes: `Reviewed and documented. Delay caused by ${reason.toLowerCase()}.`,
                        reviewedById: 'u-dthompson',
                        reviewedDate: new Date(scheduledSlotTime.getTime() + 60 * MS_PER_MINUTE).toISOString()
                    };
                }

                const supervisorNote = supervisorReview?.notes;
                const supervisorName = supervisorReview ? 'Dave Thompson' : undefined;
                const reviewDate = supervisorReview?.reviewedDate;

                // 1. ADD THE BASE RECORD (MISSED or COMPLETED)
                historicalData.push({
                    id: checkId,
                    correlationGuid,
                    residents: [resident],
                    location: room.location,
                    scheduledStartTime: scheduledTimeISO,
                    scheduledEndTime: scheduledTimeISO,
                    completedTime: actualTime,
                    missedTime: isMissed ? scheduledTimeISO : null,
                    scheduledTime: scheduledTimeISO,
                    actualTime,
                    status,
                    varianceMinutes: variance,
                    group: room.group,
                    unit: room.unit,
                    officerName: isMissed ? '' : officer,
                    officerNote,
                    supervisorNote,
                    supervisorReview,
                    supervisorName,
                    reviewDate,
                    reviewStatus: isMissed ? (supervisorReview ? 'verified' : 'pending') : 'verified',
                    hasHighRisk: (roomIdx + resIdx) % 7 === 0,
                    roomIdMethod: isMissed ? undefined : (resSeed % 3 === 0 ? 'NFC' : (resSeed % 3 === 1 ? 'QR_CODE' : 'MANUAL_ENTRY')),
                });

                // 2. INJECT CORRECTION CHAIN (Simulation of late completion after a miss)
                // 10% chance if missed, to show it was eventually settled
                if (isMissed && randomVal < 0.1) {
                    const correctionVariance = 17 + (resSeed % 10); // 17-26 mins late
                    const correctionTime = new Date(scheduledSlotTime.getTime() + correctionVariance * MS_PER_MINUTE).toISOString();
                    historicalData.push({
                        id: `${checkId}-corrected`,
                        correlationGuid, // SHARED GUID
                        residents: [resident],
                        location: room.location,
                        scheduledStartTime: scheduledTimeISO,
                        scheduledEndTime: scheduledTimeISO,
                        completedTime: correctionTime,
                        missedTime: null,
                        scheduledTime: scheduledTimeISO,
                        actualTime: correctionTime,
                        status: 'completed-late',
                        varianceMinutes: correctionVariance,
                        group: room.group,
                        unit: room.unit,
                        officerName: officer,
                        officerNote: 'Verification of missed window.',
                        hasHighRisk: (roomIdx + resIdx) % 7 === 0,
                        roomIdMethod: 'MANUAL_ENTRY',
                        reviewStatus: 'verified'
                    });
                }

                slotTime = new Date(slotTime.getTime() + CHECK_INTERVAL_MINS * MS_PER_MINUTE);
                slotIndex++;
            }
        });
    });

    return { liveData, historicalData };
};

const cachedData = generateEnhancedData();

export const TOTAL_LIVE_RECORDS = cachedData.liveData.length;
export const TOTAL_HISTORICAL_RECORDS = cachedData.historicalData.length;

export { cachedData as enhancedMockData };

// Helper to check if a search term matches any property of a record
const matchesSearch = (text: string, search: string) => {
    return text.toLowerCase().includes(search.toLowerCase());
};

const isSpecialRiskSearch = (s: string) => {
    const lower = s.toLowerCase();
    return lower === 'sr' || lower === 'special risk' || lower === 'suicide risk' || lower === 'special' || lower === 'suicide' || lower === 'high risk';
};

const isMedicalWatchSearch = (s: string) => {
    const lower = s.toLowerCase();
    return lower === 'mw' || lower === 'medical watch' || lower === 'medical' || lower === 'watch';
};

// Paginated data loaders for table views
export const loadEnhancedLivePage = (
    cursor: number,
    pageSize: number,
    filter?: DesktopFilter
): Promise<{ data: LiveCheckRow[]; nextCursor: number | null; totalCount: number }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let filtered = cachedData.liveData;
            if (filter) {
                if (filter.search) {
                    const s = filter.search.toLowerCase();
                    const isSR = isSpecialRiskSearch(s);
                    const isMW = isMedicalWatchSearch(s);

                    filtered = filtered.filter((row: LiveCheckRow) =>
                        row.residents.some((r) => matchesSearch(r.name, s)) ||
                        matchesSearch(row.location, s) ||
                        matchesSearch(row.group, s) ||
                        matchesSearch(row.unit, s) ||
                        (row.lastCheckOfficer && matchesSearch(row.lastCheckOfficer, s)) ||
                        matchesSearch(row.status, s) ||
                        (isSR && row.hasHighRisk) ||
                        (isMW && row.location.includes('MW'))
                    );
                }
                if (filter.group && filter.group !== 'all') filtered = filtered.filter((r: LiveCheckRow) => r.group === filter.group);
                if (filter.unit && filter.unit !== 'all') filtered = filtered.filter((r: LiveCheckRow) => r.unit === filter.unit);
                if (filter.statusFilter && filter.statusFilter !== 'all') {
                    filtered = filtered.filter((r: LiveCheckRow) => r.status === filter.statusFilter);
                }
            }
            const data = filtered.slice(cursor, cursor + pageSize);
            const nextCursor = (cursor + pageSize < filtered.length) ? cursor + pageSize : null;
            resolve({ data, nextCursor, totalCount: filtered.length });
        }, 200);
    });
};

export const loadEnhancedHistoricalPage = (
    cursor: number,
    pageSize: number,
    filter?: DesktopFilter
): Promise<{ data: HistoricalCheck[]; nextCursor: number | null; totalCount: number }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let filtered = cachedData.historicalData;
            if (filter) {
                if (filter.search) {
                    const s = filter.search.toLowerCase();
                    const isSR = isSpecialRiskSearch(s);
                    const isMW = isMedicalWatchSearch(s);

                    filtered = filtered.filter((row: HistoricalCheck) =>
                        row.residents.some((r) => matchesSearch(r.name, s)) ||
                        matchesSearch(row.location, s) ||
                        matchesSearch(row.group, s) ||
                        matchesSearch(row.unit, s) ||
                        matchesSearch(row.officerName, s) ||
                        (row.supervisorNote && matchesSearch(row.supervisorNote, s)) ||
                        (row.officerNote && matchesSearch(row.officerNote, s)) ||
                        matchesSearch(row.status, s) ||
                        (isSR && row.hasHighRisk) ||
                        (isMW && row.location.includes('MW'))
                    );
                }
                if (filter.group && filter.group !== 'all') filtered = filtered.filter((r: HistoricalCheck) => r.group === filter.group);
                if (filter.unit && filter.unit !== 'all') filtered = filtered.filter((r: HistoricalCheck) => r.unit === filter.unit);
                if (filter.historicalStatusFilter && filter.historicalStatusFilter.length > 0) {
                    filtered = filtered.filter((r: HistoricalCheck) => {
                        const activeFilters = filter.historicalStatusFilter;

                        // Handle "All" equivalent
                        if (activeFilters.includes('all')) return true;

                        // Missed Filter
                        if (activeFilters.includes('missed-all')) {
                            if (r.status === 'missed') return true;
                        }
                        if (activeFilters.includes('missed-not-reviewed')) {
                            if (r.status === 'missed' && !r.supervisorNote) return true;
                        }
                        if (activeFilters.includes('missed-reviewed')) {
                            if (r.status === 'missed' && !!r.supervisorNote) return true;
                        }

                        // Completed Filter
                        if (activeFilters.includes('completed')) {
                            if (r.status === 'completed') return true;
                        }
                        if (activeFilters.includes('completed-late')) {
                            if (r.status === 'completed-late') return true;
                        }

                        return false;
                    });
                }
                if (filter.startDate || filter.endDate) {
                    const checkDate = (iso: string) => iso.split('T')[0];
                    filtered = filtered.filter((r: HistoricalCheck) => {
                        if (filter.startDate) {
                            const date = checkDate(r.scheduledTime);
                            if (date < filter.startDate) return false;
                        }
                        if (filter.endDate) {
                            const date = checkDate(r.scheduledTime);
                            if (date > filter.endDate) return false;
                        }
                        return true;
                    });
                }

                // Advanced Fields
                if (filter.officer) {
                    filtered = filtered.filter((r: HistoricalCheck) =>
                        r.officerName.toLowerCase().includes(filter.officer.toLowerCase())
                    );
                }
                if (filter.startDate) {
                    filtered = filtered.filter((r: HistoricalCheck) => r.scheduledTime.split('T')[0] >= filter.startDate!);
                }
                if (filter.endDate) {
                    filtered = filtered.filter((r: HistoricalCheck) => r.scheduledTime.split('T')[0] <= filter.endDate!);
                }
                if (filter.enhancedObservation && filter.enhancedObservation !== 'any') {
                    filtered = filtered.filter((r: HistoricalCheck) => {
                        if (filter.enhancedObservation === 'has-any') return !!r.hasHighRisk || r.location.includes('MW');
                        if (filter.enhancedObservation === 'sr') return !!r.hasHighRisk;
                        if (filter.enhancedObservation === 'mw') return r.location.includes('MW'); // Mock logic
                        return true;
                    });
                }
                if (filter.commentFilter && filter.commentFilter !== 'any') {
                    filtered = filtered.filter((r: HistoricalCheck) => {
                        if (filter.commentFilter === 'has') return !!r.supervisorNote;
                        if (filter.commentFilter === 'none') return !r.supervisorNote;
                        return true;
                    });
                }
                if (filter.commentReason && filter.commentReason !== 'any') {
                    filtered = filtered.filter((r: HistoricalCheck) =>
                        r.supervisorNote && r.supervisorNote.startsWith(filter.commentReason)
                    );
                }
            }
            const data = filtered.slice(cursor, cursor + pageSize);
            const nextCursor = (cursor + pageSize < filtered.length) ? cursor + pageSize : null;
            resolve({ data, nextCursor, totalCount: filtered.length });
        }, 200);
    });
};

/**
 * Update one or more historical checks in the mock database.
 */
export const updateHistoricalCheck = (ids: string[], updates: Partial<HistoricalCheck>): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            cachedData.historicalData = cachedData.historicalData.map((check: HistoricalCheck) =>
                ids.includes(check.id) ? { ...check, ...updates } : check
            );
            resolve();
        }, 100);
    });
};
