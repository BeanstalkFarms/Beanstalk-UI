import React from 'react';

export const EXAMPLE_TOOLTIP = '';
export const UNRIPE_ASSET_TOOLTIPS : { [key: string]: string | React.ReactElement } = {
  // Beans
  circulatingBeans: 'Beans that were in Farmers\' wallets.',
  withdrawnBeans:   'Beans that were Withdrawn from the Silo. This includes "Withdrawn" and "Claimable" Beans shown on the old Beanstalk UI.',
  harvestableBeans: 'Beans from Harvestable Pods that weren\'t yet Harvested.',
  orderedBeans:     'Beans that were stored in Pod Orders.',
  farmableBeans:    (
    <>Previously called <em>Farmable Beans</em> — Bean seignorage in the Silo that had not yet been Deposited in a particular Season.</>
  ),
  wrappedBeans:     'Beans that were stored in Beanstalk but not Deposited.',
  // LP
  circulatingBeanEthLp:   'BEAN:ETH LP tokens that were in Farmers\' wallets. The number of tokens and associated BDV are shown.',
  circulatingBeanLusdLp:  'BEAN:LUSD LP tokens that were in Farmers\' wallets. The number of tokens and associated BDV are shown.',
  circulatingBean3CrvLp:  'BEAN:3CRV LP tokens that were in Farmers\' wallets. The number of tokens and associated BDV are shown.',
  withdrawnBeanEthLp:     'BEAN:ETH LP tokens that were Withdrawn from the Silo. The number of tokens and associated BDV are shown. This includes "Withdrawn" and "Claimable" BEAN:ETH tokens shown on the old Beanstalk UI.',
  withdrawnBeanLusdLp:    'BEAN:LUSD LP tokens that were Withdrawn from the Silo. The number of tokens and associated BDV are shown. This includes "Withdrawn" and "Claimable" BEAN:LUSD tokens shown on the old Beanstalk UI.',
  withdrawnBean3CrvLp:    'BEAN:3CRV LP tokens that were Withdrawn from the Silo. The number of tokens and associated BDV are shown. This includes "Withdrawn" and "Claimable" BEAN:3CRV tokens shown on the old Beanstalk UI.',
  // circulatingBeanEthBdv: 'TODO: add tooltip in constants/tooltips.ts',
  // circulatingBeanLusdBdv: 'TODO: add tooltip in constants/tooltips.ts',
  // circulatingBean3CrvBdv: 'TODO: add tooltip in constants/tooltips.ts',
  // withdrawnBeanEthBdv: 'TODO: add tooltip in constants/tooltips.ts',
  // withdrawnBeanLusdBdv: 'TODO: add tooltip in constants/tooltips.ts',
  // withdrawnBean3CrvBdv: 'TODO: add tooltip in constants/tooltips.ts',
};
