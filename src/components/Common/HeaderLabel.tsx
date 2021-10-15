import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { QuestionModule } from './index';
import { chainId } from '../../util';

export default function HeaderLabel(props) {
  const backgroundColor = chainId === 1 ? '#627264' : '#7A2343';
  const classes = makeStyles(theme => ({
    container: {
      backgroundColor: backgroundColor,
      borderRadius: '15px',
      boxShadow:
        '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
      color: 'white',
      display: 'flex',
      fontSize: '16px',
      margin: '-8px',
      padding: '4px 4px',
      textTransform: 'none',
    },
    title: {
      fontFamily: 'Futura-PT-Book',
      padding: '10px',
      textAlign: 'left',
      width: '67%',
    },
    value: {
      fontFamily: 'Lucida Console',
      padding: '10px',
      textAlign: 'right',
      width: '33%',
    },
  }))();

  return (
    <Box className={classes.container}>
      <Box className={classes.title}>
        {props.title}
        {props.description !== undefined ? (
          <QuestionModule
            description={props.description}
            margin={props.margin}
            marginTooltip={props.marginTooltip}
            placement={props.placement}
          />
        ) : undefined}
      </Box>
      <Box className={classes.value}>{props.value}</Box>
    </Box>
  );
}

HeaderLabel.defaultProps = {
  margin: '-8px 0 0 2px',
  marginTooltip: '0 0 0 10px',
};
