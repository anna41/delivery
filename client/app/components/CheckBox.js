import React, {Component} from 'react';
import axios from 'axios';
import Checkbox from 'material-ui/Checkbox';
import { connect } from 'react-redux';
import {updateCarCheckBox} from '../logic';

class CheckBox extends Component{

    constructor(props) {
        super(props);
    }

    onClickCheckBox(car){
        console.log("in check box",car);
        this.props.updateCarCheckBox(car);
    }
    
      

    render(){
        console.log("car",this.props);
        return (
          <Checkbox
            defaultChecked = {this.props.active}
            onClick = {this.onClickCheckBox.bind(this,this.props)}
          />
           
        )
    }
}

  export default connect(
    null, {updateCarCheckBox}
)(CheckBox);
