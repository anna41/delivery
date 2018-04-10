import axios from 'axios';


export function loadOrders(orders) {
    return {
        type: 'ADD_ORDERS',
        payload: orders
    }
}
