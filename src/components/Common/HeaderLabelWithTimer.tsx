import { HeaderLabel } from './index'
import { timeToStringDetailed } from '../../util'

export default function HeaderLabelWithTimer(props) {
  const [title, value, description] = props.display(props.time)

  return (
    <HeaderLabel
      balanceDescription={timeToStringDetailed(props.time)}
      description={description}
      marginTooltip='0 0 0 10px'
      title={title}
      value={value}
    />
  )
}

HeaderLabelWithTimer.defaultProps = {
  display: (v) => { return ['', '', ''] }
}
