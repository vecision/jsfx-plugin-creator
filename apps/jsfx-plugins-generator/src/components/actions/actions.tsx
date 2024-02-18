import classNames from 'classnames';
import { ButtonHTMLAttributes, CSSProperties, ForwardedRef, forwardRef } from 'react';

import { Icon, IconProps } from '@jsfx-plugins-generator/components/icon';

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
  icon?: IconProps;
};

export const Button = forwardRef(({ icon, ...props }: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      ref={ref}
      type={props.type ?? 'button'}
      className={classNames(styles.button, props.className, {
        [styles['has-icon']]: !!icon,
        [styles['icon-only']]: !!icon && !props.children,
      })}
    >
      {icon && <Icon {...icon} />}
    </button>
  );
});

Button.displayName = 'Button';
