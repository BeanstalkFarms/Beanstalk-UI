import { Link } from '@material-ui/core'
import { ContentSection, Grid, HeaderLabel } from '../Common'
import TradeModule from './TradeModule'
import LastCrossTimer from './LastCrossTimer'

export default function Trade(props) {

  return (
    <ContentSection id='trade' title='Trade'>
      <div style={{maxWidth: '50%', margin: '20px 0'}}>
        {`Users can buy and sell Beans`}
        <p>For more info, click <Link href={'https://google.com'} target='blank'>{' here'}</Link>.</p>
      </div>
      <Grid container item xs={12} sm={12} spacing={3} justifyContent='center'>
        <Grid item xs={12} sm={6} style={{maxWidth: '300px'}}>
          <HeaderLabel
            title='Current Bean Price'
            value={`$${props.beanPrice.toFixed(4)}`}
            description='Current Bean Price on Uniswap'
          />
        </Grid>
        <Grid item xs={12} sm={6} style={{maxWidth: '300px'}}>
          <LastCrossTimer lastCross={props.lastCross}/>
        </Grid>
      </Grid>

      <Grid item xs={10} sm={8} style={{maxWidth: '500px', minHeight: '545px'}}>
        <TradeModule {...props} />
      </Grid>

    </ContentSection>
  )
}
