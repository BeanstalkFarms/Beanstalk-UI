import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import Plots from '../components/Plots';
import Pagination from '../components/Pagination';
import Updater from '../state/marketplace/updater';

export default function Marketplace() {
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  console.log('listings:', listings);

    const [plots, setPlots] = React.useState([{ placeInLine: 1200430000, pricePerPod: 0.21, amountPods: 1200430, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000434000, pricePerPod: 0.21, amountPods: 12004340, expiresIn: 1300000 }]);
    const [loading, setLoading] = React.useState(false);
    const [order, setOrder] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [plotsPerPage] = React.useState(4);
    const [plotPrice, setPlotPrice] = React.useState(0);
    const [pricePerPodInput, setPricePerPodInput] = React.useState(0);
    const indexOffLastPost = currentPage * plotsPerPage;
    const indexOfFirstPost = indexOffLastPost - plotsPerPage;
    const currentPlots = plots.slice(indexOfFirstPost, indexOffLastPost);

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

    const setPlotToSell = (pods) => {
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

    const OrderByPlace = () => {
      const sortPlots = [...plots];
      if (order) {
        sortPlots.sort((a, b) => b.placeInLine - a.placeInLine);
        setOrder(false);
      } else {
        sortPlots.sort((a, b) => a.placeInLine - b.placeInLine);
        setOrder(true);
      }

      setPlots(sortPlots);
    };

    const OrderByPods = () => {
      const sortPlots = [...plots];
      if (order) {
        sortPlots.sort((a, b) => b.amountPods - a.amountPods);
        setOrder(false);
      } else {
        sortPlots.sort((a, b) => a.amountPods - b.amountPods);
        setOrder(true);
      }
      setPlots(sortPlots);
    };

    const OrderByPrice = () => {
      const sortPlots = [...plots];
      if (order) {
        sortPlots.sort((a, b) => b.pricePerPod - a.pricePerPod);
        setOrder(false);
      } else {
        sortPlots.sort((a, b) => a.pricePerPod - b.pricePerPod);
        setOrder(true);
      }
      setPlots(sortPlots);
    };

    const OrderExpireDate = () => {
      const sortPlots = [...plots];
      if (order) {
        sortPlots.sort((a, b) => b.expiresIn - a.expiresIn);
        setOrder(false);
      } else {
        sortPlots.sort((a, b) => a.expiresIn - b.expiresIn);
        setOrder(true);
      }
      setPlots(sortPlots);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    React.useEffect(() => {
      setLoading(false);
      setShowModal(false);
    }, [plots, setPlots]);

    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px', margin: '20px' }}>
          <div>
            <p>My Plots</p>
          </div>
          <div>
            <table cellPadding={0} cellSpacing={0}>
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
                        <Button onClick={() => setPlotToSell(plot.amountPods)}>SELL</Button>
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
            <table cellPadding={0} cellSpacing={0}>
              <tr>
                <th><Button onClick={() => OrderByPlace()}>Place in Line</Button></th>
                <th><Button onClick={() => OrderByPrice()}>Price Per Pod</Button></th>
                <th><Button onClick={() => OrderByPods()}>Amount of pods</Button></th>
                <th><Button onClick={() => OrderExpireDate()}>Expires In</Button></th>
              </tr>
              {
                loading ?
                  <div>loading</div>
                  :
                  <Plots plots={currentPlots} loading={loading} />
              }
            </table>
          </div>
          <div>
            <Pagination plotsPerPage={plotsPerPage} totalPlots={plots.length} paginate={paginate} />
          </div>
        </div>
        {
          showModal ?
            <SellModal />
            :
            null
        }
        <Updater />
      </div>
    );
}
