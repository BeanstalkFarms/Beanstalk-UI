import { makeStyles } from '@material-ui/styles'

export default function TitleLabel(props) {
  const classes = makeStyles(theme => ({
    label: {
      borderRadius: '15px',
      color: 'black',
      fontFamily: 'Futura-PT-Book',
      fontSize: props.size || '24px',
      margin: props.margin || '0',
      padding: props.padding || '5px',
      textTransform: props.textTransform
    }
  }))()

  return (
    <div className={classes.label} style={props.style}>
      {props.children}
    </div>
  )
}

TitleLabel.defaultProps = {
  textTransform: 'uppercase',
}
