import React from 'react';
import { Button } from '@material-ui/core';

export default function Marketplace() {
    const [plots] = React.useState([{ placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }]);
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px' }}>
          <div>
            <p>Plots</p>
          </div>
          <div>
            <table>
              <tr>
                <th>Place in Line</th>
                <th>Price Per Pod</th>
                <th>Amount of pods</th>
                <th>Expires In</th>
              </tr>
              {
                  plots.map((plot) => (
                    <tr style={{}}>
                      <td>{plot.placeInLine}</td>
                      <td>{plot.pricePerPod}</td>
                      <td>{plot.amountPods}</td>
                      <td>{plot.expiresIn}</td>
                      <td>
                        <Button onPress={() => alert('buy')}>buy</Button>
                      </td>
                    </tr>
                  ))
              }
            </table>
          </div>
          <Button onPress={() => alert('buy')}>Sell</Button>
        </div>
      </div>
    );
}
