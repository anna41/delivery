import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CarTable from "./TableForCars";
import AddCarButton from "./AddCarButton";


class Cars extends Component{

    render(){
        return (         
            <MuiThemeProvider>
            <div>
                <CarTable />
                <AddCarButton />
            </div>
            </MuiThemeProvider>          
        );
    }
}

export default Cars;
  