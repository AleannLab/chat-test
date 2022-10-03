import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const Accordion = withStyles({
  root: {
    margin: '4px 0px',
    '&.Mui-expanded': {
      margin: '4px 0px',
    },
    '&::before': {
      display: 'none',
    },
  },
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    borderRadius: '4px',
    border: '1px solid',
    borderColor: '#00000020',
    paddingLeft: '0px',
    fontFamily: 'Montserrat',
    fontSize: '1.25rem',
    color: '#02122F',
    '&.Mui-expanded': {
      minHeight: '48px',
    },
  },
  expanded: {
    borderRadius: '4px 4px 0px 0px',
  },
  content: {
    margin: '1rem !important',
  },
})(MuiAccordionSummary);

const AccordionDetails = withStyles({
  root: {
    backgroundColor: '#F3F5F9',
    border: '1px solid #00000020',
    borderTopWidth: '0px',
    borderRadius: '0px 0px 4px 4px',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
  },
})(MuiAccordionDetails);

const MyAccordion = ({ name, expanded, header, body, mountOnEnter }) => {
  const [expandedAccordion, setExpandedAccordion] = React.useState(
    expanded ? name : false,
  );

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <Accordion
      TransitionProps={{ mountOnEnter: mountOnEnter }}
      elevation={0}
      expanded={expandedAccordion === name}
      onChange={handleChange(name)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${name}-header`}>
        {header}
      </AccordionSummary>
      <AccordionDetails>{body}</AccordionDetails>
    </Accordion>
  );
};

MyAccordion.propTypes = {
  name: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  header: PropTypes.elementType,
  body: PropTypes.element,
  mountOnEnter: PropTypes.bool,
};

MyAccordion.defaultProps = {
  expanded: false,
  header: '',
  body: '',
  mountOnEnter: false,
};

export default MyAccordion;
