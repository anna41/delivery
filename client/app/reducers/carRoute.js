export default function carRoute(state = [], action) {
     if (action.type === 'ADD_ROUTE') {
        return action.payload;
    }
    return state;
  }