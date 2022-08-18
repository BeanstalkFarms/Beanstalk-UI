import { Box, Button, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { useParams } from 'react-router-dom';
import snapshot from '@snapshot-labs/snapshot.js';
import { Wallet } from 'ethers';
import BigNumber from 'bignumber.js';
import useAccount from '~/hooks/ledger/useAccount';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import { ProposalDocument } from '~/generated/graphql';
import DescriptionButton from '~/components/Common/DescriptionButton';
import { useSigner } from '~/hooks/ledger/useSigner';
import { displayBN } from '~/util';
import TransactionToast from '~/components/Common/TxnToast';

type VoteFormValues = {
  option: number | undefined;
};

const VoteForm: React.FC<FormikProps<VoteFormValues> & {
  proposal: any;
}> = ({
  values,
  setFieldValue,
  proposal,
}) => {
  /// Loading
  if (proposal === undefined) {
    return (
      <Box height={100} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  /// Time
  const today   = new Date();
  const endDate = new Date(proposal.end * 1000);
  const differenceInTime = endDate.getTime() - today.getTime();

  /// Option isn't selected or the voting period has ended
  const disableSubmit = (values.option === undefined) || differenceInTime <= 0;

  return (
    <Form autoComplete="off">
      <Stack gap={1}>
        {/* progress bars */}
        <Stack px={1} pb={1} gap={1}>
          {proposal.choices.map((choice: string, index: number) => (
            <Stack gap={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1">{choice}</Typography>
                <Typography variant="body1">
                  {displayBN(new BigNumber(proposal.scores[index]))} STALK
                  <Typography
                    display={proposal.scores_total > 0 ? 'inline' : 'none'}>• {((proposal.scores[index] / proposal.scores_total) * 100).toFixed(2)}%
                  </Typography>
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={proposal.scores_total > 0 ? (proposal.scores[index] / proposal.scores_total) * 100 : 0}
                sx={{ height: '10px', borderRadius: 1 }}
              />
            </Stack>
          ))}
        </Stack>
        {proposal.type === 'single-choice' ? (
          <>
            <Field name="option">
              {(fieldProps: FieldProps<any>) => {
                const set = (v: any) => () => {
                  // if user clicks on the selected action, unselect the action
                  if (fieldProps.form.values.option !== undefined && v === fieldProps.form.values.option) {
                    fieldProps.form.setFieldValue('option', undefined);
                  } else {
                    fieldProps.form.setFieldValue('option', v);
                  }
                };
                return (
                  <Stack gap={1}>
                    {proposal.choices.map((choice: string, index: number) => (
                      <DescriptionButton
                        key={index + 1}
                        title={choice}
                        onClick={set(index + 1)}
                        isSelected={fieldProps.form.values.option === (index + 1)}
                        sx={{ p: 1 }}
                        StackProps={{ sx: { justifyContent: 'center' } }}
                        TitleProps={{ variant: 'body1' }}
                        disabled={differenceInTime <= 0}
                      />
                    ))}
                  </Stack>
                );
              }}
            </Field>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={disableSubmit}
            >
              {differenceInTime <= 0 ? 'Vote ended' : 'Vote'}
            </LoadingButton>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            href={proposal.link}
          >
            Vote on Snapshot.org &rarr;
          </Button>
        )}
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const Vote: React.FC<{}> = () => {
  ///
  const account = useAccount();
  const { data: signer } = useSigner();

  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query proposal data
  const queryConfig = useMemo(() => ({
    variables: { proposal_id: id }
  }), [id]);
  const { data } = useGovernanceQuery(ProposalDocument, queryConfig);

  // Form setup
  const initialValues: VoteFormValues = useMemo(() => ({
    option: undefined,
  }), []);

  const onSubmit = useCallback(
    async (
      values: VoteFormValues,
      formActions: FormikHelpers<VoteFormValues>
    ) => {
      let txToast;
      try {
        if (!account) throw new Error('Connect a wallet first.');
        if (values.option === undefined) throw new Error('Select a voting option.');

        txToast = new TransactionToast({
          loading: 'Voting on proposal...',
          success: 'Vote successful.',
        });

        const hub = 'https://hub.snapshot.org';
        const client = new snapshot.Client712(hub);

        const message = {
          space: data?.proposal?.space?.id,
          proposal: data?.proposal?.id,
          type: data?.proposal?.type,
          choice: values.option,
          app: 'snapshot'
        };

        console.debug('[Vote]', signer, await signer?.getAddress(), account, message);

        const _account = await signer?.getAddress();
        if (!_account) throw new Error('Missing signer');

        const result = await client.vote(signer as Wallet, _account, message);
        console.debug('[vote: result]', result);

        txToast.success();
        /// vote
      } catch (err) {
        console.error(err);
        // txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [account, data?.proposal?.id, data?.proposal?.space?.id, data?.proposal?.type, signer]
  );

  return (
    <Formik<VoteFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<VoteFormValues>) => (
        <VoteForm
          proposal={data?.proposal}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Vote;
