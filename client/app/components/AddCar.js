
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import {addCarWithName} from '../logic';
import { connect } from 'react-redux';

class ContactForm extends Component {
  

    submit =(values)=>{
        console.log("value",values.carName);
        this.props.addCarWithName(values.carName);
        values.carName = "";
    }
      

    render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.submit)}>
        <div>
          <label htmlFor="carName">Car Name</label>
          <Field name="carName" component="input" type="text"/>
        </div>
        <button type="submit">Submit</button>
      </form>
    );
  }
}

// Decorate the form component
ContactForm = reduxForm({
  form: 'contact' // a unique name for this form
})(ContactForm);

export default connect(
   null, {addCarWithName}
)(ContactForm);
