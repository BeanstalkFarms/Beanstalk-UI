import React, { Fragment } from 'react';
import { Box, AppBar, Button, Link, Tab, Tabs } from '@material-ui/core';
import BigNumber from 'bignumber.js';

import { makeStyles } from '@material-ui/styles';
import LockIcon from '@material-ui/icons/Lock';
import { FormatTooltip, QuestionModule } from './index';

export default function BaseModule(props) {
  const s = props.size === 'small';
  const classes = makeStyles(() => ({
    inputModule: {
      backgroundColor: '#F5FAFF',
      borderRadius: '25px',
      color: 'black',
      marginTop: props.marginTop,
      padding: '10px',
    },
    metaModule: {
      backgroundColor: 'rgba(238 238 238 / 85%)',
      borderRadius: '25px',
      boxShadow: 'none',
      color: 'black',
      marginTop: '16px',
      padding: '10px 16px 30px 16px',
    },
    sectionTab: {
      fontFamily: 'Futura-Pt-Book',
      fontSize: s ? '14px' : '18px',
      minWidth: '44px',
      textTransform: props.textTransform,
      borderRadius: '15px',
    },
    singleSection: {
      fontFamily: 'Futura-Pt-Book',
      fontSize: s ? '14px' : '18px',
      minWidth: '44px',
      textTransform: props.textTransform,
      borderRadius: '15px',
      margin: '12px 0 12px 0',
    },
    formButton: {
      borderRadius: '15px',
      fontFamily: 'Futura-Pt-Book',
      fontSize: 'calc(12px + 1vmin)',
      height: '44px',
      margin: '12px 12px',
      width: '64%',
      maxWidth: '200px',
    },
    indicator: {
      backgroundColor: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      '& > span': {
        backgroundColor: '#627264',
        borderRadius: '3.5px',
        height: '7px',
        marginTop: '-8px',
        maxWidth: '7px',
        width: '100%',
      },
    },
    noIndicator: {
      backgroundColor: 'transparent',
    },
    moduleContent: {
      backgroundColor: '#F5FAFF',
      height: '100%',
      left: '0',
      opacity: '50%',
      position: 'absolute',
      top: '0',
      width: '100%',
      zIndex: '1',
    },
  }))();

  function a11yProps(index) {
    return {
      key: `${index}`,
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  const allowanceCallback = (transactionState) => {
    switch (transactionState) {
      case 1:
        props.setAllowance(new BigNumber(-1));
        break;
      case 2:
        props.setAllowance(new BigNumber(1));
        break;
      case 3:
        if (props.allowance.isEqualTo(-1)) {
          props.setAllowance(0);
        }
        break;
      default:
        break;
    }
  };

  const approveHandler = () => {
    props.handleApprove(allowanceCallback);
  };

  let buttonLabel;
  let buttonHandler;
  if (props.allowance.isEqualTo(0)) {
    buttonLabel = 'APPROVE';
    buttonHandler = approveHandler;
  } else if (props.locked) {
    buttonLabel = (
      <>
        <LockIcon />
        <Box style={{ style: 'inline-block' }}>
          {`${props.lockedSeasons} seasons`}
        </Box>
      </>
    );
  } else if (props.allowance.isGreaterThan(0)) {
    buttonLabel = props.sectionTitles[props.section];
    buttonHandler = props.handleForm;
  } else {
    buttonLabel = 'WAITING . . .';
    buttonHandler = null;
  }

  let showButton;
  if (props.showButton) {
    showButton = (
      <FormatTooltip
        placement="top"
        margin="0 0 0 7px"
        title={props.locked ? 'Unvote Active BIPs to Withdraw' : ''}
      >
        <Box>
          <Button
            className={classes.formButton}
            color="primary"
            disabled={
              buttonLabel !== 'APPROVE' &&
              (buttonHandler === null || props.isDisabled || props.locked)
            }
            onClick={buttonHandler}
            variant="contained"
          >
            {buttonLabel}
          </Button>
        </Box>
      </FormatTooltip>
    );
  } else {
    <></>;
  }

  const moduleContent = (
    <>
      <Box style={{ position: 'relative', zIndex: '0' }}>
        {props.children}
        {props.allowance.isEqualTo(0) ? (
          <Box className={classes.moduleContent} />
        ) : null}
      </Box>
      {showButton}
      {props.allowance.isEqualTo(0) ? (
        <span>
          To use this module, send an Approval by clicking the Approve button
          above.
          <br />
          <Link // eslint-disable-line
            style={{ color: 'green' }}
            href=""
            onClick={(event) => {
              event.preventDefault();
              props.resetForm();
            }}
          >
            Reset Defaults
          </Link>
        </span>
      ) : null}
    </>
  );

  return (
    <>
      {props.normalBox && props.sectionTitles.length > 1 ? (
        <AppBar
          style={props.style}
          className={
            props.removeBackground ? classes.metaModule : classes.inputModule
          }
          position="static"
        >
          <Tabs
            classes={
              props.sectionTitles.length > 1
                ? { indicator: classes.indicator }
                : { indicator: classes.noIndicator }
            }
            indicatorColor="primary"
            onChange={props.handleTabChange}
            style={{ width: '100%', borderRadius: '15px' }}
            TabIndicatorProps={{ children: <span /> }}
            textColor="primary"
            value={props.section}
            variant="fullWidth"
          >
            {props.sectionTitles.map((sectionTitle, index) => (
              <Tab
                className={classes.sectionTab}
                disabled={props.sectionTitles.length < 2}
                label={
                  props.sectionTitlesDescription !== undefined ? (
                    <Box>
                      {sectionTitle}
                      <QuestionModule
                        description={props.sectionTitlesDescription[index]}
                        margin={props.margin}
                        marginTooltip={props.marginTooltip}
                        widthTooltip={props.widthTooltip}
                      />
                    </Box>
                  ) : (
                    sectionTitle
                  )
                }
                style={{ color: 'black' }}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
          <hr
            style={{
              color: 'primary',
              backgroundColor: 'primary',
              margin: '4px 8px',
            }}
          />
          {props.showButton ? (
            <form autoComplete="off" noValidate style={{ padding: '0 10px' }}>
              {moduleContent}
            </form>
          ) : (
            <span style={{ padding: s ? '0px' : '0px 10px' }}>{moduleContent}</span>
          )}
        </AppBar>
      ) : props.sectionTitles.length === 1 && props.normalBox ? (
        <AppBar
          style={props.style}
          className={
            props.removeBackground ? classes.metaModule : classes.inputModule
          }
          position="static"
        >
          <span className={classes.singleSection}>
            {props.sectionTitlesDescription !== undefined ? (
              <Box>
                {props.sectionTitles[0]}
                <QuestionModule
                  description={props.sectionTitlesDescription[0]}
                  margin={props.margin}
                  marginTooltip={props.marginTooltip}
                  widthTooltip={props.widthTooltip}
                />
              </Box>
            ) : (
              props.sectionTitles[0]
            )}
          </span>
          <hr
            style={{
              color: 'primary',
              backgroundColor: 'primary',
              margin: '4px 8px',
            }}
          />
          {props.showButton ? (
            <form autoComplete="off" noValidate style={{ padding: '0 10px' }}>
              {moduleContent}
            </form>
          ) : (
            <span style={{ padding: '0px 10px' }}>{moduleContent}</span>
          )}
        </AppBar>
      ) : (
        <AppBar
          style={props.style}
          className={
            props.removeBackground ? classes.metaModule : classes.inputModule
          }
          position="static"
        >
          <span style={{ padding: '0px 10px' }}>{moduleContent}</span>
        </AppBar>
      )}
    </>
  );
}

BaseModule.defaultProps = {
  allowance: new BigNumber(1),
  isDisabled: false,
  locked: false,
  showButton: true,
  removeBackground: false,
  marginTop: '44px',
  margin: '-12px 0 0 0px',
  normalBox: true,
  textTransform: 'uppercase',
};
