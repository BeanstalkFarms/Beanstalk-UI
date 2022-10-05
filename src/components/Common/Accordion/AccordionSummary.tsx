import React from 'react';
import { AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import splitArrowsIcon from '~/img/beanstalk/interface/split-arrows.svg';
import { BeanstalkPalette, IconSize } from '../../App/muiTheme';
import IconWrapper from '../IconWrapper';
import Row from '~/components/Common/Row';

const StyledAccordionSummary : React.FC<{
  title: string | JSX.Element;
  icon?: JSX.Element;
  gradientText?: boolean;
}> = ({
  title,
  icon,
  gradientText = true,
}) => (
  <AccordionSummary
    expandIcon={(
      <ExpandMoreIcon
        sx={{
          color: BeanstalkPalette.theme.fall.brown,
          fontSize: IconSize.xs
        }}
      />
    )}>
    <Row>
      <IconWrapper boxSize={IconSize.medium}>
        {icon || <img alt="" src={splitArrowsIcon} height={IconSize.xs} />}
      </IconWrapper>
      <Typography
        variant="body1"
        sx={gradientText ? {
          background: 'linear-gradient(90deg, rgba(185, 125, 70, 1.0) 23%, rgba(255, 173, 97, 1.0) 54%, rgba(177, 180, 31, 1.0) 20%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        } : null}
      >
        {title}
      </Typography>
    </Row>
  </AccordionSummary>
);

export default StyledAccordionSummary;
