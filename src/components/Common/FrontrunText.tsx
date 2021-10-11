import { Link } from '@material-ui/core'
import { SLIPPAGE_LINK } from '../../constants'

export default function FrontrunText(props) {
  const linkStyle = {
    color: 'red',
    fontFamily: 'Futura-PT-Book',
    fontSize: '12px',
    marginTop: '-9px',
  }
  const textStyle = {
    color: 'red',
    fontFamily: 'Futura-PT-Book',
    fontSize: '12px',
    marginTop: '-4px',
  }

  return (
    <div style={textStyle}>
      {'Your Transaction may be Frontrun. Consider Lowering Slippage Tolerance.'}
      <br/>
      <Link href={SLIPPAGE_LINK} target='blank' style={linkStyle} >
        Click Here to Learn More
      </Link>
      {'.'}
    </div>
  )
}
