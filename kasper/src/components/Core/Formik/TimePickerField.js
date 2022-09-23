import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, Typography } from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ErrorField from './ErrorField';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const TimePickerField = withStyles(styles)(
  ({
    fieldLabel,
    mt = 3,
    fieldName,
    options,
    disabled,
    classes,
    placeholder,
    disableUserInput = false,
    ...props
  }) => {
    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => (
          <div className="d-flex flex-column">
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
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardTimePicker
                keyboardIcon={
                  <ScheduleIcon style={{ fontSize: '1rem', fill: '#0D2145' }} />
                }
                label=""
                margin="normal"
                id="time-picker-dialog"
                className="mt-0 time-picker"
                //disablePast
                size="small"
                value={field.value}
                name="time"
                inputVariant="outlined"
                disabled={form.isSubmitting || disabled === true}
                onChange={(e) => {
                  form.setFieldValue(fieldName, e);
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}
                helperText={<ErrorField fieldName={fieldName} />}
                error={meta.touched && meta.error}
                InputProps={{ readOnly: disableUserInput }}
                {...props}
              />
            </MuiPickersUtilsProvider>
          </div>
        )}
      </Field>
    );
  },
);

export default TimePickerField;
