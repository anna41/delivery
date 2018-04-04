export default function orders(state = [], action) {
    if (action.type === 'ADD_ORDERS') {
        return[
            ...action.payload
          ];
    }
    return state;
  }