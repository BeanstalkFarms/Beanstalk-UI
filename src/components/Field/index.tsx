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
    <div style={{maxWidth: '50%', margin: '20px 0'}}>
      {`The Field is the credit facility of Beanstalk. Users can purchase Beanstalk debt when there is Available Soil by "Sowing" Beans for Pods. Pods are the debt asset. The interest on Sowing is the Weather. Pods will be paid off when the TWAP > 1 for a Season on a First in First Out (FIFO) basis.`}
      <p>For more info, click <Link href={'https://google.com'} target='blank'>{' here'}</Link>.</p>
    </div>
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            description='Number of Beans that Can be Lent to Beanstalk'
            title='Available Soil'
            value={displayBN(props.soil)}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description='Total Unharvestable Pods'
            title='Pod Line'
            value={displayBN(props.unripenedPods)}
          />
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description='Interest Rate for Sowing Beans'
            title='Weather'
            value={`${props.weather.toFixed()}%`}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            description='Total Harvested Pods Over All Seasons'
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
