import React, { useCallback } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import sunIcon from '~/img/beanstalk/sun/sun-icon.svg';
import TransactionToast from 'components/Common/TxnToast';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useBeanstalkContract } from '~/hooks/useContract';
import { BeanstalkReplanted } from '~/generated/index';
import { useSigner } from '~/hooks/ledger/useSigner';
import { AppState } from '~/state';

const SunriseButton : React.FC = () => {
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  
  const awaiting = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['awaiting']>((state) => state._beanstalk.sun.sunrise.awaiting);

  ///
  const onSubmit = useCallback(async (_, formActions: FormikHelpers<{}>) => {
    const txToast = new TransactionToast({
      loading: 'Calling Sunrise...',
      success: 'The Sun has risen.',
    });

    ///
    beanstalk.sunrise()
      .then((txn) => {
        txToast.confirming(txn);
        return txn.wait();
      })
      .then((receipt) => {
        txToast.success(receipt);
        formActions.resetForm();
      })
      .catch((err) => {
        console.error(txToast.error(err.error || err));
      });
  }, [beanstalk]);
  return (
    <Formik initialValues={{}} onSubmit={onSubmit}>
      {(formikProps: FormikProps<{}>) => {
        const disabled = formikProps.isSubmitting || awaiting;
        return (
          <Form autoComplete="off">
            <LoadingButton
              loading={formikProps.isSubmitting}
              disabled={disabled}
              type="submit"
              variant="contained"
              color="light"
              sx={{
                backgroundColor: '#FBF2B9',
                borderColor: '#F7CF2D',
                height: { xs: '60px', md: '45px' },
                // borderWidth: 1,
                // borderStyle: 'solid',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: '#FBF2B9 !important',
                  opacity: 0.9
                }
              }}
              fullWidth
            >
              {!disabled ? (
                <>
                  <img src={sunIcon} alt="Sunrise" style={{ height: 28 }} />&nbsp;
                  Sunrise
                </>
              ) : (
                <>Sunrise Not Available</>
              )}
            </LoadingButton>
          </Form>
        );
      }}
    </Formik>
  );
};

export default SunriseButton;
