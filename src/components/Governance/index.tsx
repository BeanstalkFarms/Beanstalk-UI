import { ContentSection, Grid } from '../Common'
import GovernanceTable from './GovernanceTable'
import Vote from './Vote'

export default function Governance(props) {
  if (props.bips === undefined || props.bips.length === 0)
    return null

  const activeBipStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '16px',
    marginTop: '10px',
    width: '100%',
  }

  const activeBips = props.bips.reduce((aBips,bip) => {
    if (bip.active) aBips.push(bip.id.toString())
    return aBips
  }, [])
  const votedBips = activeBips.reduce((vBips, bip) => {
    vBips[bip] = props.votedBips.has(bip)
    return vBips
  }, {})
  const stalkBips = activeBips.reduce((sBips, bip) => {
    sBips[bip] = props.bips[bip].roots
    return sBips
  }, {})
  const seasonBips = activeBips.reduce((sBips, bip) => {
    sBips[bip] = props.bips[bip].period.minus(props.season.minus(props.bips[bip].start))
    return sBips
  }, {})

  const voteField = (
    activeBips.length > 0
      ? <Grid item md={6} xs={12} style={{maxWidth: '550px', margin: 'auto'}}>
          <Vote
            bips={activeBips}
            seasonBips={seasonBips}
            stalkBips={stalkBips}
            totalStalk={props.totalStalk}
            userStalk={props.userStalk}
            votedBips={votedBips}
          />
        </Grid>
      : <div style={activeBipStyle}>No Active BIPs</div>
  )

  return (
    <ContentSection id='governance' title='Governance' size='20px'>
      <Grid container item sm={12} xs={12} alignItems='flex-start' justifyContent='center' style={{minHeight: '200px'}}>
        <Grid item xs={12}>
          {voteField}
        </Grid>
        <Grid item xs={12}>
          <GovernanceTable {...props} style={{maxWidth: '745px', margin: '0 auto'}} />
        </Grid>
      </Grid>
    </ContentSection>
  )
}
