import React from 'react';
import BeanDeposit from "./Modules/BeanDeposit";
import { useParams } from "react-router-dom";
import { LPDeposit } from "./Modules/LPDeposit";
import CurveDeposit from "./Modules/CurveDeposit";

export default function Deposit() {
  const { tokenSlug } = useParams<{ tokenSlug: string }>();

  return (
    <>
      {tokenSlug === 'bean' ? (<BeanDeposit />) : null}
      {tokenSlug === 'bean-eth' ? (<LPDeposit />) : null}
      {tokenSlug === 'bean-3crv' ? (<CurveDeposit />) : null}
    </>
  );
}
