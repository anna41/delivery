import React, { Component } from 'react';
import axios from 'axios';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { connect } from 'react-redux';
import AddCar from './AddCar';

class AddCarButton extends Component {

    constructor() {
        super()
        this.state = {
            isHidden: true
        }
    }

    toggleHidden() {
        this.setState({
            isHidden: !this.state.isHidden
        })
    }

    onClick() {
        this.setState({ showResults: true });
    }

    render() {
        return (
            <div>
                <FloatingActionButton onClick={this.toggleHidden.bind(this)}>
                    <ContentAdd />
                </FloatingActionButton>
                {!this.state.isHidden && <AddCar />}
            </div>
        )
    }
}

export default connect(
    null, {}
)(AddCarButton);

