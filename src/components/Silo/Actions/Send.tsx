import AddressInputField from 'components/Common/Form/AddressInputField';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

export type SendFormValues = {
  to?: string;
}

const SendForm : React.FC<FormikProps<SendFormValues>> = (props) => {
  return (
    <Form>
      <AddressInputField name="to" />
    </Form>
  )
}

const Send : React.FC<{}> = () => {
  return (
    <Formik initialValues={{ to: '' }} onSubmit={() => {}}>
      {(formikProps: FormikProps<SendFormValues>) => (
        <SendForm
          {...formikProps}
        />
      )}
    </Formik>
  );
}

export default Send;