import React, {Component} from 'react';
import axios from 'axios';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import { connect } from 'react-redux';

class DeleteCarButton extends Component{

    constructor(props) {
        super(props);
    }

    
    onDelete(car)  {
        let that = this;
        axios.post('/delete', {
            car
        })
        .then(function (response) {
            that.props.deleteCar(response.data)
        })
    }
      

    render(){
        return (
            <FlatButton
                icon={<ActionDelete />}
                //onClick = {this.onDelete.bind(this,result)}
            />
           
        )
    }
}

export default connect(
    state => ({
    }),
    dispatch => ({
        deleteCar: (input) => {
            dispatch({ type: 'DELETE_CAR', payload: input })
          }
    })
  )(DeleteCarButton);
