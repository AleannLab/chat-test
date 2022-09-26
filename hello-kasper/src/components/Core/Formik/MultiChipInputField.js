import React, { useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, ErrorMessage } from 'formik';
import { InputLabel } from '@material-ui/core';
import ReactTags from 'react-tag-autocomplete';
import debounce from 'lodash.debounce';

import './MultiChipInputField.css';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const MultiChipInputField = withStyles(styles)(
  ({
    fieldLabel,
    fieldName,
    allowNew = true,
    classes,
    placeholder,
    suggestions,
    disabled,
    onChangeInput,
    tagComponent,
    allowOne = false,
    readOnly = false,
  }) => {
    const [filter, setFilter] = React.useState('');

    useEffect(() => onChangeInput(filter), [filter]); // eslint-disable-line react-hooks/exhaustive-deps

    const refreshSuggestions = debounce((query) => setFilter(query), 500);

    return (
      <Field name={fieldName} id={fieldName}>
        {({ field, form: { setFieldValue, isSubmitting } }) => (
          <>
            {fieldLabel && (
              <InputLabel
                id={`${field.name}_label`}
                className={classes.fieldLabel}
              >
                {fieldLabel}
              </InputLabel>
            )}
            <div
              style={
                isSubmitting || disabled || readOnly === true
                  ? { pointerEvents: 'none', cursor: 'no-drop' }
                  : {}
              }
            >
              <ReactTags
                autofocus={false}
                allowNew={allowNew || true}
                tags={field.value || []}
                // delimiterChars={[',']}
                // delimiters={[188,13,9]}
                onDelete={(i) => {
                  if (allowOne === true) {
                    setFieldValue(fieldName, []);
                  } else if (field.value && Array.isArray(field.value)) {
                    const tags = field.value.slice(0);
                    tags.splice(i, 1);
                    setFieldValue(fieldName, tags);
                  }
                }}
                onAddition={(tag) => {
                  //if (!(/^[a-zA-Z][a-zA-Z\s\\.\\#]*[a-zA-Z]$/.test(tag.name))) return false;
                  console.log('REACTTAGS handleAddition', tag);
                  if (allowNew === false && !tag.id) return;

                  var curTags = field.value || [];
                  var oldTag = curTags.find((item) => item.id === tag.id);
                  if (!tag.id || !oldTag) {
                    const tags = [].concat(
                      allowOne === true ? [] : curTags,
                      tag,
                    );
                    console.log('REACTTAGS handleAddition tags', tags);
                    setFieldValue(fieldName, tags);
                  }
                }}
                suggestions={suggestions || []}
                onInput={(query) => refreshSuggestions(query)}
                placeholderText={placeholder || ''}
                tagComponent={tagComponent}
              />
            </div>
            <ErrorMessage name={fieldName} />
          </>
        )}
      </Field>
    );
  },
);

export default MultiChipInputField;
