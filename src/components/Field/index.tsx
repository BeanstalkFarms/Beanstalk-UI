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
            {`The Field is the Beanstalk credit facility. Anyone can lend Beans to Beanstalk anytime there is Available Soil by Sowing Beans in the Field in exchange for Pods. Pods are the debt asset of Beanstalk. The Weather at the time of the Sow determines amount of Pods received for each Bean Sown. When the Bean supply increases Pods become redeemable for 1 Bean each on a FIFO basis.`}
            <p><Link href={`https://medium.com/@BeanstalkFarms/earn-interest-from-beanstalk-just-the-basics-165a8cc5fecd#0b33`} target='blank'>{'Read More'}</Link>.</p>
          </Grid>
        </Grid>
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
            value={`${displayBN(props.weather)}%`}
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
