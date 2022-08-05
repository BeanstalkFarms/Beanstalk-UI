/// Default account getter
export let getAccount = (account: string) => account.toLowerCase();

/// Override if env var is provided.
const _account = import.meta.env.VITE_OVERRIDE_FARMER_ACCOUNT;
if (import.meta.env.DEV && _account) {
  console.warn(`Using overridden Farmer account: ${_account}`);
  getAccount = () => ((_account as string).toLowerCase());
}
