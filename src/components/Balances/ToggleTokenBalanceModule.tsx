import {
    Grid,
    TokenBalanceModule,
    UniswapAsset
  } from '../Common'
  
  export default function ToggleTokenBalanceModule(props) {
    return (
        props.balance > 0
      ? <Grid item xs={12} >
          <TokenBalanceModule
            {...props}
            swerve
          />
        </Grid>
      : null
    )
  }