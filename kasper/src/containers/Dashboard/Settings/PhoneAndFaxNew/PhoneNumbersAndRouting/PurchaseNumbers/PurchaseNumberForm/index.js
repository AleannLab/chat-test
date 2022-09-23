import {
  Button,
  Grid,
  LinearProgress,
  makeStyles,
  MenuItem,
} from '@material-ui/core';
import SelectField from 'components/Core/Formik/SelectField';
import { Form, Formik } from 'formik';
import Pagination from '@material-ui/lab/Pagination';
import { regions } from 'helpers/misc';
import styles from './index.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as SearchIcon } from 'assets/images/search-icon.svg';
import Table from 'components/Core/Table';
import TextInputField from 'components/Core/Formik/TextInputField';
import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';

const initialValues = {
  searchType: 'region',
  region: '',
  areaCode: '',
};

const useStyles = makeStyles((theme) => ({
  card: {
    background: 'transparent',
    borderRadius: '0px',
    borderBottom: 'none',
    boxShadow: 'none',
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
    top: '112%',
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

const tableColumns = [
  {
    id: 'number',
    label: 'Number',
  },
  {
    id: 'npa',
    label: 'NPA',
  },
  {
    id: 'capabilities',
    label: 'Capabilities',
  },
  {
    id: 'region',
    label: 'Region',
  },
  { id: 'action', label: 'Action', numeric: false },
];

const searchTypeOptions = [
  {
    value: 'region',
    name: 'Region',
  },
  {
    value: 'area-code',
    name: 'Area Code',
  },
];
const firstIndex = 0;

const PurchaseNumberForm = ({ handleClose }) => {
  const { purchaseNumbers, notification } = useStores();
  const queryClient = useQueryClient();
  const classes = useStyles();
  const [NumberListing, setNumberListing] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  const {
    data: NumberList = [],
    mutateAsync,
    isLoading,
  } = useMutation(
    'search-numbers',
    (data) => purchaseNumbers.searchNumbers(data),
    {
      onSuccess: (data) => {
        if (data.length === 0) {
          notification.showError('No numbers found');
        }
      },
      onError: (error) => {
        notification.showError(
          'An unexpected error occurred while fetching numbers',
        );
      },
    },
  );

  const { mutateAsync: purchaseNumber } = useMutation(
    'buy-number',
    (data) => purchaseNumbers.buyNumber(data),
    {
      onSuccess: (data) => {
        notification.showSuccess('Number Purchased Sucessfully');
        queryClient.invalidateQueries('voiceNumbers');
        handleClose();
      },
      onError: (error) => {
        notification.showError(
          error?.data?.message ??
            'An unexpected error occurred while purchasing number',
        );
      },
    },
  );

  const input = (
    <Grid item xs={5}>
      <TextInputField
        mt={1}
        variant="outlined"
        fieldName="areaCode"
        fieldLabel="AREA CODE *"
        placeholder="Enter Area Code"
      />
    </Grid>
  );

  const select = (
    <Grid item xs={5}>
      <SelectField
        fieldLabel="REGION *"
        fieldName="region"
        options={regions.map((item) => (
          <MenuItem value={item.abbreviation} key={item.abbreviation}>
            {item.name}
          </MenuItem>
        ))}
      />
    </Grid>
  );

  const handleBuyNumber = async (number) => {
    handleSelectedNumber(number);
    await purchaseNumber({
      officeNumber: number,
      numberType: 'VOICE',
      providerId: 1,
    });
  };

  const handleSelectedNumber = (phoneNumber) => {
    setSelectedNumber(phoneNumber);
  };

  const createData = (number, npa, capabilities, region, phoneNumber) => {
    const newCapabilities = Object.keys(capabilities)
      .filter((capability) => capabilities[capability])
      .join(', ');

    const handleDisable = (number) => number === selectedNumber;

    const action = (
      <Button
        type="button"
        className="secondary-btn"
        variant="outlined"
        color="secondary"
        disabled={handleDisable(phoneNumber)}
        onClick={() => handleBuyNumber(phoneNumber)}
      >
        Buy Now
      </Button>
    );
    return { number, npa, newCapabilities, region, action };
  };

  const handleContentRender = (type) => {
    switch (type) {
      case 'region':
        return select;
      case 'area-code':
        return input;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (NumberList.length > 0) {
      setNumberListing(NumberList.slice(firstIndex, pageSize));
    }
  }, [NumberList]);

  useEffect(() => {
    if (NumberList.length > 0) {
      if (page === 1) {
        setPage(page);
        setNumberListing(NumberList.slice(firstIndex, pageSize));
      } else {
        setPage(page);
        setNumberListing(
          NumberList.slice(firstIndex + pageSize * (page - 1), pageSize * page),
        );
      }
    }
  }, [selectedNumber]);

  useEffect(() => {
    setNumberListing(NumberList.slice(0, pageSize));
  }, [pageSize]);

  const handleChangePage = (event, value) => {
    setPage(value);
    setNumberListing(
      NumberList.slice(firstIndex + pageSize * (value - 1), pageSize * value),
    );
  };

  const getRows = NumberListing?.map(
    ({ friendlyName, locality, capabilities, region, phoneNumber }) => {
      return createData(
        friendlyName,
        locality,
        capabilities,
        region,
        phoneNumber,
      );
    },
  );

  const handleSubmitForm = async (values) => {
    if (values?.searchType === 'region') {
      await mutateAsync({ inRegion: values?.region });
    } else {
      await mutateAsync({ areaCode: values?.areaCode });
    }
  };

  const handleShouldDisabled = (values) => {
    if (values.searchType === 'region') {
      return !values.region;
    } else {
      return !values.areaCode;
    }
  };

  return (
    <>
      <Formik initialValues={initialValues} onSubmit={handleSubmitForm}>
        {({ isSubmitting, values }) => (
          <Form>
            <div className={styles.container}>
              <Grid
                container
                spacing={2}
                direction="row"
                className="align-items-end"
              >
                <Grid item xs={5}>
                  <SelectField
                    disabled={isSubmitting}
                    fieldLabel="SEARCH TYPE"
                    fieldName="searchType"
                    options={searchTypeOptions.map((item) => (
                      <MenuItem value={item.value} key={item.value}>
                        {item.name}
                      </MenuItem>
                    ))}
                  />
                </Grid>
                {handleContentRender(values.searchType)}
                <Grid item xs={2}>
                  <Button
                    type="submit"
                    className="secondary-btn mb-1"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting || handleShouldDisabled(values)}
                    startIcon={<SearchIcon />}
                  >
                    {isLoading ? 'Searching..' : 'Search'}
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Form>
        )}
      </Formik>
      {NumberList.length > 0 && (
        <div className={styles.tableContainer}>
          {isLoading && (
            <LinearProgress
              color="secondary"
              className={styles.tableProgressBar}
            />
          )}
          <Table
            enableSearchBar
            isSelectable={false}
            allowSelectAll={false}
            columns={tableColumns}
            rows={getRows || []}
            isEmpty={getRows.length}
            showSearchResultCount={true}
            emptyText="No Numbers Found"
          />
          <Pagination
            className={classes.pagination}
            count={Math.ceil(NumberList.length / 5)}
            page={page}
            onChange={(e, page) => handleChangePage(e, page)}
            variant="outlined"
            shape="rounded"
          />
        </div>
      )}
    </>
  );
};

export default PurchaseNumberForm;
