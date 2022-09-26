# About

This repository hosts the front end of the Kasper dashboard, basically what the customer sees. It does NOT include the Admin Panel.

## Requirements

- Node 14.9+
- AWS CLI ( https://kasperdental.atlassian.net/l/c/xmZ6K0fe )
- Yarn Package Manager ( https://yarnpkg.com/getting-started/install ) [*You do not need to remove 'npm' to set up Yarn*]

# Getting started

## If you have cloned this repository before May 2022...

In May 2022, apex-react has switched to using the Yarn Package Manager. Follow these steps to set update your local repository

1. Run "git pull" if you have not already
2. Delete the "node_modules" folder & "package_lock.json" file
3. Install Yarn if you have not already
4. Run "yarn install" to generate a fresh new "node_modules" folder & a new yarn.lock file [which replaces package-lock.json]

**If step 4 fails:** If step 4 fails and produces a _ESOCKETITMEOUT_ error then run: `yarn install --network-timeout 10000000`
_See: https://stackoverflow.com/a/52135833_

## Setting Up

1. Set Up AWS CLI as guided
1. Clone the repository onto your local machine.
1. Navigate to the directory and execute execute `yarn install` to install dependencies from `package.json` file.
1. Execute `yarn start` to run application locally

# High level folder Structure:

- **assets** - _Stores static assets_
- **containers** - _Contains the main pages/routes of the application_
- **components** - _Contains components that are reusable throughout the application_
- **stores** - _It has the mobx stores per application feature_
- **hooks** - _Custom hooks needed for the implementation of the project_
- **helper** - _Helper functions_
- **constants** - _All constants_
- **theme.js** - _Overridden Material-UI theme_

# Environments and Deployment:

- command to start local sever with .env.staging file
  `yarn run start:staging`

- command to start local sever with .env.production file  
  `yarn run start:prod`

- command to build app with .env.staging file  
  `yarn run build:staging`

- command to build app with .env.production file  
  `yarn run build:prod`

# Modifying Endpoints

When you clone this repo by default, it will use all the services/APIs hosted on AWS. If you wish to change that, you will need to modify the “constants.js” file.

```
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
  STAGE_ENV: process.env.REACT_APP_STAGE_ENV,
  GOOGLE_ANALYTICS_MEASURMENT_ID: process.env.REACT_APP_GA_MEASURMENT_ID,
};
```

Simply change the URL that is being pointed too, for example

```
// OFFICE_API_URL: process.env.REACT_APP_OFFICE_API_URL,
/* The URL below is not default, copy the URL from your console when your service loads */
 OFFICE_API_URL: "http://localhost:3005/dev",
```

By default, it runs on the “development” environment with the tenant ID set to “test”. **It is highly recommended you do not run your environment as production/main**. If you wish to use a different tenant ID other than “test” in development, change the “TEST_TENANT_ID”

```
// TEST_TENANT_ID: process.env.REACT_APP_TEST_TENANT_ID,
TEST_TENANT_ID: "test2"
```
