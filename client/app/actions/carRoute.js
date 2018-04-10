import axios from 'axios';

export function loadOrdersRoute(points) {
    console.log("in action", points)
    return {
        type: 'ADD_ROUTE',
        payload: points
    }
}