import React from 'react';
import moment from 'moment';
import Timer from 'react-compound-timer';

export const buildWaitTime = (inTime) => {
  let startTime = moment.utc(inTime);
  let endTime = moment.utc();
  let duration = moment.duration(endTime.diff(startTime), 'milliseconds');
  return (
    <span style={duration.asMinutes() > 30 ? { color: '#F4266E' } : {}}>
      <Timer initialTime={duration.asMilliseconds()}>
        {({ getTime }) => {
          const minutes = getTime() / 1000 / 60;
          const hours = minutes / 60;
          return (
            <>
              {hours > 24 ? (
                <>
                  <Timer.Days />
                  d+
                </>
              ) : minutes > 59 ? (
                <>
                  <Timer.Hours />h
                </>
              ) : (
                <>
                  {minutes ? (
                    <>
                      <Timer.Minutes />m
                    </>
                  ) : null}
                  <Timer.Seconds />s
                </>
              )}
            </>
          );
        }}
      </Timer>
    </span>
  );
};
