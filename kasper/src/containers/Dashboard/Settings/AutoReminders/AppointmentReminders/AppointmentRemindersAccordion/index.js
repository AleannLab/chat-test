import React, { Suspense, lazy } from 'react';
import Accordion from 'components/Core/Accordion';
import { ReactComponent as GearBellCheck } from 'assets/images/gear-check.svg';
import { ReactComponent as GearBellIcon } from 'assets/images/gear-bell.svg';
import { ReactComponent as GearTimeIcon } from 'assets/images/gear-time.svg';

const Confirmations = lazy(() => import('../Forms/Confirmations'));
const GeneralReminders = lazy(() => import('../Forms/GeneralReminders'));
const SameDayReminders = lazy(() => import('../Forms/SameDayReminders'));

export default function AppointmentRemindersAccordion() {
  return (
    <div>
      <Accordion
        name="confirmations"
        header={
          <div className="d-flex align-items-center">
            <GearBellCheck />
            <span className="ms-2">Confirmations</span>
          </div>
        }
        body={
          <Suspense fallback="Loading content...">
            <Confirmations />
          </Suspense>
        }
        mountOnEnter
      />
      <Accordion
        name="generalReminders"
        header={
          <div className="d-flex align-items-center">
            <GearBellIcon />
            <span className="ms-2">General Reminders</span>
          </div>
        }
        body={
          <Suspense fallback="Loading content...">
            <GeneralReminders />
          </Suspense>
        }
        mountOnEnter
      />
      <Accordion
        name="sameDayReminders"
        header={
          <div className="d-flex align-items-center">
            <GearTimeIcon />
            <span className="ms-2">Same Day Reminders</span>
          </div>
        }
        body={
          <Suspense fallback="Loading content...">
            <SameDayReminders />
          </Suspense>
        }
        mountOnEnter
      />
    </div>
  );
}
