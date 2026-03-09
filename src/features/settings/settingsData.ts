export interface SettingsNode {
  id: string;
  label: string;
  icon?: string;           // Material symbol name
  children?: SettingsNode[];
}

export const SETTINGS_TREE: SettingsNode[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'settings',
    children: [
      { id: 'general.top-navigation', label: 'Top Navigation' },
      { id: 'general.email-settings', label: 'Email Settings' },
    ],
  },
  { id: 'privacy-security', label: 'Privacy & Security', icon: 'lock' },
  { id: 'race-blind-charging', label: 'Race-Blind Charging', icon: 'visibility_off' },
  { id: 'sms', label: 'SMS', icon: 'sms' },
  { id: 'telemetry', label: 'Telemetry', icon: 'monitoring' },
  {
    id: 'safety-check',
    label: 'Safety Check',
    icon: 'verified_user',
  },
];

export interface SafetyChecksConfig {
  bufferTime: number;                    // Minutes before max interval when check is "due" (default: 2)
  enableCheckForm: boolean;              // Whether the safety check form is enabled (default: true)
  enableCheckType: boolean;              // Whether the check type field shows on form (default: false)
  enabled: boolean;                      // Master feature toggle (default: true)
  enhancedObservation: {
    bufferTime: number;                  // Buffer before enhanced obs max interval (default: 1)
    maximumInterval: number;             // Max minutes between enhanced obs checks (default: 5)
    minimumInterval: number;             // Min interval; early warning if below (default: 1)
  };
  maximumInterval: number;              // Max minutes between standard checks (default: 15)
  minimumInterval: number;              // Min interval; early warning if below (default: 1)
  missedCheckDelay: number;             // Grace period after max before missed (default: 5)
  scanType: 'NFC' | 'QR_CODE';         // Default device scan mode (default: 'NFC')
}

export const DEFAULT_SAFETY_CHECKS: SafetyChecksConfig = {
  bufferTime: 2,
  enableCheckForm: true,
  enableCheckType: false,
  enabled: true,
  enhancedObservation: {
    bufferTime: 1,
    maximumInterval: 5,
    minimumInterval: 1,
  },
  maximumInterval: 15,
  minimumInterval: 1,
  missedCheckDelay: 5,
  scanType: 'NFC',
};

export const PROPERTY_DESCRIPTIONS: Record<string, string> = {
  'bufferTime': "Minutes before the maximum interval when a standard check becomes 'due'.",
  'enableCheckForm': "Enables the detailed safety check form on devices. When disabled, the app performs single-tap quick checks.",
  'enableCheckType': "Shows the check type selection field on the safety check form.",
  'enabled': "Master toggle for the safety checks feature. Disabling this stops check creation and deactivates related endpoints.",
  'enhancedObservation.bufferTime': "Minutes before the maximum interval when an enhanced observation check becomes 'due'.",
  'enhancedObservation.maximumInterval': "Maximum minutes allowed between enhanced observation checks before a miss is recorded.",
  'enhancedObservation.minimumInterval': "Minimum minutes required between enhanced observation checks. Performing a check earlier triggers a warning.",
  'maximumInterval': "Maximum minutes allowed between standard checks before a miss is recorded.",
  'minimumInterval': "Minimum minutes required between standard checks. Performing a check earlier triggers a warning (set to 0 to disable).",
  'missedCheckDelay': "Grace period (in minutes) after the maximum interval before recording a miss. Applied to both standard and enhanced observation checks.",
  'scanType': "The primary scanning technology devices will use to record safety checks.",
};
