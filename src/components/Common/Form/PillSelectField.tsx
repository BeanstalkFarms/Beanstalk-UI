import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';
import { Field, FieldProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import DescriptionButton from '../DescriptionButton';
import PillDialogField from './PillDialogField';

const PillSelectField : React.FC<{
  /** */
  options: ({
    title: string;
    description: string;
    icon: string | ReactNode;
    pill: string | ReactNode;
    value: any;
  })[]
  /** Field name */
  name: string;
  /** Field label */
  label: string;
}> = ({
  options,
  name,
  label,
}) => {
  const [isOpen, show, hide] = useToggle();
  return (
    <Field name={name}>
      {(fieldProps: FieldProps<any>) => {
        const pill = options.find((x) => x.value === fieldProps.field.value)?.pill;
        const set = (v: any) => () => {
          fieldProps.form.setFieldValue(name, v);
          hide();
        };
        return (
          <PillDialogField
            isOpen={isOpen}
            show={show}
            hide={hide}
            label={label}
            pill={pill}
            pl={0.5}
          >
            <Stack gap={1}>
              {options.map((option, index) => (
                <DescriptionButton
                  key={index}
                  {...option}
                  onClick={set(option.value)}
                  fullWidth
                  disableRipple
                  />
                ))}
            </Stack>
          </PillDialogField>
        );
      }}
    </Field>
  );
};

export default PillSelectField;
