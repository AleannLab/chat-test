import { useState, useEffect } from 'react';
import styles from './index.module.css';
import { TextField, InputLabel, Box, Grid } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useStores } from 'hooks/useStores';

const FORM_FIELDS = {
  patient: {
    name: 'Patient',
    label: "What's the name of the patient that referred you?",
  },
  doctor: {
    name: 'Doctor',
    label: "What's the name of the doctor that referred you?",
  },
  others: {
    name: 'Others',
    label: 'Please tell us how you heard about our practice',
  },
};

const ReferralComponent = ({
  component,
  // parent,
  onChange,
  value,
}) => {
  const [optionsList, setOptionsList] = useState(
    Object.values(FORM_FIELDS).map((item) => item.name),
  );
  const { paperlessForm } = useStores();
  const [componentValues, setComponentValues] = useState({
    from: value?.[component.key]?.from || '',
    firstName: value?.[component.key]?.firstName || '',
    lastName: value?.[component.key]?.lastName || '',
  });

  useEffect(() => {
    if (value?.[component.key]) {
      setComponentValues({ ...value?.[component.key] });
    }
  }, [value, value?.[component.key], component]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (event, newValue) => {
    setComponentValues({
      from: newValue || '',
      firstName: '',
      lastName: '',
    });
    onChange({
      from: newValue || '',
      firstName: '',
      lastName: '',
    });
  };

  const handleChange = (event, newValue) => (key) => {
    setComponentValues({
      ...componentValues,
      [key]: event.target.value || '',
    });
    onChange({
      ...componentValues,
      [key]: event.target.value || '',
    });
  };

  useEffect(() => {
    paperlessForm.setIsFetching(false);
    const fetchData = async () => {
      const res = await paperlessForm.fetchReferredBy();
      if (Array.isArray(res)) {
        setOptionsList([
          ...res.map((el) =>
            [el.firstname, el.lastname].filter((el) => el).join(' '),
          ),
          ...optionsList,
        ]);
      }
      paperlessForm.setIsFetching(false);
    };
    fetchData();
  }, [paperlessForm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={styles.noPrint}>
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            className={styles.deletePaddingTop}
            onChange={(event, newValue) => handleSelect(event, newValue)}
            disablePortal
            options={optionsList}
            value={componentValues.from}
            getOptionLabel={(referredBy) => referredBy}
            renderInput={(params) => (
              <TextField
                {...params}
                onChange={handleChange}
                size="small"
                variant="outlined"
              />
            )}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <InputLabel className={styles.label}>
            {FORM_FIELDS[componentValues?.from?.toLowerCase()]?.label || ''}
          </InputLabel>
        </Box>
        {componentValues?.from.toLowerCase() ===
          FORM_FIELDS.patient.name.toLowerCase() ||
        componentValues?.from.toLowerCase() ===
          FORM_FIELDS.doctor.name.toLowerCase() ? (
          <Grid container spacing={3}>
            <Grid item sm={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <InputLabel className={styles.label}>First Name</InputLabel>
              </Box>
              <TextField
                className={styles.deletePaddingTop}
                fullWidth
                variant="outlined"
                value={componentValues?.firstName}
                onChange={(event, newValue) =>
                  handleChange(event, newValue)('firstName')
                }
                size="small"
              />
            </Grid>
            <Grid item sm={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <InputLabel className={styles.label}>Last Name</InputLabel>
              </Box>
              <TextField
                fullWidth
                className={styles.deletePaddingTop}
                variant="outlined"
                value={componentValues?.lastName}
                onChange={(event, newValue) =>
                  handleChange(event, newValue)('lastName')
                }
                size="small"
              />
            </Grid>
          </Grid>
        ) : componentValues?.from.toLowerCase() ===
          FORM_FIELDS.others.name.toLowerCase() ? (
          <TextField
            variant="outlined"
            className={styles.deletePaddingTop}
            fullWidth
            value={componentValues?.referralOther}
            onChange={(event, newValue) =>
              handleChange(event, newValue)('lastName')
            }
            size="small"
          />
        ) : null}
      </div>

      <div className={styles.printOnly}>
        {value?.[component.key]?.firstName || ''}{' '}
        {value?.[component.key]?.lastName || ''}
      </div>
    </>
  );
};

export default ReferralComponent;
