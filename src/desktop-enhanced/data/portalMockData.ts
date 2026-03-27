import { PortalAccessRecord } from '../types/portalTypes';

export const INITIAL_PORTAL_RESULTS: PortalAccessRecord[] = [
    {
        id: '1',
        caseNumber: 'CIV-24-0000013',
        caseName: 'Dave Thompson v Luke Smith',
        caseType: 'Civil',
        participantRole: 'Plaintiff 1 Dave Thompson',
        accessType: 'Direct access',
        status: 'Active',
        email: 'dave.thompson@journaltech.com',
        dateGranted: '2024-01-15',
        author: 'Dave Thompson',
        sharedWith: 'Specific users only',
        purpose: 'Standardized documentation for portal management module'
    },
    {
        id: '2',
        caseNumber: 'CIV-24-0000014',
        caseName: 'Agnes Schlauerheide v Dave Welch',
        caseType: 'Civil',
        participantRole: 'Plaintiff 1 Agnes Schlauerheide',
        accessType: 'Direct access',
        status: 'Active',
        email: 'agnes.schlauerheide@outlook.com',
        dateGranted: '2024-02-03',
        author: 'Dave Thompson',
        sharedWith: 'All project users',
        purpose: 'Standardized documentation for jti design system'
    },
    {
        id: '3',
        caseNumber: 'CIV-24-0000015',
        caseName: 'Agnes Schlauerheide v Chanelle Solis',
        caseType: 'Civil',
        participantRole: 'Plaintiff 1 Agnes Schlauerheide',
        accessType: 'Direct access',
        status: 'Active',
        email: 'dave.solis@partner.com',
        dateGranted: '2024-03-20',
        author: 'Dave Thompson',
        sharedWith: 'Specific users only',
        purpose: 'Standardized documentation for user permission matrix'
    },
    {
        id: '4',
        caseNumber: 'CIV-24-0000016',
        caseName: "Agnes Schlauerheide v Dave Ware, FLARB'S FLARBENARIUM and others",
        caseType: 'Juvenile',
        participantRole: 'Plaintiff 1 Agnes Schlauerheide',
        accessType: 'Direct access',
        status: 'Active',
        email: 'dave.ware@example.com',
        dateGranted: '2024-04-08',
        author: 'Dave Thompson',
        sharedWith: 'Specific users only',
        purpose: 'Standardized documentation for mobile access strategy'
    },
    {
        id: '5',
        caseNumber: 'CIV-24-0000017',
        caseName: 'Agnes Schlauerheide v Confluence API (Dave)',
        caseType: 'Criminal',
        participantRole: 'Plaintiff 1 Agnes Schlauerheide',
        accessType: 'Direct access',
        status: 'Expired',
        email: 'agnes.dave@outlook.com',
        dateGranted: '2023-11-10',
        dateRevoked: '2024-02-28',
        author: 'Dave Thompson',
        sharedWith: 'All project users',
        purpose: 'Standardized documentation for confluence api'
    },
    {
        id: '6',
        caseNumber: 'CIV-24-0000018',
        caseName: 'Agnes Schlauerheide v eSeries Audit',
        caseType: 'Civil',
        participantRole: 'Plaintiff 1 Agnes Schlauerheide',
        accessType: 'Direct access',
        status: 'Active',
        email: 'dave.audit@eseries.gov',
        dateGranted: '2024-05-14',
        author: 'Dave Thompson',
        sharedWith: 'Specific users only',
        purpose: 'Standardized documentation for eseries'
    }
];
