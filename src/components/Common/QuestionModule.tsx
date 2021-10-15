import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { FormatTooltip } from './index'

export default function QuestionModule(props) {
  const questionStyle = {
    display: 'inline-block',
    margin: props.margin,
    position: props.position !== undefined ? props.position : 'absolute',
    ...props.style,
  }

  const [show, setShow] = useState(false)

  return (
    <Box style={questionStyle}>
      <FormatTooltip
        margin={props.marginTooltip}
        placement={props.placement !== undefined ? props.placement : 'top-start'}
        title={props.description}
        width={props.widthTooltip}
        disableHoverListener
        open={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <HelpOutlineIcon style={{fontSize: '8px'}} width='100%' />
      </FormatTooltip>
    </Box>
  )
}
