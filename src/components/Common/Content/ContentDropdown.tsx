import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import { Box, Link, Typography } from '@mui/material';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { theme } from 'constants/index';

// TODO: style
const Accordion = withStyles({
  root: {
    maxWidth: '400px',
    minWidth: '300px',
    width: '60vw',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: theme.secondary,
    marginBottom: -1,
    borderRadius: '15px',
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles(() => ({
  root: {
    backgroundColor: theme.secondary,
    borderRadius: '0 0 15px 15px',
  },
}))(MuiAccordionDetails);

const useStyles = makeStyles(() => ({
  root: {
    // width: '300px',
  },
  topContainer: {
    backgroundColor: 'transparent',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
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
}));

export default function ContentDropdown({
  description,
  descriptionTitle,
  descriptionLinks,
  accordionStyles,
}) {
  const classes = useStyles();
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
        style={{
          backgroundColor: theme.secondary,
          borderRadius: '15px',
          ...accordionStyles
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: theme.accentText }} />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          style={{ backgroundColor: theme.secondary }}
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
