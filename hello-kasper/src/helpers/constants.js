const CONSTANTS = {
  OFFICE_API_URL: process.env.REACT_APP_OFFICE_API_URL,
  TASK_API_URL: process.env.REACT_APP_TASK_API_URL,
  OFFICE_CHAT_API_URL: process.env.REACT_APP_OFFICE_CHAT_API_URL,
  CALL_CONTROL_API_URL: process.env.REACT_APP_CALL_CONTROL_API_URL,
  NOTIFIER_API_URL: process.env.REACT_APP_NOTIFIER_API_URL,
  VOIP_API_URL: process.env.REACT_APP_VOIP_API_URL,
  MEDIA_API_URL: process.env.REACT_APP_MEDIA_API_URL,
  FORMS_API_URL: process.env.REACT_APP_FORMS_API_URL,
  ADMIN_API_URL: process.env.REACT_APP_ADMIN_API_URL,
  CONTACTS_API_URL: process.env.REACT_APP_CONTACTS_API_URL,
  PBX_API_URL: process.env.REACT_APP_PBX_API_URL,
  PERMISSIONS_API_URL: process.env.REACT_APP_PERMISSIONS_API_URL,
  TEST_TENANT_ID: process.env.REACT_APP_TEST_TENANT_ID,
  BEAMER_PRODUCT_ID: process.env.REACT_APP_BEAMER_PRODUCT_ID,
  ENV: process.env.REACT_APP_ENV,
  GOOGLE_ANALYTICS_MEASURMENT_ID: process.env.REACT_APP_GA_MEASURMENT_ID,
  KASPER_CONFIG_APP_URL: process.env.REACT_APP_KASPER_CONFIG_APP,
  LOGROCKET_APP_ID: process.env.REACT_APP_LOGROCKET_APP_ID,
};

/*
 * Config to enable or disable application features
 */
const FEATURES = {
  OFFICE_SCHEDULING: process.env.REACT_APP_ENABLE_OFFICE_SCHEDULING === 'true',
  SCHEDULE_APPOINTMENT: process.env.REACT_APP_SCHEDULE_APPOINTMENT === 'true',
  ANALYTICS_MORNING_HUDDLE:
    process.env.REACT_APP_ENABLE_ANALYTICS_MORNING_HUDDLE === 'true',
};

const PERMISSION_IDS = {
  MORNING_HUDDLE: 1,
  MOBILE_APP: 5,
  SWELL: 5,
  TASKS: 6,
  BRAND_CUSTOMIZATION: 9,
  CALENDAR: 11,
  PAPERLESS_FORMS: 12,
  PAPERLESS_FORMS_SETTINGS: 13,
};

/**
 * This is a config for mapping colors to appointments based on appointment status
 * The key used for mapping is 'name', considering the names are same across the environments
 */
const APPOINTMENT_STATUS_CONFIG = [
  {
    odId: 1,
    name: 'Scheduled',
    primaryColor: '#6D72E0',
    secondaryColor: '#E6E7F4',
    showOnScheduler: true,
  },
  {
    odId: 2,
    name: 'Complete',
    primaryColor: '#5A9B68',
    secondaryColor: '#E6F4E9',
    showOnScheduler: true,
  },
  {
    odId: 3,
    name: 'Unscheduled List',
    primaryColor: '#F3C82D',
    secondaryColor: '#FFF8DF',
    showOnScheduler: false,
  },
  {
    odId: 5,
    name: 'Broken',
    primaryColor: '#E05D58',
    secondaryColor: '#FFEDED',
    showOnScheduler: true,
  },
];

const PATIENT_BOARD_COLUMNS = {
  arrived: 1,
  ready: 2,
  screening: 3,
  procedure: 4,
  checkout: 5,
};

const PATIENT_BOARD_STATE = {
  0: 'arrived',
  1: 'ready',
  2: 'screening_exam',
  3: 'procedure',
  4: 'checkout',
};

const DASHBOARD_STATE = {
  arrived: 'arrived',
  ready: 'ready',
  screening: 'screening_exam',
  procedure: 'procedure',
  checkout: 'checkout',
};

const DASHBOARD_SUB_STATE = {
  IN_CHAIR: 'in_chair',
  READY_FOR_DOCTOR: 'ready_for_doctor',
  DOCTOR_ARRIVED: 'doctor_arrived',
};

const IVR_ACTIONS = {
  TRANSFER_TO_AGENT: 'transferToAgent',
  TRANSFER_TO_IVR: 'transferToIVR',
  TRANSFER_TO_TEAM: 'transferToTeam',
  TRANSFER_TO_EXTERNAL_NUMBER: 'transferToExternalNumber',
  REPEAT_IVR: 'repeat',
  VOICEMAIL: 'voicemail',
};

const WAIT_TIME_ALERT = {
  WARNING: 10,
  DANGER: 15,
};

const DEFAULT_MISSED_CALL_REPLY =
  'Sorry we missed your call! Feel free to send us a text and one of our staff can respond directly to you as soon as we get a chance.';

const TASK_STATE = {
  todo: 'todo',
  overdue: 'overdue',
  completed: 'completed',
};

const FAX_LOADING_STATUS = ['queued', 'transmitting', 'processing'];

const PHONE_MODEL = {
  T54W: 't54w',
  W60B: 'w60b',
};

['Forward to phone number'];

const CALL_ROUTING_RULES = [
  {
    label: 'Internal Routing',
    value: 'INTERNAL',
    color: '#566F9F',
  },
  { label: 'Play greeting', value: 'GREETING', color: '#FEA828' },
  {
    labelShort: 'Forwarded',
    label: 'Forward to phone number',
    value: 'EXTERNAL',
    color: '#61A6E7',
  },
];
const AUTHORIZATION_TYPE = Object.freeze({
  USER: 'user',
  PATIENT: 'patient',
  TENANT: 'tenant',
});

const PATIENT_DATA_MODAL_TABS = {
  fileDirectory: 1,
  patientInfo: 2,
};

const REQUIRED_MESSAGE_ONLINE_SCHEDULE = {
  reasonForVisit: 'Reason for Visit',
  provider: 'Provider',
  appointmentTime: 'Appointment Time',
};

const DEFAULT_APP_HEADER_IMAGE =
  'https://email-images.meetkasper.com/header-kasper-cover.png';

export default CONSTANTS;
export {
  FEATURES,
  PERMISSION_IDS,
  APPOINTMENT_STATUS_CONFIG,
  PATIENT_BOARD_COLUMNS,
  DASHBOARD_STATE,
  DASHBOARD_SUB_STATE,
  PATIENT_BOARD_STATE,
  IVR_ACTIONS,
  WAIT_TIME_ALERT,
  DEFAULT_MISSED_CALL_REPLY,
  TASK_STATE,
  FAX_LOADING_STATUS,
  PHONE_MODEL,
  CALL_ROUTING_RULES,
  AUTHORIZATION_TYPE,
  PATIENT_DATA_MODAL_TABS,
  REQUIRED_MESSAGE_ONLINE_SCHEDULE,
  DEFAULT_APP_HEADER_IMAGE,
};
