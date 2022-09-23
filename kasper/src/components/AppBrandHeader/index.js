import React from 'react';
import styles from './index.module.css';
import { AppBar } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import Logo from 'assets/images/kasper_default_logo.svg';
import { DEFAULT_APP_HEADER_IMAGE } from 'helpers/constants';

export default function AppBrandHeader() {
  const { officeProfile, notification } = useStores();

  const { data, isSuccess, isLoading } = useQuery(
    'officeInfo',
    () => officeProfile.fetchPublicData(),
    {
      initialData: {
        office_brand_color: '#0D2145',
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  return (
    <React.Fragment>
      <AppBar className={styles.appBar}>
        <img
          alt="Office Cover Image"
          className={styles.coverImage}
          src={
            isSuccess && data?.office_cover_pic_url?.url
              ? data.office_cover_pic_url.url
              : DEFAULT_APP_HEADER_IMAGE
          }
        />

        {isLoading ? (
          <ImgSkeleton bgColor={data.office_brand_color} />
        ) : (
          <img
            alt="Office Profile Image"
            className={styles.profileImage}
            src={
              data?.office_profile_pic_url?.url
                ? data.office_profile_pic_url.url
                : Logo
            }
            style={{
              backgroundColor: '#FFFFFF',
            }}
          />
        )}
      </AppBar>
    </React.Fragment>
  );
}

const ImgSkeleton = ({ bgColor }) => {
  return (
    <Skeleton
      className={styles.profileImage}
      variant="circle"
      style={{ backgroundColor: bgColor }}
    />
  );
};
