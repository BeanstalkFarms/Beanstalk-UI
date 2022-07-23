import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import React from 'react';
import { IconSize } from '../App/muiTheme';

const PageHeader : React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title?: string | JSX.Element;
  icon?: JSX.Element;
  /** Show a back button to return to `returnPath`. */
  returnPath: string;
  /**  */
  control?: React.ReactElement;
}> = (props) => {
//   const buttonProps = props.returnPath ? {
//     to: props.returnPath,
//     component: RouterLink,
//   }
  const navigate = useNavigate();
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5}>
        <Box sx={{ width: 70 }}>
          <Button
            onClick={() => navigate(-1)}
            color="naked"
            sx={{
              p: 0,
              borderRadius: 1,
              float: 'left',
              display: 'inline',
              mb: '-2.5px',
            }}
          >
            <Stack direction="row" gap={0.5} alignItems="center">
              <KeyboardBackspaceIcon sx={{ width: IconSize.small }} height="auto" />
              <Typography variant="h4">Back</Typography>
            </Stack>
          </Button>
        </Box>
        {props.title && (
          <Typography variant="h2">
            <Stack direction="row" gap={0.5} alignItems="center">
              {props.icon}
              {props.title}
            </Stack>
          </Typography>
        )}
        <Box sx={{ width: 70 }} />
      </Stack>
    </Box>
  );
};

export default PageHeader;
