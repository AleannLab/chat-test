import { configure } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import 'mobx-react/batchingForReactDom';
import React from 'react';
import { ActivityLog } from './activityLog';
import { Authentication } from './authentication';
import { Users } from './users';
import { LocalServerApp } from './lsa';

const phoneFaxGreetingTypes = {
  awayGreeting: 1,
  voicemailGreeting: 2,
  sipGreeting: 3,
  vacationGreeting: 4,
  holdMusicGreeting: 5,
  customGreetings: 6,
};

configure({
  // computedRequiresReaction: true,
  // enforceActions: "observed",
  // reactionRequiresObservable: true,
  // observableRequiresReaction: true,
});

class RootStore {
  constructor() {
    this.routing = new RouterStore();
    // this.authentication = new Authentication(this);
    this.users = new Users(this);
    this.activityLogs = new ActivityLog(this);
    this.localServerApp = new LocalServerApp(this);
  }
}

export const store = new RootStore();

export const storesContext = React.createContext(store);
