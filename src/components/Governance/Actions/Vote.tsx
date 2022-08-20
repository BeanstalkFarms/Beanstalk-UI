import { Box, Button, CircularProgress, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { useParams } from 'react-router-dom';
import snapshot from '@snapshot-labs/snapshot.js';
import { Wallet } from 'ethers';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useProposalQuery, useVotesQuery } from '~/generated/graphql';
import DescriptionButton from '~/components/Common/DescriptionButton';
import { useSigner } from '~/hooks/ledger/useSigner';
import {  displayFullBN, parseError } from '~/util';
import TransactionToast from '~/components/Common/TxnToast';
import { Proposal } from '~/util/Governance';
import { AppState } from '~/state';
import useAccount from '~/hooks/ledger/useAccount';
import WalletButton from '~/components/Common/Connection/WalletButton';
import { SNAPSHOT_LINK } from '~/constants';

type VoteFormValues = {
  choice: number | undefined;
};

const VoteForm: React.FC<FormikProps<VoteFormValues> & {
  proposal: Proposal;
  existingChoice: number | undefined;
}> = ({
  values,
  setFieldValue,
  isSubmitting,
  proposal,
  existingChoice
}) => {
  /// State
  const account = useAccount();
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);

  /// Time
  const today = new Date();
  const endDate = new Date(proposal.end * 1000);
  const differenceInTime = endDate.getTime() - today.getTime();

  /// Handlers
  const handleClick = useCallback((choice: number | undefined) => () => {
    setFieldValue('choice', choice);
  }, [setFieldValue]);

  /// Option isn't selected or the voting period has ended
  const canVote = farmerSilo.stalk.active.gt(0);
  const alreadyVotedThisChoice = (
    existingChoice !== undefined 
    && existingChoice === values.choice
  );
  const isClosed = differenceInTime <= 0;
  const isInvalid = (
    values.choice === undefined // no choice selected
    || alreadyVotedThisChoice // already voted for this same choice
    || isClosed // expired
    || !canVote // no stalk
  );

  return (
    <Form autoComplete="off">
      <Stack gap={1}>
        {/**
          * Progress by choice
          */}
        <Stack px={1} pb={1} gap={1.5}>
          {proposal.choices.map((choice: string, index: number) => (
            <Stack gap={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1">
                  {isClosed && existingChoice !== undefined && (existingChoice === index + 1) ? (
                    <Tooltip title={`You voted: ${proposal.choices[existingChoice - 1]}`}>
                      <span>✓&nbsp;</span>
                    </Tooltip>
                  ) : null}
                  {choice}
                </Typography>
                <Typography variant="body1">
                  {displayFullBN(new BigNumber(proposal.scores[index]), 0, 0)} STALK
                  <Typography
                    display={proposal.scores_total > 0 ? 'inline' : 'none'}>•{((proposal.scores[index] / proposal.scores_total) * 100).toFixed(2)}%
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
        {/**
          * Voting
          */}
        {!isClosed && (
          proposal.type === 'single-choice' ? (
            account ? (
              <>
                {canVote && (
                  <Stack gap={1}>
                    {proposal.choices.map((label: string, index: number) => {
                      const choice = index + 1;
                      const isSelected = values.choice === choice;
                      return (
                        <DescriptionButton
                          key={choice}
                          title={`${isSelected ? '✓ ' : ''}${label}`}
                          disabled={!canVote || isSubmitting}
                          onClick={handleClick(isSelected ? undefined : choice)}
                          isSelected={isSelected}
                          sx={{ p: 1 }}
                          StackProps={{ sx: { justifyContent: 'center' } }}
                          TitleProps={{ variant: 'body1' }}
                          size="medium"
                        />
                      );
                    })}
                  </Stack>
                )}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="medium"
                  loading={isSubmitting}
                  disabled={isInvalid || isSubmitting}
                >
                  {canVote 
                    ? (
                      alreadyVotedThisChoice
                        ? `Already voted ${proposal.choices[existingChoice - 1]}`
                        : 'Vote'
                    )
                    : 'Need Stalk to vote'
                  }
                </LoadingButton>
              </>
            ) : (
              <WalletButton />
            )
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              href={proposal.link || SNAPSHOT_LINK}
              target="_blank"
              rel="noreferrer"
            >
              Vote on Snapshot.org &rarr;
            </Button>
          )
        )}
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const Vote: React.FC = () => {
  const account = useAccount();
  const { data: signer } = useSigner();

  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query: Proposal
  const queryConfig = useMemo(() => ({
    variables: { proposal_id: id as string },
    context: { subgraph: 'snapshot' },
  }), [id]);
  const { loading, error, data, refetch: refetchProposal } = useProposalQuery(queryConfig);
  const proposal = data?.proposal as Proposal;

  /// Query Votes
  const { 
    data: voteData,
    refetch : refetchVotes,
  } = useVotesQuery({
    variables: {
      proposal_id: proposal?.id.toLowerCase() || '',
      voter_address: account || '',
    },
    skip: !account || !proposal?.id, // only send query when wallet connected
    context: { subgraph: 'snapshot' },
    nextFetchPolicy: 'network-only'
  });
  const existingChoice = voteData?.votes?.[0]?.choice;
  
  /// Form setup
  const initialValues: VoteFormValues = useMemo(() => ({ 
    choice: existingChoice
  }), [existingChoice]);
  const onSubmit = useCallback(
    async (
      values: VoteFormValues,
      formActions: FormikHelpers<VoteFormValues>
    ) => {
      let txToast;
      try {
        const _account = await signer?.getAddress();
        if (!_account) throw new Error('Missing signer.');
        if (values.choice === undefined) throw new Error('Select a voting choice.'); // use undefined here since 'choice' can be numerical zero 
        if (!proposal) throw new Error('Error loading proposal data.');
        if (proposal.type !== 'single-choice') throw new Error('Unsupported proposal type. Please vote through snapshot.org directly.');

        txToast = new TransactionToast({
          loading: 'Voting on proposal...',
          success: 'Vote successful. It may take some time for your vote to appear on the Beanstalk UI. Check Snapshot for the latest results.',
        });

        const hub = 'https://hub.snapshot.org';
        const client = new snapshot.Client712(hub);
        const message = {
          space: proposal.space.id,
          proposal: proposal.id,
          type: proposal.type as 'single-choice', // 'single-choice' | 'approval' | 'quadratic' | 'ranked-choice' | 'weighted' | 'basic';
          choice: values.choice,
          app: 'snapshot'
        };

        const result = await client.vote(
          signer as Wallet,
          _account,
          message
        );
        console.debug('[Vote] Voting result: ', result);
        await Promise.all([
          refetchProposal(),
          refetchVotes()
        ]);
        txToast.success();
      } catch (err) {
        console.error(err);
        txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [proposal, signer, refetchProposal, refetchVotes]
  );

  if (loading) {
    return (
      <Box height={100} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height={100} display="flex" alignItems="center" justifyContent="center">
        <Typography>{error.message.toString()}</Typography>
      </Box>
    );
  }

  return (
    <Formik<VoteFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<VoteFormValues>) => (
        <VoteForm
          proposal={proposal}
          existingChoice={existingChoice}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Vote;
