import React from 'react';
import { Page } from 'Pages/index';
import SiloTransaction from 'components/Silo/SiloActions';
import { Redirect, useParams } from 'react-router-dom';
import TOKENS from 'constants/siloTokens';

export default function SiloDepositPage(props) {
  const { tokenSlug } = useParams<{ tokenSlug: string }>();
  const sections = [<SiloTransaction />];
  const tokenData = TOKENS.filter((token) => token.slug === tokenSlug)[0];
  const sectionTitles = [(tokenData === undefined) ? 'Silo' : `${tokenData.name} Silo`];

  // this token doesn't exist
  if (tokenData === undefined) {
    return <Redirect to={"/silo"} />
  }
  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      noRedirect
      sectionNumber={props.sectionNumber}
    />
  );
}
