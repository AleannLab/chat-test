import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, Typography, TextField } from '@material-ui/core';
import ErrorField from './ErrorField';

const styles = () => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const SelectField = withStyles(styles)(
  ({
    fieldLabel,
    mt = 3,
    mb = 1,
    fieldName,
    disabled,
    options,
    classes,
    placeholder,
    ...props
  }) => {
    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => (
          <div className="d-flex flex-column w-100">
            {
              <Box className="d-flex" mt={mt} mb={mb}>
                <Typography
                  className="space-top space-bottom"
                  variant="caption"
                >
                  {fieldLabel}
                </Typography>
              </Box>
            }
            <TextField
              {...field}
              id={fieldName}
              select
              name={fieldName}
              onChange={(e) => {
                form.setFieldValue(fieldName, e.target.value);
              }}
              placeholder={placeholder}
              className="select-option"
              // autoComplete={}
              variant="outlined"
              size="small"
              disabled={form.isSubmitting || disabled === true}
              fullWidth
              helperText={<ErrorField fieldName={fieldName} />}
              error={meta.touched && meta.error !== undefined}
              {...props}
            >
              {options}
            </TextField>
          </div>
        )}
      </Field>
    );
  },
);

export default SelectField;
