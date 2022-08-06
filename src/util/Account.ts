/// Default account getter
export let getAccount = (account: string) => account.toLowerCase();

/// Override if env var is provided.
export const IMPERSONATED_ACCOUNT = import.meta.env.VITE_OVERRIDE_FARMER_ACCOUNT;
if (import.meta.env.DEV && IMPERSONATED_ACCOUNT) {
  console.warn(`Using overridden Farmer account: ${IMPERSONATED_ACCOUNT}`);
  getAccount = () => ((IMPERSONATED_ACCOUNT as string).toLowerCase());
}
