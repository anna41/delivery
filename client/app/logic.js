import axios from 'axios';
import * as carActions from './actions/cars';
import _ from 'lodash';

export const loadCars = () => {
  return (dispatch, getState) => {
    axios.get('/data')
    .then(response => {
        return dispatch(carActions.addCars(response.data));
    });
  }
};

export const loadCar = () => {
  console.log("load car");
  return (dispatch, getState) => {
    axios.post('/cars')
    .then(response => {
        return dispatch(carActions.addCar(response.data));
    });
  }
};

export const updateCarCheckBox = (car) => {
  console.log("car in update",car);
  return (dispatch, getState) => {
    axios.post('/check', {
      car
    })
    .then(response => {
        return dispatch(carActions.updateCar(response.data));
    });
  }
};
