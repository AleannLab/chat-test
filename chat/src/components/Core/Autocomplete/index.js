import Typography from '@material-ui/core/Typography';
import React from 'react';
import ReactTags from 'react-tag-autocomplete';
import './index.css';

const Autocomplete = ({
  tags,
  suggestions,
  onAddition,
  onDelete,
  chipComponent,
  textComponent,
  placeHolderText,
  disabled,
  onInput,
}) => {
  const ChipComponent = chipComponent;
  if (chipComponent) {
    return (
      <ReactTags
        minQueryLength={1}
        tags={tags}
        suggestions={disabled ? [] : suggestions}
        suggestionsFilter={(tag, query) =>
          tag?.name?.toLowerCase().includes(query.toLowerCase())
        }
        placeholderText={placeHolderText}
        onAddition={(tag) => onAddition(tag)}
        onDelete={(i) => onDelete(i)}
        allowBackspace={!disabled}
        maxSuggestionsLength={suggestions.length}
        onInput={onInput}
        tagComponent={({ tag, removeButtonText, onDelete }) => {
          return (
            <ChipComponent
              size="small"
              style={{ flexDirection: 'row-reverse', fontSize: 'small' }}
              label={tag.name}
              onDelete={onDelete}
              disabled={disabled}
            />
          );
        }}
      />
    );
  } else if (textComponent) {
    return (
      <ReactTags
        minQueryLength={1}
        tags={tags}
        suggestionsFilter={(tag, query) =>
          tag.name.toLowerCase().includes(query.toLowerCase())
        }
        suggestions={disabled ? [] : suggestions}
        placeholderText=""
        onAddition={(tag) => onAddition(tag)}
        onDelete={(i) => onDelete(i)}
        allowBackspace={!disabled}
        maxSuggestionsLength={suggestions.length}
        tagComponent={({ tag, removeButtonText, onDelete }) => {
          return (
            <Typography variant="button" disabled={disabled}>
              {tag.name}
            </Typography>
          );
        }}
      />
    );
  }
};

Autocomplete.defaultProps = {
  placeHolderText: '',
  disabled: false,
};

export default Autocomplete;
