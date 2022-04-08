import React from 'react';
import { useParams } from 'react-router-dom';
import BeanDeposit from './Modules/BeanDeposit';
import { LPDeposit } from './Modules/LPDeposit';
import CurveDeposit from './Modules/CurveDeposit';
import BeanlusdDeposit from './Modules/BeanlusdDeposit';

export default function Deposit() {
  const { tokenSlug } = useParams<{ tokenSlug: string }>();

  return (
    <>
      {tokenSlug === 'bean' ? (<BeanDeposit />) : null}
      {tokenSlug === 'bean-eth' ? (<LPDeposit />) : null}
      {tokenSlug === 'bean-3crv' ? (<CurveDeposit />) : null}
      {tokenSlug === 'bean-lusd' ? (<BeanlusdDeposit />) : null}
    </>
  );
}
