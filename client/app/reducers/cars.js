export default function cars(state = [], action) {
    if (action.type === 'ADD_CARS') {
        return[
            ...action.payload
          ];
    }
    else if (action.type === 'UPDATE_CARS') {
        return action.payload;
    }
    return state;
  }