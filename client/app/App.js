import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CarTable from "./components/Table";
import AddCarButton from "./components/AddCarButton";


class App extends Component{

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

export default App;
  