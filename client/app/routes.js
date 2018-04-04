import React, {Component} from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Cars from './components/Cars';
import Orders from './components/Orders';

export default () =>(
    <BrowserRouter>
    <div>
      <MuiThemeProvider>
        <div>
        <Link to='/cars'>Cars</Link>
        <Link to='/orders'>Orders</Link>
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