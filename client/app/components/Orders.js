import React,{Component}  from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import { connect } from 'react-redux';
import TableForOrders from './TableForOrders';
import {loadOrders} from '../logic';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const styles = {
    headline: {
      fontSize: 24,
      paddingTop: 16,
      marginBottom: 12,
      fontWeight: 400,
    },
  };

  var status;

class Orders extends Component{

    constructor(props) {
        super(props);
    }

    componentWillMount(){
        this.props.loadOrders('all');
    }

    getOrders(t,tp,status){
        this.props.loadOrders(status.props.value);
    }

    render(){
        return (
            <MuiThemeProvider>
            <div>
                <h1> Orders</h1>
                <Tabs>
                <Tab 
                    label="All orders" 
                    value = "all"
                    onActive={this.getOrders.bind(this,this.props,'status')}
                >
                <div>
                    <TableForOrders/>
                </div>
                </Tab>
                <Tab 
                    label="Delivered orders" 
                    value = "delivered"
                    onActive={this.getOrders.bind(this,this.props,'status')}
                >
                <div>
                    <TableForOrders/>
                </div>
                </Tab>
                <Tab 
                    label="On the way orders" 
                    value = "on the way"
                    onActive={this.getOrders.bind(this,this.props,'status')}
                >
                <div>
                    <TableForOrders/>
                </div>
                </Tab>
                <Tab 
                    label="In the store orders" 
                    value= "in the store"
                    onActive={this.getOrders.bind(this,this.props,'status')}
                >
                <div>
                    <TableForOrders/>
                </div>
                </Tab>
            </Tabs>
          </div>
          </MuiThemeProvider>
        )
    }
}

  export default connect(
    state => ({
        orders: state.orders
    }),
    {loadOrders}
)(Orders);