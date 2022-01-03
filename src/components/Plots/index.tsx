import React from 'react';
import Radio from '@material-ui/core/Radio';

const Plots = ({ plots, selectedValue, handleRadioChange }) => {
  const MoneyFormat = (labelValue: number) => (Math.abs(Number(labelValue)) >= 1.0e+9 ? `${Math.abs(Number(labelValue)) / 1.0e+9}B` : Math.abs(Number(labelValue)) >= 1.0e+6 ? `${Math.abs(Number(labelValue)) / 1.0e+6}M` : Math.abs(Number(labelValue)) >= 1.0e+3 ? `${Math.abs(Number(labelValue)) / 1.0e+3}K` : Math.abs(Number(labelValue)));
  return (
    <>
      {
      plots.map((plot: any) => (
        <tr key={plot.expiresIn} style={{ borderBottom: '1px solid black' }}>
          <td>
            <Radio name="radio-buttons" onChange={handleRadioChange} value={`${plot.placeInLine}`} color="default" checked={selectedValue === `${plot.placeInLine}`} />
          </td>
          <td>{MoneyFormat(plot.placeInLine)}</td>
          <td>${plot.pricePerPod}</td>
          <td>{plot.amountPods}</td>
          <td>{plot.expiresIn}</td>
        </tr>
      ))
    }
    </>
  );
};

export default Plots;
