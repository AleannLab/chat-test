import { Button, Grid } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styles from './index.module.css';
import HoldMusic from './HoldMusic';
import ChooseNumber from './ChooseNumber';
import Schedule from './Schedule';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const TABS = [
  { label: '1. Name and Schedule', value: 'set-schedule' },
  { label: '2. Greeting', value: 'hold-music' },
  { label: '3. Choose Numbers', value: 'choose-number' },
];

const AddVacation = () => {
  const { notification, authentication, vacationGreeting, incomingCalls } =
    useStores();
  const history = useHistory();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);
  const [greetings, setGreetings] = useState([]);
  const [addVacationPayload, setAddVacationPayload] = useState({});
  const [title, setTitle] = useState('Add Vacation');
  const { timezone } = authentication.user || {};
  const { state } = useLocation();
  const { data: officeNumbers = [] } = useQuery(
    'getOfficeNumbers',
    () => incomingCalls.getNumbers(),
    {
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the number list.',
        );
      },
    },
  );

  const { mutateAsync: handleAddVacation, isLoading: isAddingVacation } =
    useMutation(
      'addVacation',
      (addVacationPayload) => vacationGreeting.addVacation(addVacationPayload),
      {
        onSuccess: () => {
          handleClose();
          queryClient.invalidateQueries('vacationList');
        },
        onError: (error) => {
          notification.showError(
            error.message ??
              'An unexpected error occurred while attempting to add the vacation',
          );
        },
      },
    );
  const { mutateAsync: handleEditVacation, isLoading: isEditingVacation } =
    useMutation(
      'editVacation',
      (editData) => vacationGreeting.editVacation(editData),
      {
        onSuccess: () => {
          handleClose();
          queryClient.invalidateQueries('vacationList');
        },
        onError: (error) => {
          notification.showError(
            error.message ??
              'An unexpected error occurred while attempting to edit the vacation',
          );
        },
      },
    );

  const handleNumberFilter = (number) =>
    officeNumbers.filter((numberObj) => numberObj.number === number)?.[0]
      ?.uuid ?? '';

  const getNumberIds = () => {
    return new Promise((resolve, reject) => {
      const selectedNumberIds = state.assigned_numbers
        ?.split(',')
        .map((number) => handleNumberFilter(number));
      if (selectedNumberIds && selectedNumberIds.length > 0) {
        resolve(selectedNumberIds);
      } else {
        resolve([]);
      }
    });
  };
  const handleRehydrateState = async () => {
    const previousNumberIds = await getNumberIds();

    setAddVacationPayload({
      label: state.label,
      from: state.from,
      to: state.to,
      greeting: state.greeting_uuid,
      new_numbers: previousNumberIds || '',
      delete_numbers: '',
      vacation_uuid: state.uuid,
    });
  };

  useEffect(() => {
    if (state) {
      setTitle('Edit Vacation');
      handleRehydrateState();
    }
  }, [state]);

  const isSelected = (tab) => {
    return selectedTab === tab;
  };

  const handleClose = () => {
    history.goBack();
    setAddVacationPayload({});
    vacationGreeting.setSelectedHoldMusic('');
  };

  const handleVacationPayload = (data) =>
    setAddVacationPayload((prevState) => ({ ...prevState, ...data }));

  const doneAdding = () => {};

  const addVacation = async (values) => {
    await handleAddVacation({ ...addVacationPayload, ...values });
  };
  const editVacation = async (values) => {
    await handleEditVacation({ ...addVacationPayload, ...values });
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case TABS[0].value:
        return (
          <Schedule
            handleClose={handleClose}
            doneAdding={doneAdding}
            newSchedule={true}
            greetings={greetings}
            timezone={timezone}
            isSelected={isSelected}
            setSelectedTab={setSelectedTab}
            handleVacationPayload={handleVacationPayload}
            addVacationPayload={addVacationPayload}
          />
        );
      case TABS[1].value:
        return (
          <HoldMusic
            handleClose={handleClose}
            isSelected={isSelected}
            setSelectedTab={setSelectedTab}
            handleVacationPayload={handleVacationPayload}
            addVacationPayload={addVacationPayload}
          />
        );
      case TABS[2].value:
        return (
          <ChooseNumber
            isSelected={isSelected}
            setSelectedTab={setSelectedTab}
            handleVacationPayload={handleVacationPayload}
            addVacationPayload={addVacationPayload}
            handleClose={handleClose}
            addVacation={addVacation}
            isAddingVacation={isAddingVacation || isEditingVacation}
            editVacation={editVacation}
          />
        );
      default:
        return null;
    }
  };

  const Footer = (
    <>
      <Button
        className="primary-btn me-auto"
        variant="outlined"
        color="primary"
        onClick={handleClose}
      >
        Cancel
      </Button>

      <Button
        className="secondary-btn"
        variant="contained"
        color="secondary"
        onClick={handleClose}
      >
        Save
      </Button>
    </>
  );

  const Header = () => {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mb-4">
        <span>{title}</span>
      </div>
    );
  };

  return (
    <>
      <Modal
        height={540}
        onClose={handleClose}
        header={<Header />}
        body={
          <Grid spacing={4} container style={{ height: 400 }}>
            <Grid item xs={3}>
              <div className="d-flex flex-column">
                {TABS.map((tab, i) => (
                  <div
                    key={i}
                    className={`${styles.section} ${
                      isSelected(tab.value) ? styles.selectedSection : ''
                    }`}
                    onClick={() => {
                      setSelectedTab(tab.value);
                    }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </Grid>
            <Grid style={{ marginTop: 17 }} xs={9}>
              {renderTabContent()}
            </Grid>
          </Grid>
        }
      />
    </>
  );
};

export default AddVacation;
