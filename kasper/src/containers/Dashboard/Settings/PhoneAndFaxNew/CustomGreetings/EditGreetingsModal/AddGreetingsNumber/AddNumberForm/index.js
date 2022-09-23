import {
  Button,
  Card,
  Fade,
  IconButton,
  InputBase,
  LinearProgress,
  makeStyles,
} from '@material-ui/core';
import { Form, Formik } from 'formik';
import { Scrollbars } from 'react-custom-scrollbars';
import Checkbox from 'components/Core/Checkbox';
import styles from './index.module.css';
import ClearIcon from '@material-ui/icons/Clear';
import React, { useRef, useState } from 'react';
import { ReactComponent as SearchIcon } from 'assets/images/search-icon.svg';
import debounce from 'lodash.debounce';
import { observer } from 'mobx-react';
import { ReactComponent as NoCallsIcon } from 'assets/images/no-calls-selected.svg';
import ListManager from 'components/ListManager';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import AddNumberSkeleton from './AddNumberSkeleton';

const useStyles = makeStyles((theme) => ({
  card: {
    background: 'transparent',
    borderRadius: '0px',
    borderBottom: 'none',
    boxShadow: 'none',
    padding: '0 !important',
  },
  selectedCard: {
    background: 'transparent',
    borderRadius: '0px',
    borderBottom: 'none',
    '& > div': {
      borderLeft: 'none',
    },
  },

  InputBase: {
    background: 'transparent',
    width: '90%',
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    color: '#999999',
    marginLeft: '8px',
  },

  input: {
    '&::placeholder': {
      color: '#999999',
    },
  },
  newSmsBtn: {
    padding: '1rem',
    background: '#243656',
    borderBottom: '1px solid #293D63',
  },
  unseenSmsBtn: {
    padding: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.8rem',
    fontFamily: 'Montserrat',
    cursor: 'pointer',
    color: '#000000',
    backgroundColor: '#d9e2f3',
  },
  refreshIcon: {
    color: '#cccccc',
    cursor: 'pointer',
  },
  refreshSpinner: {
    height: '1rem !important',
    width: '1rem !important',
    color: '#cccccc',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    left: '0%',
    right: '0%',
    top: '105%',
    position: 'absolute',
    bottom: '0%',
    background: 'ffffff',

    '& .Mui-selected': {
      color: '#f4266e',
      backgroundColor: '#ffffff',
      border: '1px solid #f4266e',
    },
    '& li:first-child': {
      display: 'none',
    },
    '& li>button': {
      color: '#02122F',
    },
    '& li:last-child': {
      display: 'none',
    },
  },
}));

const Header = () => {
  return (
    <div className={styles.header}>
      <span className="d-flex align-items-center">Choose Phone Number(s)</span>
    </div>
  );
};

