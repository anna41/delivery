import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dropdown from "./components/Table";


class App extends Component{


    render(){
        return (
            <MuiThemeProvider>
            <div>
                <Dropdown />
            </div>
            </MuiThemeProvider>
        )
    }
}

export default App;