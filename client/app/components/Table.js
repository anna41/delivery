import React, {Component} from 'react';
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
import {loadCars} from '../logic';


class MyTable extends Component{

    constructor(props){
        super(props);
	}

    componentWillMount(){
        this.props.loadCars();
    }

    render(){
        return(
            <div>
                <h1> Cars</h1>
                <Table>
                <TableHeader
                adjustForCheckbox={false}
                displayRowCheckbox = {false}
                displaySelectAll={false}
                >
                <TableRow>
                    <TableHeaderColumn>ID</TableHeaderColumn>
                    <TableHeaderColumn>Status</TableHeaderColumn>
                    <TableHeaderColumn>Available Time</TableHeaderColumn>
                    <TableHeaderColumn>Active</TableHeaderColumn>
                    <TableHeaderColumn></TableHeaderColumn>
                </TableRow>
                </TableHeader>
                <TableBody
                 displayRowCheckbox={false}>
                    {this.props.cars.map((car,index) => (
                        <TableRow key={index}>     
                            <TableRowColumn>{car._id}</TableRowColumn>                      
                            <TableRowColumn>{car.status}</TableRowColumn>
                            <TableRowColumn class="check">{car.availableTime}</TableRowColumn>
                            <TableRowColumn>
                               <CheckBox {...car}/>
                            </TableRowColumn>
                            <TableRowColumn>
                                <DeleteCarButton {...car}/>
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
    }), {loadCars}
)(MyTable);
