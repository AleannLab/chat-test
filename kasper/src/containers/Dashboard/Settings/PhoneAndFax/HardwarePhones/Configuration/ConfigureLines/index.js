import { Skeleton } from '@material-ui/lab';
import React, { useMemo } from 'react';
import styles from './index.module.css';
import { useHistory, useRouteMatch } from 'react-router-dom';
import moment from 'moment-timezone';
import { useStores } from 'hooks/useStores';
import { ReactComponent as TelephoneIcon } from 'assets/images/telephone.svg';
import { ReactComponent as ParkedLineIcon } from 'assets/images/parked-line.svg';
import { ReactComponent as UserProfile } from 'assets/images/user-profile.svg';
import DialpadIcon from '@material-ui/icons/Dialpad';
import LineItem from '../LineItem';
import { ButtonBase } from '@material-ui/core';
import { useState } from 'react';

const PAGES = [1, 2, 3];
const LINES = 30;
const LINES_PER_PAGE = 10;
const FIRST_LINE = 1;

const ChangePage = ({ currentPage, onChangePage }) => {
  return (
    <div className={styles.changePageContainer}>
      {PAGES.map((page) => (
        <ButtonBase
          onClick={() => onChangePage(page)}
          className={styles.changePageButton}
          style={{
            color: currentPage === page ? '#F4266E' : '#000',
            border: `1px solid ${currentPage === page ? '#F4266E' : '#D2D2D2'}`,
          }}
          key={page}
        >
          {page}
        </ButtonBase>
      ))}
    </div>
  );
};

const ConfigureLines = ({ selectedPhone, loading }) => {
  const [currentPage, setCurrentPage] = useState(PAGES[0]);
  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/hardware-phones/:hardwarePhoneId',
  );

  const { authentication } = useStores();
  const { timezone } = authentication.user || {};
  const config = useMemo(
    () => selectedPhone?.hardware_config?.line_keys || [],
    [selectedPhone],
  );

  const extractLineNumberFromLine = (line) => {
    // Find key with format "linekey.<NUMBER>.line"
    const keys = Object.keys(line);
    const regex = /^linekey\.([0-9]+)\.line$/i;
    for (const key of keys) {
      if (regex.test(key)) {
        return line[key];
      }
    }
    return null;
  };

  const groupLinesData = (lines) => {
    // Group Config Object according to their line number
    const grouped = {};
    for (const line of lines) {
      const lineNumber = extractLineNumberFromLine(line);
      if (typeof lineNumber === 'number') {
        grouped[lineNumber] = line;
      }
    }
    return grouped;
  };

  let transformed = groupLinesData(config);

  const getSelected = (line) => {
    // Format Config Object to be used in LineItem
    const configObj = transformed[line];
    let icon;
    if (configObj) {
      const type = configObj[`linekey.${line}.type`];
      const label = configObj[`linekey.${line}.label`];
      const value = configObj[`linekey.${line}.value`];

      const isAgent = type === 16 && !value?.includes('park');
      const isSpeedDial = type === 13;
      const isParkedLine = type === 16 && value?.includes('park');

      if (isSpeedDial) {
        icon = <DialpadIcon style={{ fontSize: 15, color: '#566F9F' }} />;
      }
      if (isAgent) {
        icon = <UserProfile fill={'#566F9F'} />;
      }
      if (isParkedLine) {
        icon = <ParkedLineIcon />;
      }
      return { icon, label };
    }
  };

  const getTypeParam = (type, value) => {
    const isAgent = type === 16 && !value?.includes('park');
    const isSpeedDial = type === 13;
    const isParkedLine = type === 16 && value?.includes('park');

    if (isAgent) return 'AGENT';
    if (isSpeedDial) return 'SD';
    if (isParkedLine) return 'PARK';
  };

  const renderLineItems = (from, to, alignedLeft) => {
    const lines = new Array(LINES).fill().map((_, index) => index + 1);
    return lines.slice(from - 1, to).map((line) => {
      const configObj = transformed[line];
      const type = configObj?.[`linekey.${line}.type`];
      const value = configObj?.[`linekey.${line}.value`];
      const label = configObj?.[`linekey.${line}.label`];

      const baseModal = `${match.url}/edit-line/${line}`;
      const selectedModal = `${match.url}/edit-line/${line}?type=${getTypeParam(
        type,
        value,
      )}&value=${value}&label=${label}`;
      return line === LINES_PER_PAGE * currentPage ? (
        <ChangePage currentPage={currentPage} onChangePage={setCurrentPage} />
      ) : line === 1 ? (
        <LineItem
          alignLeft
          selected={{
            icon: <TelephoneIcon />,
            label: selectedPhone?.fullname,
          }}
        />
      ) : (
        <LineItem
          loading={loading}
          disabled={loading}
          alignLeft={alignedLeft}
          selected={getSelected(line)}
          editable
          onClick={() => {
            history.push(configObj ? selectedModal : baseModal);
          }}
          key={line}
        />
      );
    });
  };

  const currentPageOffset = (currentPage - 1) * 10;

  return (
    <div className={styles.ConfigureLinesWrapper}>
      <div className={styles.lineLabelsContainer}>
        {new Array(5).fill().map((_, index) => (
          <span key={index}>{`LINE ${currentPageOffset + (index + 1)}`}</span>
        ))}
      </div>
      <div className={styles.configureLinesContainer}>
        <div className={styles.configureLinesHeader}>
          <TelephoneIcon style={{ opacity: 0.5 }} />
          <span className={styles.phoneLabel}>
            {selectedPhone?.fullname ?? (
              <Skeleton animation="wave" height={10} width={79} />
            )}
          </span>
        </div>
        <div className={styles.configureLinesContent}>
          <div className={styles.lineItemsColumn}>
            {renderLineItems(
              currentPageOffset + FIRST_LINE,
              currentPageOffset + 5,
              true,
            )}
          </div>
          <div className={styles.timeContainer}>
            <span className={styles.time}>
              {moment.utc().tz(timezone).format('HH:mm')}
            </span>
            <span style={{ marginTop: -10 }} className={styles.textSmall}>
              {moment.utc().tz(timezone).format('dddd, MMM D ')}
            </span>
          </div>
          <div className={styles.lineItemsColumn}>
            {renderLineItems(
              currentPageOffset + 6,
              currentPageOffset + LINES_PER_PAGE,
            )}
          </div>
        </div>
        <div className={styles.configureLinesFooter}>
          <span className={styles.textSmall}>History</span>
          <div className={styles.footerDivider} />
          <span className={styles.textSmall}>Directory</span>
          <div className={styles.footerDivider} />
          <span className={styles.textSmall}>DND</span>
          <div className={styles.footerDivider} />
          <span className={styles.textSmall}>Menu</span>
        </div>
      </div>
      <div className={styles.lineLabelsContainer}>
        {new Array(5).fill().map((_, index) => (
          <span key={index + 5}>{`LINE ${
            currentPageOffset + (index + 6)
          }`}</span>
        ))}
      </div>
    </div>
  );
};

export default ConfigureLines;
