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

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className={`${styles.wrapper} ${className}`} data-size={size}>
            <span className={`material-symbols-rounded ${styles.searchIcon}`}>search</span>

            <input
                ref={inputRef}
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
                    className={styles.clearButton}
                    tabIndex={-1}
                >
                    <span className="material-symbols-rounded">close</span>
                </Button>
            )}
        </div>
    );
};
