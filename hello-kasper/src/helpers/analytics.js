import ReactGA from 'react-ga4';
import CONSTANTS from '../helpers/constants';

export const analyticsInitialize = () => {
  const trackingId = CONSTANTS.GOOGLE_ANALYTICS_MEASURMENT_ID;
  ReactGA.initialize(trackingId);
};

export const trackPageView = (page) => {
  ReactGA.send({ hitType: 'pageview', page });
};
