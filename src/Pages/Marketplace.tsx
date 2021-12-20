import React from 'react';
<<<<<<< HEAD:src/components/Marketplace/index.tsx
import { Button, Box, TextField } from '@material-ui/core';
import Plots from '../Plots';
import SellPlots from '../SellPlots';
import Pagination from '../Pagination';
import DropDown from '../DropDown';
=======
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import Plots from '../components/Plots';
import Pagination from '../components/Pagination';
import Updater from '../state/marketplace/updater';
>>>>>>> eb1295ba917e1c6382e993ca55390b7f48d2ebb9:src/Pages/Marketplace.tsx

export default function Marketplace() {
  // TODO: hook this up
  const { listings, buyOffers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  console.log('got listings, buyOffers:', listings, buyOffers);

    const [plots, setPlots] = React.useState([{ placeInLine: 1200430000, pricePerPod: 0.21, amountPods: 1200430, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 }, { placeInLine: 12000434000, pricePerPod: 0.21, amountPods: 12004340, expiresIn: 1300000 }]);
    const [loading, setLoading] = React.useState(false);
    const [order, setOrder] = React.useState(false);
    const [showFilter, setShowFilter] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [plotsPerPage] = React.useState(4);
    const [plotPrice, setPlotPrice] = React.useState(0);
    const [pricePerPodInput, setPricePerPodInput] = React.useState(0);
    const indexOffLastPost = currentPage * plotsPerPage;
    const indexOfFirstPost = indexOffLastPost - plotsPerPage;
    const currentPlots = plots.slice(indexOfFirstPost, indexOffLastPost);
    const [selectedValue, setSelectedValue] = React.useState('a');

    const smallLabels = {
      display: 'inline-block',
      fontFamily: 'Futura-PT-Book',
      fontSize: 'calc(9px + 0.7vmin)',
      marginLeft: '13px',
      textAlign: 'left' as const,
      textTransform: 'uppercase' as const,
      width: 'calc(100% - 13px)',
    };

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
      <div style={{ fontFamily: 'Futura-PT-Book', fontSize: 'calc(9px + 0.5vmin)', width: '100vw', height: '100vh', display: 'flex', background: 'rgb(0, 0, 0, 0.9)', zIndex: '99999', position: 'fixed', top: '0%', left: '0%', alignItems: 'center', justifyContent: 'center' }}>
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

    const toggleFilter = () => setShowFilter(!showFilter);

    const handleRadioChange = (event) => {
      setSelectedValue(event.target.value);
    };

    React.useEffect(() => {
      setLoading(false);
      setShowModal(false);
    }, [plots, setPlots]);

    return (
      <div style={{ fontFamily: 'Futura-PT-Book', fontSize: 'calc(9px + 0.5vmin)', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowX: 'hidden', overflowY: 'scroll', marginTop: '120px', paddingBottom: '100px' }}>
        <div style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px', margin: '20px' }}>
          <div>
            <Box style={smallLabels}>My Plots</Box>
          </div>
          <div>
            <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
              <tr style={{ borderBottom: '2px solid black' }}>
                <th>{' '}</th>
                <th><Button onClick={() => OrderByPlace()}>Place in Line</Button></th>
                <th><Button onClick={() => OrderByPrice()}>Price Per Pod</Button></th>
                <th><Button onClick={() => OrderByPods()}>Amount of pods</Button></th>
                <th><Button onClick={() => OrderExpireDate()}>Expires In</Button></th>
              </tr>
              {
                loading ?
                  <div>loading</div>
                  :
                  <SellPlots plots={plots} loading={loading} />
              }
            </table>
            <Button onClick={() => setPlotToSell(0)}>SELL</Button>
          </div>
        </div>

        <Box style={{ backgroundColor: 'rgb(255, 222, 151, 0.8)', padding: '20px', borderRadius: '20px', margin: '20px' }}>
          <div>
            <Box style={smallLabels}>Plots</Box>
          </div>
          <div style={{ fontFamily: 'Futura-PT-Book', fontSize: 'calc(9px + 0.5vmin)' }}>
            <Button onClick={() => toggleFilter()}>Filter</Button>
          </div>
          {
            showFilter ?
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <DropDown />
                <TextField
                  className="TextField-rounded"
                  variant="outlined"
                  type="text"
                  size="medium"
                  placeholder="0" />
              </div>
            :
            null
          }
          <div>
            <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
              <tr style={{ borderBottom: '2px solid black' }}>
                <th>{' '}</th>
                <th><Button onClick={() => OrderByPlace()}>Place in Line</Button></th>
                <th><Button onClick={() => OrderByPrice()}>Price Per Pod</Button></th>
                <th><Button onClick={() => OrderByPods()}>Amount of pods</Button></th>
                <th><Button onClick={() => OrderExpireDate()}>Expires In</Button></th>
              </tr>
              {
                loading ?
                  <div>loading</div>
                  :
                  <Plots selectedValue={selectedValue} plots={currentPlots} loading={loading} />
              }
            </table>
          </div>
          <div>
            <Button onClick={() => console.log('buy')}>BUY</Button>
          </div>
<<<<<<< HEAD:src/components/Marketplace/index.tsx
          <div>
            <Pagination handleRadioChange={handleRadioChange} plotsPerPage={plotsPerPage} totalPlots={plots.length} paginate={paginate} />
          </div>
        </Box>
        <>
          {
            showModal ?
              <SellModal />
              :
              null
          }
        </>
=======
        </div>
        {
          showModal ?
            <SellModal />
            :
            null
        }
        <Updater />
>>>>>>> eb1295ba917e1c6382e993ca55390b7f48d2ebb9:src/Pages/Marketplace.tsx
      </div>
    );
}
