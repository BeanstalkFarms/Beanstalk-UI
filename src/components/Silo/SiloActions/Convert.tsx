import React from 'react';
import { useParams } from 'react-router-dom';
import BeanConvert from './Modules/BeanConvert';
import LPConvert from './Modules/LPConvert';

export default function Convert() {
  const { tokenSlug } = useParams<{ tokenSlug: string }>();

  return (
    <>
      {tokenSlug === 'bean' ? (<BeanConvert />) : null}
      {tokenSlug === 'bean-eth' ? (<LPConvert />) : null}
    </>
  );
}
