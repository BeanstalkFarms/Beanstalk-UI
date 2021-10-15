import { useState } from 'react'
import { Box } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { UNISWAP_BASE_LP } from '../../constants'
import {
  BaseModule,
  ContentSection,
  ClaimableAsset,
  Grid,
  totalDescriptions,
  totalStrings,
  walletDescriptions,
  walletStrings
} from '../Common'
import ClaimableBalance from './ClaimableBalance'
import BalanceModule from './BalanceModule'

export default function Balances(props) {
  const balanceStyle = {
    borderRadius: '25px',
    color: 'primary',
    backgroundColor: '#F5FAFF',
    padding: '10px',
  }
  const divStyle = {
    fontSize: '18px',
    fontFamily: 'Futura-Pt-Book',
    marginTop: '13px',
    textTransform: 'uppercase',
  }
  const lineStyle = {
    color: 'primary',
    backgroundColor: 'primary',
    margin: '14px 4px 8px 4px',
  }

  const sectionTitles = ['My Balances', 'Beanstalk']
  const [section, setSection] = useState(0)
  const handleTabChange = (event, newSection) => { setSection(newSection) }

  const userLP = (
    props.lpBalance
      .plus(props.lpSiloBalance)
      .plus(props.lpTransitBalance)
      .plus(props.lpReceivableBalance)
  )
  const userBeans = (
    props.beanBalance
      .plus(props.beanSiloBalance)
      .plus(props.beanTransitBalance)
      .plus(props.beanReceivableBalance)
      .plus(props.harvestablePodBalance)
  )

  const userBeansAndEth = props.poolForLPRatio(userLP)
  const poolBeansAndEth = props.poolForLPRatio(props.totalLP)

  const userLPBeans = userBeansAndEth[0].multipliedBy(2)
  const userBalanceInDollars = userBeans.plus(userLPBeans).multipliedBy(props.beanPrice)

  const marketCap = (
    props.totalBeans.isGreaterThan(0)
      ? props.totalBeans.multipliedBy(props.beanPrice)
      : new BigNumber(0)
  )
  const poolMarketCap = (
    props.beanReserve.isGreaterThan(0)
      ? props.beanReserve.multipliedBy(props.beanPrice).multipliedBy(2)
      : new BigNumber(0)
  )

  const userTotalClaimable = (
    props.beanReceivableBalance
      .plus(props.harvestablePodBalance)
      .plus(props.lpReceivableBalance)
      .plus(props.claimableEthBalance)
  )

  const claimable = (
    userTotalClaimable.isGreaterThan(0)
      ? <Grid item xs={6}>
          <ClaimableBalance
            asset={ClaimableAsset.Ethereum}
            balance={props.claimableEthBalance}
            userClaimable={userTotalClaimable.isGreaterThan(0)}
            description={walletDescriptions.claimableEthBalance}
            claimable={props.claimable}
            {...props}
          />
        </Grid>
      : null
  )

  const farmable = (
    props.grownStalkBalance.isGreaterThan(0) || props.farmableBeanBalance.isGreaterThan(0) ||
    (props.stalkBalance.isGreaterThan(0) && props.rootsBalance.isEqualTo(0))
      ? <Grid item xs={6}>
          <ClaimableBalance
            asset={ClaimableAsset.Stalk}
            balance={props.rootsBalance.isEqualTo(0) ? new BigNumber(0) : props.grownStalkBalance}
            buttonDescription={'Farm Beans, Seeds and Stalk.'}
            claimTitle='FARM'
            description={'Stalk grown from previously claimed Seeds does not earn interest until it is farmed. Use this button to farm Grown Stalk.'}
            claimable={props.grownStalkBalance}
            userClaimable={props.grownStalkBalance.isGreaterThan(0)}
            widthTooltip='230px'
            {...props}
          />
          {props.rootsBalance.isEqualTo(0)
            ? <Box style={{width:'130%', marginLeft:'-15%'}}>
                You have not updated your Silo account since the last BIP has passed. Please click 'Farm' to update your Silo.
              </Box>
            : null
          }
        </Grid>
      : null
  )

  const myBalancesSection = (
    <>
    <BalanceModule
      description={walletDescriptions}
      strings={walletStrings}
      topLeft={userBalanceInDollars}
      topRight={props.rootsBalance.dividedBy(props.totalRoots).multipliedBy(100)}
      beanReserveTotal={new BigNumber(0)}
      beanLPTotal={userBeansAndEth}
      {...props}
    />

    <Grid container item justifyContent='center'>
      {claimable}
      {farmable}
    </Grid>
    </>
  )
  const totalBalancesSection = (
    <>
    <BalanceModule
      description={totalDescriptions}
      strings={totalStrings}
      beanBalance={
        props.totalBeans.isGreaterThan(0)
          ? props.totalBeans
              .minus(props.totalSiloBeans)
              .minus(props.totalTransitBeans)
              .minus(props.beanReserve)
          : new BigNumber(0)
      }
      lpBalance={
        props.totalLP.isGreaterThan(0)
          ? props.totalLP
              .minus(props.totalSiloLP)
              .minus(props.totalTransitLP)
              .minus(new BigNumber(UNISWAP_BASE_LP))
          : new BigNumber(0)
      }
      beanSiloBalance={props.totalSiloBeans}
      lpSiloBalance={props.totalSiloLP}
      beanTransitBalance={props.totalTransitBeans}
      lpTransitBalance={props.totalTransitLP}
      beanClaimableBalance={undefined}
      beanReceivableBalance={new BigNumber(0)}
      harvestablePodBalance={new BigNumber(0)}
      lpReceivableBalance={new BigNumber(0)}
      claimableEthBalance={new BigNumber(0)}
      beanReserveTotal={props.beanReserve}
      ethBalance={props.ethReserve}
      stalkBalance={props.totalStalk}
      seedBalance={props.totalSeeds}
      podBalance={props.totalPods}
      topLeft={marketCap}
      topRight={poolMarketCap}
      beanLPTotal={poolBeansAndEth}
      poolForLPRatio={props.poolForLPRatio}
    />
    </>
  )

  const sections = [myBalancesSection, totalBalancesSection]

  return (
    <ContentSection id='balances' title='Balances' size='20px' style={{marginTop: '-80px'}}>
      <Box className='BalanceSection-mobile'>
        <BaseModule
          handleForm={() => {}}
          handleTabChange={handleTabChange}
          section={section}
          sectionTitles={sectionTitles}
          showButton={false}
        >
          {sections[section]}
        </BaseModule>
      </Box>

      <Grid className='BalanceSection' container item spacing={8} justifyContent='center' alignItems='flex-start' style={{marginTop: '8px'}}>
        <Grid item sm={12} md={6} style={{maxWidth: '500px'}}>
          <Box className='AppBar-shadow' style={balanceStyle}>
            <Box style={divStyle}>My Balances </Box>
            <hr style={lineStyle} />
            {myBalancesSection}
          </Box>
        </Grid>

        <Grid item sm={12} md={6} style={{maxWidth: '500px'}}>
          <Box className='AppBar-shadow' style={balanceStyle}>
            <Box style={divStyle}>Beanstalk</Box>
            <hr style={lineStyle} />
            {totalBalancesSection}
          </Box>
        </Grid>
      </Grid>
    </ContentSection>
  )
}