const AddNumberForm = observer(
  ({ handleClose, selectedNumbers, selectedName }) => {
    const classes = useStyles();
    const searchField = useRef();
    const [clearFieldBtn, setClearFieldBtn] = useState(false);
    const [filteredNumbers, setFilteredNumbers] = useState([]);
    const { customGreetings, notification, incomingCalls } = useStores();
    const { greetingID, Id, greetingType } = useParams();
    const GreetingName = greetingType.split('-')?.[0];
    const selectedNumberHasLength = selectedNumbers.length > 0 ? true : false;
    const method = selectedNumberHasLength ? 'PATCH' : 'POST';
    const shouldFilter = selectedNumberHasLength ? true : false;
    const QueryClient = useQueryClient();

    const NoPhonesText = (
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
        <div className="p-3">
          <NoCallsIcon />
        </div>
        <div className={styles.noMessageText}>No phone numbers available</div>
      </div>
    );

    const {
      data: officeNumbers = [],
      isLoading,
      isFetched,
    } = useQuery('getOfficeNumbers', () => incomingCalls.getNumbers(), {
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the number list.',
        );
      },
    });

    const { mutateAsync, isLoading: isUpdatingNumbers } = useMutation(
      'selectLogMutation',
      (payload) => customGreetings.postOfficeNumbers(payload),
      {
        onError: () => {
          notification.showError(
            'An unexpected error occurred while attempting to fetch the number list.',
          );
        },
        onSuccess: () => {
          QueryClient.invalidateQueries('getGreetings');
          handleClose();
        },
      },
    );

    const clearField = () => {
      searchField.current.value = '';
      refreshNumberList('');
      setFilteredNumbers([]);
      if (clearFieldBtn !== false) {
        setClearFieldBtn(false);
      }
    };
    const appearClearField = (event) => {
      if (event.target.value.length > 0) setClearFieldBtn(true);
      else setClearFieldBtn(false);
    };

    const refreshNumberList = debounce((filter) => {
      const filteredData = officeNumbers.filter((obj) => {
        return Object.keys(obj).some((key) => {
          return obj?.[key]
            ?.toString()
            ?.toLowerCase()
            ?.includes(filter.toLowerCase());
        });
      });
      setFilteredNumbers(filteredData);
    }, 500);

    const handleNumberFilter = (number) =>
      officeNumbers.filter((numberObj) => numberObj.number === number)?.[0]
        ?.uuid ?? '';

    const handleSubmitForm = async ({ numbers }) => {
      const selectedNumberIds = numbers.map((number) =>
        handleNumberFilter(number),
      );
      const newSelectedNumbers = shouldFilter
        ? numbers.filter((number) => !selectedNumbers.includes(number))
        : [];

      const removedNumbers = shouldFilter
        ? selectedNumbers.filter((number) => !numbers.includes(number))
        : [];

      const newSelectedNumbersIds = newSelectedNumbers.map((number) =>
        handleNumberFilter(number),
      );
      const removedNumbersIds = removedNumbers.map((number) =>
        handleNumberFilter(number),
      );

      const payload = {
        greeting_uuid: greetingID,
        new_numbers: shouldFilter
          ? newSelectedNumbersIds.toString()
          : selectedNumberIds.toString(),
        delete_numbers: removedNumbersIds.toString(),
        method,
      };

      await mutateAsync(payload);
    };

    const initialValues = {
      numbers: selectedNumbers,
    };

    return (
      <>
        <div
          className={styles.titleText}
        >{`${GreetingName} Greetings : ${selectedName}`}</div>
        <Header />
        <Card
          style={{ height: '50px', display: 'flex', alignItems: 'center' }}
          className={[
            classes.card,
            'd-flex justify-content-between align-items-center px-2 mt-2',
          ].join(' ')}
        >
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div className={styles.searchInput}>
              <SearchIcon className={styles.searchIcon} />
              <InputBase
                className={classes.InputBase}
                placeholder="Search..."
                onChange={(e) => {
                  refreshNumberList(e.target.value);
                  appearClearField(e);
                }}
                inputRef={searchField}
              />
              <Fade in={clearFieldBtn}>
                <IconButton
                  className={styles.searchIcon}
                  onClick={() => clearField()}
                >
                  <ClearIcon style={{ fontSize: '18px' }} />
                </IconButton>
              </Fade>
            </div>
          </div>
        </Card>

        <Formik
          initialValues={initialValues}
          onSubmit={(values) => handleSubmitForm(values)}
        >
          {({ handleChange, values }) => (
            <Form className="d-flex flex-start flex-column">
              {isLoading && (
                <LinearProgress
                  color="secondary"
                  className={styles.tableProgressBar}
                />
              )}

              <Scrollbars
                style={{
                  height: '195px',
                  margin: '10px -9px 0',
                  width: 'calc(100% + 9px)',
                }}
                renderTrackHorizontal={(props) => <div {...props} />}
              >
                <ListManager
                  loading={isLoading}
                  loaded={isFetched}
                  values={values}
                  data={
                    filteredNumbers.length > 0 ? filteredNumbers : officeNumbers
                  }
                  handleMenuClick={handleChange}
                  render={React.memo(SmartGroupListItem)}
                  renderLoading={<AddNumberSkeleton />}
                  skeletonItems={2}
                  emptyMessage={NoPhonesText}
                />
              </Scrollbars>

              <div className="d-flex justify-content-between mt-5">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  disabled={isUpdatingNumbers}
                  color="primary"
                  onClick={() => handleClose()}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  disabled={isUpdatingNumbers}
                  color="secondary"
                  style={{ width: 'auto' }}
                >
                  {isUpdatingNumbers ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </>
    );
  },
);

export default AddNumberForm;

const SmartGroupListItem = observer(function ({ id, index, payload }) {
  return (
    <div
      key={index}
      className={styles.timeSlotCheckbox}
      role="group"
      aria-labelledby="checkbox-group"
    >
      <Checkbox
        type="checkbox"
        name="numbers"
        value={id.number}
        checked={payload.values.numbers?.includes(id.number)}
        onChange={payload.handleMenuClick}
      />
      {id.number}
    </div>
  );
});
