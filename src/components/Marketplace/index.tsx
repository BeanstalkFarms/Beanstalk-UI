import React from 'react';
import { Button } from '@material-ui/core';
import Plots from '../Plots';
import Pagination from '../Pagination';

export default function Marketplace() {
    const [plots] = React.useState([{ placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }]);
    const [loading, setLoading] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [currentPage] = React.useState(1);
    const [plotsPerPage] = React.useState(4);
    const [plotPrice, setPlotPrice] = React.useState(0);
    const [pricePerPodInput, setPricePerPodInput] = React.useState(0);
    const indexOffLastPost = currentPage * plotsPerPage;
    const indexOfFirstPost = indexOffLastPost - plotsPerPage;
    const CurrentPlots = plots.slice(indexOfFirstPost, indexOffLastPost);

    const showSellModal = () => {
      setShowModal(!showModal);
    };

    const handleChange = (event) => {
      setPricePerPodInput(event.target.value);
      setPlotPrice(0);
    };

    const sellPlot = () => {
      console.log('connect to metamask');
    };

    const setPlots = (pods) => {
      showSellModal();
      console.log(pods);
    };

    const SellModal = ({ pods }) => (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'rgb(0, 0, 0, 0.9)', zIndex: '99999', position: 'fixed', top: '0%', left: '0%', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px', margin: '20px' }}>
          <div>
            <p>SELLING</p>
          </div>
          <div>
            <p> {pods} x ${pricePerPodInput} =  {plotPrice} $BEAN</p>
          </div>
          <div>
            <table>
              <tr>
                <td><input onChange={(event) => handleChange(event)} /></td>
                <td><Button onclick={() => sellPlot()}>SELL</Button></td>
                <td><Button onClick={() => showSellModal()}>CANCEL</Button></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );

    React.useEffect(() => {
      setLoading(false);
      setShowModal(false);
    }, []);

    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px', margin: '20px' }}>
          <div>
            <p>My Plots</p>
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
                    <tr>
                      <td>{plot.placeInLine}</td>
                      <td>{plot.pricePerPod}</td>
                      <td>{plot.amountPods}</td>
                      <td>{plot.expiresIn}</td>
                      <td>
                        <Button onClick={() => setPlots(plot.amountPods)}>SELL</Button>
                      </td>
                    </tr>
                  ))
              }
            </table>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px', margin: '20px' }}>
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
                loading ?
                  <div>loading</div>
                  :
                  <Plots plots={CurrentPlots} loading={loading} />
              }
            </table>
          </div>
          <div>
            <Pagination plotsPerPage={plotsPerPage} totalPlots={plots.length} />
          </div>
        </div>
        {
          showModal ?
            <SellModal />
            :
            null
        }
      </div>
    );
}
