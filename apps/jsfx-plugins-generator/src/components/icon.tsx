import * as Icons from '@heroicons/react/20/solid';
import { CSSProperties, ForwardedRef, forwardRef, SVGProps } from 'react';

import { toCSSProperties } from '@jsfx-plugins-generator/utils/css-properties';

export type IconProps = {
  icon: keyof typeof Icons;
  size?: string;
  color?: string;
  style?: CSSProperties;
  scale?: CSSProperties['scale'];
} & Pick<SVGProps<SVGSVGElement>, 'className'>;

export const Icon = forwardRef(({ icon, style, scale, ...rest }: IconProps, ref: ForwardedRef<SVGSVGElement>) => {
  const Component = Icons[icon];

  return (
    <Component
      ref={ref}
      style={{
        ...style,
        ...toCSSProperties({
          scale,
        }),
      }}
      {...rest}
    />
  );
});

Icon.displayName = 'Icon';
