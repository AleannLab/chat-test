import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Avatar from 'components/Avatar';
import { observer } from 'mobx-react';
import { convertHexToRGBA } from 'helpers/misc';

import { ReactComponent as CorrectIcon } from 'assets/images/correct-arrow.svg';
import styles from './index.module.css';
import './index.css';

const ProviderCard = observer(
  ({
    id,
    index,
    firstName,
    lastName,
    suffix,
    speciality,
    displayImage,
    bio,
    disabled,
    selected,
    selectPractitioner,
    brandColor,
  }) => {
    const colors = ['#60C0F5', '#6D6AF6', '#82E980', '#AA77EA'];
    let headerColor = '';
    if (index < 4) {
      headerColor = colors[index];
    } else {
      headerColor = colors[index % 4];
    }

    return (
      <div className={`${selected ? 'cst-card-selected' : 'cst-card'}`}>
        <Card
          className={`${disabled ? styles.disabledCard : styles.card}`}
          onClick={() => {
            if (!disabled) {
              selectPractitioner({
                id,
                name: firstName + ' ' + lastName,
                type: speciality,
              });
            }
          }}
        >
          <CardMedia
            style={{
              height: '70px',
              background: headerColor,
            }}
          />
          <Avatar
            src={displayImage}
            id={id}
            className={styles.practitionerAvatar}
            firstName={firstName}
            lastName={lastName}
          />
          <CardContent className={styles.cardContent}>
            <div className={styles.practitionerDetails}>
              <span className={styles.practitionerName}>
                <>
                  {firstName} {lastName}
                  {suffix ? `, ${suffix}` : ``}
                </>
              </span>
              <span className={styles.practitionerType}>{speciality}</span>
            </div>
            <div className={styles.practitionerDescription}>
              <span>{bio}</span>
            </div>
          </CardContent>
          <CardActions className={styles.cardActions}>
            <ToggleButton
              value="selected"
              size="small"
              selected={selected}
              className={styles.selectButton}
              disabled={disabled}
              style={{
                backgroundColor: convertHexToRGBA(brandColor, 12),
                color: brandColor,
                borderColor: brandColor,
              }}
            >
              {selected ? (
                <div className={styles.selectedButton}>
                  <CorrectIcon
                    fill={brandColor}
                    className={styles.correctIcon}
                  />
                  Selected
                </div>
              ) : (
                'Select'
              )}
            </ToggleButton>
          </CardActions>
        </Card>
      </div>
    );
  },
);

export default ProviderCard;
