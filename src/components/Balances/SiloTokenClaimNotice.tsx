// import React, { useMemo } from 'react';
// import { Box, Button, Stack, Typography } from '@mui/material';
// import { Link as RouterLink } from 'react-router-dom';
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';
// import { useSelector } from 'react-redux';
// import BigNumber from 'bignumber.js';
// import { BEAN } from '~/constants/tokens';
// import useWhitelist from '~/hooks/beanstalk/useWhitelist';
// import { BeanstalkPalette } from '../App/muiTheme';

// import Row from '../Common/Row';
// import { displayFullBN } from '~/util';
// import { AppState } from '~/state';
// import { NEW_BN, ZERO_BN } from '~/constants';
// import useGetChainToken from '~/hooks/chain/useGetChainToken';
// import { ERC20Token } from '~/classes/Token';
// import useSeason from '~/hooks/beanstalk/useSeason';

// const ARROW_CONTAINER_WIDTH = 20;

// type Claimable = {
//   total: BigNumber;
//   tokens: {
//     token: ERC20Token;
//     amount: BigNumber;
//   }[];
// };

// const SiloTokenClaimNotice: React.FC<{}> = () => {
//   // Chain Constants
//   const whitelist = useWhitelist();

//   // helpers
//   const getChainToken = useGetChainToken();
//   const bean = getChainToken(BEAN);
//   const currentSeason = useSeason();

//   // State
//   const balances = useSelector<
//     AppState,
//     AppState['_farmer']['silo']['balances']
//   >((state) => state._farmer.silo.balances);

//   const claimData = useMemo(() => {
//     const data = Object.values(whitelist).reduce<Record<string, Claimable>>(
//       (acc, token) => {
//         if (currentSeason === NEW_BN) return acc;
//         const balance = balances[token.address];
//         if (balance?.claimable?.amount?.gt(0)) {
//           const claimable = { ...acc.claimable };
//           claimable.total = (claimable.total || ZERO_BN).plus(
//             balance.claimable.amount
//           );
//           acc.claimable = {
//             ...claimable,
//             tokens: [
//               ...(claimable.tokens ?? []),
//               {
//                 token,
//                 amount: balance.claimable.amount,
//               },
//             ],
//           };
//         }

//         if (balance?.withdrawn?.amount?.gt(0)) {
//           const withdrawn = { ...acc.withdrawn };
//           balance?.withdrawn?.crates?.forEach((crate) => {
//             if (crate.season.minus(currentSeason).lte(1)) {
//               withdrawn.total = (withdrawn.total || ZERO_BN).plus(
//                 balance.withdrawn.amount
//               );
//               acc.withdrawn = {
//                 ...withdrawn,
//                 tokens: [
//                   ...(withdrawn.tokens ?? []),
//                   {
//                     token,
//                     amount: balance.withdrawn.amount,
//                   },
//                 ],
//               };
//             }
//           });
//         }
//         return acc;
//       },
//       {}
//     );
//     return { claimable: data?.claimable, withdrawn: data?.withdrawn };
//   }, [balances, currentSeason, whitelist]);

//   const canClaim = claimData?.claimable?.total?.gt(0);
//   const hasWithdrawn = claimData?.withdrawn?.total?.gt(0);

//   if (!canClaim && !hasWithdrawn) return null;

//   const claimHash =
//     claimData?.claimable?.tokens?.length === 1
//       ? claimData.claimable.tokens[0].token.address
//       : '';
//   const withdrawHash =
//     claimData?.withdrawn?.tokens?.length === 1
//       ? claimData?.withdrawn.tokens[0].token.address
//       : '';

//   const Claim = () => (
//     <Box width="100%">
//       <Button
//         component={RouterLink}
//         to={`/silo/${claimHash}`}
//         fullWidth
//         variant="outlined"
//         color="secondary"
//         size="large"
//         sx={{
//           textAlign: 'left',
//           px: 2,
//           py: 1.5,
//           backgroundColor: BeanstalkPalette.lightestBlue,
//           border: 0,
//           ':hover': {
//             backgroundColor: BeanstalkPalette.lightestBlue,
//             border: 0,
//           },
//         }}
//       >
//         <Row justifyContent="space-between" width="100%">
//           <Row gap={0.5}>
//             <img src={bean.logo} alt="bean" width="16px" height="16px" />
//             <Typography
//               component="span"
//               sx={{ color: BeanstalkPalette.nightBlue }}
//             >
//               {displayFullBN(
//                 claimData?.claimable?.total ?? ZERO_BN,
//                 bean.displayDecimals
//               )}
//             </Typography>
//             {claimData?.claimable?.tokens.length > 1 &&
//               claimData?.claimable?.tokens.map(({ token, amount }, i) => (
//                 <Row gap={0.5} key={token.symbol}>
//                   <img
//                     src={token.logo}
//                     alt={token.symbol}
//                     width="16px"
//                     height="16px"
//                   />
//                   <Typography sx={{ color: BeanstalkPalette.nightBlue }}>
//                     {displayFullBN(amount, token.displayDecimals)}
//                     {i !== claimData?.claimable?.tokens.length - 1 ? ', ' : ' '}
//                   </Typography>
//                 </Row>
//               ))}
//             <Typography sx={{ color: BeanstalkPalette.nightBlue }}>
//               Claimable from the Silo
//             </Typography>
//           </Row>
//           <Stack
//             display={{ xs: 'none', md: 'block' }}
//             sx={{ width: ARROW_CONTAINER_WIDTH }}
//             alignItems="center"
//           >
//             <ArrowRightIcon sx={{ color: BeanstalkPalette.nightBlue }} />
//           </Stack>
//         </Row>
//       </Button>
//     </Box>
//   );

//   const Withdrawn = () => (
//     <Box width="100%">
//       <Button
//         component={RouterLink}
//         to={`/silo/${withdrawHash}`}
//         fullWidth
//         variant="outlined"
//         color="secondary"
//         size="large"
//         sx={{
//           textAlign: 'left',
//           px: 2,
//           py: 1.5,
//           backgroundColor: BeanstalkPalette.lightYellow,
//           border: 0,
//           ':hover': {
//             backgroundColor: BeanstalkPalette.lightYellow,
//             border: 0,
//           },
//         }}
//       >
//         <Row justifyContent="space-between" width="100%">
//           <Row gap={0.5}>
//             <img src={bean.logo} alt="bean" width="16px" height="16px" />
//             <Typography sx={{ color: BeanstalkPalette.nightBlue }}>
//               {displayFullBN(
//                 claimData?.withdrawn?.total ?? ZERO_BN,
//                 bean.displayDecimals
//               )}{' '}
//               Withdrawn from the Silo and are Claimable at the beginning of next
//               Season.
//             </Typography>
//           </Row>
//           <Stack
//             display={{ xs: 'none', md: 'block' }}
//             sx={{ width: ARROW_CONTAINER_WIDTH }}
//             alignItems="center"
//           >
//             <ArrowRightIcon sx={{ color: BeanstalkPalette.theme.fall.brown }} />
//           </Stack>
//         </Row>
//       </Button>
//     </Box>
//   );

//   return (
//     <Stack spacing={1} width="100%">
//       <Claim />
//       <Withdrawn />
//     </Stack>
//   );
// };

// export default SiloTokenClaimNotice;
