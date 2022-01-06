import BigNumber from 'bignumber.js';
import { account, beanstalkContract, txCallback } from './index';

export const depositBeans = async (amount, claimable, callback) => {
  console.log(claimable);
  (claimable
    ? beanstalkContract().claimAndDepositBeans(amount, claimable)
    : beanstalkContract().depositBeans(amount)
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const claimAndWithdrawBeans = async (
  crates,
  amounts,
  claimable,
  callback
) => {
  beanstalkContract()
    .claimAndWithdrawBeans(crates, amounts, claimable)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const withdrawBeans = async (crates, amounts, callback) => {
  beanstalkContract()
    .withdrawBeans(crates, amounts)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const claimBeans = async (withdrawals, callback) => {
  beanstalkContract()
    .claimBeans(withdrawals)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const depositLP = async (amount, claimable, callback) => {
  (claimable
    ? beanstalkContract().claimAndDepositLP(amount, claimable)
    : beanstalkContract().depositLP(amount)
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const addAndDepositLP = async (
  lp: BigNumber,
  buyBeanAmount: BigNumber,
  buyEthAmount: BigNumber,
  ethAmount: BigNumber,
  addLP,
  claimable,
  callback
) => {
  (claimable
    ? beanstalkContract().claimAddAndDepositLP(
        lp,
        buyBeanAmount,
        buyEthAmount,
        addLP,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().addAndDepositLP(
        lp,
        buyBeanAmount,
        buyEthAmount,
        addLP,
        { value: ethAmount }
      )
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const convertAddAndDepositLP = async (
  lp: BigNumber,
  ethAmount: BigNumber,
  addLP,
  crates,
  amounts,
  claimable,
  callback
) => {
  (claimable
    ? beanstalkContract().claimConvertAddAndDepositLP(
        lp,
        addLP,
        crates,
        amounts,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().convertAddAndDepositLP(lp, addLP, crates, amounts, {
        value: ethAmount,
      })
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const withdrawLP = async (crates, amounts, callback) => {
  beanstalkContract()
    .withdrawLP(crates, amounts)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const claimAndWithdrawLP = async (
  crates,
  amounts,
  claimable,
  callback
) => {
  beanstalkContract()
    .claimAndWithdrawLP(crates, amounts, claimable)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const removeAndClaimLP = async (
  withdrawals,
  minBeanAmount,
  minEthAmount,
  callback
) => {
  beanstalkContract()
    .removeAndClaimLP(withdrawals, minBeanAmount, minEthAmount)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const claimLP = async (withdrawals, callback) => {
  beanstalkContract()
    .claimLP(withdrawals)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const claim = async (claimable, toWallet = false, wrappedBeans = '0') => {
  if (wrappedBeans === '0') {
    beanstalkContract()
      .claim([...claimable, toWallet])
      .then((response) => {
        response.wait().then(() => {
          txCallback();
        });
      });
  } else {
    beanstalkContract()
      .claimAndUnwrapBeans([...claimable, toWallet], wrappedBeans)
      .then((response) => {
        response.wait().then(() => {
          txCallback();
        });
      });
  }
};

export const updateSilo = async () => {
  beanstalkContract()
    .updateSilo(account)
    .then((response) => {
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const buyAndDepositBeans = async (
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  callback
) => {
  (claimable
    ? beanstalkContract().claimBuyAndDepositBeans(
        amount,
        buyBeanAmount,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().buyAndDepositBeans(amount, buyBeanAmount, {
        value: ethAmount,
      })
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const convertDepositedBeans = async (beans, minLP, crates, amounts, callback) => {
  beanstalkContract()
    .convertDepositedBeans(beans, minLP, crates, amounts)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const convertDepositedLP = async (lp, minBeans, crates, amounts, callback) => {
  beanstalkContract()
    .convertDepositedLP(lp, minBeans, crates, amounts)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};
