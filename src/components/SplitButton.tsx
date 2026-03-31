import React, { useState } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { Button } from './Button';
import styles from './SplitButton.module.css';

export interface SplitButtonMenuItem {
    label: string;
    icon?: string;
    onClick?: () => void;
    isActive?: boolean;
}

interface SplitButtonProps {
    label: string;
    active?: boolean;
    items: SplitButtonMenuItem[];
    onClick?: () => void;
    size?: 's' | 'm';
}

export const SplitButton: React.FC<SplitButtonProps> = ({
    label,
    active = false,
    items,
    onClick,
    size = 's',
}) => {
    const [open, setOpen] = useState(false);

    const hasActiveItem = items.some(item => item.isActive);
    const isActive = active || hasActiveItem;

    return (
        <RadixPopover.Root open={open} onOpenChange={setOpen}>
            <div className={styles.splitButtonGroup}>
                <Button
                    variant="secondary"
                    size={size}
                    active={isActive}
                    className={styles.labelButton}
                    onClick={onClick}
                >
                    {label}
                </Button>
                <RadixPopover.Trigger asChild>
                    <Button
                        variant="secondary"
                        size={size}
                        iconOnly
                        active={isActive || open}
                        className={styles.chevronButton}
                    >
                        <span className={`material-symbols-rounded ${styles.chevronIcon} ${open ? styles.chevronIconOpen : ''}`}>
                            expand_more
                        </span>
                    </Button>
                </RadixPopover.Trigger>
            </div>
            <RadixPopover.Portal>
                <RadixPopover.Content
                    className="menuPopover"
                    sideOffset={5}
                    align="start"
                    collisionPadding={8}
                >
                    {items.map((item) => (
                        <button
                            key={item.label}
                            className="menuItem"
                            data-state={item.isActive ? 'checked' : undefined}
                            onClick={() => {
                                item.onClick?.();
                                setOpen(false);
                            }}
                        >
                            {item.icon && (
                                <span className="material-symbols-rounded">{item.icon}</span>
                            )}
                            {item.label}
                        </button>
                    ))}
                </RadixPopover.Content>
            </RadixPopover.Portal>
        </RadixPopover.Root>
    );
};
