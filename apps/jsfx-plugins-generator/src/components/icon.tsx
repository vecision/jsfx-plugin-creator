import * as Icons from '@heroicons/react/20/solid';

export type IconProps = {
  icon: keyof typeof Icons;
  size?: string;
  color?: string;
};
export const Icon = ({ icon, ...rest }: IconProps) => {
  const _Icon = Icons[icon];

  return <_Icon {...rest} />;
};
