import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import passStyles from './PasswordInputField.module.css';
import { Field } from 'formik';
import PasswordStrengthBar from 'react-password-strength-bar';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import ErrorField from './ErrorField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const PasswordInputField = withStyles(styles)(
  ({
    fieldLabel,
    fieldName,
    rows,
    disabled,
    classes,
    placeholder,
    hideStrengthBar,
    mt = 3,
    ...props
  }) => {
    // const [field, meta, helpers] = useField({ ...props, name: fieldName });

    const [hidePassword, setHidePassword] = useState(true);

    const hidePasswordChange = () => {
      setHidePassword(!hidePassword);
    };

    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => (
          <>
            {fieldLabel && (
              <Box mt={mt} mb={1}>
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
              id={fieldName}
              name={fieldName}
              type={hidePassword ? 'password' : 'text'}
              placeholder={placeholder}
              // autoComplete={}
              variant="outlined"
              size="small"
              disabled={form.isSubmitting || disabled === true}
              fullWidth
              autoComplete=""
              helperText={<ErrorField fieldName={fieldName} />}
              error={meta.touched && meta.error}
              InputProps={{
                endAdornment: disabled ? null : (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={hidePasswordChange}
                      edge="end"
                    >
                      {hidePassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...props}
            />
            {/* <span>{field.value}</span> */}
            {!hideStrengthBar && (
              <PasswordStrengthBar
                password={field.value}
                // barColors={["#ddd", "#1ABA17", "#1ABA17", "#1ABA17", "#1ABA17"]}
                scoreWords={[
                  'Strength: Weak',
                  'Strength: Weak',
                  'Strength: Okay',
                  'Strength: Good',
                  'Strength: Strong',
                ]}
                shortScoreWord="Strength: Weak"
                className={passStyles.passwordStrengthBar}
                scoreWordClassName={passStyles.scoreWord}
              />
            )}
          </>
        )}
      </Field>
    );
  },
);

export default PasswordInputField;
