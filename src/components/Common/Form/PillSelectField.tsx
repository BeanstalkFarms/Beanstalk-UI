import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';
import { Field, FieldProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import DescriptionButton from '../DescriptionButton';
import PillDialogField from './PillDialogField';

export type PillSelectFieldProps = {
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
  /** Tooltip */
  tooltip?: string,
};
const PillSelectField : React.FC<PillSelectFieldProps> = ({
  options,
  name,
  label,
  tooltip,
}) => {
  const [isOpen, show, hide] = useToggle();
  return (
    <Field name={name}>
      {(fieldProps: FieldProps<any>) => {
        const pill = options.find((x) => x.value === fieldProps.field.value)?.pill; // FIXME: inefficient
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
            tooltip={tooltip}
            pill={pill}
            pl={0.5}
          >
            {/* Dialog contents */}
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
