import { Typography, TypographyProps } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import Row from '~/components/Common/Row';
import { BeanstalkPalette } from '~/components/App/muiTheme';

export type PathItem = {
  title: string;
  path: string;
}

const PagePath: React.FC<{
  items: PathItem[];
}> = (props) => (
  <Row gap={1}>
    {props.items.map((item, index) => {
        const isLastItem = props.items.length - 1 === index;
        const StyledTypography: React.FC<TypographyProps> = ({ children }) => (
          <Typography
            variant="h4"
            color={isLastItem ? BeanstalkPalette.black : BeanstalkPalette.grey}
            sx={{
              '&:hover': {
                color: BeanstalkPalette.black
              }
            }}
          >
            {children}
          </Typography>
        );
        return (
          <>
            <Link to={item.path} style={{ textDecoration: 'none' }}>
              <StyledTypography>{item.title}</StyledTypography>
            </Link>
            {!isLastItem && (
              <StyledTypography>{'>'}</StyledTypography>
            )}
          </>
        );
      }
    )}
  </Row>
);

export default PagePath;
