export interface PortalAccessRecord {
    id: string;
    caseNumber: string;
    caseName: string;
    caseType: 'Civil' | 'Criminal' | 'Juvenile';
    participantRole: string;
    accessType: string;
    status: 'Active' | 'Inactive';
    email: string; // Used for the search trigger
    // Access history
    dateGranted: string;
    dateRevoked?: string;
    // Metadata for audit
    author: string;
    sharedWith: string;
    purpose: string;
    accessGroup?: 'With portal access' | 'Parties without access' | 'Case assignments without access';
}

export interface PortalUserRecord {
    id: string;
    caseName: string; // Displayed search result title
    participantRole: string;
    email: string;
    accessType: string;
    // Metadata for audit
    author: string;
    sharedWith: string;
    purpose: string;
}
