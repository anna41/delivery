import React, {Component} from 'react';
import axios from 'axios';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { connect } from 'react-redux';
import {loadCar} from '../logic';

class AddCarButton extends Component{

    constructor(props) {
        super(props);
    }

    
    addCarOnClick(){
        this.props.loadCar();
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
    state => ({
    }), {loadCar}
)(AddCarButton);

