import { useEffect, useState } from 'react';
import curve, { initCurve } from 'util/Curve';
import { useAccount, useProvider } from 'wagmi';
import useChainId from './useChain';

// class DebugProvider extends ethers.providers.ExternalProvider {
//   readonly provider: ethers.providers.BaseProvider;

//   constructor(provider: ethers.providers.BaseProvider) {
//     super(provider.getNetwork());
//     this.provider = provider;
//   }

//   // This should return a Promise (and may throw errors)
//   // method is the method name (e.g. getBalance) and params is an
//   // object with normalized values passed in, depending on the method
//   // perform(method: string, params: any): Promise<any> {
//   //   return this.provider.perform(method, params).then((result: any) => {
//   //     console.log('DEBUG', method, params, '=>', result);
//   //     return result;
//   //   }, (error: any) => {
//   //     console.log('DEBUG:ERROR', method, params, '=>', error);
//   //     throw error;
//   //   });
//   // }
// }

export default function useCurve() {
  const [_curve, setCurve] = useState<typeof curve | null>(null);
  // const chainId = useChainId();
  // const provider = useProvider();
  // const { data: address } = useAccount();
  
  // useEffect(() => {
  //   if (provider && address && chainId) {
  //     setCurve(null);
  //     console.debug(`[curve/use] initializing: `, chainId, provider, provider.network)
  //     initCurve(chainId)
  //       .then((c) => {
  //         console.debug(`[curve/use] initialized: `, c);
  //         setCurve(c);
  //       })
  //       .catch((e) => {
  //         console.error('[curve/use]', e);
  //       });
  //     }
  // }, [provider, address, chainId]);
  return _curve;
}
