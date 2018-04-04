import React, {Component} from 'react';
import axios from 'axios';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { connect } from 'react-redux';
import {addCar} from '../logic';

class AddCarButton extends Component{

    constructor(props) {
        super(props);
    }

    
    addCarOnClick(){
        this.props.addCar();
    }
      

    render(){
        return (
            <FloatingActionButton onClick={this.addCarOnClick.bind(this)}>
            <ContentAdd />
           </FloatingActionButton>
           
        )
    }
}

export default connect(
    null, {addCar}
)(AddCarButton);

