import React, { useEffect, useRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { MentionsInput, Mention } from 'react-mentions';
import classNames from './index.module.css';
import errorNames from './error.module.css';
import {
  VariablesSuggestionContainer,
  VariablesSuggestionItem,
} from '../index';

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
    value,
    focused,
    onChange,
    fieldLabel,
    fieldName,
    disabled,
    tags,
    classes,
    tagLabel,
    maxLength,
    enableRapidReplies,
    showCharCount = false,
    ...props
  }) => {
    const ref = useRef();

    useEffect(() => {
      ref.current.focus();
    }, [focused]);

    const handleOnChange = (e, form) => {
      form.setFieldValue('chat', e.target.value);
      onChange(e);
    };
    const style = {
      position: 'unset',
      suggestions: {
        width: '125%',
        top: '-15px',
        left: '-50px',
        marginTop: '0px',
      },
    };

    return (
      <Field name={fieldName}>
        {({ field, form, meta }) => {
          return (
            <>
              <MentionsInput
                placeholder="Enter your message..."
                className="mentions"
                classNames={meta.error ? errorNames : classNames}
                value={value}
                onChange={(e) => handleOnChange(e, form, field)}
                id={field.name}
                name={field.name}
                style={style}
                disabled={form.isSubmitting || disabled === true}
                inputRef={ref}
                maxLength={maxLength}
                customSuggestionsContainer={(children) => {
                  return <VariablesSuggestionContainer items={children} />;
                }}
                {...props}
              >
                <Mention
                  trigger={'{'}
                  data={enableRapidReplies ? tags : []}
                  className={classNames.mentions__mention}
                  markup={'{__display__}'}
                  displayTransform={(id, display) => `{${display}}`}
                  appendSpaceOnAdd
                  renderSuggestion={(
                    entry,
                    search,
                    highlightedDisplay,
                    index,
                    focused,
                  ) => {
                    return (
                      <VariablesSuggestionItem
                        focused={focused}
                        variable={highlightedDisplay}
                        description={entry?.description}
                      />
                    );
                  }}
                />
              </MentionsInput>
            </>
          );
        }}
      </Field>
    );
  },
);

export default MentionInputField;
