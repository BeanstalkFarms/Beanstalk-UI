import React from 'react';
import BigNumber from 'bignumber.js';
import { fundsList } from 'constants/index';
import { ContentSection, fundraiserStrings } from '../Common';
import FundsModule from './FundsModule';

export default function Fundraiser(props) {
  // const { innerWidth: width } = window;
  // const descriptionLinks = [
  //   {
  //     href: `${MEDIUM_INTEREST_LINK}#0b33`,
  //     text: 'Read More',
  //   },
  // ];

  const funds = (
    Object.keys(fundsList).map((id, item) => {
      const masterList = fundsList[item];
      const fundsRequired = new BigNumber(masterList.total);
      const fundsRemaining = new BigNumber(10); // remainaing usdc balance for audit

      const fundPercent = fundsRemaining.dividedBy(fundsRequired).multipliedBy(100);

      // added console.logs for testing

      // console.log(masterList.total);
      // console.log(masterList.token);
      // console.log(masterList.tokenNum);
      // console.log(masterList.address);
      // console.log(masterList.fundsAddress);
      // console.log(masterList.name);
      // console.log(masterList.description);
      return (
        <FundsModule
          key={item}
          fundsRemaining={fundsRemaining}
          fundsRequired={fundsRequired}
          address={masterList.address}
          fundsAddress={masterList.fundsAddress}
          fundPercent={fundPercent}
          description={masterList.description}
          title={masterList.name}
          asset={masterList.tokenNum}
          minHeight={fundsList.length - 1 === item ? '600px' : undefined}
          {...props}
        />
      );
    })
  );
  const activeFundraiser = true; // pull in similar to how bips are done (also in NavigationBar)

  if (activeFundraiser) {
    return (
      <ContentSection id="fund" title="Fundraiser" description={fundraiserStrings.fundsDescription}>
        {funds}
      </ContentSection>
    );
  }
  return null;
}
