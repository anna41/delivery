import React, {Component} from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import Cars from './components/Cars';
import Orders from './components/Orders';

export default () =>(
    <BrowserRouter>
    <div>
      <MuiThemeProvider>
        <div>
        <Link to='/cars'><FlatButton style={{height:'50px',color:'rgb(5, 0, 221)'}} className="my-button">Cars</FlatButton></Link>
        <Link to='/orders'><FlatButton style={{height:'50px',color:'rgb(5, 0, 221)'}} className="my-button">Orders</FlatButton></Link>
       </div>
        </MuiThemeProvider>
        <Switch>
            <Route path="/" exact component={Cars} />
            <Route path="/cars" exact component={Cars} />
            <Route path='/orders' exact component={Orders} />
        </Switch>
        </div>
    </BrowserRouter>
    );