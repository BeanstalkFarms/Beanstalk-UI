import { Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';
import { SmartSubmitButton } from '../../Common/Form';

export type SendFormValues = {
  to?: string;
}

const SendForm : React.FC<FormikProps<SendFormValues>> = () => (
  <Form autoComplete="off">
    <Stack gap={1}>
      <FieldWrapper label="Send Deposits to">
        <AddressInputField name="to" />
      </FieldWrapper>
      <SmartSubmitButton
        // loading={isSubmitting}
        // disabled={!isSubmittable || isSubmitting}
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        tokens={[]}
        mode="auto"
      >
        Send
      </SmartSubmitButton>
    </Stack>
  </Form>
  );

const Send : React.FC<{}> = () => (
  <Formik initialValues={{ to: '' }} onSubmit={() => {}}>
    {(formikProps: FormikProps<SendFormValues>) => (
      <SendForm
        {...formikProps}
        />
      )}
  </Formik>
  );

export default Send;
