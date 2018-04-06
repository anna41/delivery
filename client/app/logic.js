import axios from 'axios';
import * as carActions from './actions/cars';
import _ from 'lodash';
import * as orderActions from './actions/orders';

export const loadCars = () => {
  console.log("load cars");
  return (dispatch, getState) => {
    axios.get('/data')
    .then(response => {
      console.log("in response");
        return dispatch(carActions.addCars(response.data));
    });
  }
};


export const addCar = () => {
  console.log("add car");
  return (dispatch, getState) => {
    axios.put('/car')
    .then(response => {
      if(response.status==200){
        console.log("Success response",response);
        return dispatch(loadCars());
      }
    });
  }
};

export const addCarWithName = (name) => {
  console.log("add car",name);
  return (dispatch, getState) => {
    axios.put('/newCar/'+name)
    .then(response => {
      if(response.status==200){
        console.log("Success response",response);
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
      if(response.status==200){
        return dispatch(loadCars());
      }
    });
  }
};

export const loadOrders = (status) => {
  return (dispatch, getState) => {
    axios.get('/orders/'+status)
    .then(response => {
        return dispatch(orderActions.loadOrders(response.data));
    });
  }
};
