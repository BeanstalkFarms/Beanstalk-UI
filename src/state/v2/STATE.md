`bean`: Bean token
- pools (keyed by pool address)
  - price
  - reserves
  - deltaB
  - totalCrosses
  - supply
- price: aggregate price

`beanstalk`: Beanstalk protocol
- field
- governance
- market
- silo
- sun
  - season

`farmer`: Active user
- allowances: ERC-20 token allowances
- balances: ERC-20 token balances
- events: Beanstalk events related to this farmer, used to calculate deposits etc.
- field
  - plots
  - harvestablePlots
- governance
- market
- nfts
- silo
  - tokens (keyed by tokenAddress)
    - circulating
    - wrapped
    - deposits
    - deposited
    - withdrawn
    - withdrawals
    - claimable
  - beans
  - stalk
  - seeds
  - roots