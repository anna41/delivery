import React, {Component} from 'react';
import axios from 'axios';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import { connect } from 'react-redux';
import {onDelete} from '../logic';

class DeleteCarButton extends Component{

    constructor(props) {
        super(props);
    }


    onDeleleButton(car){
        console.log("in delete");
        this.props.onDelete(car);
    }
      

    render(){
        return (
            <FlatButton
                icon={<ActionDelete />}
                onClick = {this.onDeleleButton.bind(this,this.props)}
            />
           
        )
    }
}

export default connect(
    null, {onDelete}
)(DeleteCarButton);

