import React, { useState } from 'react';
import styles from './index.module.css';
import SettingsIcon from '@material-ui/icons/Settings';
import Divider from '@material-ui/core/Divider';
import GoalIndicator from 'components/Core/GoalIndicator';
import SetGoalModal from './SetGoalModal';
import { useStores } from 'hooks/useStores';
import { useQueryClient } from 'react-query';

const GoalCard = ({ totalPatients, target, achieved }) => {
  const { analytics: analyticsStore, notification } = useStores();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const handleGoalSave = async (goalValue) => {
    const response = await analyticsStore.setGoalByType({
      production_goal: goalValue,
    });

    if (response.success) {
      queryClient.setQueryData(['analytics', 'productionGoal'], {
        production_goal: goalValue,
      });
    } else {
      notification.showError(
        'An unexpected error occurred while attempting to set goal!',
      );
    }
    return true;
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <SettingsIcon
          className={styles.settingsIcon}
          onClick={() => setOpenModal(true)}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.text}>Total Patients Scheduled</div>
        <div className={styles.count}>
          {totalPatients} <span className={styles.suffix}>patients</span>
        </div>
      </div>
      <Divider className="my-2" />
      <div className={styles.goalIndicatorTitle}>Production Scheduled</div>
      <GoalIndicator
        className="mb-2"
        goalValue={target}
        achievedValue={achieved}
        goalUnit="$"
      />

      {openModal && (
        <SetGoalModal
          goalValue={target}
          onSave={handleGoalSave}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
};

export default GoalCard;
