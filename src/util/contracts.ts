// export const tokenContract = (token: SupportedToken) =>
//   new ethers.Contract(token.addr, beanAbi, web3Signer);

import { ethers } from "ethers";
import { web3Signer } from "util/index";

// export const tokenContractReadOnly = (token: SupportedToken) =>
//   new web3.eth.Contract(beanAbi, token.addr);

class Contracts {

  static Price = () => new ethers.Contract(
    '0xd047408488aa48A31319265E9808D6c59Adb1E51',
    require('constants/abi/BeanstalkUtilities.json'),
    web3Signer
  )

}

export default Contracts;