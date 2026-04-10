import { PortalAccessRecord } from '../types/portalTypes';

export const INITIAL_PORTAL_RESULTS: PortalAccessRecord[] = [
    // =================================================================
    //   CASE 1: Galactic Empire v Rebel Alliance (SW-CIV-24-001)
    //   Large-scale Class Action / Civil Suit
    // =================================================================
    {
        id: 'sw-001',
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: 'Plaintiff 1 Skywalker, Luke',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_luke@rebelalliance.org',
        dateGranted: '2024-01-01',
        author: 'Imperial Records',
        sharedWith: 'Case participant account',
        purpose: 'Portal access for lead plaintiff',
        accessGroup: 'With portal access'
    },
    {
        id: 'sw-002',
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: 'Plaintiff 2 Organa, Leia',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_leia@rebelalliance.org',
        dateGranted: '2024-01-01',
        author: 'Imperial Records',
        sharedWith: 'Case participant account',
        purpose: 'Portal access for lead plaintiff',
        accessGroup: 'With portal access'
    },
    {
        id: 'sw-003',
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: 'Solicitor for Plaintiffs',
        accessType: 'Delegated access',
        status: 'Active',
        email: 'mock_hermione@hogwarts.edu', // CROSS-OVER: Hermione is the solicitor
        dateGranted: '2024-01-05',
        author: 'Imperial Records',
        sharedWith: 'Professional representative',
        purpose: 'Legal representation for Rebel Alliance',
        accessGroup: 'With portal access'
    },
    {
        id: 'sw-004',
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: 'Defendant 1 Palpatine, Sheev',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_palpatine@empire.gov',
        dateGranted: '2024-01-10',
        author: 'Imperial Records',
        sharedWith: 'Case participant account',
        purpose: 'Defense access',
        accessGroup: 'With portal access'
    },
    {
        id: 'sw-005',
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: 'Defendant 2 Vader, Darth',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_vader@empire.gov',
        dateGranted: '2024-01-10',
        author: 'Imperial Records',
        sharedWith: 'Case participant account',
        purpose: 'Defense access',
        accessGroup: 'With portal access'
    },
    {
        id: 'sw-006',
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: 'Expert Witness (Aerospace)',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_holden@rocinante.space', // CROSS-OVER: Holden as expert witness
        dateGranted: '2024-02-15',
        author: 'Imperial Records',
        sharedWith: 'Professional representative',
        purpose: 'Technical testimony regarding thermal exhaust ports',
        accessGroup: 'With portal access'
    },
    // Adding 20 more generic Stormtroopers to SW-CIV-24-001 to show "More people per case"
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: `sw-st-${i}`,
        caseNumber: 'SW-CIV-24-001',
        caseName: "The Rebel Alliance v Galactic Empire, Sheev Palpatine and others",
        caseType: 'Civil',
        participantRole: `Defendant Group member: Stormtrooper #${i + 772}`,
        accessType: 'Direct access',
        status: 'Inactive',
        email: `stormtrooper_${i}@empire.gov`,
        dateGranted: '2024-03-01',
        author: 'Imperial Records',
        sharedWith: 'Case participant account',
        purpose: 'Personnel tracking in class action',
        accessGroup: 'Parties without access'
    })),

    // =================================================================
    //   CASE 2: Ministry of Magic v Tom Riddle (HP-CIV-24-002)
    // =================================================================
    {
        id: 'hp-001',
        caseNumber: 'HP-CIV-24-002',
        caseName: "Ministry of Magic v Tom Riddle, Death Eaters Ltd and others",
        caseType: 'Civil',
        participantRole: 'Prosecution Lead Potter, Harry',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_harry@hogwarts.edu',
        dateGranted: '2024-05-01',
        author: 'Ministry Records',
        sharedWith: 'Case participant account',
        purpose: 'Lead prosecution access',
        accessGroup: 'With portal access'
    },
    {
        id: 'hp-002',
        caseNumber: 'HP-CIV-24-002',
        caseName: "Ministry of Magic v Tom Riddle, Death Eaters Ltd and others",
        caseType: 'Civil',
        participantRole: 'Solicitor for Prosecution',
        accessType: 'Delegated access',
        status: 'Active',
        email: 'mock_hermione@hogwarts.edu', // CROSS-LINK: Hermione again
        dateGranted: '2024-05-01',
        author: 'Ministry Records',
        sharedWith: 'Professional representative',
        purpose: 'Legal counsel',
        accessGroup: 'With portal access'
    },
    {
        id: 'hp-003',
        caseNumber: 'HP-CIV-24-002',
        caseName: "Ministry of Magic v Tom Riddle, Death Eaters Ltd and others",
        caseType: 'Civil',
        participantRole: 'Defendant Riddle, Tom (AKA Voldemort)',
        accessType: 'Direct access',
        status: 'Inactive',
        email: 'mock_voldemort@deatheaters.org',
        dateGranted: '2024-05-10',
        author: 'Ministry Records',
        sharedWith: 'Case participant account',
        purpose: 'Defense access (Revoked)',
        accessGroup: 'Parties without access'
    },
    {
        id: 'hp-004',
        caseNumber: 'HP-CIV-24-002',
        caseName: "Ministry of Magic v Tom Riddle, Death Eaters Ltd and others",
        caseType: 'Civil',
        participantRole: 'Witness (Inter-dimensional)',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_vader@empire.gov', // CROSS-OVER: Vader as witness (don't ask why)
        dateGranted: '2024-06-01',
        author: 'Ministry Records',
        sharedWith: 'Case participant account',
        purpose: 'Testimony on Dark Arts management',
        accessGroup: 'With portal access'
    },
    // Adding 15 more Death Eaters
    ...Array.from({ length: 15 }).map((_, i) => ({
        id: `hp-de-${i}`,
        caseNumber: 'HP-CIV-24-002',
        caseName: "Ministry of Magic v Tom Riddle, Death Eaters Ltd and others",
        caseType: 'Civil',
        participantRole: `Defendant: Death Eater #${i + 1}`,
        accessType: 'Direct access',
        status: 'Inactive',
        email: `de_member_${i}@deatheaters.org`,
        dateGranted: '2024-05-15',
        author: 'Ministry Records',
        sharedWith: 'Case participant account',
        purpose: 'Participant tracking',
        accessGroup: 'Parties without access'
    })),

    // =================================================================
    //   CASE 3: MCRN v James Holden (EX-CIV-24-003)
    // =================================================================
    {
        id: 'ex-001',
        caseNumber: 'EX-CIV-24-003',
        caseName: "Mars Congressional Republic v James Holden, Rocinante Crew and others",
        caseType: 'Civil',
        participantRole: 'Defendant 1 Holden, James',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_holden@rocinante.space',
        dateGranted: '2024-07-01',
        author: 'MCRN Registry',
        sharedWith: 'Case participant account',
        purpose: 'Defense access for vessel captain',
        accessGroup: 'With portal access'
    },
    {
        id: 'ex-002',
        caseNumber: 'EX-CIV-24-003',
        caseName: "Mars Congressional Republic v James Holden, Rocinante Crew and others",
        caseType: 'Civil',
        participantRole: 'Solicitor for Defense',
        accessType: 'Delegated access',
        status: 'Active',
        email: 'mock_hermione@hogwarts.edu', // CROSS-LINK: Hermione is everywhere
        dateGranted: '2024-07-05',
        author: 'MCRN Registry',
        sharedWith: 'Professional representative',
        purpose: 'Inter-galactic legal counsel',
        accessGroup: 'With portal access'
    },
    {
        id: 'ex-003',
        caseNumber: 'EX-CIV-24-003',
        caseName: "Mars Congressional Republic v James Holden, Rocinante Crew and others",
        caseType: 'Civil',
        participantRole: 'Prosecutor Avasarala, Chrisjen',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_avasarala@un.gov',
        dateGranted: '2024-07-01',
        author: 'MCRN Registry',
        sharedWith: 'Case participant account',
        purpose: 'Lead prosecutor for Earth interests',
        accessGroup: 'With portal access'
    },
    {
        id: 'ex-004',
        caseNumber: 'EX-CIV-24-003',
        caseName: "Mars Congressional Republic v James Holden, Rocinante Crew and others",
        caseType: 'Civil',
        participantRole: 'Participant Nagata, Naomi',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_naomi@rocinante.space',
        dateGranted: '2024-07-01',
        author: 'MCRN Registry',
        sharedWith: 'Case participant account',
        purpose: 'Crew access',
        accessGroup: 'With portal access'
    },
    // Adding 10 Belt residents as participants
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: `ex-belter-${i}`,
        caseNumber: 'EX-CIV-24-003',
        caseName: "Mars Congressional Republic v James Holden, Rocinante Crew and others",
        caseType: 'Civil',
        participantRole: `Affiliated Belter #${i + 1}`,
        accessType: 'Direct access',
        status: 'Active',
        email: `belter_${i}@tycho.stn`,
        dateGranted: '2024-08-01',
        author: 'MCRN Registry',
        sharedWith: 'Case participant account',
        purpose: 'OPA representation',
        accessGroup: 'With portal access'
    })),

    // =================================================================
    //   CASE 4: Multi-Universe Mediation (MULT-CIV-24-999)
    //   Testing "More cases per person" (Vader, Holden, Hermione all here)
    // =================================================================
    {
        id: 'mult-001',
        caseNumber: 'MULT-CIV-24-999',
        caseName: "Inter-Galactic Peace Tribunal: Vader v Holden v Potter",
        caseType: 'Civil',
        participantRole: 'Mediator Granger, Hermione',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_hermione@hogwarts.edu',
        dateGranted: '2024-10-01',
        author: 'High Tribunal',
        sharedWith: 'Professional representative',
        purpose: 'Neutral mediation',
        accessGroup: 'With portal access'
    },
    {
        id: 'mult-002',
        caseNumber: 'MULT-CIV-24-999',
        caseName: "Inter-Galactic Peace Tribunal: Vader v Holden v Potter",
        caseType: 'Civil',
        participantRole: 'Party 1 Skywalker, Darth Vader',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_vader@empire.gov',
        dateGranted: '2024-10-01',
        author: 'High Tribunal',
        sharedWith: 'Case participant account',
        purpose: 'Mediation participant',
        accessGroup: 'With portal access'
    },
    {
        id: 'mult-003',
        caseNumber: 'MULT-CIV-24-999',
        caseName: "Inter-Galactic Peace Tribunal: Vader v Holden v Potter",
        caseType: 'Civil',
        participantRole: 'Party 2 Holden, James',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_holden@rocinante.space',
        dateGranted: '2024-10-01',
        author: 'High Tribunal',
        sharedWith: 'Case participant account',
        purpose: 'Mediation participant',
        accessGroup: 'With portal access'
    },
    {
        id: 'mult-004',
        caseNumber: 'MULT-CIV-24-999',
        caseName: "Inter-Galactic Peace Tribunal: Vader v Holden v Potter",
        caseType: 'Civil',
        participantRole: 'Party 3 Potter, Harry',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_harry@hogwarts.edu',
        dateGranted: '2024-10-01',
        author: 'High Tribunal',
        sharedWith: 'Case participant account',
        purpose: 'Mediation participant',
        accessGroup: 'With portal access'
    },

    // =================================================================
    //   CASE 5: Avasarala's Personal Matters (EX-PER-24-001)
    //   Testing "More cases per person" for Avasarala
    // =================================================================
    {
        id: 'ex-per-001',
        caseNumber: 'EX-PER-24-001',
        caseName: "Avasarala v High Consulate of Mars",
        caseType: 'Civil',
        participantRole: 'Plaintiff Avasarala, Chrisjen',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_avasarala@un.gov',
        dateGranted: '2024-01-15',
        author: 'UN Court',
        sharedWith: 'Case participant account',
        purpose: 'Personal litigation',
        accessGroup: 'With portal access'
    },
    {
        id: 'ex-per-002',
        caseNumber: 'EX-PER-24-001',
        caseName: "Avasarala v High Consulate of Mars",
        caseType: 'Civil',
        participantRole: 'Advisor Holden, James',
        accessType: 'Direct access',
        status: 'Active',
        email: 'mock_holden@rocinante.space', // Holden in another case
        dateGranted: '2024-01-20',
        author: 'UN Court',
        sharedWith: 'Case participant account',
        purpose: 'Factual advisor',
        accessGroup: 'With portal access'
    }
];
