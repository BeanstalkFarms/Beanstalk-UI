import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, Link, Typography } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { theme } from 'constants/index';

const Accordion = withStyles({
  root: {
    width: '400px',
    boxShadow: 'none',
    backgroundColor: theme.primary,
    '&:not(:last-child)': {
      borderBottom: 0,
      backgroundColor: theme.primary,
    },
    '&:before': {
      display: 'none',
      backgroundColor: theme.primary,
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: theme.primary,
    marginBottom: -1,
    borderRadius: '15px',
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
      borderRadius: '15px 15px 0 0',
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
      borderRadius: '15px',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles(() => ({
  root: {
    backgroundColor: theme.primary,
    borderRadius: '0 0 15px 15px',
  },
}))(MuiAccordionDetails);

export default function ContentDropdown({
    description,
    descriptionTitle,
    descriptionLinks,
}) {
  const classes = makeStyles(() => ({
    root: {
      width: '300px',
    },
    topContainer: {
      backgroundColor: 'transparent',
    },
    heading: {
      fontSize: '16px',
      fontWeight: 'bold',
      fontFamily: 'Futura-PT-Book',
      color: theme.accentText,
    },
    descriptionText: {
      color: theme.accentText,
      textAlign: 'justify',
      fontFamily: 'Futura-PT-Book',
      fontSize: '16px',
    },
  }))();
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (
    event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box style={{ margin: '0px' }}>
      <Accordion
        expanded={expanded === 'event'}
        onChange={handleChange('event')}
        className={classes.topContainer}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: theme.accentText }} />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography className={classes.heading}>
            {descriptionTitle}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className={classes.descriptionText}>
            {description}
            {descriptionLinks !== undefined ?
              descriptionLinks.map((l) => (
                <span key={l.text}>
                  {' '}
                  <Link
                    style={{ color: theme.accentText }}
                    key={l.text}
                    href={l.href}
                    target="blank"
                  >
                    {l.text}
                  </Link>
                  .
                </span>
              ))
              : null
          }
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

ContentDropdown.defaultProps = {
  marginTop: '20px',
  width: '100%',
  description: 'Template description',
  descriptionTitle: 'FAQ',
};
