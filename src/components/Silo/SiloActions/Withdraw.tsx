import React from 'react';
import { useParams } from "react-router-dom";
import BeanWithdraw from "./Modules/BeanWithdraw";
import LPWithdraw from "./Modules/LPWithdraw";
import CurveWithdraw from "./Modules/CurveWithdraw";

export default function Deposit() {
  const { tokenSlug } = useParams<{ tokenSlug: string }>();

  return (
    <>
      {tokenSlug === 'bean' ? (<BeanWithdraw />) : null}
      {tokenSlug === 'bean-eth' ? (<LPWithdraw />) : null}
      {tokenSlug === 'bean-3crv' ? (<CurveWithdraw />) : null}
    </>
  );
}
