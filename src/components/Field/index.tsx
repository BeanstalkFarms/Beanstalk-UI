import React from 'react';
import { displayBN, displayFullBN } from '../../util';
import { APY_CALCULATION, MEDIUM_INTEREST_LINK } from '../../constants';
import BeanLogo from '../../img/bean-bold-logo.svg';
import {
  BaseModule,
  ContentSection,
  Grid,
  HeaderLabel,
} from '../Common';
import FieldModule from './FieldModule';

export default function Field(props) {
  const { innerWidth: width } = window;

  const headerLabelStyle = {
    maxWidth: '300px',
  };

  // const apy = props.beansPerSeason.harvestableWeek * 8760;

  const tth = props.unripenedPods.dividedBy(props.beansPerSeason.harvestableWeek);
  const apy = props.weather.multipliedBy(8760).dividedBy(tth);

  const apyField = (
    <Grid container item xs={12} spacing={3} justifyContent="center">
      <Grid item sm={6} xs={12} style={headerLabelStyle}>
        <HeaderLabel
          balanceDescription={`${apy.toFixed(2)}% APY`}
          description={<span>The Pod APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY, <a target="blank" href={APY_CALCULATION}>click here</a></span>}
          title="Pod APY"
          value={`${apy.toFixed(0)}%`}
        />
      </Grid>
      <Grid item sm={6} xs={12} style={headerLabelStyle}>
        <HeaderLabel
          balanceDescription={`${tth.toFixed(2)} Seasons`}
          description={<span>The Seasons to Pod Clearance is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity. For the complete formulas used to calculate Seasons to Pod Clearance, <a target="blank" href={APY_CALCULATION}>click here</a></span>}
          title="Seasons to Pod Clearance"
          value={tth.toFixed(0)}
        />
      </Grid>
    </Grid>
  );

  const description =
  (
    <>
      The Field is the Beanstalk credit facility. Anyone can lend Beans to
      Beanstalk anytime there is Available Soil by sowing Beans in the
      Field in exchange for Pods. Pods are the debt asset of Beanstalk.
      The Weather during the Season Beans are sown determines the number
      of Pods received for each Bean sown. When the Bean supply increases,
      Pods become redeemable for &nbsp;
      <img
        style={{
          verticalAlign: 'middle',
          marginRight: '-1.5px',
          padding: '0 0 4px 0',
        }}
        height="17px"
        src={BeanLogo}
        alt="Beans"
      />
      1 each on a FIFO basis.
    </>
  );

  const descriptionLinks = [
    {
      href: `${MEDIUM_INTEREST_LINK}#0b33`,
      text: 'Read More',
    },
  ];

  return (
    <ContentSection id="field" title="Field" description={description} descriptionLinks={descriptionLinks}>
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(props.soil)} Soil`}
            description="Soil is the number of Beans that Beanstalk is currently willing to borrow. Anyone can lend any number of Beans up to the Available Soil in exchange for Pods."
            title="Available Soil"
            value={displayBN(props.soil)}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(props.unripenedPods)} Unharvestable Pods`}
            description="The Pod Line is the total number of Unharvestable Pods. This is the amount of debt Beanstalk has outstanding."
            title="Pod Line"
            value={displayBN(props.unripenedPods)}
          />
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(props.weather)}% Weather`}
            description="The Weather is the interest rate for sowing Beans. For a given Weather w, you receive w + 1 Pods for each Bean sown."
            title="Weather"
            value={`${props.weather.toFixed()}%`}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(props.harvestableIndex)} Harvested Pods`}
            description="The total Harvested Pods over all Seasons is the amount of debt Beanstalk has paid off thus far."
            title="Pods Harvested"
            value={displayBN(props.harvestableIndex)}
          />
        </Grid>
      </Grid>
      {apyField}
      <Grid
        container
        item
        xs={12}
        spacing={2}
        className="SiloSection"
        alignItems="flex-start"
        justifyContent="center"
        style={{ minHeight: '550px', height: '100%' }}
      >
        <Grid
          item
          md={6}
          sm={12}
          style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
        >
          <BaseModule
            section={0}
            sectionTitles={['']}
            sectionTitlesDescription={['']}
            showButton={false}
            removeBackground
            normalBox={false}
          >
            <FieldModule {...props} />
          </BaseModule>
        </Grid>
      </Grid>
    </ContentSection>
  );
}
