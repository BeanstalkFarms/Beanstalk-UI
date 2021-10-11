import { Link } from '@material-ui/core'
import { ContentSection } from '../Common'
import TabbedSilo from './TabbedSilo'

export default function Silo(props) {
  return (
    <ContentSection id='silo' title='Silo'>
      <div style={{maxWidth: '50%', margin: '20px 0'}}>
        {`The Silo is the Beanstalk DAO and savings account. Users can deposit assets in the Silo to earn ownership (Stalk) and interest (Beans). When the TWAP > 1 for a Season, 50% of new Beans are distributed to Stalk holders in proportion to their Stalk ownership of the Silo.`}
        <p>For more info, click <Link href={'https://google.com'} target='blank'>{' here'}</Link>.</p>
      </div>
      <TabbedSilo {...props} />
    </ContentSection>
  )
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0'
}
