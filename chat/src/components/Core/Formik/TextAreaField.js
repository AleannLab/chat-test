import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import textAreaStyles from './TextAreaField.module.css';
import { Box, InputLabel, TextField } from '@material-ui/core';
import ErrorField from './ErrorField';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const TextAreaField = withStyles(styles)(
  ({
    fieldLabel,
    fieldName,
    disabled,
    placeholder,
    maxLength,
    rowsMax = 5,
    rows = 3,
    mt = 0,
    classes,
    shouldResize = true,
    showCharCount = false,
    inputClassName,
    shouldValidate = true,
    ...props
  }) => {
    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => (
          <>
            {fieldLabel && (
              <Box mt={mt}>
                <InputLabel
                  id={`${field.name}_label`}
                  className={classes.fieldLabel}
                >
                  <span className="mb-2">{fieldLabel}</span>
                  {showCharCount && maxLength && (
                    <span>{` ${field.value?.length || 0} / ${maxLength}`}</span>
                  )}
                </InputLabel>
              </Box>
            )}
            <TextField
              {...field}
              id={fieldName}
              name={fieldName}
              placeholder={placeholder}
              // autoComplete={}
              rowsMax={rowsMax}
              rows={rows}
              inputProps={{
                className: `${
                  shouldResize
                    ? textAreaStyles.textareaCustomResize
                    : textAreaStyles.textareaCustom
                } ${inputClassName}`,
                maxLength,
              }}
              // className={textAreaStyles.textareaCustom}
              variant="outlined"
              multiline
              size="small"
              disabled={form.isSubmitting || disabled === true}
              fullWidth
              helperText={
                shouldValidate && <ErrorField fieldName={fieldName} />
              }
              error={shouldValidate && meta.touched && meta.error !== undefined}
              {...props}
            />
          </>
        )}
      </Field>
    );
  },
);

export default TextAreaField;
