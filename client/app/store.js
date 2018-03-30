import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';


import carsReducer from './reducers/cars';


const middlewares = [
    thunk
]

const store = createStore(combineReducers({
    cars: carsReducer
}), {}, compose(applyMiddleware(...middlewares)));

export default store;