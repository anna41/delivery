
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { addCarWithName } from '../logic';
import { connect } from 'react-redux';

class ContactForm extends Component {


  submit = (values) => {
    console.log("value", values.carName);
    this.props.addCarWithName(values.carName);
    values.carName = "";
  }


  render() {
    return (
      <form style={{ 'padding': '15px' }} onSubmit={this.props.handleSubmit(this.submit)}>
        <div>
          <label  style={{ 'padding': '15px' }} htmlFor="carName">Car name</label>
          <Field name="carName" component="input" type="text" />
        </div>
        <button style={{ 'margin': '15px' }} type="submit">Submit</button>
      </form>
    );
  }
}

ContactForm = reduxForm({
  form: 'contact'
})(ContactForm);

export default connect(
  null, { addCarWithName }
)(ContactForm);
