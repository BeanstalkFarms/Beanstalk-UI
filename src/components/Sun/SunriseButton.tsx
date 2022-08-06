import React, { useCallback } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Box, Dialog, Divider, Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSigner } from '~/hooks/ledger/useSigner';
import { AppState } from '~/state';
import SunriseCountdown from '~/components/Sun/SunriseCountdown';
import useToggle from '~/hooks/display/useToggle';
import { useBeanstalkContract } from '~/hooks/useContract';
import TransactionToast from '~/components/Common/TxnToast';
import { StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import { BeanstalkPalette, IconSize } from '~/components/App/muiTheme';
import sunIcon from '~/img/beanstalk/sun/sun-icon.svg';

const SunriseButton : React.FC = () => {
  const theme = useTheme();
  /// Ledger
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);

  const [open, show, hide] = useToggle();
  const awaiting = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['awaiting']>((state) => state._beanstalk.sun.sunrise.awaiting);

  // const onSubmit = useCallback(async (_, formActions: FormikHelpers<{}>) => {
  //   const txToast = new TransactionToast({
  //     loading: 'Calling Sunrise...',
  //     success: 'The Sun has risen.',
  //   });
  //   beanstalk.sunrise()
  //     .then((txn) => {
  //       txToast.confirming(txn);
  //       return txn.wait();
  //     })
  //     .then((receipt) => {
  //       txToast.success(receipt);
  //       formActions.resetForm();
  //     })
  //     .catch((err) => {
  //       console.error(txToast.error(err.error || err));
  //     });
  // }, [beanstalk]);

  const onSubmit = useCallback(() => {
    const txToast = new TransactionToast({
      loading: 'Calling Sunrise...',
      success: 'The Sun has risen.',
    });
    beanstalk.sunrise()
      .then((txn) => {
        txToast.confirming(txn);
        return txn.wait();
      })
      .then((receipt) => {
        txToast.success(receipt);
        // formActions.resetForm();
      })
      .catch((err) => {
        console.error(txToast.error(err.error || err));
      });
  }, [beanstalk]);

  return (
    <>
      <Formik initialValues={{}} onSubmit={onSubmit}>
        {(formikProps: FormikProps<{}>) => {
          const disabled = formikProps.isSubmitting || awaiting;
          // const disabled = false;
          return (
            <Form autoComplete="off">
              <Dialog
                onClose={hide}
                open={open}
                PaperProps={{
                  sx: {
                    maxWidth: '350px'
                  }
                }}
              >
                <StyledDialogTitle onClose={hide}>
                  Confirm Sunrise
                </StyledDialogTitle>
                <StyledDialogContent sx={{ p: 2 }}>
                  <Stack gap={2}>
                    <Stack justifyContent="center" gap={2} py={2}>
                      <img src={sunIcon} alt="Sunrise" style={{ height: IconSize.large }} />
                      <Stack gap={1}>
                        <Stack direction="row" justifyContent="center">
                          <Typography variant="body1">Sunrise has been available for: </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="center">
                          <Typography variant="body1">Bean reward for calling <Box display="inline" sx={{ backgroundColor: BeanstalkPalette.lightYellow, borderRadius: 0.4, px: 0.4 }}><strong><Link color="text.primary" underline="none" href="https://docs.bean.money/additional-resources/glossary#sunrise">sunrise()</Link></strong></Box>:</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Typography sx={{ mx: 0 }} textAlign="center" variant="body1" color={BeanstalkPalette.washedRed}>Calling this function from the app is strongly discouraged because there is a high likelihood that your transaction will get front-run by bots.</Typography>
                    <LoadingButton
                      type="submit"
                      onClick={onSubmit}
                      loading={formikProps.isSubmitting}
                      disabled={disabled}
                      color="light"
                      sx={{
                        backgroundColor: BeanstalkPalette.washedRed,
                        // borderColor: '#F7CF2D',
                        height: { xs: '60px', md: '45px' },
                        // borderWidth: 1,
                        // borderStyle: 'solid',
                        color: BeanstalkPalette.white,
                        '&:hover': {
                          backgroundColor: `${BeanstalkPalette.washedRed} !important`,
                          opacity: 0.9
                        }
                      }}
                    >
                      Sunrise
                    </LoadingButton>
                  </Stack>
                </StyledDialogContent>
              </Dialog>
              <LoadingButton
                loading={formikProps.isSubmitting}
                disabled={disabled}
                variant="contained"
                onClick={show}
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
                {/* {awaiting ? ( */}
                {/*  'Awaiting Sunrise...' */}
                {/* ) : ( */}
                {/*  <>Sunrise available&nbsp;<span style={{ display: 'inline' }}><SunriseCountdown /></span></> */}
                {/* )} */}
                {!disabled ? (
                  <>
                    <img src={sunIcon} alt="Sunrise" style={{ height: 28 }} />&nbsp;
                    Sunrise
                  </>
                ) : (
                  <>Sunrise available&nbsp;<span style={{ display: 'inline' }}><SunriseCountdown /></span></>
                )}
              </LoadingButton>
            </Form>
          );
        }}
      </Formik>
    </>

  );
};

export default SunriseButton;
