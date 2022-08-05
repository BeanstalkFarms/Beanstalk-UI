import { Handler } from '@netlify/functions';
import { ethers } from 'ethers';
import { ERC20__factory } from 'generated';

const provider = new ethers.providers.AlchemyProvider(1, process.env.REACT_APP_ALCHEMY_API_KEY);
const address  = '0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab';
const bean     = ERC20__factory.connect(address, provider);

const handler: Handler = async () => {
  try {
    return {
      statusCode: 200,
      body: ethers.utils.formatUnits(await bean.totalSupply(), 6),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 403
    };
  }
};

export { handler };
