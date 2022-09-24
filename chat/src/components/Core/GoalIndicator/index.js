import React from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import HappyFaceIcon from '@material-ui/icons/InsertEmoticonRounded';
import SadFaceIcon from '@material-ui/icons/SentimentDissatisfiedRounded';
import { convertToCurrency } from 'helpers/misc';

const GoalIndicator = ({
  className,
  goalValue,
  achievedValue,
  barHeight,
  goalUnit,
  colorAboveGoal,
  colorBelowGoal,
}) => {
  const isGoalAchieved = achievedValue >= goalValue;
  const goalPercentage = isGoalAchieved
    ? (goalValue * 100) / achievedValue
    : (achievedValue * 100) / goalValue;

  return (
    <div className={`${className} ${styles.root}`}>
      <div className={styles.trackContainer} style={{ height: barHeight }}>
        {/* Section to indicate the achieved goals with specified color */}
        <div
          className={styles.rail}
          style={{
            width: `${goalPercentage}%`,
            backgroundColor: isGoalAchieved ? colorAboveGoal : colorBelowGoal,
          }}
        />

        {/* Floating text to show achieved goals  */}
        <div
          className={styles.goalTextContainer}
          style={{
            width: `${isGoalAchieved ? 100 : goalPercentage}%`,
          }}
        >
          <div
            className={styles.goalText}
            style={{
              color: isGoalAchieved ? colorAboveGoal : colorBelowGoal,
            }}
          >
            {convertToCurrency(achievedValue)} Total
          </div>
        </div>

        {/* Section to indicate the actual goals in background to achieved goals - The striped section */}
        <div
          className={styles.track}
          style={{
            width: `${100 - goalPercentage}%`,
            backgroundColor: isGoalAchieved ? colorAboveGoal : '#F0F3F8',
          }}
        >
          {/* Floating thumb to with actual goal text */}
          <div
            className={`${styles.thumbContainer} ${
              isGoalAchieved ? styles.left : styles.right
            }`}
          >
            <div className={styles.thumb}>
              <div className={styles.thumbTooltip}>
                {goalUnit}
                {goalValue} Goal
              </div>
            </div>
          </div>

          <div
            className={`${styles.overlay} ${
              isGoalAchieved && styles.overlayColored
            } ${isGoalAchieved ? styles.left : styles.right}`}
          />
        </div>
      </div>

      {/* Footer to show smiley face icons */}
      <div className={styles.footer}>
        <SadFaceIcon
          htmlColor={!isGoalAchieved ? colorBelowGoal : '#9A9A9A'}
          className={styles.faceIcons}
        />
        <HappyFaceIcon
          htmlColor={isGoalAchieved ? colorAboveGoal : '#9A9A9A'}
          className={styles.faceIcons}
        />
      </div>
    </div>
  );
};

GoalIndicator.propTypes = {
  className: PropTypes.string,
  /** Base goal value */
  goalValue: PropTypes.number,
  /** Achieved goals */
  achievedValue: PropTypes.number,
  /** Height of a horizontal bar - px/rem */
  barHeight: PropTypes.string,
  /** Unit to measure goal */
  goalUnit: PropTypes.string,
  /** Color indicator for goal achieved above given goal value*/
  colorAboveGoal: PropTypes.string,
  /** Color indicator for goal achieved below given goal value*/
  colorBelowGoal: PropTypes.string,
};

GoalIndicator.defaultProps = {
  className: '',
  goalValue: 50,
  achievedValue: 70,
  barHeight: '4rem',
  goalUnit: '',
  colorAboveGoal: '#6FDF7A',
  colorBelowGoal: '#F5DD5F',
};

export default GoalIndicator;
