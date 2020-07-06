import { Component } from 'react';
import React from 'react';
import Select from 'react-select'; 
import makeAnimated from 'react-select/animated'
import {stateOptions} from '../constants'

const animatedComponents = makeAnimated();
  
export default class UsStatesSelect extends Component<*, State> {
   
   state = { isOpen: false, value: undefined };

   toggleOpen = () => {
      this.setState(state => ({ isOpen: !state.isOpen }));
    };
    onSelectChange = value => {
      this.toggleOpen();
      this.setState({ value }); 
    };
    render() {
      const { isOpen, value } = this.state;
      return (
         <Select  
            label="Select a state"
            components={animatedComponents}
            options={stateOptions}
            onChange={this.onSelectChange}
            defaultValue={{ label: "Select a State", value: 0 }}
         />
      );
   };

}; 