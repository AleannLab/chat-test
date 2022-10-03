import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Chip from '@material-ui/core/Chip';
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { Field } from 'formik';
import { InputLabel } from '@material-ui/core';
import './index.css';
import ErrorField from '../ErrorField';

const TagsInputField = ({
  fieldLabel,
  fieldName,
  allowNew = true,
  placeholder,
  defaultValue,
  options,
  suggestions,
  disabled,
  onChangeInput = () => {},
  allowOne = false,
  readOnly = false,
  suggestionsLimit = 5,
}) => {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChangeInput(inputValue);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterOptions = createFilterOptions({
    matchFrom: 'start',
    stringify: (option) => option.name,
    limit: suggestionsLimit,
  });
  return (
    <Field name={fieldName} id={fieldName}>
      {({ field, meta, form: { setFieldValue, isSubmitting } }) => (
        <div className={styles.root}>
          {fieldLabel && (
            <InputLabel
              id={`${field.name}_label`}
              className={styles.fieldLabel}
            >
              {fieldLabel}
            </InputLabel>
          )}

          <Autocomplete
            style={
              isSubmitting || disabled || readOnly === true
                ? { pointerEvents: 'none', cursor: 'no-drop' }
                : {}
            }
            multiple
            id="tags-input-field"
            options={options || suggestions || []}
            defaultValue={defaultValue || []}
            freeSolo={allowNew}
            getOptionSelected={(option, value) => option.name === value.name}
            filterSelectedOptions
            filterOptions={filterOptions}
            value={field.value || []}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={index}
                  style={{ flexDirection: 'row-reverse', fontSize: 'small' }}
                  size="small"
                  label={option.name}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderOption={(option) => (
              <span className="text-truncate">{option.name}</span>
            )}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label=""
                placeholder={placeholder}
                size="small"
                helperText={<ErrorField fieldName={fieldName} />}
                error={meta.touched && meta.error}
              />
            )}
            onInputChange={(event, value, reason) => {
              if (reason === 'input') {
                setInputValue(value);
              }
            }}
            onChange={(event, newInputValue, reason) => {
              if (reason === 'select-option') {
                const newValue =
                  newInputValue[newInputValue.length - 1]['name'];
                !field.value.map((a) => a.name).includes(newValue) &&
                  setFieldValue(fieldName, newInputValue);
              } else if (reason === 'create-option') {
                const oldTags = [...newInputValue];
                const newTag = {
                  name: newInputValue[newInputValue.length - 1],
                };
                oldTags.splice(oldTags.length - 1, 1);
                if (oldTags.find((tag) => tag.name === newTag.name)) return;
                setFieldValue(fieldName, [...oldTags, newTag]);
              } else {
                setFieldValue(fieldName, newInputValue);
              }
            }}
            disabled={disabled}
          />
          {allowNew && (
            <div className={styles.infoText}>
              (Type and press enter to add new {fieldLabel.toLocaleLowerCase()})
            </div>
          )}
        </div>
      )}
    </Field>
  );
};

export default TagsInputField;
