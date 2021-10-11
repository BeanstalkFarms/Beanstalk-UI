import { FormControlLabel, Switch } from '@material-ui/core/'
import { withStyles } from'@material-ui/styles'
import { QuestionModule } from './index'

export default function SwitchModule(props) {
  const switchStyle = {
    display: 'inline-block',
    justifyContent: 'flex-start',
    marginBottom: '-8px',
    marginLeft: '0px',
    width: '100%',
  }

  const GreenSwitch = withStyles({
    switchBase: {
      '&$checked': {
        color: 'rgb(14, 136, 55)',
      },
      '&$checked + $track': {
        backgroundColor: 'rgb(14, 136, 55)',
      },
    },
    checked: {},
    track: {},
  })(Switch)

  const GreenFormControlLabel = withStyles({
    label:{
      fontFamily: 'Futura-PT-Book',
      fontSize: '9px',
      marginBottom: '-10px',
      marginLeft: '0',
      marginTop: '3px',
      width: '100%',
    }
  })(FormControlLabel)

  const changeHandler = (event) => props.setValue(event.target.checked)

  return (
    <div style={{display: 'flex', position: 'relative'}}>
      <div style={switchStyle}>
        <GreenFormControlLabel
          checked={props.value}
          control={<GreenSwitch />}
          disabled={props.disabled}
          label={props.label}
          onChange={changeHandler}
          style={{flexDirection: 'column-reverse', marginLeft: '0', width: '100%'}}
        />
        <QuestionModule
          description={props.description}
          margin={props.margin}
          marginTooltip={props.marginTooltip}
        />
      </div>
    </div>
  )
}

SwitchModule.defaultProps = {
  disabled: false,
  margin: '-50px 0px 0px 15px',
  marginTooltip: '0px 0 5px 10px',
}
