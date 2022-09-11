import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import React from 'react';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';
import Row from '~/components/Common/Row';

const PageHeader: React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title?: string | JSX.Element;
  titleAlign?: 'left' | 'center';
  icon?: JSX.Element;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
}> = (props) => {
  const navigate = useNavigate();
  const buttonProps = props.returnPath
    ? {
        to: props.returnPath,
        component: RouterLink,
      }
    : {
        onClick: () => navigate(-1),
      };
  return (
    <Box>
      <Row justifyContent="space-between" gap={0.5}>
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
              },
            }}
          >
            <Row gap={0.5} height="100%">
              <KeyboardBackspaceIcon
                sx={{ width: IconSize.small }}
                height="auto"
              />
              <Typography variant="h4">Back</Typography>
            </Row>
          </Button>
        </Stack>
        {props.title && (
          <>
            {typeof props.title === 'string' ? (
              <Typography
                variant="h2"
                textAlign={props.titleAlign ?? 'center'}
                sx={{
                  ml: props.titleAlign ? 1.5 : 0,
                  verticalAlign: 'middle',
                  width: '100%',
                }}
              >
                {props.icon}&nbsp;
                {props.title}
              </Typography>
            ) : (
              <>{props.title}</>
            )}
          </>
        )}
        <Box sx={{ width: 70 }} display="flex" justifyContent="end">
          {props.control ? props.control : null}
        </Box>
      </Row>
    </Box>
  );
};

export default PageHeader;
