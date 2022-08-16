import { Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { useParams } from 'react-router-dom';
import { Beanstalk } from '~/generated/index';
import { useBeanstalkContract } from '~/hooks/useContract';
import { useSigner } from '~/hooks/ledger/useSigner';
import useAccount from '~/hooks/ledger/useAccount';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import { ProposalDocument } from '~/generated/graphql';
import DescriptionButton from '~/components/Common/DescriptionButton';

type VoteFormValues = {
  option: number | undefined;
};

const VoteForm: React.FC<
  FormikProps<VoteFormValues> & {
    beanstalk: Beanstalk;
    proposal: any;
  }
> = ({
  values,
  setFieldValue,
  proposal,
  beanstalk,
}) => {
  const disableSubmit = values.option === undefined;

  if (proposal === undefined) {
    return null;
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
                    key={index}
                    title={choice}
                    onClick={set(index)}
                    selected={fieldProps.form.values.option === index}
                    // button style
                    sx={{ p: 1 }}
                    // stack style
                    StackProps={{ sx: { justifyContent: 'center' } }}
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
          Vote
        </LoadingButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const Vote: React.FC<{}> = () => {
  ///
  const account           = useAccount();
  const { data: signer }  = useSigner();
  const beanstalk         = useBeanstalkContract(signer);

  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query proposal data
  const queryConfig = useMemo(() => ({
    variables: { proposal_id: id }
  }), [id]);
  const { loading, error, data } = useGovernanceQuery(ProposalDocument, queryConfig);

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
        /// vote
      } catch (err) {
        // txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    []
  );

  return (
    <Formik<VoteFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<VoteFormValues>) => (
        <VoteForm
          beanstalk={beanstalk}
          proposal={data?.proposal}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Vote;
