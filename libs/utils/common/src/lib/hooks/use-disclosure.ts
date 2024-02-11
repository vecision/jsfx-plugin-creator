import { useState } from 'react';

export type DisclosureParams = {
  initialState?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Use Disclosure
 *
 * @description
 * A hook that returns a set of functions and a boolean to control the state of a component.
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const { isOpen, onClose, onToggle } = useDisclosure();
 *
 *   return (
 *     <>
 *       <button onClick={onToggle}>Toggle</button>
 *       <Modal isOpen={isOpen} onClose={onClose} />
 *     </>
 *   );
 * }
 * ```
 */
export const useDisclosure = (config: DisclosureParams = {}) => {
  const [isOpen, setIsOpen] = useState(config.initialState ?? false);

  const setOpen = () => {
    config?.onOpen?.();
    setIsOpen(true);
  };

  const setClose = () => {
    config?.onClose?.();
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(state => !state);
  };

  return {
    isOpen,
    setOpen,
    setClose,
    toggle,
  };
};
