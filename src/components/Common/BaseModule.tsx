import React, { Fragment } from 'react';
import { Box, Button, Link, Tab, Tabs } from '@mui/material';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import makeStyles from '@mui/styles/makeStyles';
import { theme } from 'constants/index';
import { StyledTooltip, Line, QuestionModule } from './index';

const useStyles = makeStyles(() => ({
  // disableBackground = false
  inputModule: {
    backgroundColor: theme.module.background,
    borderRadius: '25px',
    color: theme.text,
    padding: '10px',
    // Added to enable the SettingsFormMoudle 
    overflow: 'visible',
    position: 'relative',
  },
  // disableBackground = true
  metaModule: {
    backgroundColor: theme.module.metaBackground,
    borderRadius: '25px',
    boxShadow: 'none',
    color: theme.backgroundText,
    marginTop: '16px',
    padding: '10px 16px 30px 16px',
    overflow: 'visible',
  },
  sectionTab: {
    fontFamily: 'Futura-Pt-Book',
    minWidth: '44px',
    borderRadius: '15px',
  },
  singleSection: {
    fontFamily: 'Futura-Pt-Book',
    minWidth: '44px',
    borderRadius: '15px',
    margin: '12px 0 12px 0',
  },
  formButton: {
    borderRadius: '15px',
    fontFamily: 'Futura-Pt-Book',
    fontSize: 'calc(10px + 1vmin)',
    height: '44px',
    margin: '12px 12px',
    width: '64%',
    maxWidth: '240px',
    zIndex: 1,
  },
  indicator: {
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    '& > span': {
      backgroundColor: theme.secondary,
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
    backgroundColor: theme.module.background,
    height: '100%',
    left: '0',
    opacity: '50%',
    position: 'absolute',
    top: '0',
    width: '100%',
    zIndex: 1,
  },
}));

type BaseModuleProps = {
  removeBackground: boolean;

  setAllowance: any;
}
export default function BaseModule({
  // Styling
  size,
  marginTop,
  textTransform,
  textTabSize,
  widthTooltip,
  marginTooltip,
  margin,
  marginMeta,
  normalBox,
  style,
  // Display
  showButton,
  singleReset,
  setButtonLabel,
  // Allowances
  allowance,
  setAllowance,
  handleApprove,
  // Form
  locked,
  handleForm,
  resetForm,
  // Sections
  section,
  removeBackground,
  handleTabChange,
  isDisabled,
  sectionTitles,
  sectionTitlesDescription,
  // Other
  children,
} : Partial<BaseModuleProps>) {
  const dispatch = useDispatch();
  const s = size === 'small' || window.innerWidth < 450;
  const classes = useStyles();

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
        dispatch(setAllowance(new BigNumber(-1)));
        break;
      case 2:
        dispatch(setAllowance(new BigNumber(1)));
        break;
      case 3:
        if (allowance.isEqualTo(-1)) {
          dispatch(setAllowance(0));
        }
        break;
      default:
        break;
    }
  };

  const approveHandler = () => {
    handleApprove(allowanceCallback);
  };

  let buttonLabel;
  let buttonHandler;
  if (allowance.isEqualTo(0)) {
    buttonLabel = 'APPROVE';
    buttonHandler = approveHandler;
  } else if (allowance.isGreaterThan(0)) {
    buttonLabel = (setButtonLabel != null) ? setButtonLabel : sectionTitles[section];
    buttonHandler = handleForm;
  } else {
    buttonLabel = 'WAITING . . .';
    buttonHandler = null;
  }

  let actionButton;
  if (showButton) {
    actionButton = (
      <StyledTooltip
        placement="top"
        margin="0 0 0 7px"
        title={locked ? 'Unvote Active BIPs to Deposit' : ''}
      >
        <Box>
          <Button
            className={classes.formButton}
            color="primary"
            disabled={
              buttonLabel !== 'APPROVE' &&
              (buttonHandler === null || isDisabled)
            }
            onClick={buttonHandler}
            variant="contained"
          >
            {buttonLabel}
          </Button>
        </Box>
      </StyledTooltip>
    );
  } else {
    <></>;
  }
  
  const resetLink = singleReset !== true ?
    <>
      <br />
      <Link
        style={{ color: 'green' }}
        href=""
        onClick={(event) => {
          event.preventDefault();
          resetForm();
        }}
        underline="hover">
        Reset Defaults
      </Link>
    </>
    : null;

  // Removed style from <Box> temporarily:
  // style={{ position: 'relative', zIndex: '0' }}
  const moduleContent = (
    <>
      <Box>
        {children}
        {allowance.isEqualTo(0) ? (
          <Box className={classes.moduleContent} />
        ) : null}
      </Box>
      {actionButton}
      {allowance.isEqualTo(0) ? (
        <span>
          To use this module, send an Approval by clicking the Approve button
          above.
          {resetLink}
        </span>
      ) : null}
    </>
  );

  return (
    <>
      {(normalBox && sectionTitles.length >= 1) ? (
        // Multiple sections, "normalBox"
        <Box
          style={style}
          className={
            removeBackground
              ? classes.metaModule 
              : classes.inputModule
          }
          sx={{ marginTop: marginTop }}
          boxShadow={3}
        >
          <Tabs
            classes={
              sectionTitles.length > 1
                ? { indicator: classes.indicator }
                : { indicator: classes.noIndicator }
            }
            onChange={handleTabChange}
            style={{ width: '100%', borderRadius: '15px' }}
            TabIndicatorProps={{ children: <span /> }}
            value={section}
            variant="fullWidth"
          >
            {sectionTitles.map((sectionTitle, index) => (
              <Tab
                className={classes.sectionTab}
                style={{
                  textTransform: textTransform,
                  fontSize: s ? textTabSize : '18px',
                  color: (
                    removeBackground
                      ? theme.backgroundText
                      : theme.text
                  ),
                }}
                disableRipple={sectionTitles.length === 1}
                label={
                  sectionTitlesDescription !== undefined ? (
                    <Box>
                      {sectionTitle}
                      <QuestionModule
                        description={sectionTitlesDescription[index]}
                        margin={margin}
                        marginTooltip={marginTooltip}
                        widthTooltip={widthTooltip}
                      />
                    </Box>
                  ) : (
                    sectionTitle
                  )
                }
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
          <Line style={{ margin: '4px 8px' }} />
          {showButton ? (
            <form
              autoComplete="off"
              noValidate
              // Removed during mui-v5 update.
              // style={{ padding: '0 10px' }}
            >
              {moduleContent}
            </form>
          ) : (
            moduleContent
          )}
        </Box>
      ) : (normalBox && sectionTitles.length === 1) ? (
        // Single section, "normalBox"
        <Box
          style={style}
          className={
            removeBackground
              ? classes.metaModule
              : classes.inputModule
          }
          sx={{ marginTop: marginTop }}
          boxShadow={3}
        >
          <span
            className={classes.singleSection}
            style={{
              textTransform: textTransform,
              fontSize: s ? '14px' : '18px',
            }}
          >
            {sectionTitlesDescription !== undefined ? (
              <Box style={{ margin: marginMeta }}>
                {sectionTitles[0]}
                <QuestionModule
                  description={sectionTitlesDescription[0]}
                  margin={margin}
                  marginTooltip={marginTooltip}
                  widthTooltip={widthTooltip}
                />
              </Box>
            ) : (
              sectionTitles[0]
            )}
          </span>
          <Line style={{ margin: '4px 8px' }} />
          {showButton ? (
            <form autoComplete="off" noValidate style={{ padding: '0 10px' }}>
              {moduleContent}
            </form>
          ) : (
            moduleContent
          )}
        </Box>
      ) : (
        // Not a normal box
        <Box
          style={style}
          className={
            removeBackground
              ? classes.metaModule
              : classes.inputModule
          }
          sx={{ 
            marginTop: marginTop
          }}
          boxShadow={3}
        >
          {moduleContent}
        </Box>
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
  marginMeta: '0px',
  margin: '-12px 0 0 0px',
  normalBox: true,
  textTransform: 'uppercase',
  textTabSize: '12.5px',
  singleReset: false,
};
