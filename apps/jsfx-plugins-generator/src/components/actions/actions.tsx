import { toMemoKey } from '@utils-common';
import classNames from 'classnames';
import Link, { LinkProps } from 'next/link';
import { ButtonHTMLAttributes, CSSProperties, ForwardedRef, forwardRef, useMemo } from 'react';

import { Icon, IconProps } from '@jsfx-plugins-generator/components/icon/icon';
import { Tooltip, TooltipProps } from '@jsfx-plugins-generator/components/tooltip/tooltip';

import { toCSSProperties } from '@jsfx-plugins-generator/utils/css-properties';

import styles from './actions.module.scss';

type ActionProps = {
  items: ({
    label?: string;
    id: string;
    visible?: boolean;
  } & Omit<ButtonProps, 'label' | 'id'>)[];
  direction?: 'row' | 'column';
  alignment?: CSSProperties['justifyContent'];
} & React.HTMLAttributes<HTMLUListElement>;

export const Actions = ({ items, direction = 'row', alignment, className, style, ...rest }: ActionProps) => {
  const filteredItems = items.filter(item => item.visible !== false);
  const filteredItemsKey = toMemoKey(filteredItems);

  return useMemo(() => {
    if (!filteredItems.length) return null;

    return (
      <ul
        {...rest}
        className={classNames(styles.actions, className, {
          [styles['direction-row']]: direction === 'row',
          [styles['direction-column']]: direction === 'column',
        })}
        style={{ ...style, ...toCSSProperties({ justifyContent: alignment }) }}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alignment, direction, filteredItemsKey]);
};

type ButtonContentProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconProps & { iconPosition?: 'before' | 'after' };
};

const ButtonContent = forwardRef(
  ({ icon, children, ...props }: ButtonContentProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const iconPosition = icon?.iconPosition ?? 'before';

    return (
      <>
        {icon && iconPosition === 'before' && <Icon className={styles.icon} size="24px" {...icon} />}
        {children}
        {icon && iconPosition === 'after' && <Icon className={styles.icon} size="24px" {...icon} />}
      </>
    );
  }
);

ButtonContent.displayName = 'ButtonContent';

export type ButtonProps = ButtonContentProps &
  Partial<LinkProps> & {
    tooltip?: TooltipProps;
  };

export const Button = forwardRef(
  (
    {
      href,
      as,
      replace,
      scroll,
      shallow,
      passHref,
      prefetch,
      locale,
      legacyBehavior,
      tooltip,
      icon,
      className,
      ...props
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    if (tooltip) {
      if (href) {
        return (
          <Tooltip {...tooltip}>
            <Link
              href={href}
              as={as}
              replace={replace}
              scroll={scroll}
              shallow={shallow}
              passHref={passHref}
              prefetch={prefetch}
              locale={locale}
              legacyBehavior={legacyBehavior}
              type={props.type ?? 'button'}
              className={classNames(styles.button, className, {
                [styles['has-icon']]: !!icon,
                [styles['icon-only']]: !!icon && !props.children,
              })}
              ref={ref as unknown as ForwardedRef<HTMLButtonElement>}
              {...(props as any)}
            >
              <ButtonContent icon={icon} {...props} />
            </Link>
          </Tooltip>
        );
      }

      return (
        <Tooltip {...tooltip}>
          <button
            {...props}
            ref={ref as unknown as ForwardedRef<HTMLButtonElement>}
            type={props.type ?? 'button'}
            className={classNames(styles.button, className, {
              [styles['has-icon']]: !!icon,
              [styles['icon-only']]: !!icon && !props.children,
            })}
          >
            <ButtonContent icon={icon} {...props} />
          </button>
        </Tooltip>
      );
    }

    if (href) {
      return (
        <Link
          href={href}
          as={as}
          replace={replace}
          scroll={scroll}
          shallow={shallow}
          passHref={passHref}
          prefetch={prefetch}
          locale={locale}
          legacyBehavior={legacyBehavior}
          type={props.type ?? 'button'}
          className={classNames(styles.button, className, {
            [styles['has-icon']]: !!icon,
            [styles['icon-only']]: !!icon && !props.children,
          })}
          ref={ref as unknown as ForwardedRef<HTMLButtonElement>}
          {...(props as any)}
        >
          <ButtonContent icon={icon} {...props} />
        </Link>
      );
    }

    return (
      <button
        {...props}
        ref={ref as unknown as ForwardedRef<HTMLButtonElement>}
        type={props.type ?? 'button'}
        className={classNames(styles.button, className, {
          [styles['has-icon']]: !!icon,
          [styles['icon-only']]: !!icon && !props.children,
        })}
      >
        <ButtonContent icon={icon} {...props} />
      </button>
    );
  }
);

Button.displayName = 'Button';
