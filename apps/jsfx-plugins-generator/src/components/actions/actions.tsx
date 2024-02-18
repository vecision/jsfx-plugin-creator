import classNames from 'classnames';
import { ButtonHTMLAttributes, CSSProperties, ForwardedRef, forwardRef } from 'react';

import { Icon, IconProps } from '@jsfx-plugins-generator/components/icon';
import { Tooltip, TooltipProps } from '@jsfx-plugins-generator/components/tooltip/tooltip';

import { toCSSProperties } from '@jsfx-plugins-generator/utils/css-properties';

import styles from './actions.module.scss';

type ActionProps = {
  items: ({
    label: string;
    id: string;
    visible?: boolean;
  } & Omit<ButtonProps, 'label' | 'id'>)[];
  direction?: 'row' | 'column';
  alignment?: CSSProperties['justifyContent'];
};

export const Actions = ({ items, direction = 'row', alignment }: ActionProps) => {
  const filteredItems = items.filter(item => item.visible !== false);

  if (!filteredItems.length) return null;
  return (
    <ul
      className={classNames(styles.actions, {
        [styles['direction-row']]: direction === 'row',
        [styles['direction-column']]: direction === 'column',
      })}
      style={toCSSProperties({ justifyContent: alignment })}
    >
      {filteredItems.map(item => (
        <li key={item.id}>
          <Button {...item} className={classNames(item.className, styles.button)}>
            {item.label}
          </Button>
        </li>
      ))}
    </ul>
  );
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconProps & { iconPosition?: 'before' | 'after' };
};

const ButtonContent = forwardRef(({ icon, children, ...props }: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const iconPosition = icon?.iconPosition ?? 'before';

  return (
    <button
      {...props}
      ref={ref}
      type={props.type ?? 'button'}
      className={classNames(styles.button, props.className, {
        [styles['has-icon']]: !!icon,
        [styles['icon-only']]: !!icon && !children,
      })}
    >
      {icon && iconPosition === 'before' && <Icon className={styles.icon} {...icon} />}
      {children}
      {icon && iconPosition === 'after' && <Icon className={styles.icon} {...icon} />}
    </button>
  );
});

ButtonContent.displayName = 'ButtonContent';

export const Button = forwardRef(
  (
    props: ButtonProps & {
      tooltip?: TooltipProps;
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    if (props.tooltip) {
      return (
        <Tooltip {...props.tooltip}>
          <ButtonContent {...props} ref={ref} />
        </Tooltip>
      );
    }

    return <ButtonContent {...props} ref={ref} />;
  }
);

Button.displayName = 'Button';
