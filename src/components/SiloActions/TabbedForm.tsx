import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import makeStyles from '@mui/styles/makeStyles';
import { Button } from '@mui/material';

import { AppState } from 'state';
import { theme } from 'constants/index';
import { SiloToken } from 'constants/v0/siloTokens';
import { BaseModule, Grid, siloStrings } from 'components/Common';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Convert from './Convert';

const useStyles = makeStyles({
  backButton: {
    color: theme.text,
  },
});

type TabbedFormProps = {
  tokenData: SiloToken; // FIXME
}

const TabbedForm : React.FC<TabbedFormProps> = (props) => {
  // Styles
  const classes = useStyles();

  // Global state
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  // Section setup
  const [section, setSection] = useState(0);
  const sectionTitlesDescription = [
    siloStrings.tokenDepositDescription(props.tokenData.name),
    siloStrings.tokenWithdrawDescription(props.tokenData.name, totalBalance.withdrawSeasons),
    siloStrings.convert,
  ];
  const sections = [
    <Deposit />,
    <Withdraw />,
    <Convert />
  ];
  const sectionTitles = (props.tokenData.slug === 'bean-3crv' || props.tokenData.slug === 'bean-lusd') ? (
    ['Deposit', 'Withdraw']
  ) : (
    ['Deposit', 'Withdraw', 'Convert']
  );

  // Handlers
  const handleTabChange = useCallback(
    (event: any, newSection: number) => setSection(newSection),
    [setSection]
  );

  return (
    <div>
      <Grid container justifyContent="flex-start">
        <Link to="/silo" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ChevronLeftIcon />}
            className={classes.backButton}
          >
            Back
          </Button>
        </Link>
      </Grid>
      <BaseModule
        handleTabChange={handleTabChange}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        showButton={false}
        removeBackground
      >
        {sections[section]}
      </BaseModule>
    </div>
  );
};

export default TabbedForm;
