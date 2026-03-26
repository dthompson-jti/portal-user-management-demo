export interface PortalAccessRecord {
    id: string;
    caseNumber: string;
    caseName: string;
    caseType: 'Civil' | 'Criminal' | 'Juvenile';
    participantRole: string;
    accessType: string;
    status: 'Active' | 'Revoked' | 'Expired';
    email: string; // Used for the search trigger
    // Metadata for audit
    author: string;
    sharedWith: string;
    purpose: string;
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
