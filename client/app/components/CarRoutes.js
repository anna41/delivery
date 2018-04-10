import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { loadOrdersRoutes } from '../logic';
import GoogleMap from './GoogleMapForCar';


class CarRoutes extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        console.log("wii mount", this.props);
        this.props.loadOrdersRoutes(this.props.history.location.state._id);
    }


    render() {
        console.log("this props", this.props.carRoute);
        return (
            <GoogleMap {...this.props.carRoute} />
        )
    }
}

export default connect(
    state => ({
        cars: state.cars,
        carRoute: state.carRoute
    }), { loadOrdersRoutes }
)(CarRoutes);