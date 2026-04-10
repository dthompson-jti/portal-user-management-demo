// src/data/users.ts

/**
 * User Management
 * 
 * Defines the User type and a hardcoded list of users for prototype authentication.
 * Includes OKLCH color generation algorithm for Smart Avatar feature.
 */

export interface User {
    username: string;
    displayName: string;
    initials: string;
}

export const MOCK_USERS: User[] = [
    // --- Star Wars ---
    { username: 'mock_luke', displayName: 'Mock: Luke Skywalker', initials: 'LS' },
    { username: 'mock_leia', displayName: 'Mock: Leia Organa', initials: 'LO' },
    { username: 'mock_han', displayName: 'Mock: Han Solo', initials: 'HS' },
    { username: 'mock_vader', displayName: 'Mock: Darth Vader', initials: 'DV' },
    { username: 'mock_yoda', displayName: 'Mock: Master Yoda', initials: 'MY' },
    { username: 'mock_kenobi', displayName: 'Mock: Obi-Wan Kenobi', initials: 'OK' },
    { username: 'mock_ahsoka', displayName: 'Mock: Ahsoka Tano', initials: 'AT' },
    { username: 'mock_thrawn', displayName: 'Mock: Grand Admiral Thrawn', initials: 'GT' },
    { username: 'mock_boba', displayName: 'Mock: Boba Fett', initials: 'BF' },
    { username: 'mock_mando', displayName: 'Mock: Din Djarin', initials: 'DD' },

    // --- Harry Potter ---
    { username: 'mock_harry', displayName: 'Mock: Harry Potter', initials: 'HP' },
    { username: 'mock_hermione', displayName: 'Mock: Hermione Granger', initials: 'HG' },
    { username: 'mock_ron', displayName: 'Mock: Ron Weasley', initials: 'RW' },
    { username: 'mock_dumbledore', displayName: 'Mock: Albus Dumbledore', initials: 'AD' },
    { username: 'mock_snape', displayName: 'Mock: Severus Snape', initials: 'SS' },
    { username: 'mock_mcgonagall', displayName: 'Mock: Minerva McGonagall', initials: 'MM' },
    { username: 'mock_draco', displayName: 'Mock: Draco Malfoy', initials: 'DM' },
    { username: 'mock_luna', displayName: 'Mock: Luna Lovegood', initials: 'LL' },
    { username: 'mock_neville', displayName: 'Mock: Neville Longbottom', initials: 'NL' },
    { username: 'mock_hagrid', displayName: 'Mock: Rubeus Hagrid', initials: 'RH' },

    // --- The Expanse ---
    { username: 'mock_holden', displayName: 'Mock: James Holden', initials: 'JH' },
    { username: 'mock_naomi', displayName: 'Mock: Naomi Nagata', initials: 'NN' },
    { username: 'mock_amos', displayName: 'Mock: Amos Burton', initials: 'AB' },
    { username: 'mock_alex', displayName: 'Mock: Alex Kamal', initials: 'AK' },
    { username: 'mock_avasarala', displayName: 'Mock: Chrisjen Avasarala', initials: 'CA' },
    { username: 'mock_miller', displayName: 'Mock: Joseph Miller', initials: 'JM' },
    { username: 'mock_drummer', displayName: 'Mock: Camina Drummer', initials: 'CD' },
    { username: 'mock_bobbie', displayName: 'Mock: Bobbie Draper', initials: 'BD' },
    { username: 'mock_ashford', displayName: 'Mock: Klaes Ashford', initials: 'KA' },
    { username: 'mock_inaros', displayName: 'Mock: Marco Inaros', initials: 'MI' },
];

/**
 * Find a user by username (case-insensitive)
 */
export function findUser(username: string): User | undefined {
    return MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
}

/**
 * Smart Avatar: OKLCH Color Generation
 * 
 * Generates a deterministic hue value for a user using the Golden Angle.
 * This ensures maximum color separation for similar usernames.
 * 
 * @param username - The username to generate a color for
 * @returns Hue value (0-360)
 */
export function generateAvatarHue(username: string): number {
    const GOLDEN_ANGLE = 137.508; // Golden angle in degrees

    // Sum character codes
    const sum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Multiply by golden angle and wrap to 0-360
    const hue = (sum * GOLDEN_ANGLE) % 360;

    return Math.round(hue);
}

/**
 * Generate OKLCH color string for avatar background
 * 
 * @param hue - Hue value (0-360)
 * @returns CSS oklch() string
 */
export function getAvatarColor(hue: number): string {
    const L = 0.65; // Lightness (constant for good contrast with white text)
    const C = 0.18; // Chroma (constant for vibrant but not neon)

    return `oklch(${L} ${C} ${hue})`;
}
