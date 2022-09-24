import React from 'react';
import GoalIndicator from '.';

export default {
  title: 'Goal Indicator',
  component: GoalIndicator,
};

export const Main = (args) => {
  return <GoalIndicator {...args} />;
};

// Default arg values
Main.args = {
  goalValue: 50,
  achievedValue: 70,
  barHeight: '4rem',
  goalUnit: '$',
  colorAboveGoal: '#6FDF7A',
  colorBelowGoal: '#F5DD5F',
};

Main.argTypes = {
  colorAboveGoal: { control: { type: 'color' } },
  colorBelowGoal: { control: { type: 'color' } },
};

export const AboveGoal = () => {
  return <GoalIndicator goalValue={1000} achievedValue={1250} goalUnit="$" />;
};

export const BelowGoal = () => {
  return <GoalIndicator goalValue={1000} achievedValue={824} goalUnit="$" />;
};

export const Variations = () => {
  return (
    <div className="my-5">
      <h5>Case 1 : Above goal</h5>
      <GoalIndicator goalValue={500} achievedValue={700} goalUnit="$" />
      <br />
      <hr />
      <br />
      <h5>Case 2: Below goal</h5>
      <GoalIndicator goalValue={500} achievedValue={200} goalUnit="$" />
      <br />
      <hr />
      <br />
      <h5>Case 3: Achieved goals = 0</h5>
      <GoalIndicator goalValue={500} achievedValue={20} goalUnit="$" />
      <br />
      <hr />
      <br />
      <h5>Case 4: Achieved goals = Goal</h5>
      <GoalIndicator goalValue={500} achievedValue={500} goalUnit="$" />
      <br />
      <hr />
      <br />
      <h5>Case 5: Just above average</h5>
      <GoalIndicator goalValue={500} achievedValue={550} goalUnit="$" />
      <br />
      <hr />
      <br />
      <h5>Case 6: Just below average</h5>
      <GoalIndicator goalValue={500} achievedValue={490} goalUnit="$" />
    </div>
  );
};

export const Customization = () => {
  return (
    <>
      <div>
        <h5>Custom Height</h5>
        <GoalIndicator
          goalValue={1000}
          achievedValue={1250}
          barHeight="2rem"
          goalUnit="$"
        />
      </div>
      <br />
      <hr />
      <br />
      <div>
        <h5>Custom Color for above goal</h5>
        <GoalIndicator
          goalValue={1000}
          achievedValue={1250}
          goalUnit="$"
          colorAboveGoal="blue"
        />
      </div>
      <br />
      <hr />
      <br />
      <div>
        <h5>Custom Color for below goal</h5>
        <GoalIndicator
          goalValue={1000}
          achievedValue={500}
          goalUnit="$"
          colorBelowGoal="red"
        />
      </div>
    </>
  );
};
