import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, LinkProps, Stack, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import React from 'react';
// import DescriptionIcon from '@mui/icons-material/Description';
// import MenuBookIcon from '@mui/icons-material/MenuBook';
// import BookIcon from '@mui/icons-material/Book';
// import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
// import gitbookIcon from 'img/interface/gitbook.png';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { BeanstalkPalette, FontSize, IconSize } from '../App/muiTheme';

const PageHeader : React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title?: any;
  /** "Earn yield through lending beans..." */
  description?: string;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
} & Omit<LinkProps, 'title'>> = (props) => (
  <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" gap={1}>
    <Stack direction="row" alignItems="center" gap={1.5}>
      {/* Back button */}
      {props.returnPath && (
        <Button
          to={props.returnPath}
          component={RouterLink}
          color="naked"
          sx={{
            p: 1,
            borderRadius: 1,
            '&:hover': {
              color: BeanstalkPalette.logoGreen,
            }
        }}
        >
          <Stack direction="row" gap={0.5} alignItems="center">
            <KeyboardBackspaceIcon sx={{ width: IconSize.small }} height="auto" />
            <Typography variant="h4">Back</Typography>
          </Stack>
        </Button>
      )}
      {/* Title */}
      <Stack direction="column" gap={0}>
        {props.title && (
          <Box>
            <Typography variant="h1" display="flex" alignItems="center" gap={1}>
              <span>{props.title}</span>
              {props.href !== undefined && (
                <Link
                  href={props.href || 'https://docs.bean.money'}
                  underline="none"
                  color="inherit"
                  display="flex"
                  alignItems="center"
                  target="_blank"
                  rel="noreferrer"
                >
                  <AutoStoriesIcon sx={{ fontSize: FontSize['2xl'], '&:hover': { color: 'primary.main' } }} />
                </Link>
              )}
            </Typography>
          </Box>
        )}
        {props.description && (
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: '1.5rem' }}>
              {props.description}.
            </Typography>
          </Box>
        )}
      </Stack>
    </Stack>
    {props.control && <Box>{props.control}</Box>}
  </Stack>
);

export default PageHeader;
