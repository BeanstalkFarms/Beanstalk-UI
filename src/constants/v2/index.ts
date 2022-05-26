import Token from 'classes/Token';

export type ChainConstant<T> = { [chainId: number] : T }
export type TokenMap<T = Token> = ChainConstant<T>;
export type TokenOrTokenMap<T = Token> = T | TokenMap<T>;
export type TokensByAddress<T = Token> = { [address: string] : T };
