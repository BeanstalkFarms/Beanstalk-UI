import { Button, Stack, StackProps, Typography } from '@mui/material';
import React from 'react';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '../Dialog';
import DropdownIcon from '../DropdownIcon';
import PillRow from './PillRow';

const PillDialogField : React.FC<{
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  label: string;
  pill: React.ReactNode;
} & StackProps> = ({
  isOpen,
  show,
  hide,
  label,
  pill: selected,
  children,
  ...props
}) => {
  return (
    <>
      <StyledDialog open={isOpen} onClose={hide} transitionDuration={0}>
        <StyledDialogTitle onClose={hide}>
          {label}
        </StyledDialogTitle>
        <StyledDialogContent>
          {children}
        </StyledDialogContent>
      </StyledDialog>
      <PillRow
        isOpen={isOpen}
        label={label}
        onClick={show}>
        {selected}
      </PillRow>
    </>
  );
}

export default PillDialogField;