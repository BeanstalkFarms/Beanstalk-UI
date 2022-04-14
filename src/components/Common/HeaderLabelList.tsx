import React from 'react';
import { Stack, Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { theme } from 'constants/index';
import { HeaderLabel } from './index';

const useStyles = makeStyles({
  container: {
    margin: 'auto',
    backgroundColor: theme.secondary,
    borderRadius: '15px',
    color: theme.accentText,
    display: 'flex',
    fontSize: '16px',
    padding: '8px',
    textTransform: 'none',
  },
  containerShadow: {
    boxShadow: '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
  },
  containerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'left',
    paddingLeft: 4,
    marginTop: 6,
  }
});
export default function HeaderLabelList(props: any) {
  const classes = useStyles();
  return (
    <Stack className={`HeaderLabelList ${classes.container} ${props.container ? classes.containerShadow : ''}`}>
      {props.containerTitle && (
        <Box className={classes.containerTitle}>
          {props.containerTitle}
        </Box>
      )}
      {props.title.filter((x) => x !== null).map((item, index) => (
        <Box key={index}>
          <HeaderLabel
            balanceDescription={props.balanceDescription[index]}
            description={props.description[index]}
            title={props.title[index]}
            value={props.value[index]}
            container={false}
          />
        </Box>
      ))}
    </Stack>
  );
}

HeaderLabelList.defaultProps = {
  container: true,
};
