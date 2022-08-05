export let getAccount = (account: string) => account.toLowerCase();

if (import.meta.env.NODE_ENV === 'development' 
    && import.meta.env.VITE_OVERRIDE_FARMER_ACCOUNT) {
      console.warn(
        `Using overridden Farmer account: ${import.meta.env.VITE_OVERRIDE_FARMER_ACCOUNT}`
      );
      getAccount = () => (import.meta.env.VITE_OVERRIDE_FARMER_ACCOUNT as string)!.toLowerCase();
    }
