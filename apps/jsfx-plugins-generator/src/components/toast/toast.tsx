import 'react-toastify/dist/ReactToastify.css';
import cn from 'classnames';
import { ReactNode } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';

import { Icon, IconProps } from '@jsfx-plugins-generator/components/icon';

import styles from './toast.module.scss';

export type ToastProps = {
  title: string;
  message?: ReactNode;
  iconProps?: IconProps;
  onClose?: () => void;
  variant?: 'success' | 'alert' | 'error' | 'info';
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
};

type ToastComponentProps = ToastProps & {
  handleClose?: () => void;
};

export const Toast = ({ title, message, iconProps }: ToastComponentProps) => {
  return (
    <>
      <div className={styles.info}>
        {iconProps && (
          <div className={styles.icon}>
            <Icon {...iconProps} />
          </div>
        )}
        <div className={styles.text}>
          <strong className={styles.title}>{title}</strong>
          {message && <div className={styles.message}>{message}</div>}
        </div>
      </div>
      <div className={styles.actions}></div>
    </>
  );
};

export const useToast = () => {
  const notify = (props: ToastProps, options?: ToastOptions) => {
    return toast(({ closeToast }) => <Toast {...props} handleClose={closeToast} />, {
      hideProgressBar: true,
      closeButton: false,
      closeOnClick: true,
      draggable: true,
      bodyClassName: styles.body,
      position: props.position || 'bottom-right',
      role: props.variant,
      draggablePercent: 40,
      className: cn(styles.toast, styles[props.variant || 'info']),
      ...options,
    });
  };

  const success = (props: Omit<ToastProps, 'variant'>, options?: ToastOptions) => {
    const iconProps: ToastProps['iconProps'] = {
      icon: 'CheckIcon',
      size: '20',
      ...props.iconProps,
    };

    return notify({ ...props, iconProps, variant: 'success' }, options);
  };

  const error = (props: Omit<ToastProps, 'variant'>, options?: ToastOptions) => {
    const iconProps: ToastProps['iconProps'] = {
      icon: 'XMarkIcon',
      size: '20',
      ...props.iconProps,
    };

    return notify({ ...props, iconProps, variant: 'error' }, options);
  };

  const alert = (props: Omit<ToastProps, 'variant'>, options?: ToastOptions) => {
    const iconProps: ToastProps['iconProps'] = {
      icon: 'ExclamationTriangleIcon',
      size: '20',
      ...props.iconProps,
    };

    return notify({ ...props, iconProps, variant: 'alert' }, options);
  };

  const info = (props: Omit<ToastProps, 'variant'>, options?: ToastOptions) => {
    const iconProps: ToastProps['iconProps'] = {
      icon: 'SparklesIcon',
      size: '20',
      ...props.iconProps,
    };

    return notify({ ...props, iconProps, variant: 'info' }, options);
  };

  return {
    success,
    error,
    alert,
    info,
  };
};

Toast.useToast = useToast;

export const ToastProvider = ToastContainer;
