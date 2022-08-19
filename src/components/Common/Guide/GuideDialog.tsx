import React from 'react';
import { DialogProps, Stack } from '@mui/material';
import { StyledDialog, StyledDialogTitle, StyledDialogContent } from '~/components/Common/Dialog';
import { GuideProps } from '~/components/Common/Guide/GuideButton';
import DescriptionButton from '~/components/Common/DescriptionButton';

const GuideDialog: React.FC<DialogProps & GuideProps> = (props) => (
  <StyledDialog onClose={props.onClose} open={props.open} fullWidth>
    <StyledDialogTitle onClose={props.onClose as any}>{props.title}</StyledDialogTitle>
    <StyledDialogContent>
      <Stack gap={1}>
        {props.guides.map((guide) => (
          <DescriptionButton
            title={guide.title}
            onClick={props.onClose as any}
            href={guide.url}
            StackProps={{ sx: { justifyContent: 'center' } }}
          />
        ))}
      </Stack>
    </StyledDialogContent>
  </StyledDialog>
  );

export default GuideDialog;
