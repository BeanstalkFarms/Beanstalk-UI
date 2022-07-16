import BigNumber from "bignumber.js";
import { AddressMap } from "constants/index";

export type Unripe = {
  penalties: AddressMap<BigNumber>;
}