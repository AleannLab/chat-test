import React, { useEffect, useMemo, useState } from 'react';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import {
  FormGroup,
  FormControlLabel,
  TextField,
  InputBase,
  Grid,
  IconButton,
  Box,
  Fade,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

// Regex pattern for alphanumeric check
const customConditionsPatter = /^[\w\-\s]+$/;

// Check and return array index
function checkIndex(array, val) {
  return array.findIndex(
    (condition) => condition.toLowerCase() === val.toLowerCase(),
  );
}

export default function MedicalConditionsComponent({
  component,
  value,
  // parent,
  onChange,
}) {
  const { paperlessForm } = useStores();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [isError, setIsError] = useState(false);

  // Pre-fill values and show selected medical conditions as checked
  useEffect(() => {
    // timeout is required for formio to load data from the response object
    const timeout = setTimeout(() => {
      const values =
        value[component.key] && !Array.isArray(value[component.key])
          ? value[component.key].split(',')
          : value[component.key];
      setSelectedConditions(values || []);
    }, 500);

    return () => clearTimeout(timeout);
  }, [component, value]);

  useEffect(() => {
    onChange([...selectedConditions].join()); // TODO: KAS-3118: This is temporary logic, revisit it later
  }, [selectedConditions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    paperlessForm.setIsFetching(true);
    // timeout is required for formio to load data from the response object
    const timeout = setTimeout(() => {
      async function fetchData() {
        const medicalConditions = await paperlessForm.fetchMedicalConditions();
        if (medicalConditions && medicalConditions.length) {
          const values =
            value[component.key] && !Array.isArray(value[component.key])
              ? value[component.key].split(',')
              : value[component.key] || [];

          const customValues = [];
          values.forEach((val) => {
            if (
              !medicalConditions.find(
                (condition) => condition.toLowerCase() === val.toLowerCase(),
              )
            ) {
              customValues.push(val);
            }
          });
          setData([...medicalConditions, ...customValues]);
        }
        paperlessForm.setIsFetching(false);
      }
      fetchData();
    }, 500);

    return () => clearTimeout(timeout);
  }, [paperlessForm, value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // timeout added for debounce on search field
    const timeoutId = setTimeout(() => {
      if (searchText && searchText.length) {
        setFilteredData(
          data.filter((d) =>
            d.toLowerCase().includes(searchText.toLowerCase()),
          ),
        );
      } else {
        setFilteredData(data);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data, searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate grouped data to display list in grouped by the first letter
  const groupedData = useMemo(() => {
    // 'No Medical Conditions' value not to be grouped as should be displayed as the first element in the list
    const firstValue = { id: '#', data: [data[0]] };
    const filteredList = [...filteredData];

    // Conditions other than 'No Medical Conditions'
    const obj = filteredList.reduce((r, value) => {
      const l = value.charAt(0).toUpperCase();
      if (!r[l]) {
        r[l] = { id: l, data: [value] };
      } else {
        r[l].data.push(value);
      }
      return r;
    }, {});

    const sorted = Object.values(obj)
      .sort((a, b) => a['id'].localeCompare(b['id']))
      .filter((a) => a.data.length);
    return searchText ? sorted : [firstValue, ...sorted];
  }, [data, searchText, filteredData]);

  const handleCheck = (val) => {
    const index = checkIndex(selectedConditions, val);

    if (index === -1) {
      setSelectedConditions([...selectedConditions, val]);
    } else {
      const conditions = [...selectedConditions];
      conditions.splice(index, 1);
      setSelectedConditions([...conditions]);
    }
  };

  const handleOtherConditions = (e) => {
    const val = e.target.value;
    setOtherCondition(val);
    setIsError(customConditionsPatter.test(val));
  };

  const handleAddCondition = () => {
    const index = checkIndex(data, otherCondition);
    if (index === -1) {
      setData([...data, otherCondition]);
    }
    handleCheck(otherCondition);
    setOtherCondition('');
  };

  return (
    <div className="p-2">
      {paperlessForm.isFetching ? (
        <div className={styles.noPrint}>
          Please wait while loading Medical Conditions...
        </div>
      ) : (
        <>
          <div
            className={
              selectedConditions && selectedConditions.length
                ? styles.noPrint
                : ''
            }
          >
            <Grid
              className={`${styles.noPrint} d-flex align-items-center mt2 mb-4`}
              container
            >
              <Grid item xs={12} md={6}>
                <Box className={styles.searchContainer}>
                  <IconButton aria-label="search" disabled>
                    <SearchIcon />
                  </IconButton>
                  <InputBase
                    fullWidth
                    variant="outlined"
                    size="small"
                    id="search-medical-conditions"
                    placeholder="Search for medical condition"
                    defaultValue=""
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Fade in={searchText.length}>
                    <IconButton aria-label="clear">
                      <ClearIcon onClick={() => setSearchText('')} />
                    </IconButton>
                  </Fade>
                </Box>
              </Grid>
            </Grid>

            <div>
              {groupedData.map((group, i) => (
                <div key={group.id}>
                  <strong>{group.id}</strong>
                  <div className={styles.gridContainer}>
                    {group.data.map((value, i) =>
                      value ? (
                        <FormGroup key={i} className={styles.gridItem}>
                          <FormControlLabel
                            value={value}
                            control={
                              <input
                                type="checkbox"
                                checked={
                                  !!selectedConditions.find(
                                    (condition) =>
                                      condition.toLowerCase() ===
                                      value.toLowerCase(),
                                  )
                                }
                                onChange={() => handleCheck(value)}
                              />
                            }
                            label={
                              <span className={styles.label}>{value}</span>
                            }
                          />
                        </FormGroup>
                      ) : null,
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`${styles.noPrint} mt-2`}>
              <label>Other medical condition</label>
              <Grid className="d-flex align-items-start" container spacing={2}>
                <Grid item xs={9} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={otherCondition.length && !isError}
                    id="custom-medical-conditions"
                    placeholder="Input other medical condition"
                    defaultValue=""
                    value={otherCondition}
                    helperText={
                      otherCondition.length
                        ? !isError && 'Please enter valid alphanumeric value'
                        : ''
                    }
                    onChange={handleOtherConditions}
                    className={styles.inputField}
                  />
                </Grid>
                <Grid item xs={3} style={{ paddingTop: 5 }}>
                  <button
                    className={`secondary-btn ${styles.formButton}`}
                    onClick={handleAddCondition}
                    disabled={!otherCondition.length || !isError}
                  >
                    Add
                  </button>
                </Grid>
              </Grid>
            </div>
          </div>

          <div className={styles.printOnly}>
            {selectedConditions.join(', ')}
          </div>
        </>
      )}
    </div>
  );
}
