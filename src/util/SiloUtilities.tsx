import BigNumber from 'bignumber.js';
import { account, beanstalkContract, txCallback } from './index';

export const depositBeans = async (
  amount,
  claimable,
  callback,
  completeCallback
) => {
  (claimable
    ? beanstalkContract().claimAndDepositBeans(amount, claimable)
    : beanstalkContract().depositBeans(amount)
  ).then((response) => {
    callback(response.hash);
    response.wait().then(() => {
      completeCallback();
      txCallback();
    });
  });
};

export const claimAndWithdrawBeans = async (
  crates,
  amounts,
  claimable,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .claimAndWithdrawBeans(crates, amounts, claimable)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const withdrawBeans = async (
  crates,
  amounts,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .withdrawBeans(crates, amounts)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const claimBeans = async (withdrawals, callback, completeCallBack) => {
  beanstalkContract()
    .claimBeans(withdrawals)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const depositLP = async (
  amount,
  claimable,
  callback,
  completeCallBack
) => {
  (claimable
    ? beanstalkContract().claimAndDepositLP(amount, claimable)
    : beanstalkContract().depositLP(amount)
  ).then((response) => {
    callback(response.hash);
    response.wait().then(() => {
      completeCallBack();
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
  callback,
  completeCallBack
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
    callback(response.hash);
    response.wait().then(() => {
      completeCallBack();
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
  callback,
  completeCallBack
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
    callback(response.hash);
    response.wait().then(() => {
      completeCallBack();
      txCallback();
    });
  });
};

export const withdrawLP = async (
  crates,
  amounts,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .withdrawLP(crates, amounts)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const claimAndWithdrawLP = async (
  crates,
  amounts,
  claimable,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .claimAndWithdrawLP(crates, amounts, claimable)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const removeAndClaimLP = async (
  withdrawals,
  minBeanAmount,
  minEthAmount,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .removeAndClaimLP(withdrawals, minBeanAmount, minEthAmount)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const claimLP = async (withdrawals, callback, completeCallBack) => {
  beanstalkContract()
    .claimLP(withdrawals)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const claim = async (claimable, completeCallBack, toWallet = false, wrappedBeans = '0') => {
  if (wrappedBeans === '0') {
    beanstalkContract()
      .claim([...claimable, toWallet])
      .then((response) => {
        response.wait().then(() => {
          completeCallBack();
          txCallback();
        });
      });
  } else {
    beanstalkContract()
      .claimAndUnwrapBeans([...claimable, toWallet], wrappedBeans)
      .then((response) => {
        response.wait().then(() => {
          completeCallBack();
          txCallback();
        });
      });
  }
};

export const updateSilo = async (completeCallBack) => {
  beanstalkContract()
    .updateSilo(account)
    .then((response) => {
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const buyAndDepositBeans = async (
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  callback,
  completeCallback
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
    callback(response.hash);
    response.wait().then(() => {
      completeCallback();
      txCallback();
    });
  });
};

export const convertDepositedBeans = async (
  beans,
  minLP,
  crates,
  amounts,
  callback,
  completeCallback
) => {
  beanstalkContract()
    .convertDepositedBeans(beans, minLP, crates, amounts)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallback();
        txCallback();
      });
    });
};

export const convertDepositedLP = async (
  lp,
  minBeans,
  crates,
  amounts,
  callback,
  completeCallback
) => {
  beanstalkContract()
    .convertDepositedLP(lp, minBeans, crates, amounts)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallback();
        txCallback();
      });
    });
};
