import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Skeleton from '@material-ui/lab/Skeleton';
import { Img } from 'react-image';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Loader from 'components/Core/Loader';
import Modal from 'components/Core/Modal';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-pink.svg';
import { ReactComponent as DownloadIcon } from 'assets/images/custom-download.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/custom-delete.svg';
import styles from './index.module.css';
import CropImage from 'components/Core/CropImage';
import { useFlags } from 'launchdarkly-react-client-sdk';

const VALID_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png'];

const BrandCover = (props) => {
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const fileRef = useRef(null);
  const { notification, utils, officeProfile } = useStores();
  const authToken = useAuthToken();
  const { cropBrandLogo } = useFlags();

  const onCropComplete = async (blob) => {
    const file = new File([blob], `${officeProfile.data.office_name}_cover`, {
      lastModified: new Date().getTime(),
      type: blob.type,
    });
    setUploading(true);
    setImgSrc(null);
    await handleSave(file);
  };

  const handleCropImage = async (file) => {
    if (cropBrandLogo) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result.toString() || ''),
      );
      reader.readAsDataURL(file);
    } else {
      setUploading(true);
      await handleSave(file);
    }
  };

  const handleLocalFileUpload = async (e) => {
    const currentFileExtension = e.target.files[0].name
      .split('.')
      [e.target.files[0].name.split('.').length - 1].toLowerCase();
    let valid = VALID_FILE_EXTENSIONS.includes(currentFileExtension);
    if (valid) {
      if (e.target.files && e.target.files.length > 0) {
        handleCropImage(e.target.files[0]);
      }
    } else {
      notification.showError('File type is invalid');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFileExtension = e.dataTransfer.files[0].name
      .split('.')
      [e.dataTransfer.files[0].name.split('.').length - 1].toLowerCase();

    let valid = VALID_FILE_EXTENSIONS.includes(currentFileExtension);
    if (valid) {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleCropImage(e.dataTransfer.files[0]);
      }
    } else if (!valid) {
      notification.showError('File type is invalid');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    fileRef.current.click();
  };

  const handleSave = async (file) => {
    await officeProfile.deleteCompanyCover();
    await officeProfile.fetchData();
    try {
      const response = await officeProfile.uploadCompanyCover(file);
      if (response.url) {
        axios({
          method: 'PUT',
          url: response.url,
          headers: {
            'content-type': file.type,
          },
          processData: false,
          data: file,
        })
          .then(async () => {
            await officeProfile.fetchData();
            notification.showSuccess('Company cover was updated successfully');
            setTimeout(() => {
              notification.hideNotification();
              setUploading(false);
            }, 2500);
          })
          .catch((e) => {
            notification.showError(
              e?.DetailedMessage ||
                'An unexpected error occurred while attempting to fetch the company cover',
            );
          });
      }
    } catch (e) {
      notification.showError(
        e?.DetailedMessage ||
          'An unexpected error occurred while attempting to upload the company cover',
      );
    }
  };

  const handleImageDelete = async () => {
    try {
      await officeProfile.deleteCompanyCover();
      await officeProfile.fetchData();
    } catch (e) {
      notification.showError(
        e?.DetailedMessage ||
          'An unexpected error occurred while attempting to delete the company cover',
      );
    }
    setIsDeleting(false);
    setOpenConfirmation(false);
  };

  return (
    <div className={`${props.className} ${styles.officeImageRootContainer}`}>
      {!!officeProfile.data.office_cover_pic && (
        <div className="d-flex flex-row justify-content-end mb-2">
          <div>
            <input
              ref={fileRef}
              className={styles.hidden}
              type="file"
              onChange={handleLocalFileUpload}
              accept=".jpg, .jpeg, .png"
            />
            <Button
              startIcon={<DownloadIcon fill="#9A9A9A" />}
              onClick={handleClick}
              className="d-flex justify-content-start"
            >
              Upload Cover
            </Button>
          </div>

          <Button
            startIcon={<DeleteIcon fill="#9A9A9A" />}
            onClick={() => setOpenConfirmation(true)}
            className="d-flex justify-content-start"
          >
            Delete
          </Button>
        </div>
      )}

      <div
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={(e) => handleDragEnter(e)}
        onDragLeave={(e) => handleDragLeave(e)}
      >
        {officeProfile.loaded ? (
          officeProfile.data.office_cover_pic && !uploading ? (
            <div className={styles.avatarContainer}>
              <Img
                key={utils.prepareMediaUrl({
                  uuid: officeProfile.data.office_cover_pic,
                  authToken,
                })}
                alt="Company cover"
                className={styles.avatar}
                src={utils.prepareMediaUrl({
                  uuid: officeProfile.data.office_cover_pic,
                  authToken,
                })}
                loader={<Skeleton width="100%" height="100%" variant="rect" />}
              />
            </div>
          ) : (
            <div className={styles.uploadContainer}>
              <Loader show={uploading} message="Uploading brand cover">
                <div className="d-flex flex-row justify-content-center align-items-center h-100 p-1">
                  <CloudUpload className="me-2" />
                  <input
                    ref={fileRef}
                    className={styles.hidden}
                    type="file"
                    onChange={handleLocalFileUpload}
                    accept=".jpg, .jpeg, .png"
                  />
                  <div className={styles.uploadInstructions}>
                    <span className={styles.highlight} onClick={handleClick}>
                      Upload cover
                    </span>{' '}
                    or drop cover here 1920x182px (jpg, png)
                  </div>
                </div>
              </Loader>
            </div>
          )
        ) : (
          <div className={styles.avatarContainer}>
            <Skeleton width="100%" height="100%" variant="rect" />
          </div>
        )}
      </div>

      {openConfirmation && (
        <Modal
          size="sm"
          header="Delete confirmation"
          body={
            <div className={styles.confirmationRoot}>
              <p className={styles.confirmationSubtitle}>
                Are you sure you want to delete the profile picture?
              </p>
              <div className="d-flex justify-content-between mt-5">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  color="primary"
                  disabled={isDeleting}
                  onClick={() => setOpenConfirmation(false)}
                >
                  Cancel
                </Button>

                <Button
                  disabled={isDeleting}
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setIsDeleting(true);
                    handleImageDelete();
                  }}
                >
                  {isDeleting ? 'Deleting' : 'Delete'}
                </Button>
              </div>
            </div>
          }
          onClose={() => setOpenConfirmation(false)}
        />
      )}

      {imgSrc && (
        <CropImage
          imgSrc={imgSrc}
          showPreview={true}
          onCrop={onCropComplete}
          aspect={1280 / 182}
        />
      )}
    </div>
  );
};

export default observer(BrandCover);
