export let getAccount = (account: string) => account;

if (process.env.NODE_ENV === 'development' 
    && process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT) {
      console.warn(`Using overridden Farmer account: ${process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT}`);
      getAccount = (_) => (process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT as string);
    }