import React, { FC } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Field } from "formik";
import { Box, Typography, TextField } from "@material-ui/core";
import ErrorField from "./ErrorField";

type TextInputFieldProps = {
  fieldLabel?: string;
  fieldName?: string;
  maxLength?: number;
  classes?: string;
  placeholder?: string;
  disabled?: boolean;
  mt?: number;
  endAdornment?: any;
  showCharCount?: boolean;
  type?: string;
  style?: any;
  min?: any;
  step?: any;
};

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: "Montserrat",
    fontSize: 11,
  },
});

const TextInputField: FC<TextInputFieldProps> = ({
  fieldLabel,
  fieldName,
  maxLength,
  classes,
  placeholder,
  disabled,
  mt = 3,
  endAdornment,
  showCharCount,
  ...props
}) => {
  return (
    <Field name={fieldName}>
      {({ field, form, meta }) => {
        return (
          <>
            {fieldLabel && (
              <div className="d-flex justify-content-between">
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
                  >{` ${field.value?.length || 0} / ${maxLength}`}</Typography>
                )}
              </div>
            )}
            <TextField
              {...field}
              type={props.type || "text"}
              id={fieldName}
              name={fieldName}
              placeholder={placeholder}
              variant="outlined"
              size="small"
              fullWidth
              disabled={disabled === true}
              InputProps={{ endAdornment }}
              inputProps={
                props.type !== "number"
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
};

export default TextInputField;
