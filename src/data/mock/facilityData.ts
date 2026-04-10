// src/data/mock/facilityData.ts

export interface FacilityUnit {
  id: string;
  name: string;
}

export interface FacilityGroup {
  id: string;
  name: string;
  units: FacilityUnit[];
}

export const facilityData: FacilityGroup[] = [
  {
    id: 'imperial',
    name: 'Imperial Detention Center',
    units: [
      { id: 'death-star', name: 'Death Star Detention Block' },
      { id: 'star-destroyer', name: 'Star Destroyer Brigg' },
      { id: 'bespin', name: 'Bespin Carbonite Chamber' },
    ],
  },
  {
    id: 'azkaban',
    name: 'Azkaban High Security',
    units: [
      { id: 'tower-top', name: 'Tower Top (Max Security)' },
      { id: 'dungeon', name: 'Dungeon Level' },
      { id: 'common-hall', name: 'Common Holding Hall' },
    ],
  },
  {
    id: 'tycho',
    name: 'Tycho Station Holding',
    units: [
      { id: 'rocinante', name: 'Rocinante Airlock (Temporary)' },
      { id: 'docking-bay', name: 'Docking Bay 94' },
      { id: 'ops', name: 'Operations Center Detention' },
    ],
  },
];