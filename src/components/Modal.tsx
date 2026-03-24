// src/components/Modal.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  // FIX: Add required title and optional description for accessibility.
  title: string;
  description?: string;
  /** Set true when rendering on top of another open modal to ensure correct overlay stacking. */
  nested?: boolean;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<React.PropsWithChildren<unknown>>;
  Content: React.FC<React.PropsWithChildren<unknown>>;
  Footer: React.FC<React.PropsWithChildren<unknown>>;
} = ({ isOpen, onClose, children, width = 'auto', height = 'auto', title, description, nested }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={nested ? 'modal-backdrop modal-backdrop-nested' : 'modal-backdrop'} />
        <Dialog.Content
          className={nested ? 'modal-container modal-container-nested' : 'modal-container'}
          style={{ width, height }}
          onEscapeKeyDown={onClose}
        >
          {/* FIX: Add non-visual title and description to satisfy Radix a11y requirements. */}
          <Dialog.Title className="visually-hidden">{title}</Dialog.Title>
          {description && <Dialog.Description className="visually-hidden">{description}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ModalHeader: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="modal-header">{children}</div>
);

const ModalContent: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="modal-content">{children}</div>
);

const ModalFooter: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export { Modal };