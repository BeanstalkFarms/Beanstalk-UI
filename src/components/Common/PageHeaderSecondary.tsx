import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import React from 'react';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';
import Row from '~/components/Common/Row';

const PageHeader: React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title?: string | JSX.Element;
  icon?: JSX.Element;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
  alignTitle?: 'left' | 'center';
}> = (props) => {
  const navigate = useNavigate();
  const buttonProps = props.returnPath ? {
    to: props.returnPath,
    component: RouterLink,
  } : {
    onClick: () => navigate(-1),
  };

  const mainContent = (
    <>
      <Stack sx={{ width: 70, justifyContent: 'start' }}>
        <Button
          {...buttonProps}
          color="naked"
          sx={{
            p: 0,
            borderRadius: 1,
            float: 'left',
            display: 'inline',
            mb: '-2.5px',
            '&:hover': {
              color: BeanstalkPalette.logoGreen,
            }
          }}
        >
          <Stack direction="row" gap={0.5} alignItems="center" height="100%">
            <KeyboardBackspaceIcon sx={{ width: IconSize.small }} height="auto" />
            <Typography variant="h4">Back</Typography>
          </Stack>
        </Button>
      </Stack>
      {
        props.title && (
          <>
            {typeof props.title === 'string' ? (
              <Typography
                variant="h2"
                textAlign="center"
                sx={{ verticalAlign: 'middle' }}
              >
                {props.icon}&nbsp;
                {props.title}
              </Typography>
            ) : (
              <>
                {props.title}
              </>
            )}
          </>
        )
      }
    </>

  );
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'start', sm: 'center' }} justifyContent={{ xs: 'start', sm: 'space-between' }} gap={0.5}>
        {props.alignTitle === 'left' ? (
          <Row>
            {mainContent}
          </Row>
        ) : (
          <>{mainContent}</>
        )}
        <Box sx={{ width: props.alignTitle === 'left' ? 'fit-content' : 70 }} display="flex" justifyContent="end">
          {props.control ? (props.control) : null}
        </Box>
      </Stack>
    </Box>
  );
};

export default PageHeader;
