import React from 'react';

export const replaceMessageSpecialCharacters = (value) => {
  return value.replace(/{(.+?)}/g, function (m, value) {
    return `[[${value}]]`;
  });
};

export const replaceBackMessageSpecialCharacters = (message) => {
  return message.replaceAll('[[', '{').replaceAll(']]', '}');
};

export class VariableBuilder {
  variables = [];
  baseVariables = [];
  constructor(baseVariables) {
    this.baseVariables = baseVariables;
  }
  add(key, value) {
    this.variables.push(this.setVariable(key, value));
  }
  setVariable = (key, value) => {
    const variable = this.baseVariables.find((item) => item.key === key);
    variable.value = value;
    return variable;
  };
  getVariables() {
    return this.variables.map((variable, index) => ({
      ...variable,
      id: index + 1,
    }));
  }
}

export const getOsLink = () => {
  return `${window.location.protocol}//${window.location.host}/schedule-appointment`;
};

export const BASE_VARIABLES = [
  {
    key: 'firstname',
    display: 'firstname',
    variable: '{firstname}',
    description: 'Patient’s first name',
  },
  {
    key: 'lastname',
    display: 'lastname',
    variable: '{lastname}',
    description: 'Patient’s last name',
  },
  {
    key: 'phone',
    display: 'phone',
    variable: '{phone}',
    description: 'Office main phone number',
  },
  {
    key: 'officename',
    display: 'officename',
    variable: '{officename}',
    description: 'Name of office',
  },
  {
    key: 'oslink',
    display: 'oslink',
    variable: '{oslink}',
    description: 'Link to online scheduling link',
  },
];

export const VariableContext = React.createContext([]);
