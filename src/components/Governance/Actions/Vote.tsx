import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { useParams } from 'react-router-dom';
import snapshot from '@snapshot-labs/snapshot.js';
import { Wallet } from 'ethers';
import BigNumber from 'bignumber.js';
import { Beanstalk } from '~/generated/index';
import { useBeanstalkContract } from '~/hooks/useContract';
import useAccount from '~/hooks/ledger/useAccount';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import { ProposalDocument, VotesDocument } from '~/generated/graphql';
import DescriptionButton from '~/components/Common/DescriptionButton';
import { useSigner } from '~/hooks/ledger/useSigner';
import { displayBN } from '~/util';

type VoteFormValues = {
  option: number | undefined;
};

const VoteForm: React.FC<FormikProps<VoteFormValues> & {
  beanstalk: Beanstalk;
  proposal: any;
  hasVoted: boolean;
}> = (
  {
    values,
    setFieldValue,
    proposal,
    hasVoted,
    beanstalk,
  }) => {
  const disableSubmit = (values.option === undefined) || hasVoted;

  // loading
  if (proposal === undefined) {
    return (
      <Box height={100} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  console.log('PROPOSALLL', proposal);

  return (
    <Form autoComplete="off">
      {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
      <Stack gap={1}>
        {/* progress bars */}
        <Stack px={1} pb={1} gap={1}>
          {proposal.choices.map((choice: string, index: number) => (
            <Stack gap={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1">{choice}</Typography>
                <Typography variant="body1">{displayBN(new BigNumber(proposal.scores[index]))} STALK • {((proposal.scores[index] / proposal.scores_total) * 100).toFixed(2)}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(proposal.scores[index] / proposal.scores_total) * 100}
                sx={{ height: '10px', borderRadius: 1 }}
              />
            </Stack>
          ))}
        </Stack>
        <Field name="action">
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
                    key={index}
                    title={choice}
                    onClick={set(index)}
                    selected={fieldProps.form.values.option === index}
                    // button style
                    sx={{ p: 1 }}
                    // stack style
                    StackProps={{ sx: { justifyContent: 'center' } }}
                    // title style
                    TitleProps={{
                      variant: 'body1'
                    }}
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
          {hasVoted ? 'Already Voted' : 'Vote'}
        </LoadingButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const Vote: React.FC<{}> = () => {
  ///
  const account = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);

  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query proposal data
  const queryConfig = useMemo(() => ({
    variables: { proposal_id: id }
  }), [id]);
  const { data } = useGovernanceQuery(ProposalDocument, queryConfig);

  /// Check if connected wallet has voted on this proposal
  const queryConfigVote = useMemo(() => ({
    variables: {
      proposal_id: data?.proposal?.id.toString().toLowerCase(),
      voter_address: account ? account.toLowerCase() : '',
    }
  }), [data?.proposal?.id, account]);
  const { data: voteData } = useGovernanceQuery(VotesDocument, queryConfigVote);
  const hasVoted = voteData?.votes?.length > 0;

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
        if (hasVoted) throw new Error('You have already voted for this proposal!');

        const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
        const client = new snapshot.Client712(hub);

        const receipt = await client.vote(signer as Wallet, account, {
          space: data?.proposal?.space?.id,
          proposal: data?.proposal?.id,
          type: data?.proposal?.type,
          choice: values.option,
          app: data?.proposal?.space?.id
        });

        /// vote
      } catch (err) {
        console.error(err);
        // txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [account, data?.proposal?.id, data?.proposal?.space?.id, data?.proposal?.type, hasVoted, signer]
  );

  return (
    // FIXME: only works for single-choice proposals
    <Formik<VoteFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<VoteFormValues>) => (
        <VoteForm
          beanstalk={beanstalk}
          proposal={data?.proposal}
          hasVoted={hasVoted}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Vote;
