import axios from 'axios';
import * as carActions from './actions/cars';
import _ from 'lodash';

export const loadCars = () => {
  console.log("load car");
  return (dispatch, getState) => {
    axios.get('/data')
    .then(response => {
      console.log("in response");
        return dispatch(carActions.addCars(response.data));
    });
  }
};

export const loadCar = () => {
  console.log("load car");
  return (dispatch, getState) => {
    axios.put('/car')
    .then(response => {
      if(response.data=="Success"){
        console.log("Success");
        return dispatch(loadCars());
      }
    });
  }
};

export const updateCarCheckBox = (car) => {
  console.log("car in update",car);
  return (dispatch, getState) => {
    axios.put('/car/'+car._id)
    .then(response => {
      if(response.data=="Success"){
        console.log("Success");
        return dispatch(loadCars());
      }
    });
  }
};

export const onDelete = (car) => {
  console.log("car id in delete",car._id);
  return (dispatch, getState) => {
    axios.delete('/car/'+car._id)
    .then(response => {
      console.log(response);
      if(response.data=="Success"){
        console.log("Success");
        return dispatch(loadCars());
      }
    });
  }
};