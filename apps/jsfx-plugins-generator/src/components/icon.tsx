import * as Icons from '@heroicons/react/20/solid';
import { CSSProperties } from 'react';

import { toCSSProperties } from '@jsfx-plugins-generator/utils/css-properties';

export type IconProps = {
  icon: keyof typeof Icons;
  size?: string;
  color?: string;
  style?: CSSProperties;
  scale?: CSSProperties['scale'];
};

export const Icon = ({ icon, style, scale, ...rest }: IconProps) => {
  const Component = Icons[icon];

  return (
    <Component
      style={{
        ...style,
        ...toCSSProperties({
          scale,
        }),
      }}
      {...rest}
    />
  );
};
