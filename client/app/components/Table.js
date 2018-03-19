import React, {Component} from 'react';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
  } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import axios from 'axios';


class MyTable extends Component{

    constructor(props){
		super(props);

		this.state = {
			data: []
		}
	}

    
    //   updateCheck() {
    //     this.setState((oldState) => {
    //       return {
    //         checked: !oldState.checked,
    //       };
    //     });
    //   }

      componentWillMount(){
		axios.get('/data').then(response => this.setState({data: response.data}));
	}
    render(){
        var data = this.state.data;
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
                </TableRow>
                </TableHeader>
                <TableBody
                 displayRowCheckbox={false}>
                    {data.map((result) => (
                        <TableRow key={result._id}>     
                            <TableRowColumn>{result._id}</TableRowColumn>                      
                            <TableRowColumn>{result.status}</TableRowColumn>
                            <TableRowColumn>{result.availableTime}</TableRowColumn>
                            <TableRowColumn><Checkbox
                            checked = {result.active}
                            /></TableRowColumn>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        )
    }
}

export default MyTable;
