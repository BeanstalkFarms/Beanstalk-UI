import { Stack, styled, Typography } from '@mui/material';
import React from 'react';
import { BeanstalkPalette } from '../App/muiTheme';

const InfoContent = styled(Stack)(({ theme }) => ({
  width: '100%',
  padding: '20px',
  boxSizing: 'border-box',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    height: '250px',
    maxWidth: '40%',
  },
  [theme.breakpoints.down('md')]: {
    height: '225px',
    maxWidth: '100%',
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
      sx={{
        width: '100%',
        justifyContent: 'flex-end',
        background: BeanstalkPalette.skyBlue,
        maxHeight: '250px',
      }}
    >
      <img
        src={imageSrc}
        alt=""
        style={{ objectFit: 'cover', height: 'auto', width: '100%' }}
      />
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
