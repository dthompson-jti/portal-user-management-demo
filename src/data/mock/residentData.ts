// src/data/mock/residentData.ts
import { Resident } from '../../types';

export const mockResidents: Resident[] = [
  // =================================================================
  //           Imperial Detention Center (Star Wars)
  // =================================================================
  
  // --- Unit: Death Star ---
  { id: 'res_sw_1', name: 'Mock: Luke Skywalker', location: 'Death Star Detention Block', hasHighRisk: true },
  { id: 'res_sw_2', name: 'Mock: Leia Organa', location: 'Death Star Detention Block', hasHighRisk: true },
  { id: 'res_sw_3', name: 'Mock: Han Solo', location: 'Death Star Detention Block' },
  { id: 'res_sw_4', name: 'Mock: Chewbacca', location: 'Death Star Detention Block' },
  { id: 'res_sw_5', name: 'Mock: Obi-Wan Kenobi', location: 'Death Star Detention Block', hasHighRisk: true },

  // --- Unit: Star Destroyer ---
  { id: 'res_sw_6', name: 'Mock: Darth Vader', location: 'Star Destroyer Brigg', hasHighRisk: true },
  { id: 'res_sw_7', name: 'Mock: Admiral Piett', location: 'Star Destroyer Brigg' },
  { id: 'res_sw_8', name: 'Mock: Grand Moff Tarkin', location: 'Star Destroyer Brigg' },

  // --- Unit: Bespin ---
  { id: 'res_sw_9', name: 'Mock: Boba Fett', location: 'Bespin Carbonite Chamber' },
  { id: 'res_sw_10', name: 'Mock: Lando Calrissian', location: 'Bespin Carbonite Chamber' },

  // =================================================================
  //           Azkaban High Security (Harry Potter)
  // =================================================================

  // --- Unit: Tower Top ---
  { id: 'res_hp_1', name: 'Mock: Sirius Black', location: 'Tower Top (Max Security)', hasHighRisk: true },
  { id: 'res_hp_2', name: 'Mock: Albus Dumbledore', location: 'Tower Top (Max Security)', hasHighRisk: true },
  { id: 'res_hp_3', name: 'Mock: Gellert Grindelwald', location: 'Tower Top (Max Security)', hasHighRisk: true },

  // --- Unit: Dungeon Level ---
  { id: 'res_hp_4', name: 'Mock: Severus Snape', location: 'Dungeon Level', hasMedicalWatch: true },
  { id: 'res_hp_5', name: 'Mock: Tom Riddle (Voldemort)', location: 'Dungeon Level', hasHighRisk: true },
  { id: 'res_hp_6', name: 'Mock: Bellatrix Lestrange', location: 'Dungeon Level', hasHighRisk: true },

  // --- Unit: Common Hall ---
  { id: 'res_hp_7', name: 'Mock: Harry Potter', location: 'Common Holding Hall' },
  { id: 'res_hp_8', name: 'Mock: Ron Weasley', location: 'Common Holding Hall' },
  { id: 'res_hp_9', name: 'Mock: Hermione Granger', location: 'Common Holding Hall' },
  { id: 'res_hp_10', name: 'Mock: Neville Longbottom', location: 'Common Holding Hall' },

  // =================================================================
  //           Tycho Station Holding (The Expanse)
  // =================================================================

  // --- Unit: Rocinante Airlock ---
  { id: 'res_ex_1', name: 'Mock: James Holden', location: 'Rocinante Airlock (Temporary)', hasHighRisk: true },
  { id: 'res_ex_2', name: 'Mock: Naomi Nagata', location: 'Rocinante Airlock (Temporary)' },
  { id: 'res_ex_3', name: 'Mock: Amos Burton', location: 'Rocinante Airlock (Temporary)', hasHighRisk: true },

  // --- Unit: Docking Bay 94 ---
  { id: 'res_ex_4', name: 'Mock: Alex Kamal', location: 'Docking Bay 94' },
  { id: 'res_ex_5', name: 'Mock: Joseph Miller', location: 'Docking Bay 94', hasMedicalWatch: true },

  // --- Unit: Operations Center ---
  { id: 'res_ex_6', name: 'Mock: Chrisjen Avasarala', location: 'Operations Center Detention' },
  { id: 'res_ex_7', name: 'Mock: Camina Drummer', location: 'Operations Center Detention' },
  { id: 'res_ex_8', name: 'Mock: Bobbie Draper', location: 'Operations Center Detention', hasHighRisk: true },
  { id: 'res_ex_9', name: 'Mock: Klaes Ashford', location: 'Operations Center Detention' },
  { id: 'res_ex_10', name: 'Mock: Marco Inaros', location: 'Operations Center Detention', hasHighRisk: true },
];