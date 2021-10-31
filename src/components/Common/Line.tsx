import React from 'react';
import { theme } from '../../constants';

export default function Line(props) {
    const lineStyle = {
        color: theme.accentColor,
        backgroundColor: theme.accentColor,
        borderWidth: '0px',
        height: '1px',
        margin: '14px 4px 8px 4px',
    };

    return (
      <hr style={{ ...props.style, ...lineStyle }} />
    );
}
