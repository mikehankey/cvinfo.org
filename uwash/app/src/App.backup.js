/* global Plotly:true */

import React, { Component } from 'react';

import fetch from 'isomorphic-fetch'; 
import Select from 'react-select'; 

import createPlotlyComponent from 'react-plotly.js/factory'
import {stateOptions, stateDataUrl} from '~/constants'

import './App.css'; 
 
const Plot = createPlotlyComponent(Plotly);

class App extends Component {

    constructor(props) {
        super(props);

        this.handleJsonChange = this.handleJsonChange.bind(this); 
        this.handleNewPlot    = this.handleNewPlot.bind(this);
        
        const plotJSON = {
         data: [
            {
              type: 'scatter',
              mode: 'lines+points',
              x: [1, 2, 3],
              y: [2, 6, 3],
              marker: {color: 'red'}
            } 
          ],
          layout: {
            title: 'A Fancy Plot',
            autosize: true, 
          },
          useResizeHandler: true,
          style: { width: "100%", height: "100%"}
        };

        this.state = {
            json: plotJSON,
            plotUrl: ''
        };
    }
    
    handleJsonChange = newJSON => {
        this.setState({json: newJSON});
    }

    handleNewPlot = option => {

      const regex = /{ST}/gi;
  
      // Build the URL to get the JSON
      const cur_stateDataUrl = stateDataUrl.replace(regex, option.value)
        
      fetch(cur_stateDataUrl)
         .then((response) => response.json())
         .then((newJSON) => {
             
            const newJSONDataObserved =  generateObservedData(newJSON.stats,'total_d','Total Deaths') 

            const newJSONDataProjected = generateProjectedData(newJSON.projected,'total_d','Total Deaths') 
              
            newJSON =  {
                data: [newJSONDataObserved,newJSONDataProjected],
                layout: {
                  title:  "Total Deaths",
                  autosize: true, 
                  showlegend: true,
		            legend: {"orientation": "h"}
                },
                useResizeHandler: true,
                style: { width: "100%", height: "100%"}
            }; 

            this.setState({
               json: newJSON,
               plotUrl: cur_stateDataUrl
            }); 
 
             
         });  
    }
     
    getMocks = () => {
      return stateOptions[0]; 
   };
    
    render() { 
        return (
            <div className="App">
                  <div>
                     <div className='controls-panel'>
                           <Select 
                                name="select-state" 
                                options={stateOptions}
                                placeholder={'Select a state'}
                                onChange={this.handleNewPlot}
                                className={'no-select'}
                           />
                     </div> 
                     <div className='graph-container'>  
                        <Plot 
                            data={this.state.json.data}
                            layout={this.state.json.layout}
                            config={{displayModeBar: false}}
                        />  
                        <Plot 
                           data={this.state.json.data}
                           layout={this.state.json.layout}
                           config={{displayModeBar: false}}
                        />
                     </div>
                  </div>
            </div>
        );
    }
}
 

function generateObservedData(data,type,type_name) {  
   var all_dates = [];
   var all_values = [];

   for(const d of data){
      all_dates.push(d['date']);
      all_values.push(d[type]);
   }

   return   {
      'type': 'scatter',
      'mode': 'lines+points',
      'hovertemplate': '<b>Date</b>: %{x}<br><i>Observed</i>: %{y} '  + type_name,
      'x': all_dates,
      'y': all_values,
      'marker': {color: 'red'},
      'name': 'Observerd ' + type_name
   } 
 
}

function generateProjectedData(data,type,type_name) {  
   var all_dates = [];
   var all_values = [];

   for(const d of data){
      all_dates.push(d['date']);
      all_values.push(d[type]);
   }

   return  {
      'mode': 'lines',
      'x': all_dates,
      'y': all_values, 
      'hovertemplate': '<b>Date</b>: %{x}<br><i>Projected</i>: %{y} '  + type_name,
      'marker': {color: 'darkgrey'}, 
      'name': 'Projected ' + type_name,
      'line': {
         'dash': 'dash',
         'width': 2
       }
   }   
 
}

export default App;
