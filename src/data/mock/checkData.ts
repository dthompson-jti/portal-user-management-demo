import { SafetyCheck } from '../../types';
import { mockResidents } from './residentData';

// Helper to group residents by their location for check creation
const residentsByLocation = mockResidents.reduce((acc, resident) => {
  if (!acc[resident.location]) {
    acc[resident.location] = [];
  }
  acc[resident.location].push(resident);
  return acc;
}, {} as Record<string, typeof mockResidents>);

// Factory function to generate fresh check data with current timestamps
export const generateInitialChecks = (): SafetyCheck[] => {
  const now = new Date();
  const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

  const DEFAULT_INTERVAL = 15; // Minutes

  // Helper to create checks from the table data for consistency.
  const createCheck = (location: string, offsetMinutes: number = 0, specialClassifications: { type: string, details: string, residentId: string }[] = []) => {
    const scheduledEndTime = inNMinutes(offsetMinutes);
    const scheduledStartTime = inNMinutes(offsetMinutes - DEFAULT_INTERVAL);

    return {
      id: `chk_${location.toLowerCase().replace(/[\s'()]/g, '_')}`,
      correlationGuid: `guid-init-${location.toLowerCase().replace(/[\s'()]/g, '_')}`,
      type: 'scheduled',
      residents: residentsByLocation[location] || [],
      status: 'pending', 
      scheduledStartTime,
      scheduledEndTime,
      dueDate: scheduledEndTime,
      specialClassifications,
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
    } as SafetyCheck;
  };

  // --- THEMED CHECKS ---
  
  const themedChecks = [
    // Star Wars
    createCheck("Death Star Detention Block", -5), // Missed
    createCheck("Star Destroyer Brigg", 2, [{ type: 'SW', details: 'Sith Lord monitoring required.', residentId: 'res_sw_6' }]),
    createCheck("Bespin Carbonite Chamber", 8),

    // Harry Potter
    createCheck("Tower Top (Max Security)", -30, [{ type: 'SR', details: 'Animagus risk. Constant watch.', residentId: 'res_hp_1' }]), // 2 Missed
    createCheck("Dungeon Level", 5),
    createCheck("Common Holding Hall", 12),

    // The Expanse
    createCheck("Rocinante Airlock (Temporary)", 1, [{ type: 'MW', details: 'Monitor for Protomolecule symptoms.', residentId: 'res_ex_1' }]),
    createCheck("Docking Bay 94", 4),
    createCheck("Operations Center Detention", 14, [{ type: 'MA', details: 'High-level political oversight.', residentId: 'res_ex_6' }]),
  ];

  // Add some completed checks for history view
  const historyChecks = [
    {
      id: 'chk_completed_1',
      correlationGuid: 'guid-hist-1',
      type: 'scheduled',
      residents: [mockResidents[0]], // Luke
      status: 'complete',
      scheduledStartTime: inNMinutes(-45),
      scheduledEndTime: inNMinutes(-30),
      completedTime: inNMinutes(-32),
      dueDate: inNMinutes(-30),
      lastChecked: inNMinutes(-32),
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
      roomIdMethod: 'NFC'
    } as SafetyCheck,
    {
      id: 'chk_completed_2',
      correlationGuid: 'guid-hist-2',
      type: 'scheduled',
      residents: [mockResidents[12]], // Sirius
      status: 'complete',
      scheduledStartTime: inNMinutes(-75),
      scheduledEndTime: inNMinutes(-60),
      completedTime: inNMinutes(-61),
      dueDate: inNMinutes(-60),
      lastChecked: inNMinutes(-61),
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
      roomIdMethod: 'QR_CODE'
    } as SafetyCheck,
    {
      id: 'chk_completed_3',
      correlationGuid: 'guid-hist-3',
      type: 'scheduled',
      residents: [mockResidents[22]], // Holden
      status: 'completed-late',
      scheduledStartTime: inNMinutes(-105),
      scheduledEndTime: inNMinutes(-90),
      completedTime: inNMinutes(-88), 
      dueDate: inNMinutes(-90),
      lastChecked: inNMinutes(-88),
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
      roomIdMethod: 'MANUAL_ENTRY'
    } as SafetyCheck,
  ];

  return [...themedChecks, ...historyChecks];
};

export const initialChecks: SafetyCheck[] = generateInitialChecks();