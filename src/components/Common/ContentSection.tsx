import { Grid, Box } from '@material-ui/core'
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
      return (<Box className={classes.sectionTitle}><TitleLabel size={props.size} textTransform={props.textTransform}>{props.title}</TitleLabel></Box>)
    }
  }

  return (
    <Box id={props.id} className='AppContent' style={props.style}>
      <Grid container spacing={3} className={classes.appSection} justifyContent='center'>
        { renderTitle() }
        {props.children}
      </Grid>
    </Box>
  )
}

ContentSection.defaultProps = {
  padding: '60px 30px',
  marginTop: '-28px',
  width: '100%'
}
