import React, { Component } from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import { connect } from 'react-redux';
import TableForOrders from './TableForOrders';
import { loadOrders } from '../logic';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
};

var status;

class Orders extends Component {

    constructor(props) {
        super(props);
        this.getOrders = this.getOrders.bind(this);
    }

    componentWillMount() {
        this.props.loadOrders('all');
    }

    getOrders(status) {
        this.props.loadOrders(status);
    }

    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <h1> Orders</h1>
                    <Tabs>
                        <Tab
                            label="All orders"
                            onActive={() => this.getOrders('all')}
                        >
                            <div>
                                <TableForOrders />
                            </div>
                        </Tab>
                        <Tab
                            label="Delivered orders"
                            onActive={() => this.getOrders('delivered')}
                        >
                            <div>
                                <TableForOrders />
                            </div>
                        </Tab>
                        <Tab
                            label="On the way orders"
                            onActive={() => this.getOrders('on the way')}
                        >
                            <div>
                                <TableForOrders />
                            </div>
                        </Tab>
                        <Tab
                            label="In the store orders"
                            onActive={() => this.getOrders('in the store')}
                        >
                            <div>
                                <TableForOrders />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default connect(
    state => ({
        orders: state.orders
    }),
    { loadOrders }
)(Orders);