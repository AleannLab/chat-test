import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './index.module.css';
import { Typography } from '@material-ui/core';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import BrandLogo from './BrandLogo';
import BrandCover from './BrandCover';
import BrandColor from './BrandColor';
import BrandPreview from 'components/Core/Previews/Brand';

const BrandCustomization = () => {
  const { notification, officeProfile, utils } = useStores();
  const authToken = useAuthToken();

  useEffect(() => {
    officeProfile
      .fetchData()
      .then(() => {
        officeProfile.loaded = true;
      })
      .catch(() => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the office information',
        );
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Typography variant="h2" className="mb-2">
          Brand Customization
        </Typography>
        <Typography variant="body1">
          {`Upload your clinic logo and cover picture. They will be displayed in various patient facing interfaces, including online scheduling and paperless forms.`}
        </Typography>
        <Typography variant="h4" color="textPrimary" className="my-4">
          Upload Company Logo
        </Typography>
        <BrandLogo className="my-2" />
        <Typography variant="h4" color="textPrimary" className="my-4">
          Upload Company Cover
        </Typography>
        <BrandCover className="my-2" />
        <Typography variant="h4" color="textPrimary" className="my-4">
          Select Brand Color
        </Typography>
        <BrandColor className="my-2" />
        {officeProfile.loaded ? (
          <>
            <Typography variant="h4" color="textPrimary" className="my-4">
              Preview
            </Typography>
            <BrandPreview
              brandColor={officeProfile.data.office_brand_color}
              coverPictureUrl={utils.prepareMediaUrl({
                uuid: officeProfile.data.office_cover_pic,
                authToken,
              })}
              profilePictureUrl={utils.prepareMediaUrl({
                uuid: officeProfile.data.office_profile_pic,
                authToken,
              })}
            />
          </>
        ) : null}
        <div
          style={{
            height: '10rem !important',
            visibility: 'hidden',
          }}
        >
          scroll-space
        </div>
      </div>
    </div>
  );
};

export default observer(BrandCustomization);
