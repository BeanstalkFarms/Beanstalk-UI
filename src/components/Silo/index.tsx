import { Link } from '@material-ui/core'
import { MEDIUM_INTEREST_LINK } from '../../constants'
import { ContentSection } from '../Common'
import TabbedSilo from './TabbedSilo'

export default function Silo(props) {
  const { innerWidth: width } = window

  return (
    <ContentSection id='silo' title='Silo'>
      <div style={width > 500 ? {maxWidth: '550px', margin: '20px 0 0 0', padding: '12px'} : {width: width - 64, margin: '20px 0', padding: '12px'}}>
        {`The Silo is the Beanstalk DAO. Silo Members earn passive interest during Bean supply increases. Anyone can become a Silo Member by Depositing Beans or LP Tokens for the BEAN:ETH Uniswap pool in the Silo module below in exchange for Stalk and Seeds. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. The Seed token yields .0001 Stalk every Season. No action is ever required of Silo Members. All Stalk and Seeds associated with a Deposit are forfeited upon Withdrawal. All Withdrawals are frozen for 24 full Seasons.`}
        <p><Link href={`${MEDIUM_INTEREST_LINK}#8b79`} target='blank'>{'Read More'}</Link>.</p>
      </div>
      <TabbedSilo {...props} />
    </ContentSection>
  )
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0'
}
