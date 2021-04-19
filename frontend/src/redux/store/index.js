import { createStore, applyMiddleware, compose } from "redux";
import combineReducers from "../reducers/combineReducers";
import { splitwiseMiddleware } from "../middleware/index";

const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (error) {
    console.log(error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState == null) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

const persistedState = loadFromLocalStorage();
const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers,
  persistedState,
  storeEnhancers(applyMiddleware(splitwiseMiddleware))
);

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;
