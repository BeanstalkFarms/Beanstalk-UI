import { Button, Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

export type SendFormValues = {
  to?: string;
}

const SendForm : React.FC<FormikProps<SendFormValues>> = () => (
  <Form autoComplete="off">
    <Stack gap={1}>
      <FieldWrapper label="Send Deposits to">
        <AddressInputField name="to" />
      </FieldWrapper>
      <Button fullWidth type="submit" variant="contained" size="large">
        Send
      </Button>
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
