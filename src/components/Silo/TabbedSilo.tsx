import React, { useState } from 'react'
import { BaseModule, Grid } from '../Common'
import SiloBeanModule from './SiloBeanModule'
import SiloLPModule from './SiloLPModule'

export default function TabbedSilo(props) {
  const { innerWidth: width } = window

  const [section, setSection] = useState(0)
  const sectionTitles = ['LP', 'Beans']
  const sectionTitlesDescription = ['Use this tab to deposit, withdraw, and claim LP Tokens to and from the Silo.', 'Use this tab to deposit, withdraw, and claim Beans to and from the Silo.']
  const sections = [<SiloLPModule {...props} />, <SiloBeanModule {...props} />]

  return (
    <Grid container item xs={12} spacing={2} className='SiloSection' alignItems='flex-start' justifyContent='center' style={{minHeight: '550px', height: '100%'}}>
      <Grid item md={6} sm={12} style={width > 500 ? {maxWidth: '550px'} : {width: width - 64}}>
        <BaseModule
          handleTabChange={(event, newSection) => { setSection(newSection) }}
          section={section}
          sectionTitles={sectionTitles}
          sectionTitlesDescription={sectionTitlesDescription}
          showButton={false}
          removeBackground={true}
        >
          {sections[section]}
        </BaseModule>
      </Grid>
    </Grid>
  )
}
