import Tippy, { TippyProps } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export const Tooltip = (props: TippyProps) => {
  return <Tippy delay={120} {...props} />;
};
