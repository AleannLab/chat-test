import React, { useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, Typography, TextField } from '@material-ui/core';
import debounce from 'lodash.debounce';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ErrorField from './ErrorField';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const AutoCompleteInputField = withStyles(styles)(
  ({
    fieldLabel,
    mt = 0,
    fieldName,
    classes,
    placeholder,
    suggestions,
    disabled,
    getOptionLabel,
    filterOptions = (x) => x,
    onChangeInput,
    loading = false,
    onSelectionChange,
    autoCompleteRef,
    renderOption,
    getOptionSelected,
    ...props
  }) => {
    const [filter, setFilter] = React.useState('');

    useEffect(() => onChangeInput(filter), [filter]); // eslint-disable-line react-hooks/exhaustive-deps

    const refreshSuggestions = debounce((query) => setFilter(query), 500);

    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => (
          <>
            {fieldLabel && (
              <Box className="d-flex" mt={mt} mb={1}>
                <Typography
                  className="space-top space-bottom"
                  variant="caption"
                >
                  {fieldLabel}
                </Typography>
              </Box>
            )}
            <Autocomplete
              {...field}
              value={field.value}
              ref={autoCompleteRef}
              options={suggestions || []}
              onChange={(event, newValue) => {
                if (typeof onSelectionChange === 'function') {
                  onSelectionChange(newValue);
                }
                form.setFieldValue(fieldName, newValue);
              }}
              onInputChange={(event, newInputValue) => {
                refreshSuggestions(newInputValue);
              }}
              loading={loading}
              noOptionsText={loading ? '' : 'No options'}
              renderOption={renderOption}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder={placeholder}
                  helperText={<ErrorField fieldName={fieldName} />}
                  error={meta.touched && meta.error}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              getOptionLabel={getOptionLabel}
              getOptionSelected={getOptionSelected}
              // filterOptions={filterOptions}
              // selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              // freeSolo
              autoComplete
              includeInputInList
              disabled={form.isSubmitting || disabled === true}
              filterSelectedOptions
              disableClearable={false}
            />
          </>
        )}
      </Field>
    );
  },
);

export default AutoCompleteInputField;
