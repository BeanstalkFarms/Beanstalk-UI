import React from 'react';

import { Stack, styled, Typography } from '@mui/material';

import { BeanstalkPalette } from '../App/muiTheme';

const InfoContent = styled(Stack)(({ theme }) => ({
  width: '100%',
  padding: '20px',
  boxSizing: 'border-box',
  justifyContent: 'space-between',
  height: '250px',
  maxWidth: '40%',
  [theme.breakpoints.between('sm', 'md')]: {
    height: '175px !important',
    maxWidth: '100% !important',
  },
  [theme.breakpoints.down('sm')]: {
    height: '225px !important',
    maxWidth: '100% !important',
  },
}));

const Image = styled('img')(({ theme }) => ({
  objectFit: 'cover',
  alignSelf: 'center',
  [theme.breakpoints.up('lg')]: {
    width: '100%',
    height: 'auto',
  },
  [theme.breakpoints.down('lg')]: {
    height: '100%',
    width: 'auto',
  },
}));

export interface PoolEducationContentProps {
  title: string;
  texts: string[];
  imageSrc: string;
}

const PoolEducationContent: React.FC<PoolEducationContentProps> = ({
  title,
  texts,
  imageSrc,
}) => (
  <Stack direction={{ xs: 'column', md: 'row' }}>
    <Stack
      alignItems={{ lg: 'flex-end' }}
      justifyContent="flex-end"
      sx={{
        background: BeanstalkPalette.skyBlue,
        width: '100%',
        height: '250px',
      }}
    >
      <Image src={imageSrc} alt="" />
    </Stack>
    <InfoContent>
      <Stack sx={{ pb: '20px' }}>
        <Typography>{title}</Typography>
        <Stack sx={{ whiteSpace: 'pre-wrap' }}>
          {texts.map((text, i) => (
            <Typography
              variant="bodySmall"
              sx={{ color: BeanstalkPalette.grey }}
              key={i}
            >
              {`${text}\n\n`}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </InfoContent>
  </Stack>
);

export default PoolEducationContent;
