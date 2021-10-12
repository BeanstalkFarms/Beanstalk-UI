import { ContentSection } from '../Common'
import Charts from '../Charts'
import Seasons from '../Seasons'
import NFTs from '../NFT'
import Governance from '../Governance'

import Balances from '../Balances'

export default function Analytics(props) {

  return (
    <>
    <ContentSection id='analytics' title='Analytics'>
      <Balances {...props} />
      <Charts />
      <NFTs {...props} />
      <Seasons {...props} />
    </ContentSection>
    <Governance
      key='governance'
      bips={props.bips}
      season={props.season}
      totalStalk={props.totalRoots}
      userStalk={props.userStalk}
      votedBips={props.votedBips}
    />
    </>
  )
}
