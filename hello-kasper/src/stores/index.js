import { configure } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import 'mobx-react/batchingForReactDom';
import React from 'react';
import { Users } from './users';

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
    this.users = new Users(this);
  }
}

export const store = new RootStore();

export const storesContext = React.createContext(store);
