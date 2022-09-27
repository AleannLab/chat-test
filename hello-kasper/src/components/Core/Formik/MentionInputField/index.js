import React, { useRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { Box, InputLabel } from '@material-ui/core';
import { MentionsInput, Mention } from 'react-mentions';
import { flatten } from 'lodash';
import Chip from '@material-ui/core/Chip';

import classNames from './index.module.css';
import errorNames from './error.module.css';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const MentionInputField = withStyles(styles)(
  ({
    fieldLabel,
    fieldName,
    disabled,
    tags,
    classes,
    tagLabel,
    maxLength,
    showCharCount = false,
    ...props
  }) => {
    const ref = useRef();
    let initialCursorPosition = 0;

    const replaceVariables = (message) => {
      if (props.setTemplatePreview) {
        props.setTemplatePreview(message);
      }
      /**
       * This function replaces variable display names with ids to send to remove spaces
       * and making those functional to use in email templates.
       */
      if (props.formattedMessage) {
        const messageParts = message.split('{');
        let pushed = [];
        messageParts.forEach((part) => {
          let subparts = part.split('}');
          if (subparts.length > 1) {
            tags.forEach((ele) => {
              if (ele.display === subparts[0]) {
                subparts[0] = `{{${ele.id}}}`;
                pushed.push(subparts);
              }
            });
          } else {
            pushed.push(subparts);
          }
        });
        const modifiedCustomMessage = flatten(pushed).join('');
        // console.debug(modifiedCustomMessage);
        props.formattedMessage(modifiedCustomMessage);
      }
    };

    const handleTagClick = (setFieldValue, currentValue, tag) => {
      // Modify this according to markup of Mention component
      // "__" before and after display/id in mention is discarded while rendering
      // "__" in markup in Mention component is required to render correct tag
      const textToInsert = `${'{' + tag + '}'}`;
      const cursorPosition = ref.current.selectionStart;
      initialCursorPosition = cursorPosition;
      const textBeforeCursorPosition = currentValue.substring(
        0,
        cursorPosition,
      );
      const textAfterCursorPosition = currentValue.substring(
        cursorPosition,
        currentValue.length,
      );
      const finalText =
        textBeforeCursorPosition + textToInsert + textAfterCursorPosition;
      setFieldValue(fieldName, finalText);
      replaceVariables(finalText);

      /**
       * Below function sets the cursor after the tag instead of the last position.
       * Setting of cursor position is set inside a timeout as setting it immediately gets overridden by the last focus() which sets cursor at the last position.
       */
      setTimeout(() => {
        ref.current.selectionStart =
          textToInsert.length + initialCursorPosition;
        ref.current.selectionEnd = textToInsert.length + initialCursorPosition;
        ref.current.focus();
      }, 100);
    };

    const handleOnChange = (e, form, field) => {
      replaceVariables(e.target.value);
      form.setFieldValue(field.name, e.target.value);
    };

    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => {
          return (
            <>
              {fieldLabel && (
                <Box>
                  <InputLabel
                    id={`${field.name}_label`}
                    className={classes.fieldLabel}
                  >
                    <span>{fieldLabel}</span>
                    {showCharCount && maxLength && (
                      <span>{` ${field.value.length} / ${maxLength}`}</span>
                    )}
                  </InputLabel>
                </Box>
              )}
              <MentionsInput
                className="mentions"
                classNames={meta.error ? errorNames : classNames}
                value={field.value}
                onChange={(e) => handleOnChange(e, form, field)}
                id={field.name}
                name={field.name}
                disabled={form.isSubmitting || disabled === true}
                inputRef={ref}
                maxLength={maxLength}
              >
                <Mention
                  trigger="@"
                  data={tags}
                  className={classNames.mentions__mention}
                  markup={'{__display__}'}
                  displayTransform={(id, display) => `{${display}}`}
                  appendSpaceOnAdd
                />
              </MentionsInput>
              {meta.error && (
                <span
                  style={{
                    color: '#F44336',
                    fontSize: '0.8rem',
                    marginLeft: '1rem',
                    marginTop: '4px',
                  }}
                >
                  {meta.error}
                </span>
              )}
              <div className={classNames.tagContainer}>
                <span className={classNames.labelText}>{tagLabel}</span>
                <div className={classNames.tagContainer}>
                  {tags.map((message) => (
                    <Chip
                      disabled={form.isSubmitting || disabled === true}
                      label={message.display}
                      key={message.display}
                      className={classNames.tag}
                      onClick={() =>
                        handleTagClick(
                          form.setFieldValue,
                          form.values[`${fieldName}`],
                          message.display,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            </>
          );
        }}
      </Field>
    );
  },
);

export default MentionInputField;
