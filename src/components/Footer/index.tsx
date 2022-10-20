import React from 'react';
import { Typography, StackProps, Link } from '@mui/material';
import { FC } from '~/types';
import Row from '~/components/Common/Row';

export type FooterLink = {
  title: string;
  link: string;
}

const Footer: FC<StackProps> = (props) => {
  // Footer Links
  const FOOTER_LINKS: FooterLink[] = [
    {
      title: 'Docs',
      link: 'https://docs.bean.money/'
    },
    {
      title: 'Discord',
      link: 'https://discord.gg/beanstalk'
    },
    {
      title: 'Twitter',
      link: 'https://twitter.com/beanstalkfarms'
    },
    {
      title: 'Bug Bounty',
      link: 'https://immunefi.com/bounty/beanstalk'
    },
    {
      title: 'GitHub',
      link: 'https://github.com/beanstalkfarms'
    },
    {
      title: 'Disclosures',
      link: 'https://docs.bean.money/disclosures'
    }
  ];

  return (
    <Row
      gap={3}
      flexWrap="wrap"
      justifyContent="center"
      sx={{
        mt: 3,
        width: '100%',
        px: { xs: 2, md: 0 }
      }}
      {...props}
    >
      {FOOTER_LINKS.map((footerItem) => (
        <Link
          target="_blank"
          rel="noreferrer"
          color="text.primary"
          href={footerItem.link}
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          <Typography>
            {footerItem.title}
          </Typography>
        </Link>
      ))}
    </Row>
  );
};

export default Footer;
