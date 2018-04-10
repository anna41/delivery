import React, { Component } from 'react';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import CheckBox from "./CheckBox"
import DeleteCarButton from "./DeleteCarButton";
import { Link } from 'react-router-dom';
import MapIcon from 'material-ui/svg-icons/maps/place';
import { red500 } from 'material-ui/styles/colors';

const getStyles = () => {
    return {
        root: {
            whiteSpace: this.props.wrap ? 'normal' : 'nowrap', // changed line
            textOverflow: 'ellipsis',
            position: 'relative',
        }
    };
};

class TableForOrders extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Table >
                    <TableHeader
                        adjustForCheckbox={false}
                        displayRowCheckbox={false}
                        displaySelectAll={false}
                    >
                        <TableRow>
                            <TableHeaderColumn style={{ textAlign: 'left', width: '210px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>ID</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left', width: '80px', 'padding': '5px' }}>Status</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left' }}>From</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left' }}>To</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left', width: '200px', padding: '5px' }}>Arrival Time</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left', width: '30px' }}>Map</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={false}>
                        {this.props.orders.map((order, index) => (
                            <TableRow key={index}>
                                <TableRowColumn style={{ textAlign: 'left', width: '210px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>{order._id}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', width: '80px', 'padding': '5px' }}>{order.status}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', wordWrap: 'break-word', whiteSpace: 'normal' }}>{order.departurePoint.address}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', wordWrap: 'break-word', whiteSpace: 'normal' }}>{order.arrivalPoint.address}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', width: '200px', padding: '5px' }}>{order.arrivalDate}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', width: '30px' }}>
                                    <Link to={{
                                        pathname: '/orderRoute',
                                        state: { ...order }
                                    }}>
                                        <FlatButton
                                            style={{ textAlign: 'left' }}
                                            icon={<MapIcon color={red500} />}
                                        />
                                    </Link>
                                </TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}

export default connect(
    state => ({
        orders: state.orders
    }), {}
)(TableForOrders);