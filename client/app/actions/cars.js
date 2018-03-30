import axios from 'axios';


export function addCars(cars){
    return {
        type: 'ADD_CARS',
        payload: cars
    }
}

export function addCar(car){
    return {
        type: 'ADD_CAR',
        payload: car
    }
}

export function updateCar(car){
    return {
        type: 'UPDATE_CARS',
        payload: car
    }
}
