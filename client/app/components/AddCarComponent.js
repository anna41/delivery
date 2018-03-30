import React, {Component} from 'react';

class AddCar extends Component{

    constructor(props) {
        super(props);
        this.state = {
            capacity:''
        };
        this.handleCarChange = this.handleCarChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
      }
      
      handleSubmit(event) {
        event.preventDefault();
        console.log('form submitted and car value is', this.state.capacity);
      }
      
      handleCarChange(event) {
        console.log('handleCarChange', this);
        this.setState({capacity: event.target.value});
      }
      

    render(){
        return (
            <form onSubmit={this.handleSubmit}>
               <input
                type="text"
                placeholder="capacity"
                value={this.state.capacity}
                onChange={this.handleCarChange}
               />
               <button>Add car</button>
            </form>
        )
    }
}

export default AddCar;