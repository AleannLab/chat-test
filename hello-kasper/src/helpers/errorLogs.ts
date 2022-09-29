import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import CONSTANTS from './constants';
import LogRocket from 'logrocket';

class ErrorLogs {
  // Initialize sentry
  init(showSentryUserFeedback) {
    console.log('showSentryUserFeedback', showSentryUserFeedback);
    Sentry.init({
      dsn: 'https://78c8380f3837404fb75038453ccc03d6@o926466.ingest.sentry.io/6230853',
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: CONSTANTS.ENV,
      beforeSend(event, hint) {
        // Check if it is an exception and the feature flag is on, and if so, show the report dialog
        if (event.exception && showSentryUserFeedback) {
          Sentry.showReportDialog({ eventId: event.event_id });
        }
        return event;
      },
    });
    this.setContext();
  }

  // Set current scope for sentry
  setContext() {
    const {
      id = '',
      username = '',
      email = '',
    } = JSON.parse(localStorage.getItem('token'))?.data || {};
    Sentry.configureScope((scope) => {
      scope.setUser({
        id: id,
        username: username,
        email: email,
        name: username,
      });
      scope.setTag('username', username);
    });
  }

  // Capture exception in sentry
  captureException(errorMessage, interactionId = '') {
    !!interactionId && Sentry.setTag('interactionId', interactionId);
    Sentry.captureException(Error(errorMessage));
    this.captureExceptionInLogRocket(errorMessage, interactionId);
  }

  // Capture exception in LogRocket
  captureExceptionInLogRocket(errorMessage, interactionId = '') {
    LogRocket.captureMessage(errorMessage, {
      tags: {
        // additional data to be grouped as "tags"
        environment: CONSTANTS.ENV,
        interactionId,
        type: 'API',
      },
      extra: {
        // additional arbitrary data associated with the event
        environment: CONSTANTS.ENV,
        interactionId,
        type: 'API',
      },
    });
  }

  disable() {
    Sentry.close();
  }
}

export default new ErrorLogs();
