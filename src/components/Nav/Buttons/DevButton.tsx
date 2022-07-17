import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { BeanstalkReplanted } from 'generated';
import { useBeanstalkContract } from 'hooks/useContract';
import CachedIcon from '@mui/icons-material/Cached';
import { getAccount } from 'util/Account';
import { useAccount } from 'wagmi';
import { ERC20_TOKENS } from 'constants/tokens';
import useTokenMap from 'hooks/useTokenMap';
import { toTokenUnitsBN } from 'util/Tokens';

export default function DevButton(props: any) {
  const b = useBeanstalkContract() as unknown as BeanstalkReplanted;
  const { data: account } = useAccount();
  const erc20Tokens = useTokenMap(ERC20_TOKENS);
  const tokenAddresses = Object.keys(erc20Tokens);

  const onClick = useCallback(async () => {
    if (account?.address) {
      const address = getAccount(account?.address);
      console.log(
        'getAllBalances',
        await b.getAllBalances(address, tokenAddresses).then((results) =>
          results.reduce((prev, val, i) => {
            const tok = erc20Tokens[tokenAddresses[i]];
            prev[tok.name] = {
              internalBalance: toTokenUnitsBN(
                val.internalBalance.toString(),
                tok.decimals
              ).toFixed(),
              externalBalance: toTokenUnitsBN(
                val.externalBalance.toString(),
                tok.decimals
              ).toFixed(),
              totalBalance: toTokenUnitsBN(
                val.totalBalance.toString(),
                tok.decimals
              ).toFixed(),
            };
            return prev;
          }, {} as { [key: string]: any })
        )
      );
    }
  }, [account, erc20Tokens, tokenAddresses, b]);

  return (
    <Button
      color="light"
      variant="contained"
      onClick={onClick}
      sx={props.sx as any}
    >
      <CachedIcon />
    </Button>
  );
}
