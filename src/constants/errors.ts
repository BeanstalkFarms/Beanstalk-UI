import { errors } from "ethers";

export const NETWORK_ERRORS : { [key: string] : (err: any) => string } = {
  CALL_EXCEPTION: (err: errors.CALL_EXCEPTION) => {
    return err.method as string;
  }
}