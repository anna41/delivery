import React, { Component } from 'react';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import axios from 'axios';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import CheckBox from "./CheckBox"
import DeleteCarButton from "./DeleteCarButton";
import { loadCars } from '../logic';
import { Link } from 'react-router-dom';
import MapIcon from 'material-ui/svg-icons/maps/place';
import { red500 } from 'material-ui/styles/colors';


class MyTable extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.loadCars();
    }

    render() {
        return (
            <div>
                <h1> Cars</h1>
                <Table style={{ width: '100%' }}>
                    <TableHeader
                        adjustForCheckbox={false}
                        displayRowCheckbox={false}
                        displaySelectAll={false}
                    >
                        <TableRow>
                            <TableHeaderColumn style={{ textAlign: 'left', width: '130px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>Name</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'center', width: '90px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>Status</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'center', width: '200px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>Possible available Time</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left', 'paddingLeft': '15px', 'paddingRight': '10px' }}>Possible arrival point</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'center', width: '50px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>Active</TableHeaderColumn>
                            <TableHeaderColumn style={{ textAlign: 'left', width: '30px', 'paddingLeft': '25px', 'paddingRight': '10px' }}>Map</TableHeaderColumn>
                            <TableHeaderColumn style={{ width: '50px', 'paddingLeft': '10px', 'paddingRight': '30px' }}></TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={false}>
                        {this.props.cars.map((car, index) => (
                            <TableRow key={index}>
                                <TableRowColumn style={{ textAlign: 'left', width: '130px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>{car.carName}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'center', width: '90px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>{car.status}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'center', width: '200px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>{car.availableTime}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', 'paddingLeft': '15px', 'paddingRight': '10px', wordWrap: 'break-word', whiteSpace: 'normal' }}>{car.possibleArrivalPoint.address}</TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'center', width: '50px', 'paddingLeft': '10px', 'paddingRight': '10px' }}>
                                    <CheckBox {...car} />
                                </TableRowColumn>
                                <TableRowColumn style={{ width: '30px', 'paddingLeft': '25px', 'paddingRight': '10px' }}>
                                    <Link to={{
                                        pathname: '/carRoutes',
                                        state: { ...car }
                                    }}>
                                        <FlatButton
                                            style={{ textAlign: 'left' }}
                                            icon={<MapIcon color={red500} />}
                                        />
                                    </Link>
                                </TableRowColumn>
                                <TableRowColumn style={{ textAlign: 'left', width: '60px', 'paddingLeft': '10px', 'paddingRight': '30px' }}>
                                    <DeleteCarButton {...car} />
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
        cars: state.cars
    }), { loadCars }
)(MyTable);
