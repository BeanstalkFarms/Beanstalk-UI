import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { TitleLabel } from './index'

export default function ContentSection(props) {
  const classes = makeStyles(({
    appSection: {
      padding: props.padding
    },
    sectionTitle: {
      marginTop: props.marginTop,
      width: props.width
    }
  }))()

  function renderTitle() {
    if (props.title !== undefined) {
      return (<div className={classes.sectionTitle}><TitleLabel size={props.size} textTransform={props.textTransform}>{props.title}</TitleLabel></div>)
    }
  }

  return (
    <div id={props.id} className='AppContent' style={props.style}>
      <Grid container spacing={3} className={classes.appSection} justifyContent='center'>
        { renderTitle() }
        {props.children}
      </Grid>
    </div>
  )
}

ContentSection.defaultProps = {
  padding: '60px 30px',
  marginTop: '-28px',
  width: '100%'
}
