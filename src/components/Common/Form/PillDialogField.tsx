import { StackProps } from '@mui/material';
import React from 'react';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '../Dialog';
import PillRow from './PillRow';

const PillDialogField : React.FC<{
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  label: string;
  pill: React.ReactNode;
  tooltip?: string;
} & StackProps> = ({
  isOpen,
  show,
  hide,
  label,
  pill: selected,
  tooltip,
  children,
}) => (
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
      label={label}
      tooltip={tooltip}
      isOpen={isOpen}
      onClick={show}
    >
      {selected}
    </PillRow>
  </>
);

export default PillDialogField;
