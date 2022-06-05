import React from 'react';
import { TokenImage, Token, TokenLabel } from 'util/index';
import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles({
  tokenIcon: {
    width: 11,
    height: 11,
    verticalAlign: 'middle',
    marginLeft: 1,
    marginTop: -3,
    opacity: 0.7,
  },
});

type TokenImageProps = {
  token: Token;
  style?: any;
}

export default function TokenIcon(props: TokenImageProps) {
  const styles = useStyles();
  return (
    <img
      alt={TokenLabel(props.token)}
      src={TokenImage(props.token)}
      className={styles.tokenIcon}
      style={props.style}
    />
  );
}

TokenIcon.defaultProps = {
  style: undefined,
};
