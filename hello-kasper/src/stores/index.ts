import React from 'react';
import { Users } from './users';

class RootStore {
  users: Users;
  constructor() {
    this.users = new Users(this);
  }
}

export const store = new RootStore();

export const storesContext = React.createContext(store);
