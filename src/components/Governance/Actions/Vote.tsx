import { Box, CircularProgress, Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { useParams } from 'react-router-dom';
import { Beanstalk } from '~/generated/index';
import { useBeanstalkContract } from '~/hooks/useContract';
import { useSigner } from '~/hooks/ledger/useSigner';
import useAccount from '~/hooks/ledger/useAccount';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import { ProposalDocument, VotesDocument } from '~/generated/graphql';
import DescriptionButton from '~/components/Common/DescriptionButton';
// import { useProvider,  } from 'wagmi';

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

  return (
    <Form autoComplete="off">
      {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
      <Stack gap={1}>
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
                    key={index + 1}
                    title={choice}
                    onClick={set(index + 1)}
                    selected={fieldProps.form.values.option === index + 1}
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
      // let txToast;
      try {
        if (!account) throw new Error('Connect a wallet first.');
        if (!values.option) throw new Error('Select a voting option.');
        if (hasVoted) throw new Error('You have already voted for this proposal!');

        // const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
        // const client = new snapshot.Client712(hub);

        // @ts-ignore
        // const web3 = new Web3Provider(window.ethereum);

        // const receipt = await client.vote(web3, account, {
        //   space: data?.proposal?.space?.id,
        //   proposal: data?.proposal?.id,
        //   type: data?.proposal?.type,
        //   choice: values.option,
        //   app: data?.proposal?.space?.id
        // });

        /// vote
      } catch (err) {
        // txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [account, hasVoted]
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
