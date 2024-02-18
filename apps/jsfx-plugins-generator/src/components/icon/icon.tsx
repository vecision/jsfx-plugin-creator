import * as Icons from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { CSSProperties, ForwardedRef, forwardRef, SVGProps } from 'react';

import { toCSSProperties } from '@jsfx-plugins-generator/utils/css-properties';

import styles from './icon.module.scss';

export type IconProps = {
  icon: keyof typeof Icons;
  size?: string;
  color?: string;
  style?: CSSProperties;
  scale?: CSSProperties['scale'];
} & Pick<SVGProps<SVGSVGElement>, 'className'>;

export const Icon = forwardRef(
  ({ icon, style, scale = 1.2, size = '28px', className, ...rest }: IconProps, ref: ForwardedRef<SVGSVGElement>) => {
    const Component = Icons[icon];

    return (
      <Component
        ref={ref}
        className={classNames(className, styles.icon)}
        style={{
          ...style,
          ...toCSSProperties({
            scale,
            size,
          }),
        }}
        {...rest}
      />
    );
  }
);

Icon.displayName = 'Icon';
