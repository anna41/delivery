import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';


import carsReducer from './reducers/cars';
import ordersReducer from './reducers/orders';
import { reducer as formReducer } from 'redux-form';


const middlewares = [
    thunk
]

const store = createStore(combineReducers({
    cars: carsReducer,
    orders: ordersReducer,
    form: formReducer
}), {}, compose(applyMiddleware(...middlewares)));

export default store;