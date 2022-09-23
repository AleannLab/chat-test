import React from 'react';
import { DayView } from '@devexpress/dx-react-scheduler-material-ui';

const CustomDayScaleRow = () => {
  return <DayView.DayScaleRow className="d-none"></DayView.DayScaleRow>;
};

export default React.memo(CustomDayScaleRow);
