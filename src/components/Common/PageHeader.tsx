import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, LinkProps, Stack, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import React from 'react';
// import DescriptionIcon from '@mui/icons-material/Description';
// import MenuBookIcon from '@mui/icons-material/MenuBook';
// import BookIcon from '@mui/icons-material/Book';
// import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
// import gitbookIcon from 'img/interface/gitbook.png';
import { BeanstalkPalette, FontSize, IconSize } from '../App/muiTheme';

const PageHeader : React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title?: string | JSX.Element;
  /** "Earn yield through lending beans..." */
  description?: string;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
} & LinkProps> = (props) => (
  <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" gap={1}>
    <Stack direction="row" alignItems="center" gap={1.5}>
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
      {/* --- THE OLD CIRCLE BACK BUTTON ---*/}
      {/* {props.returnPath && ( */}
      {/*  <Button */}
      {/*    to={props.returnPath} */}
      {/*    component={RouterLink} */}
      {/*    variant="contained" */}
      {/*    color="light" */}
      {/*    sx={{ p: 1, borderRadius: 100, minWidth: 0 }} */}
      {/*  > */}
      {/*    <ChevronLeftIcon /> */}
      {/*  </Button> */}
      {/* )} */}
      <Stack direction="column" gap={0}>
        {props.title && (
          <Box>
            <Typography variant="h1" display="flex" alignItems="center" gap={1}>
              <span>{props.title}</span>
              {props.href !== undefined && (
                <Link
                  href={props.href}
                  underline="none"
                  color="inherit"
                  display="flex"
                  alignItems="center"
                >
                  {/* <img src={gitbookIcon} alt="" height={IconSize.medium} style={{ '&:hover': { opacity: 0.9 } }} /> */}
                  <AutoStoriesIcon href="https://docs.bean.money" target="_blank" sx={{ fontSize: FontSize['2xl'], '&:hover': { color: BeanstalkPalette.logoGreen } }} />
                </Link>
              )}
            </Typography>
              {/* <Typography variant="bodySmall" display="inline">
                Docs
              </Typography> */}
            {/* </Typography> */}
          </Box>
        )}
        {props.description && (
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: '1.5rem' }}>
              {/* <Link href="#" underline="hover" fontWeight={700}>Docs</Link> &middot; */}
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
