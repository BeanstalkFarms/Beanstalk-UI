/// Proof-of-concept: Almanac Tab
/// Highlight the tab with a border on keystroke.

// import React from 'react';
// import { Tab, TabProps } from '@mui/material';
// import useAppFlag from '~/hooks/display/useAppFlag';

// const open = (url: string) => (e: any) => {
//   e.preventDefault();
//   e.stopPropagation();
//   window.open(url, `_newtab${new Date().getTime()}`);
// };

// const prefix = (uri: string) => (uri ? uri.charAt(0) === '/' ? `https://beanstalk.gitbook.io/wip-farmers-almanac${uri}` : uri : '');

// const almProps = (props: any, pressed = false) => ({
//     onClick: pressed ? open(prefix(props.almHref)) : props.onClick,
//     className: pressed ? `alm ${props.className}` : props.className,
//   });

// type AlmProps = {
//   almHref: string;
// }

// const AlmTab : React.FC<TabProps & AlmProps> = ({ ...props }) => {
//   const pressed = useAppFlag('almanacView');
//   return (
//     <Tab
//       {...props}
//       {...almProps(props, pressed as boolean)}
//     />
//   );
// };

export default null;
