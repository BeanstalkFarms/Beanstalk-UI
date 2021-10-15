import { Box } from '@material-ui/core'
import { displayFullBN, TokenLabel } from '../../util'
import { FormatTooltip } from './index'

export default function BalanceField(props) {
  const title = (
    props.token !== undefined
      ? `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`
      : displayFullBN(props.balance)
  )

  return (
    <FormatTooltip title={title} placement='right'>
      <span>
        {props.content !== undefined
          ? props.content
          : (<Box style={style}>{props.balance}</Box>)
        }
      </span>
    </FormatTooltip>
  )
}
