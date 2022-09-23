import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, Typography, TextField, InputAdornment } from '@material-ui/core';
import PhoneNumber from 'awesome-phonenumber';
import { normalizeNumber } from 'helpers/misc';
import ErrorField from './ErrorField';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const PhoneInputField = withStyles(styles)(
  ({
    fieldLabel,
    fieldName,
    maxLength = 10,
    rows,
    classes,
    placeholder = '',
    showMaskedPlaceholder = true,
    disabled,
    mt = 3,
    callbackOnUpdate, // runs whenever there is a onBlur or onChange event
    ...props
  }) => {
    // const [field, meta, helpers] = useField({ ...props, name: fieldName });

    var ayt = PhoneNumber.getAsYouType('US');

    const handlePhoneNumberChange = (value) => {
      return ayt.reset(normalizeNumber(value));
    };
    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => {
          field.value = handlePhoneNumberChange(field.value);
          return (
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
              <TextField
                {...field}
                // component={TextField}
                id={fieldName}
                name={fieldName}
                placeholder={
                  showMaskedPlaceholder
                    ? PhoneNumber.getExample('US').getNumber('national')
                    : placeholder
                } // autoComplete={}
                variant="outlined"
                size="small"
                fullWidth
                disabled={disabled === true}
                inputProps={{
                  maxLength: maxLength + 4, //due to extra characters added by US formatting
                  style: props.style,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+1</InputAdornment>
                  ),
                }}
                helperText={<ErrorField fieldName={fieldName} />}
                error={meta.touched && meta.error}
                onChange={(e) => {
                  field.onChange(e);
                  callbackOnUpdate && callbackOnUpdate(e); // run callback and update value
                }}
                onBlur={(e) => {
                  field.onBlur(e);
                  callbackOnUpdate && callbackOnUpdate(e);
                }}
              />
            </>
          );
        }}
      </Field>
    );
  },
);

export default PhoneInputField;
