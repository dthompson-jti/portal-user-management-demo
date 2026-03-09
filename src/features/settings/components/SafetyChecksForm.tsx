import React from 'react';
import { useAtom } from 'jotai';
import { safetyChecksAtom } from '../settingsAtoms';
import { PROPERTY_DESCRIPTIONS, SafetyChecksConfig } from '../settingsData';
import { Switch } from '../../../components/Switch';
import { TextInput } from '../../../components/TextInput';
import { Select, SelectItem } from '../../../components/Select';
import styles from './SafetyChecksForm.module.css';

interface FormFieldProps {
  label: string;
  description: string;
  children: React.ReactNode;
  align?: 'inline' | 'stack';
}

const FormField: React.FC<FormFieldProps> = ({ label, description, children, align = 'stack' }) => (
  <div className={`${styles.formField} ${styles[align]}`}>
    <div className={styles.fieldInfo}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldDescription}>{description}</div>
    </div>
    <div className={styles.fieldControl}>
      {children}
    </div>
  </div>
);

export const SafetyChecksForm: React.FC = () => {
  const [config, setConfig] = useAtom(safetyChecksAtom);

  const updateConfig = (updates: Partial<SafetyChecksConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateEnhanced = (updates: Partial<SafetyChecksConfig['enhancedObservation']>) => {
    setConfig(prev => ({
      ...prev,
      enhancedObservation: { ...prev.enhancedObservation, ...updates }
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Safety Check</h1>
      <p className={styles.description}>
        Configure the behavior and timing of safety checks across your facility.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>General</h2>
        <FormField
          label="Feature Enabled"
          description={PROPERTY_DESCRIPTIONS['enabled']}
          align="inline"
        >
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </FormField>

        <FormField
          label="Missed Check Delay"
          description={PROPERTY_DESCRIPTIONS['missedCheckDelay']}
        >
          <TextInput
            type="number"
            min={0}
            value={config.missedCheckDelay}
            onChange={(e) => updateConfig({ missedCheckDelay: parseInt(e.target.value) || 0 })}
          />
        </FormField>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Device & Form Options</h2>
        <FormField
          label="Default Scan Type"
          description={PROPERTY_DESCRIPTIONS['scanType']}
        >
          <Select
            value={config.scanType}
            onValueChange={(value) => updateConfig({ scanType: value as 'NFC' | 'QR_CODE' })}
            valueLabel={config.scanType === 'NFC' ? 'NFC' : 'QR Code'}
          >
            <SelectItem value="NFC">NFC</SelectItem>
            <SelectItem value="QR_CODE">QR Code</SelectItem>
          </Select>
        </FormField>
        <FormField
          label="Enable Check Form"
          description={PROPERTY_DESCRIPTIONS['enableCheckForm']}
          align="inline"
        >
          <Switch
            checked={config.enableCheckForm}
            onCheckedChange={(checked) => updateConfig({ enableCheckForm: checked })}
          />
        </FormField>
        <FormField
          label="Enable Check Type"
          description={PROPERTY_DESCRIPTIONS['enableCheckType']}
          align="inline"
        >
          <Switch
            checked={config.enableCheckType}
            onCheckedChange={(checked) => updateConfig({ enableCheckType: checked })}
          />
        </FormField>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Normal Observation</h2>
        <div className={styles.stack}>
          <FormField
            label="Maximum Interval"
            description={PROPERTY_DESCRIPTIONS['maximumInterval']}
          >
            <TextInput
              type="number"
              min={0}
              value={config.maximumInterval}
              onChange={(e) => updateConfig({ maximumInterval: parseInt(e.target.value) || 0 })}
            />
          </FormField>
          <FormField
            label="Minimum Interval"
            description={PROPERTY_DESCRIPTIONS['minimumInterval']}
          >
            <TextInput
              type="number"
              min={0}
              value={config.minimumInterval}
              onChange={(e) => updateConfig({ minimumInterval: parseInt(e.target.value) || 0 })}
            />
          </FormField>
          <FormField
            label="Buffer Time"
            description={PROPERTY_DESCRIPTIONS['bufferTime']}
          >
            <TextInput
              type="number"
              min={0}
              value={config.bufferTime}
              onChange={(e) => updateConfig({ bufferTime: parseInt(e.target.value) || 0 })}
            />
          </FormField>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Enhanced Observation</h2>
        <div className={styles.stack}>
          <FormField
            label="Maximum Interval"
            description={PROPERTY_DESCRIPTIONS['enhancedObservation.maximumInterval']}
          >
            <TextInput
              type="number"
              min={0}
              value={config.enhancedObservation.maximumInterval}
              onChange={(e) => updateEnhanced({ maximumInterval: parseInt(e.target.value) || 0 })}
            />
          </FormField>
          <FormField
            label="Minimum Interval"
            description={PROPERTY_DESCRIPTIONS['enhancedObservation.minimumInterval']}
          >
            <TextInput
              type="number"
              min={0}
              value={config.enhancedObservation.minimumInterval}
              onChange={(e) => updateEnhanced({ minimumInterval: parseInt(e.target.value) || 0 })}
            />
          </FormField>
          <FormField
            label="Buffer Time"
            description={PROPERTY_DESCRIPTIONS['enhancedObservation.bufferTime']}
          >
            <TextInput
              type="number"
              min={0}
              value={config.enhancedObservation.bufferTime}
              onChange={(e) => updateEnhanced({ bufferTime: parseInt(e.target.value) || 0 })}
            />
          </FormField>
        </div>
      </section>
    </div>
  );
};
