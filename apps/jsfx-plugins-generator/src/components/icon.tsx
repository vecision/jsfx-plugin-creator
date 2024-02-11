import * as Icons from '@heroicons/react/20/solid';

export const Icon = ({ icon }: { icon: keyof typeof Icons }) => {
  const _Icon = Icons[icon];
  return <_Icon />;
};
