import { BigNumber as EBN } from 'ethers';
import { AddDepositEvent, PlotTransferEvent, SowEvent } from 'constants/generated/Beanstalk/BeanstalkReplanted';
import { BEAN, ERC20_TOKENS } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import { HarvestEvent } from 'constants/generated/Beanstalk/Beanstalk';
import EventProcessor, { BN, EventProcessingParameters } from './EventProcessor';
import { TokenMap } from 'constants/index';

// ------------------------------------------

const Bean = BEAN[1];
const account = '0xFARMER';
const epp : EventProcessingParameters = {
  farmableBeans: BN(0),
  season: BN(6074),
  harvestableIndex: BN(100),  // fixme
  tokenMap: ERC20_TOKENS.reduce<TokenMap>((prev, curr) => {
    prev[curr[1].address] = curr[1];
    return prev;
  }, {}),
};

// ------------------------------------------

const propArray = (o: { [key: string] : any }) => 
  Object.keys(o).reduce((prev, key) => { 
    prev[prev.length] = o[key];
    prev[key] = o[key];
    return prev;
  }, [] as ((keyof typeof o)[] & typeof o));

const mockProcessor = () => new EventProcessor(account, epp);

// ------------------------------------------

describe('utilities', () => {
  it('builds an array with numerical and string keys', () => {
    const a = propArray({ index: 0, pods: 10 });
    expect(a[0]).toEqual(0);
    expect(a.index).toEqual(0);
    expect(a[1]).toEqual(10);
    expect(a.pods).toEqual(10);
  });
  it('converts ethers.BigNumber to BigNumber.js', () => {
    expect(BN(EBN.from(10))).toStrictEqual(new BigNumber(10));
  });
});

// ------------------------------------------

describe('the Field', () => {
  // 1.
  it('adds a single Plot', () => {
    const p = mockProcessor();
    p.ingest({
      event: 'Sow',
      args: propArray({
        index: EBN.from(10 * 10 ** Bean.decimals),
        pods:  EBN.from(42 * 10 ** Bean.decimals)
      })
    } as SowEvent);

    expect(Object.keys(p.plots).length === 1);
    expect(p.plots['10']).toStrictEqual(new BigNumber(42));
  });

  // 2.
  it('adds a single Plot and Harvests', () => {
    const p = mockProcessor();
    p.ingest({
      event: 'Sow',
      args: propArray({
        index: EBN.from(10 * 10 ** Bean.decimals),
        pods:  EBN.from(42 * 10 ** Bean.decimals)
      })
    } as SowEvent);
    p.ingest({
      event: 'Harvest',
      args: propArray({
        beans: EBN.from(5 * 10 ** Bean.decimals),
        plots: [EBN.from(10 * 10 ** Bean.decimals)]
      })
    } as HarvestEvent);

    expect(Object.keys(p.plots).length === 1);
    expect(p.plots['10']).toBeUndefined();
    expect(p.plots['15']).toStrictEqual(new BigNumber(42 - 5));

    p.ingest({
      event: 'Harvest',
      args: propArray({
        beans: EBN.from(37 * 10 ** Bean.decimals),
        plots: [EBN.from(15 * 10 ** Bean.decimals)]
      })
    } as HarvestEvent);

    expect(Object.keys(p.plots).length === 0);
    expect(p.plots['10']).toBeUndefined();
    expect(p.plots['15']).toBeUndefined();
  });

  // 3.
  it('sends a single Plot, full', () => {
    const p = mockProcessor();
    p.ingest({
      event: 'Sow',
      args: propArray({
        index: EBN.from(10 * 10 ** Bean.decimals),
        pods:  EBN.from(42 * 10 ** Bean.decimals)
      })
    } as SowEvent);
    p.ingest({
      event: 'PlotTransfer',
      args: propArray({
        from: '0xFARMER',
        to: '0xPUBLIUS',
        id: EBN.from(10 * 10 ** Bean.decimals),
        pods: EBN.from(42 * 10 ** Bean.decimals)
      })
    } as PlotTransferEvent);

    expect(Object.keys(p.plots).length).toBe(0);
  });

  // 4.
  it('sends a single Plot, partial (indexed from the front)', () => {
    const p = mockProcessor();
    p.ingest({
      event: 'Sow',
      args: propArray({
        index: EBN.from(10 * 10 ** Bean.decimals),
        pods:  EBN.from(42 * 10 ** Bean.decimals)
      })
    } as SowEvent);
    p.ingest({
      event: 'PlotTransfer',
      args: propArray({
        from: '0xFARMER',
        to:   '0xPUBLIUS',
        id:   EBN.from(10 * 10 ** Bean.decimals), // front of the Plot
        pods: EBN.from(22 * 10 ** Bean.decimals)  // don't send the whole Plot
      })
    } as PlotTransferEvent);

    // Since the Plot is sent from the front, index starts at 10 + 22 = 32.
    expect(Object.keys(p.plots).length).toBe(1);
    expect(p.plots[(10 + 22).toString()]).toStrictEqual(new BigNumber(42 - 22));
  });
});

// --------------------------------

describe('the Silo', () => {
  describe('depositing', () => {
    it('throws when processing unknown tokens', () => {
      const p = mockProcessor();
      expect(p.ingest({
        event: 'AddDeposit',
        args: propArray({
          token: '0xUNKNOWN',
        })
      } as AddDepositEvent)).toThrow();
    });
    it('adds a simple Bean deposit', () => {
      const p = mockProcessor();
      const t = Bean.address;
      p.ingest({
        event: 'AddDeposit',
        args: propArray({
          account,
          token:  t,
          season: EBN.from(6074),
          amount: EBN.from(1000*10**Bean.decimals), // Deposited 1,000 Bean
          bdv:    EBN.from(1000*10**Bean.decimals), 
        }),
      } as AddDepositEvent);

      //
      const deposit = p.deposits[t.toLowerCase()];
      expect(deposit);
      expect(deposit["6074"]).toStrictEqual({
        amount: BN(1000),
        bdv:    BN(1000),
      });
    });
  });
});


// const mockEvent = <T extends Event['args']>(name: string, args: T) => ({
//   // Used for event processing
//   event: name,
//   args: args,
//   // Mocked Ethereum event parameters
//   eventSignature: '',
//   blockNumber: 0,
//   blockHash: '0xBLOCKHASH',
//   transactionIndex: 0,
//   removed: false,
//   address: '0xADDRESS',
//   data: '0xDATA',
//   topics: ['0xTOPIC'],
//   transactionHash: '0xHASH',
//   logIndex: 0,
//   removeEventListener: () => {},
//   getBlock: () => {},
//   getTransaction: () => {},
//   getTransactionReceipt: () => {},
// })

// const mockProcessor = () => new EventProcessor('0xFARMER', epp);

// const propArray = <T extends Event>(o: { [key: string] : any }) => {
//   const v = Object.values(o) as Record<string | number, any>;
//   Object.keys(o).map((k) => { v[k] = o[k]; });
//   return v as T['args'];
// }