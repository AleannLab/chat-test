import { legacy_createStore as createStore, combineReducers } from "redux";

const counterReducer = (state = 0, action:any) => {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;

    default:
      return state;
  }
};

const counterReducer2 = (state = 0, action:any) => {
  switch (action.type) {
    case "INCREMENT-MICRO2":
      return state + 1;

    default:
      return state;
  }
};


const allReducers = combineReducers({
  count1: counterReducer,
  count2: counterReducer2,
});


export const store = createStore(allReducers);
