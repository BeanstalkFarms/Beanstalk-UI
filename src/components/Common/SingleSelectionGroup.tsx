import React, { useCallback } from 'react';
import {
  FormControl,
  FormControlProps,
  MenuItem,
  SelectProps,
  SelectChangeEvent,
  Select,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FontSize } from '../App/muiTheme';

type ISelectProps = Omit<SelectProps, 'value' | 'onChange' | 'multiple'>;
type TSelect = string | number;

export type ISelectionGroup<T extends TSelect> = {
  value: T;
  options: T[];
  setValue: React.Dispatch<React.SetStateAction<T>>;
  formControlProps?: FormControlProps;
  fontSize?: keyof typeof FontSize;
};

const stylesSmall = {
  '& .MuiInputBase-root': {
    borderRadius: '4px',
    borderColor: 'primary.main',
  },
  '& .MuiInputBase-input': {
    paddingLeft: 1,
    paddingTop: 0.5,
    paddingBottom: 0.5,
    borderColor: 'primary.main',
    '&:hover': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiOutlinedInput-root': {
    borderColor: 'primary.main',
    '&:hover': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputBase-input:focus, hover, active': {
    borderColor: 'primary.main',
  },
  '& .MuiSelect-icon': {
    fontSize: 'inherit',
    color: 'text.primary',
  },
};

export default function SingleSelectionGroup<T extends TSelect>({
  value,
  options,
  setValue,
  formControlProps,
  size = 'small',
  fontSize,
  ...props
}: ISelectionGroup<T> & ISelectProps) {
  const handleOnChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      setValue(event.target.value as T);
    },
    [setValue]
  );

  return (
    <FormControl {...formControlProps}>
      <Select
        size={size}
        value={value}
        onChange={handleOnChange}
        IconComponent={ExpandMoreIcon}
        {...props}
        sx={{
          fontSize: fontSize ? FontSize[fontSize] : undefined,
          ...(size === 'small' ? stylesSmall : {}),
          ...props.sx,
        }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.toString()}
            value={opt}
            sx={{
              minWidth: 'unset',
              fontSize: fontSize ? FontSize[fontSize] : undefined,
            }}
          >
            {opt.toString()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
