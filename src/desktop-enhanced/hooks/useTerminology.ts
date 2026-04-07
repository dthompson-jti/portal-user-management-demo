import { useAtomValue } from 'jotai';
import { terminologyAtom, STATUS_LABEL_OPTIONS, COLUMN_HEADER_OPTIONS } from '../atoms';

export const useTerminology = () => {
    const { statusLabels, columnHeader } = useAtomValue(terminologyAtom);

    const statusOpt = STATUS_LABEL_OPTIONS.find(o => o.value === statusLabels)!;
    const headerOpt = COLUMN_HEADER_OPTIONS.find(o => o.value === columnHeader)!;

    return {
        /** Label for Active status */
        activeLabel: statusOpt.activeLabel,
        /** Label for Inactive status */
        inactiveLabel: statusOpt.inactiveLabel,
        /** Column header label for the status column */
        columnHeader: headerOpt.label,
        /** Filter options for status selectors */
        statusOptions: [
            { value: 'all', label: 'All statuses' },
            { value: 'Active', label: statusOpt.activeLabel },
            { value: 'Inactive', label: statusOpt.inactiveLabel },
        ],
        /** Resolve a status value to its display label */
        getStatusLabel: (status: 'Active' | 'Inactive') =>
            status === 'Active' ? statusOpt.activeLabel : statusOpt.inactiveLabel,
        /** Icon for Active status */
        activeIcon: 'check_circle' as const,
        /** Icon for Inactive status */
        inactiveIcon: 'block' as const,
    };
};
