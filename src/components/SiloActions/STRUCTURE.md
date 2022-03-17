"Module": creates a BaseModule with Sections to house Actions. Some Actions are only visible when the user has a certain balance, for example if the user has Claimable Beans then the Claim Action appears in the Bean Module.
"Action": contains the input/output fields, form handler logic (should be moved ASAP), txn details.

There are four types of action: Deposit, Withdraw, Claim, and Convert.

Not all tokens have each action.

`index.tsx`: wraps a TabbedForm containing Actions.
`Convert.tsx` => all Convert modules (`BeanConvert`, `LPConvert`).
`BeanConvert` => wraps the `BeanConvertAction`.
...etc.