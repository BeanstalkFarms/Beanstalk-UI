import { Link } from '@material-ui/core'
import { displayBN } from '../../util'
import { ContentSection, Grid, HeaderLabel } from '../Common'
import FieldModule from './FieldModule'

export default function Field(props) {
  const headerLabelStyle = {
    maxWidth: '300px',
  }

  return (
    <ContentSection id='field' title='Field'>
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid container item xs={12} spacing={3} justifyContent='center'>
          <Grid item xs={12} sm={12} style={{maxWidth: '500px', margin: '20px 0', padding: '12px'}}>
            {`The Field is the Beanstalk credit facility. Anyone can lend Beans to Beanstalk anytime there is Available Soil by sowing Beans in the Field in exchange for Pods. Pods are the debt asset of Beanstalk. The Weather of the Season Beans are sown determines the number of Pods received for each Bean sown. When the Bean supply increases, Pods become redeemable for Bean1 each on a FIFO basis.`}
            <p><Link href={`https://medium.com/@BeanstalkFarms/earn-interest-from-beanstalk-just-the-basics-165a8cc5fecd#0b33`} target='blank'>{'Read More'}</Link>.</p>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            description='Soil is the number of Beans that Beanstalk is currently willing to borrow. Anyone can lend any number of Beans up to the Available Soil in exchange for Pods.'
            title='Available Soil'
            value={displayBN(props.soil)}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description='The Pod Line is the total number of Unharvestable Pods. This is the amount of debt Beanstalk has issued.'
            title='Pod Line'
            value={displayBN(props.unripenedPods)}
          />
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description='The Weather is the interest rate for sowing Beans. For a given Weather w, you receive w + 1 Pods for each Bean sown.'
            title='Weather'
            value={`${displayBN(props.weather)}%`}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description='The total Harvested Pods over all Seasons. This is the amount of debt Beanstalk has paid off thus far.'
            title='Pods Harvested'
            value={displayBN(props.harvestableIndex)}
          />
        </Grid>
      </Grid>

      <Grid container item xs={12} justifyContent='center'>
        <Grid item sm={8} xs={10} style={{maxWidth: '500px', minHeight: '450px'}}>
          <FieldModule {...props} />
        </Grid>
      </Grid>
    </ContentSection>
  )
}
