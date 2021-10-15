import { Link } from '@material-ui/core';
import { displayBN } from '../../util';
import { MEDIUM_INTEREST_LINK } from '../../constants';
import BeanLogo from '../../img/bean-bold-logo.svg';
import { BaseModule, ContentSection, Grid, HeaderLabel } from '../Common';
import FieldModule from './FieldModule';

export default function Field(props) {
  const { innerWidth: width } = window;

  const headerLabelStyle = {
    maxWidth: '300px',
  };

  return (
    <ContentSection id="field" title="Field">
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid container item xs={12} spacing={3} justifyContent="center">
          <Grid
            className="section-description"
            item
            xs={12}
            sm={12}
            style={{ maxWidth: '500px', margin: '20px 0', padding: '12px' }}
          >
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
            1 each on a FIFO basis.{' '}
            <Link href={`${MEDIUM_INTEREST_LINK}#0b33`} target="blank">
              Read More
            </Link>
            .
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            description="Soil is the number of Beans that Beanstalk is currently willing to borrow. Anyone can lend any number of Beans up to the Available Soil in exchange for Pods."
            title="Available Soil"
            value={displayBN(props.soil)}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description="The Pod Line is the total number of Unharvestable Pods. This is the amount of debt Beanstalk has outstanding."
            title="Pod Line"
            value={displayBN(props.unripenedPods)}
          />
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description="The Weather is the interest rate for sowing Beans. For a given Weather w, you receive w + 1 Pods for each Bean sown."
            title="Weather"
            value={`${props.weather.toFixed()}%`}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description="The total Harvested Pods over all Seasons is the amount of debt Beanstalk has paid off thus far."
            title="Pods Harvested"
            value={displayBN(props.harvestableIndex)}
          />
        </Grid>
      </Grid>

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
