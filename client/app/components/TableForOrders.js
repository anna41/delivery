import React, {Component} from 'react';
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


class TableForOrders extends Component{

    constructor(props){
        super(props);
	}

    render(){
        return(
            <div>
                <Table fixedHeader={false} style={{ tableLayout: 'auto' }}>
                <TableHeader
                adjustForCheckbox={false}
                displayRowCheckbox = {false}
                displaySelectAll={false}
                >
                <TableRow>
                    <TableHeaderColumn>ID</TableHeaderColumn>
                    <TableHeaderColumn>Status</TableHeaderColumn>
                    <TableHeaderColumn>From</TableHeaderColumn>
                    <TableHeaderColumn>To</TableHeaderColumn>
                </TableRow>
                </TableHeader>
                <TableBody
                 displayRowCheckbox={false}>
                    {this.props.orders.map((order,index) => (
                        <TableRow key={index}>     
                            <TableRowColumn>{order._id}</TableRowColumn>                      
                            <TableRowColumn>{order.status}</TableRowColumn>
                            <TableRowColumn>{order.departure_point.address}</TableRowColumn>
                            <TableRowColumn>{order.arrival_point.address}</TableRowColumn>
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
