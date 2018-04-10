import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { loadOrdersRoutes } from '../logic';
import GoogleMap from './MapForOrder';


class OrderRoute extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        console.log("this props");
        console.log("this props", this.props.location.state);
        let points = [];
        points.push(this.props.location.state.departurePoint);
        points.push(this.props.location.state.arrivalPoint);
        console.log("points", points);
        return (
            <div>
                <p>here</p>
                <GoogleMap {...points} />
            </div>
        )
    }
}

export default connect(
    state => ({
        carRoute: state.carRoute
    }), { loadOrdersRoutes }
)(OrderRoute);