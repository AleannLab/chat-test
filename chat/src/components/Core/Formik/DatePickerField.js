import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, Typography } from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ErrorField from './ErrorField';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const DatePickerField = withStyles(styles)(
  ({
    fieldLabel,
    mt = 3,
    fieldName,
    options,
    disabled,
    classes,
    placeholder,
    maxDate,
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
              <KeyboardDatePicker
                keyboardIcon={
                  <CalendarTodayIcon
                    style={{ fontSize: 14, fill: '#0D2145' }}
                  />
                }
                label=""
                maxDate={maxDate}
                margin="normal"
                id="date-picker-dialog"
                className="mt-0 date-picker"
                //disablePast
                fullWidth
                format="MM/dd/yyyy"
                placeholder="MM/DD/YYYY"
                value={field.value}
                name={fieldName}
                inputVariant="outlined"
                disabled={form.isSubmitting || disabled === true}
                onChange={(e) => {
                  form.setFieldValue(fieldName, e);
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                helperText={<ErrorField fieldName={fieldName} />}
                error={meta.touched && meta.error}
                {...props}
              />
            </MuiPickersUtilsProvider>
          </div>
        )}
      </Field>
    );
  },
);

export default DatePickerField;
