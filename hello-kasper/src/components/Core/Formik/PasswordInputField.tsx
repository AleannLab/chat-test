import React, { useState, FC, PropsWithChildren } from "react";
import { withStyles } from "@material-ui/core/styles";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { Field } from "formik";
import PasswordStrengthBar from "react-password-strength-bar";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import passStyles from "./PasswordInputField.module.css";
import ErrorField from "./ErrorField";


const styles = (theme) => ({
  fieldLabel: {
    fontFamily: "Montserrat",
    fontSize: 11,
  },
});

type PasswordInputFieldProps = PropsWithChildren<{
  fieldLabel?: string;
  fieldName?: string;
  rows?: string;
  disabled?: string;
  classes?: string;
  placeholder?: string;
  hideStrengthBar?: boolean;
  mt?: number;
}>;

const PasswordInputField: FC<PasswordInputFieldProps> = ({
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
  const [hidePassword, setHidePassword] = useState(true);

  const hidePasswordChange = () => {
    setHidePassword(!hidePassword);
  };

  return (
    <Field name={fieldName}>
      {({ field, form, meta }) => (
        <>
          {fieldLabel && (
            <div>
              <Typography className="space-top space-bottom" variant="caption">
                {fieldLabel}
              </Typography>
            </div>
          )}
          <TextField
            {...field}
            id={fieldName}
            name={fieldName}
            type={hidePassword ? "password" : "text"}
            placeholder={placeholder}
            // autoComplete={}
            variant="outlined"
            size="small"
            disabled={form.isSubmitting || disabled}
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
          {/* {!hideStrengthBar && (
            <PasswordStrengthBar
              password={field.value}
              scoreWords={[
                "Strength: Weak",
                "Strength: Weak",
                "Strength: Okay",
                "Strength: Good",
                "Strength: Strong",
              ]}
              shortScoreWord="Strength: Weak"
              className={passStyles.passwordStrengthBar}
              scoreWordClassName={passStyles.scoreWord}
            />
          )} */}
        </>
      )}
    </Field>
  );
};

export default PasswordInputField;
