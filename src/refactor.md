# Going multi-chain
- useContract pattern?
  - creates a new contract instance with a [signer or provider], see "withSignerIfPossible"
  - presence of a signer will change dynamically with the state of the application
- AddressMap mapping chainId => address
- Any address can be different
- Any token should be supportable by instantiating it with the right address and decimals
- Contracts should use type-safe generated code throughout the app
- The `Pool` can't know about the contract address until runtime, only the ABI
  - Instantiate multiple Pools
    - How expensive is it to instantiate more classes? Unlikely to be expensive enough to worry about right now given a small number of pools. 
  - Change the Pool instance address / target chain dynamically
- What's the clearest export structure for all of these constants?
- Signing txns can happen via a sep pattern like the *Utilities pattern
  - Could likely get rid of most of the boilerplate here

# Forms
- Formik
- Multiple token selector
- Calculating the amount out for multiple tokens across different Dex's
- Summing the BDV across those amountOuts
- Curve vs. Uniswap variance in logic - how to incorporate into the Pool class?
  - Force Pool to accept poolState?