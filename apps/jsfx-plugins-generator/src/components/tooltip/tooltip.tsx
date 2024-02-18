import 'tippy.js/dist/tippy.css';
import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';

import styles from './tooltip.module.scss';

export const Tooltip = (props: TippyProps) => {
  return <Tippy delay={props.delay || 80} className={classNames(props.className, styles.tooltip)} {...props} />;
};
