import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, Typography, TextField } from '@material-ui/core';
import ErrorField from './ErrorField';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const TextInputField = withStyles(styles)(
  ({
    fieldLabel,
    fieldName,
    maxLength,
    rows,
    classes,
    placeholder,
    disabled,
    mt = 3,
    endAdornment,
    showCharCount,
    ...props
  }) => {
    // const [field, meta, helpers] = useField({ ...props, name: fieldName });

    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => {
          return (
            <>
              {fieldLabel && (
                <Box className="d-flex justify-content-between" mt={mt} mb={1}>
                  <Typography
                    className="space-top space-bottom"
                    variant="caption"
                  >
                    {fieldLabel}
                  </Typography>
                  {showCharCount && maxLength && (
                    <Typography
                      className="space-top space-bottom"
                      variant="caption"
                    >{` ${
                      field.value?.length || 0
                    } / ${maxLength}`}</Typography>
                  )}
                </Box>
              )}
              <TextField
                {...field}
                type={props.type || 'text'}
                // component={TextField}
                id={fieldName}
                name={fieldName}
                placeholder={placeholder}
                // autoComplete={}
                variant="outlined"
                size="small"
                fullWidth
                disabled={disabled === true}
                InputProps={{ endAdornment }}
                inputProps={
                  props.type !== 'number'
                    ? { maxLength, style: props.style }
                    : {
                        min: props.min,
                        step: props.step,
                        style: props.style,
                      }
                }
                helperText={<ErrorField fieldName={fieldName} />}
                error={meta.touched && !!meta.error}
                {...props}
              />
            </>
          );
        }}
      </Field>
    );
  },
);

export default TextInputField;
