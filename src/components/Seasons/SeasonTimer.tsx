import { HeaderLabelWithTimer } from '../Common'
import { timeToString } from '../../util'

export default function SeasonTimer(props) {
  function display(time) {
    let timeDifference
    let title
    let description
    if (time <= 0) {
      timeDifference = -time
      title = 'Sunrise Overdue By'
      description = 'Time Sunrise Call is Overdue'
    }
    else {
      timeDifference = time
      title = 'Next Sunrise'
      description = 'Time Until the Next Sunrise Can Be Called'
    }

    return [title, timeToString(timeDifference), description]
  }

  return (
    <HeaderLabelWithTimer display={display} time={props.time} />
  )
}
