import axios from 'axios';

export function addCars(cars) {
    return {
        type: 'ADD_CARS',
        payload: cars
    }
}