export default function cars(state = [], action) {
    if (action.type === 'ADD_CARS') {
        return[
            ...state,
            ...action.payload
          ];
    }
    else if (action.type === 'ADD_CAR') {
        console.log("in reducer",action.payload);
        return [
            ...state,
            action.payload
          ];
    }
    else if (action.type === 'UPDATE_CARS') {
        return action.payload;
    }
    else if(action.type === 'DELETE_CAR'){
      return action.payload;
    }
    return state;
  }