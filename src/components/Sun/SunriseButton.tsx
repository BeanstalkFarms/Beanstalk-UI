import React, { useCallback } from "react";
import { Button } from "@mui/material";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import sunIcon from 'img/beanstalk/sun/sun-icon.svg';
import { useBeanstalkContract } from "hooks/useContract";
import { BeanstalkReplanted } from "constants/generated";
import { useSigner } from "wagmi";
import TransactionToast from "components/Common/TxnToast";
import { LoadingButton } from "@mui/lab";

const SunriseButton : React.FC = () => {
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const onSubmit = useCallback(async (_, formActions: FormikHelpers<{}>) => {
    const txToast = new TransactionToast({
      loading: `Calling Sunrise...`,
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
  }, [beanstalk])
  return (
    <Formik initialValues={{}} onSubmit={onSubmit}>
      {(formikProps: FormikProps<{}>) => (
        <Form>
          <LoadingButton
            loading={formikProps.isSubmitting}
            disabled={formikProps.isSubmitting}
            type="submit"
            variant="contained"
            color="light"
            sx={{
              backgroundColor: '#FBF2B9',
              borderColor: '#F7CF2D',
              borderWidth: 1,
              borderStyle: 'solid',
              color: "text.primary"
            }}
            fullWidth
          >
            {!formikProps.isSubmitting && (
              <><img src={sunIcon} alt="Sunrise" style={{ height: 28 }} />&nbsp;</>
            )}Sunrise
          </LoadingButton>
        </Form>
      )}
    </Formik>
  )
}

export default SunriseButton;