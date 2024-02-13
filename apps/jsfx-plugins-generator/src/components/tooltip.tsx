import 'tippy.js/dist/tippy.css';
import Tippy, { TippyProps } from '@tippyjs/react';

export const Tooltip = (props: TippyProps) => {
  return <Tippy delay={120} {...props} />;
};
