import { BeanstalkPrice__factory } from "constants/generated";
import { web3Signer } from "util/index";

export const BEANFTGENESIS = '0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79';
export const BEANFTCOLLECTION = '0x459895483556daD32526eFa461F75E33E458d9E9';
export const BEANSTALK = '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5';

export default class Contracts {
  static BeanstalkPrice = BeanstalkPrice__factory.connect(
    '0xd047408488aa48A31319265E9808D6c59Adb1E51',
    web3Signer,
  )
}
