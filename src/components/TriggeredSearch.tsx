import React from 'react';
import { Button } from './Button';
import styles from './TriggeredSearch.module.css';

interface TriggeredSearchProps {
    value?: string;
    onChange?: (value: string) => void;
    onSearch: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
    minSearchLength?: number;
    variant?: 'default' | 'top-nav';
    size?: 'sm' | 'md';
    className?: string;
}

export const TriggeredSearch: React.FC<TriggeredSearchProps> = ({
    value = '',
    onChange,
    onSearch,
    placeholder,
    disabled = false,
    minSearchLength = 3,
    variant = 'default',
    size = 'md',
    className = '',
}) => {
    const inputId = React.useId();
    const isSearchDisabled = value.trim().length < minSearchLength || disabled;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isSearchDisabled) {
            onSearch(value);
        }
    };

    const handleClear = () => {
        onChange?.('');
    };

    return (
        <div className={`${styles.wrapper} ${className}`} data-variant={variant} data-size={size}>
            <label htmlFor={inputId} className={styles.visuallyHidden}>
                {placeholder}
            </label>
            <input
                id={inputId}
                type="text"
                className={styles.input}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            
            <div className={styles.buttonWrapper}>
                {value && (
                    <Button
                        variant={variant === 'top-nav' ? 'quaternary' : 'tertiary'}
                        size={size === 'sm' ? 'xs' : 'm'}
                        iconOnly
                        onClick={handleClear}
                        disabled={disabled}
                        className={styles.clearButton}
                        aria-label="Clear search"
                    >
                        <span className="material-symbols-rounded">close</span>
                    </Button>
                )}
                
                <Button
                    variant="primary"
                    size={size === 'sm' ? 's' : 'm'}
                    onClick={() => onSearch(value)}
                    disabled={isSearchDisabled}
                    className={styles.searchButton}
                    iconOnly
                    aria-label="Execute search"
                >
                    <span className="material-symbols-rounded">search</span>
                </Button>
            </div>
        </div>
    );
};
