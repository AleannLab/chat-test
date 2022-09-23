import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';

import 'react-image-crop/dist/ReactCrop.css';

// const SCALE = 1;
// const ROTATE = 0;

const CropImage = ({ className, header, imgSrc, aspect, onCrop }) => {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setOpenModal(Boolean(imgSrc));
  }, [imgSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  function onImageLoad(e) {
    imgRef.current = e.currentTarget;

    const { width, height } = e.currentTarget;

    // This is to demonstrate how to make and center a % aspect crop
    // which is a bit trickier so we use some helper functions.
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspect,
        width,
        height,
      ),
      width,
      height,
    );

    setCrop(crop);
  }

  /**
   * @param {HTMLImageElement} image - Image File Object
   * @param {Object} crop - crop Object
   * @param {String} fileName - Name of the returned file in Promise
   */
  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    // New lines to be added
    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    // As Base64 string
    // const base64Image = canvas.toDataURL("image/jpeg");
    // return base64Image;

    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          blob.name = fileName;
          resolve(blob);
        },
        'image/jpeg',
        1,
      );
    });
  };

  const handleCropComplete = async () => {
    () => setOpenModal(false);
    const croppedImg = await getCroppedImg(
      imgRef.current,
      completedCrop,
      'rishi.png',
    );
    typeof onCrop === 'function' && onCrop(croppedImg);
  };

  return (
    openModal && (
      <Modal
        size="lg"
        header={header}
        body={
          <div className={`d-flex flex-column align-items-center ${className}`}>
            {Boolean(imgSrc) && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  alt={header}
                  src={imgSrc}
                  style={
                    {
                      // transform: `scale(${SCALE}) rotate(${ROTATE}deg)`,
                      // minHeight: 360,
                    }
                  }
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>
        }
        footer={
          <>
            <Button
              className="primary-btn mr-auto"
              variant="outlined"
              color="primary"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>

            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={handleCropComplete}
            >
              {`Crop & Save`}
            </Button>
          </>
        }
        onClose={() => setOpenModal(false)}
      />
    )
  );
};

CropImage.propTypes = {
  className: PropTypes.string,
  header: PropTypes.element,
  imgSrc: PropTypes.string,
  aspect: PropTypes.oneOf([1, 16 / 9]),
  onCrop: PropTypes.func,
};

CropImage.defaultProps = {
  className: '',
  header: 'Crop Image',
  aspect: 1,
  onCrop: () => {},
};

export default CropImage;
