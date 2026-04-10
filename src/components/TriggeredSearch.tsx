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
    const isSearchDisabled = value.trim().length < minSearchLength || disabled;

    const handleClear = () => {
        onChange?.('');
    };

    return (
        <div className={`${styles.wrapper} ${className}`} data-variant={variant} data-size={size}>
            <input
                type="text"
                className={styles.input}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
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
                        tabIndex={-1}
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
                    tabIndex={-1}
                >
                    <span className="material-symbols-rounded">search</span>
                </Button>
            </div>
        </div>
    );
};
