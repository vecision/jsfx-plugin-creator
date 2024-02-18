import { XMarkIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { ReactNode, useCallback, useLayoutEffect, useRef } from 'react';

import { Actions } from '@jsfx-plugins-generator/components/actions/actions';

import styles from './dialog.module.scss';

type DialogProps = {
  children: React.ReactNode;
  dialog?: ReturnType<typeof useDialog>;
  className?: string;
  title?: ReactNode;
};
export const Dialog = ({ children, dialog, className, title }: DialogProps) => {
  const fallbackController = useDialog();
  const controller = dialog ?? fallbackController;

  return (
    <dialog className={classNames(className, styles.dialog)} ref={controller?.dialogRef}>
      <div className={styles.content}>
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <button className={styles.closeIcon} onClick={controller.setClose}>
            <XMarkIcon />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
};

Dialog.Actions = Actions;

type UseDialogParams = {
  isInitiallyOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
};

const useDialog = ({ isInitiallyOpen, onClose, onOpen }: UseDialogParams = {}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const setOpen = useCallback(() => {
    if (!dialogRef.current) return;

    dialogRef.current.showModal?.();
    onOpen?.();
  }, [onOpen]);

  const setClose = useCallback(() => {
    if (!dialogRef.current) return;

    dialogRef.current.close?.();
    onClose?.();
  }, [onClose]);

  const setToggle = useCallback(() => {
    if (!dialogRef.current) return;

    if (dialogRef.current.open) {
      dialogRef.current.close?.();
    } else {
      dialogRef.current.showModal?.();
    }
  }, []);

  useLayoutEffect(() => {
    if (isInitiallyOpen) {
      setOpen();
    }
  }, [isInitiallyOpen, setOpen]);

  return {
    dialogRef,
    setOpen,
    setClose,
    setToggle,
  };
};

Dialog.useDialog = useDialog;
