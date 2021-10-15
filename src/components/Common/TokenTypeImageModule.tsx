import { Box } from '@material-ui/core';
import { TokenImage, TokenLabel, TokenTypeImage } from '../../util';

export default function TokenTypeImageModule(props) {
  const tokenTypeStyle = {
    height: '100%',
    left: '0',
    position: 'absolute',
    top: '0',
  };
  const tokenTypeModifierStyle = {
    bottom: '0',
    height: '60%',
    left: `${parseInt(props.style.height) / 4}px`,
    position: 'absolute',
  };

  return (
    <Box style={{ ...props.style, position: 'relative' }}>
      <img
        alt={TokenLabel(props.token)}
        src={TokenImage(props.token)}
        style={tokenTypeStyle}
      />
      <img
        alt=""
        src={TokenTypeImage(props.token)}
        style={tokenTypeModifierStyle}
      />
    </Box>
  );
}

TokenTypeImageModule.defaultProps = {
  style: { height: '20px' },
};
