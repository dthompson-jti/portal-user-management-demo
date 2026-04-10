import { PortalAccessRecord } from '../types/portalTypes';

export type PortalParticipantType = 'party' | 'case-assignment';

export const getPortalParticipantType = (record: PortalAccessRecord): PortalParticipantType => {
    const accessGroup = record.accessGroup?.toLowerCase() ?? '';
    const sharedWith = record.sharedWith.toLowerCase();

    if (accessGroup.includes('assignment')) {
        return 'case-assignment';
    }

    if (accessGroup.includes('parties')) {
        return 'party';
    }

    if (sharedWith.includes('professional representative')) {
        return 'case-assignment';
    }

    return 'party';
};

export const getPortalAccessGroupForStatus = (
    record: PortalAccessRecord,
    status: PortalAccessRecord['status']
): NonNullable<PortalAccessRecord['accessGroup']> => {
    if (status === 'Active') {
        return 'With portal access';
    }

    return getPortalParticipantType(record) === 'case-assignment'
        ? 'Case assignments without access'
        : 'Parties without access';
};

export const applyPortalStatusChange = (
    record: PortalAccessRecord,
    status: PortalAccessRecord['status']
): PortalAccessRecord => ({
    ...record,
    status,
    accessGroup: getPortalAccessGroupForStatus(record, status),
});
