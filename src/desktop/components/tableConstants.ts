/**
 * Standard column layout constants for Desktop Data Tables.
 * These ensure consistent widths, min-widths, and resize behavior across views.
 * 
 * Usage:
 * const columns = [
 *   {
 *     id: 'select',
 *     ...COLUMN_WIDTHS.CHECKBOX
 *   },
 *   {
 *     id: 'resident',
 *     ...COLUMN_WIDTHS.RESIDENT
 *   }
 * ]
 */

export const COLUMN_WIDTHS = {
    // Utility Columns
    CHECKBOX: {
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableResizing: false,
    },
    ACTIONS: {
        size: 48,
        minSize: 48,
        maxSize: 48,
        enableResizing: false,
    },

    // Content Columns
    STATUS: {
        size: 154,
        minSize: 154, // Fits "Upcoming" badge comfortably + room for ellipsis
    },
    TIMESTAMP: {
        size: 190,
        minSize: 170, // Fits merged "MM/DD/YYYY  HH:MM:SS AM/PM" comfortably
    },
    RESIDENT: {
        size: 300,
        minSize: 240, // Names need space for badges
    },
    LOCATION: {
        size: 90,
        minSize: 70,
    },
    MERGED_LOCATION: {
        size: 260,
        minSize: 220,
    },
    VARIANCE: {
        size: 120,
        minSize: 100,
    },
    OFFICER: {
        size: 160,
        minSize: 130,
    },
    NOTES: {
        size: 300,
        minSize: 200,
    },
    GROUP: {
        size: 110,
        minSize: 90,
    },
    UNIT: {
        size: 140,
        minSize: 100,
    },
    ALERT_ICON: {
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
    },
} as const;
