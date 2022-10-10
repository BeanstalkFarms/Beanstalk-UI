import { StackProps } from '@mui/material';
import React from 'react';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '../Dialog';
import PillRow from './PillRow';

import { FC } from '~/types';

const PillDialogField : FC<{
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
  pill,
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
      {pill}
    </PillRow>
  </>
);

export default PillDialogField;
