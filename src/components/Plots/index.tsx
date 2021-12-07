import React from 'react';
import { Button } from '@material-ui/core';

const Plots = ({ plots }) => (
  <>
    {
      plots.map((plot: any) => (
        <tr>
          <td>{plot.placeInLine}</td>
          <td>{plot.pricePerPod}</td>
          <td>{plot.amountPods}</td>
          <td>{plot.expiresIn}</td>
          <td>
            <Button onPress={() => alert('buy')}>BUY</Button>
          </td>
        </tr>
      ))
    }
  </>
);

export default Plots;
