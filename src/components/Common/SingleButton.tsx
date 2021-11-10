import React from 'react';
import { Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { QuestionModule } from '.';

export default function SingleButton(props) {
  const maxWidth = props.size === 'small' ? '200px' : '300px';

  const classes = makeStyles(() => ({
    button: {
      backgroundColor: props.backgroundColor,
      borderRadius: '15px',
      boxShadow:
        '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
      color: props.color,
      fontFamily: 'Futura-Pt-Book',
      fontSize: props.fontSize,
      height: props.height,
      margin: '12px',
      maxWidth: maxWidth,
      opacity: '95%',
      textTransform: props.textTransform,
      transition: '0.2s ease-out opacity',
      width: props.width,
      '&:hover': {
        backgroundColor: props.backgroundColor,
        opacity: '100%',
      },
    },
  }))();

  function getIcon() {
    if (props.icon !== undefined) {
      return (
        <img
          alt=""
          src={props.icon}
          style={{ height: 'calc(15px + 1vmin)', margin: '15px' }}
        />
      );
    }
  }

  return (
    <Button className={classes.button} onClick={() => props.handleClick()}>
      {getIcon()}
      <Box>
        {props.title}
        <QuestionModule
          description={props.description}
          margin={props.margin}
          marginTooltip={props.marginTooltip}
          widthTooltip={props.widthTooltip}
        />
      </Box>
      {getIcon()}
    </Button>
  );
}

SingleButton.defaultProps = {
  backgroundColor: '#FFF1B6',
  color: 'black',
  fontSize: 'calc(12px + 1vmin)',
  height: '44px',
  isDisabled: 'false',
  margin: '-12px 0 0 5px',
  size: 'small',
  textTransform: 'uppercase',
  width: '200px',
};
