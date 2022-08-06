import { useAccount as useWagmiAccount } from 'wagmi';
import { getAccount } from '~/util';

export default function useAccount() {
  const { data: account } = useWagmiAccount();
  return account?.address && getAccount(account.address);
}
