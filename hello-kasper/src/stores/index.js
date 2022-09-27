import { configure } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import 'mobx-react/batchingForReactDom';
import React from 'react';
import { ActivityLog } from './activityLog';
import { Authentication } from './authentication';
import { Chat } from './chats';
import { OfficeChat } from './officeChats';
import { OfficeProfile } from './officeProfile';
import { Patient } from './patient';
import { Users } from './users';
import { LocalServerApp } from './lsa';
// import { KittyOfficeChat } from './chatkitty';
import { Utils } from './utils';
import { Notification } from './notification';

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
    this.notification = new Notification(this);
    this.authentication = new Authentication(this);
    this.users = new Users(this);
    this.utils = new Utils(this);

    this.officeChats = new OfficeChat(this);
    this.chats = new Chat(this);
    this.officeChats = new OfficeChat(this);
    this.activityLogs = new ActivityLog(this);
    this.patients = new Patient(this);
    this.officeProfile = new OfficeProfile(this);
    this.localServerApp = new LocalServerApp(this);
    // this.kittyOfficeChat = new KittyOfficeChat(this);
  }
}

export const store = new RootStore();

export const storesContext = React.createContext(store);
