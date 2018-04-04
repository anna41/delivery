import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';


import carsReducer from './reducers/cars';
import ordersReducer from './reducers/orders';


const middlewares = [
    thunk
]

const store = createStore(combineReducers({
    cars: carsReducer,
    orders: ordersReducer
}), {}, compose(applyMiddleware(...middlewares)));

export default store;