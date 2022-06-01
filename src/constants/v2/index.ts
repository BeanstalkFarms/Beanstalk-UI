import Pool from 'classes/Pool';
import Token from 'classes/Token';

// --------------
// Reusable types
// --------------

/** A Map of SupportedChainId => any arbitrary type */
export type ChainConstant<T> = { [chainId: number] : T }
/** A Map of address => any arbitrary type. */
export type AddressMap<T>    = { [address: string] : T };

// --------------------
// Token-specific types
// --------------------
// By default these assume a type parameter of Token,
// but this can be narrowed to ERC20Token, etc.

/** A Map of SupportedChainId => Token */
export type TokenMap<T = Token>        = ChainConstant<T>;
/** A Token or TokenMap. */
export type TokenOrTokenMap<T = Token> = T | TokenMap<T>;
/** A Map of address => Token */
export type TokensByAddress<T = Token> = AddressMap<T>;

// -------------------
// Pool-specific types
// -------------------
// By default these assume a type parameter of Pool,
// but this can be narrowed.

/** A Map of address => Pool */
export type PoolsByAddress<P = Pool> = AddressMap<P>;
