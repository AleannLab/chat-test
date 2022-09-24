import React, { useEffect, useRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'formik';
import { MentionsInput, Mention } from 'react-mentions';
import classNames from './index.module.css';
import errorNames from './error.module.css';
import { replaceMessageSpecialCharacters } from '../../variableContext';

const styles = (theme) => ({
  fieldLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const SuggestionsContainer = ({ children, parentRef }) => {
  const refContainer = useRef();
  if (parentRef.current && refContainer.current) {
    const setContainerPosition = () => {
      const container = refContainer.current.parentNode.parentNode;
      const data = parentRef.current.getBoundingClientRect();
      const toPx = (val, offset = 0) => {
        return Math.floor(val + offset) + 'px';
      };
      container.style.width = toPx(data.width);
      container.style.left = toPx(data.left);
      container.style.zIndex = '10001';
      container.style.top = toPx(data.top, data.height - 10);
    };
    try {
      setTimeout(() => {
        setContainerPosition();
      }, 1);
      setContainerPosition();
    } catch (e) {
      console.log(e);
    }
  }
  return <div ref={refContainer}>{children}</div>;
};

const MentionInputField = withStyles(styles)(
  ({
    value,
    focused,
    onChange,
    fieldLabel,
    fieldName,
    disabled,
    classes,
    tagLabel,
    maxLength,
    tags,
    showCharCount = false,
    ...props
  }) => {
    const ref = useRef();

    useEffect(() => {
      ref.current.focus();
    }, [focused]);

    const handleOnChange = (e, form, field) => {
      props.formattedMessage(e.target.value);
      form.setFieldValue(field.name, e.target.value);
      onChange(e.target.value);
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
                value={replaceMessageSpecialCharacters(value)}
                onChange={(e) => handleOnChange(e, form, field)}
                id={field.name}
                name={field.name}
                disabled={form.isSubmitting || disabled === true}
                inputRef={ref}
                suggestionsPortalHost={document.getElementById(
                  'rapid-replies-modal',
                )}
                maxLength={maxLength}
                customSuggestionsContainer={(children) => {
                  return (
                    <SuggestionsContainer parentRef={ref}>
                      {children}
                    </SuggestionsContainer>
                  );
                }}
              >
                <Mention
                  data={tags}
                  trigger={'{'}
                  className={classNames.mentions__mention}
                  markup={'[[__display__]]'}
                  displayTransform={(id, display) => `{${display}}`}
                  appendSpaceOnAdd
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
