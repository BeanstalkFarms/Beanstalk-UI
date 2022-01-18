import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { GetWalletAddress } from 'util/index';

import SellIntoOfferModal from 'components/Marketplace/Offers/SellIntoOfferModal';
import OffersTable from './OffersTable';

type OffersProps = {
  mode: 'ALL' | 'MINE';
}

/**
 * Offers ("Offers to Buy")
 */
export default function Offers(props: OffersProps) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);
  const { buyOffers: allOffers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  // FIXME: can we offload this to the main site initializer?
  useEffect(() => {
    const init = async () => {
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (allOffers == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  if (allOffers.length === 0) {
    return <div>No offers.</div>;
  }

  const offers = props.mode === 'MINE' ? (
    allOffers.filter((offer) => offer.listerAddress === walletAddress)
  ) : (
    allOffers.filter((offer) => offer.listerAddress !== walletAddress)
  );

  return (
    <>
      <SellIntoOfferModal
        currentOffer={currentOffer}
        onClose={() => setCurrentOffer(null)}
      />
      <OffersTable
        mode={props.mode}
        offers={offers}
        setCurrentOffer={setCurrentOffer}
      />
    </>
  );
}
