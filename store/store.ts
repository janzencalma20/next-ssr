import { createStore, applyMiddleware, combineReducers,compose } from 'redux';
import thunk from 'redux-thunk';
import apolloClient from './reducers/apolloClient';
import authReducer from "./reducers/auth/auth";

const rootReducer = combineReducers({
  apolloClient: apolloClient,
  authUser: authReducer,
});

const composeEnhancers = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const logger = (store:any) => {
  return (next: (arg0: any) => any) => {
    return (action: any) => {
      const result = next(action);
      return result;
    };
  };
};
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));


export default store