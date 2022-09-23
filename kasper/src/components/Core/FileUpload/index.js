import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

import { useStores } from 'hooks/useStores';
import { guidGenerator } from 'helpers/misc';
import { ReactComponent as CloudUploadIcon } from 'assets/images/cloud-upload.svg';
import styles from './index.module.css';

const FileElement = ({ file, onRemove, disabled, index }) => {
  return (
    <span className={styles.fileElementContainer} key={index}>
      <span>{file.name}</span>
      <IconButton
        aria-label="remove"
        onClick={onRemove}
        size="small"
        disabled={disabled}
      >
        <CloseIcon />
      </IconButton>
    </span>
  );
};

const FileUpload = ({
  maxLimit,
  accept,
  maxFileSize,
  onFilesChanged,
  disabled,
}) => {
  const idForHTMLComponent = guidGenerator();
  const [files, setFiles] = useState([]);
  const { notification } = useStores();
  const validExtensions = accept
    .split(',')
    .map((extension) => extension.trim());
  let validFiles = [];

  useEffect(() => {
    if (onFilesChanged) {
      onFilesChanged([...files]);
    }
  }, [files.length, onFilesChanged]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    [...e.target.files].forEach((file) => {
      const extension =
        '.' +
        file.name.split('.')[file.name.split('.').length - 1].toLowerCase();
      let valid = validExtensions.includes(extension);

      if (valid) {
        if (maxFileSize) {
          // Converting size in megabytes to bytes
          if (file.size >= maxFileSize * 1024 * 1024) {
            notification.showError(
              `Maximum allowed file size is ${maxFileSize}MB`,
            );
          } else {
            validFiles.push(file);
          }
        }
      } else {
        notification.showError('File type is invalid');
      }
    });

    const setOfFiles = [...files, ...validFiles];

    if (setOfFiles.length > maxLimit) {
      notification.showError(`You can add up to ${maxLimit} files`);
      setFiles(setOfFiles.slice(0, 10));
    } else {
      setFiles(setOfFiles);
    }
  };

  const handleFileRemove = (fileIndex) => {
    const currentFiles = [...files];
    currentFiles.splice(fileIndex, 1);
    setFiles([...currentFiles]);
  };

  return (
    <>
      <div>
        <input
          className={styles.hidden}
          id={idForHTMLComponent}
          multiple
          type="file"
          onChange={handleChange}
          disabled={files.length >= maxLimit}
          accept={accept}
        />
        <label htmlFor={idForHTMLComponent}>
          <Button
            size="small"
            className={styles.uploadButton}
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={disabled || files.length >= maxLimit}
          >
            Choose files
          </Button>
        </label>
        {files.length ? (
          files.map((file, index) => (
            <FileElement
              key={index}
              file={file}
              onRemove={() => handleFileRemove(index)}
              disabled={disabled}
            />
          ))
        ) : (
          <span
            className={[styles.fileElementContainer, styles.noFileMsg].join(
              ' ',
            )}
          >
            No file is chosen
          </span>
        )}
      </div>
    </>
  );
};

FileUpload.propTypes = {
  maxLimit: PropTypes.number,
  // files: PropTypes.array,
  accept: PropTypes.string,
  maxFileSize: PropTypes.number,
  onFilesChanged: PropTypes.func,
  disabled: PropTypes.bool,
};

FileUpload.defaultProps = {
  maxLimit: 10,
  // files: [],
  accept: '.jpg, .png, .pdf, .docx, .xlsx',
  maxFileSize: 100,
  onFilesChanged: () => {},
  disabled: false,
};

export default FileUpload;
