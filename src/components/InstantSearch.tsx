import React, { useEffect, useRef } from 'react';
import { Button } from './Button';
import styles from './InstantSearch.module.css';

interface InstantSearchProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder: string;
    size?: 'sm' | 'md';
    autoFocus?: boolean;
    disabled?: boolean;
    className?: string;
}

export const InstantSearch: React.FC<InstantSearchProps> = ({
    value = '',
    onChange,
    placeholder,
    size = 'md',
    autoFocus = false,
    disabled = false,
    className = '',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = React.useId();

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className={`${styles.wrapper} ${className}`} data-size={size}>
            <label htmlFor={inputId} className={styles.visuallyHidden}>
                {placeholder}
            </label>

            <span className={`material-symbols-rounded ${styles.searchIcon}`}>search</span>

            <input
                ref={inputRef}
                id={inputId}
                type="text"
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
            />

            {value && onChange && !disabled && (
                <Button
                    variant="quaternary"
                    size="xs"
                    iconOnly
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    className={styles.clearButton}
                >
                    <span className="material-symbols-rounded">close</span>
                </Button>
            )}
        </div>
    );
};
