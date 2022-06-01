import React from 'react';
import { theme } from 'constants/index';

const lineStyle = {
  color: theme.accentColor,
  backgroundColor: theme.accentColor,
  borderWidth: '0px',
  height: '1px',
  margin: '14px 4px 8px 4px',
};

export default function Line(props : { style?: any }) {
  return <hr style={{ ...props.style, ...lineStyle }} />;
}
