import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { BaseModule, Grid, siloStrings } from 'components/Common';
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import Convert from "./Convert";
import { useParams } from "react-router-dom";

export default function TabbedForm() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const { tokenSlug } = useParams<{ tokenSlug: string }>();

  const [section, setSection] = useState(0);
  const sectionTitlesDescription = [
    siloStrings.lpDescription,
    siloStrings.beanDescription,
    siloStrings.convert,
  ];
  // const sections = [<SiloSelectLPModule />, <SiloBeanModule />, <SiloConvertModule />];
  //                    LP             BEANS              CONVERT
  const sections = [<Deposit />, <Withdraw />, <Convert />];

  const sectionTitles = (tokenSlug === "bean-3crv") ? (
      ['deposit', 'withdraw']
  ) : (
      ['deposit', 'withdraw', 'convert']
  );


  return (
    <Grid
      container
      item
      xs={12}
      spacing={2}
      className="SiloSection"
      alignItems="flex-start"
      justifyContent="center"
    >
      <Grid
        item
        md={6}
        sm={12}
        style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
      >
        <BaseModule
          handleTabChange={(event, newSection) => {
            setSection(newSection);
          }}
          section={section}
          sectionTitles={sectionTitles}
          sectionTitlesDescription={sectionTitlesDescription}
          showButton={false}
          removeBackground
        >
          {sections[section]}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
