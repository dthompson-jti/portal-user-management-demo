// src/components/Accordion.tsx
import React, { useId, useRef } from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { Button } from './Button';
import styles from './Accordion.module.css';

// ─── Root ────────────────────────────────────────────────────────────────────

interface AccordionSingleProps {
    type: 'single';
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    collapsible?: boolean;
    children: React.ReactNode;
    className?: string;
}

interface AccordionMultipleProps {
    type?: 'multiple';
    defaultValue?: string[];
    value?: string[];
    onValueChange?: (value: string[]) => void;
    children: React.ReactNode;
    className?: string;
}

type AccordionRootProps = AccordionSingleProps | AccordionMultipleProps;

const AccordionRoot: React.FC<AccordionRootProps> = ({ children, className, ...props }) => {
    const cls = `${styles.root}${className ? ` ${className}` : ''}`;

    if (props.type === 'single') {
        const { type, defaultValue, value, onValueChange, collapsible = true } = props;
        return (
            <RadixAccordion.Root
                type={type}
                className={cls}
                defaultValue={defaultValue}
                value={value}
                onValueChange={onValueChange}
                collapsible={collapsible}
            >
                {children}
            </RadixAccordion.Root>
        );
    }

    const { defaultValue, value, onValueChange } = props as AccordionMultipleProps;
    return (
        <RadixAccordion.Root
            type="multiple"
            className={cls}
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
        >
            {children}
        </RadixAccordion.Root>
    );
};

// ─── Item ────────────────────────────────────────────────────────────────────

interface AccordionItemProps {
    /** Unique value used for controlled/default open state */
    value: string;
    /** Header title */
    title: React.ReactNode;
    /** Panel content */
    children: React.ReactNode;
    /** Material Symbols icon name for optional leading icon */
    leadingIcon?: string;
    /** Optional right-side slot — badges, counts, actions */
    rightSlot?: React.ReactNode;
    className?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
    value,
    title,
    children,
    leadingIcon,
    rightSlot,
    className,
}) => {
    const titleId = `accordion-title-${useId()}`;
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Clicking anywhere on the header row toggles the accordion by programmatically
    // clicking the trigger button. The trigger itself calls stopPropagation so clicks
    // on it don't bubble here and cause a double-toggle. The rightSlot wrapper also
    // calls stopPropagation so action buttons inside it don't accidentally toggle.
    const handleHeaderClick = () => {
        triggerRef.current?.click();
    };

    return (
        <RadixAccordion.Item
            value={value}
            className={`${styles.item}${className ? ` ${className}` : ''}`}
        >
            {/*
             * Radix renders Header as <h3> by default — correct per WAI-ARIA accordion spec.
             * We reset h3 styles via .headerRoot and lay out content in the inner .header div.
             */}
            <RadixAccordion.Header className={styles.headerRoot}>
                <div className={styles.header} onClick={handleHeaderClick}>
                    {/*
                     * Radix.Trigger asChild merges aria-expanded, aria-controls, data-state,
                     * and the toggle click handler into our Button component.
                     * stopPropagation prevents the click from bubbling to the header div
                     * and causing a double-toggle.
                     */}
                    <RadixAccordion.Trigger asChild>
                        <Button
                            ref={triggerRef}
                            variant="quaternary"
                            size="m"
                            iconOnly
                            className={styles.trigger}
                            aria-labelledby={titleId}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span
                                className={`material-symbols-rounded ${styles.chevron}`}
                                aria-hidden="true"
                            >
                                expand_more
                            </span>
                        </Button>
                    </RadixAccordion.Trigger>

                    {leadingIcon && (
                        <span
                            className={`material-symbols-rounded ${styles.leadingIcon}`}
                            aria-hidden="true"
                        >
                            {leadingIcon}
                        </span>
                    )}

                    <span className={styles.title} id={titleId}>
                        {title}
                    </span>

                    {rightSlot && (
                        // stopPropagation prevents clicks on rightSlot actions from
                        // bubbling to the header and toggling the accordion.
                        <div
                            className={styles.rightSlot}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {rightSlot}
                        </div>
                    )}
                </div>
            </RadixAccordion.Header>

            {/*
             * Radix.Content handles:
             * - role="region" + aria-labelledby (pointing to the trigger)
             * - data-state="open|closed" for CSS animation hooks
             * - Keeps content mounted during exit animation, then hides it
             * - Provides --radix-accordion-content-height CSS variable
             */}
            <RadixAccordion.Content className={styles.panel}>
                <div className={styles.panelContent}>{children}</div>
            </RadixAccordion.Content>
        </RadixAccordion.Item>
    );
};

// ─── Compound export ──────────────────────────────────────────────────────────

/**
 * Accordion — collapsible sections with full WAI-ARIA keyboard navigation.
 *
 * @example
 * // Multiple sections, one open by default
 * <Accordion defaultValue={["details"]}>
 *   <Accordion.Item value="details" title="Details">…</Accordion.Item>
 *   <Accordion.Item value="history" title="History" leadingIcon="history">…</Accordion.Item>
 * </Accordion>
 *
 * @example
 * // Single open at a time, collapsible
 * <Accordion type="single" collapsible>
 *   <Accordion.Item value="a" title="Section A">…</Accordion.Item>
 *   <Accordion.Item value="b" title="Section B" rightSlot={<Badge>3</Badge>}>…</Accordion.Item>
 * </Accordion>
 *
 * Keyboard navigation (from Radix):
 *   Space / Enter  — toggle focused item
 *   ↑ / ↓          — move focus between items
 *   Home / End     — jump to first / last item
 */
export const Accordion = Object.assign(AccordionRoot, {
    Item: AccordionItem,
});

// Named sub-component export for direct import
export { AccordionItem };
