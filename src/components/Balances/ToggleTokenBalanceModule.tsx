import { Grid, TokenBalanceModule } from '../Common'

  export default function ToggleTokenBalanceModule(props) {

    const toggleBalance = (
      props.balance > 0
        ? <Grid item xs={12}>
            <TokenBalanceModule swerve {...props} />
          </Grid>
        : null
    )

    return (toggleBalance)
  }
