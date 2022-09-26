import React from 'react';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { convertHexToRGBA } from 'helpers/misc';
import PropTypes from 'prop-types';
import styles from './index.module.css';
import ProviderPanel from './ProviderPanel';
import SchedulingPanel from './SchedulingPanel';
import Logo from 'assets/images/kasper_default_logo.svg';

const BrandPreview = ({ coverPictureUrl, profilePictureUrl, brandColor }) => {
  const secondaryColor = convertHexToRGBA(brandColor, 12);
  return (
    /**
     * Main container
     */
    <Box className={styles.container}>
      {/**
       * Cover Picture
       */}
      <div
        className={styles.coverPicture}
        style={
          coverPictureUrl
            ? {
                background: `url('${coverPictureUrl}')`,
              }
            : {
                backgroundColor: brandColor,
              }
        }
      ></div>
      {/**
       * Preview container
       */}
      <div className={styles.previewContainer}>
        {/**
         * Brand Profile Picture
         */}
        <div className={styles.profilePicture}>
          <img src={profilePictureUrl || Logo} alt="" width="100%" />
        </div>
        <div className="d-flex">
          <div style={{ flex: 1 }}>
            <Skeleton
              variant="rect"
              width="65%"
              height={10}
              animation={false}
              style={{ marginBottom: '0.5rem' }}
            />
            <Skeleton variant="rect" width="75%" height={4} animation={false} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: '75%',
                backgroundColor: secondaryColor,
                border: `0.5px solid ${brandColor}`,
                margin: '0 0 0 auto',
                padding: '0.5rem 1.5rem',
              }}
            >
              <Skeleton
                variant="rect"
                width="65%"
                height={4}
                animation={false}
                style={{ marginBottom: '0.5rem', backgroundColor: brandColor }}
              />
              <Skeleton
                variant="rect"
                width="75%"
                height={4}
                animation={false}
                style={{ backgroundColor: brandColor }}
              />
            </div>
          </div>
        </div>
        <div className={styles.previewContent}>
          <div className={styles.providerPanel}>
            <ProviderPanel
              primaryColor={brandColor}
              secondaryColor={secondaryColor}
            />
          </div>
          <div className={styles.separator}></div>
          <div className={styles.schedulingPanel}>
            <SchedulingPanel
              primaryColor={brandColor}
              secondaryColor={secondaryColor}
            />
          </div>
        </div>
      </div>
    </Box>
  );
};

BrandPreview.propTypes = {
  coverPictureUrl: PropTypes.string,
  profilePictureUrl: PropTypes.string,
  brandColor: PropTypes.string,
};

BrandPreview.defaultProps = {
  coverPictureUrl: '',
  profilePictureUrl: '',
  brandColor: '',
};

export default BrandPreview;
