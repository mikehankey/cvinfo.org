/* global Plotly:true */

import React, { Component } from 'react';

import fetch from 'isomorphic-fetch'; 
import Select from 'react-select'; 

import createPlotlyComponent from 'react-plotly.js/factory'
import {stateOptions, stateDataUrl} from './constants'
import {getCurrentDate} from './utils'

import './App.css'; 
 
const Plot = createPlotlyComponent(Plotly);

class App extends Component {

    constructor(props) {
        super(props);

        this.handleJsonChange = this.handleJsonChange.bind(this); 
        this.handleNewPlot    = this.handleNewPlot.bind(this);
        

        // Init Data
        const plotJSON = {
         data: [
            { 
            } 
          ],
          layout: { 
          } 
        };


        this.state = {
            total_deaths: {
               json: plotJSON,
               plotUrl: ''
            },
            daily_deaths:{
               json: plotJSON,
               plotUrl: ''
           }
        };
    }
    
    handleJsonChange = newJSON => {
        this.setState({json: newJSON});
    }

    handleNewPlot = option => {

      const regex = /{ST}/gi;
  
      // Build the URL to get the JSON
      // ADD process.env.PUBLIC_URL +  for live version
      const cur_stateDataUrl = stateDataUrl.replace(regex, option.value)
        
      fetch(cur_stateDataUrl)
         .then((response) => response.json())
         .then((newJSON) => {

            const tmp = generateObservedData(newJSON.stats,'total_d','Total Deaths') 
             
            const newJSONDataObserved_TOTALDEATH =  generateObservedData(newJSON.stats,'total_d','Total Deaths') 
            const newJSONDataProjected_TOTALDEATH = generateProjectedData(newJSON.projected,'total_d','Total Deaths') 
            
            const todayLine =  [{
               type: 'line',
               x0:   getCurrentDate(),
               y0: 0,
               x1:   getCurrentDate(),
               yref: 'paper',
               y1: 1.2,
               line: {
                  color: 'grey',
                  width: 1.5,
                  dash: 'dot'
               }
            }]

            const todayAnnotation = [
               {
                 x: getCurrentDate(),
                 y: Math.max(...[newJSONDataObserved_TOTALDEATH.y,newJSONDataProjected_TOTALDEATH.y]),
                 xref: 'x',
                 yref: 'y',
                 text: 'Today', 
                 ax: -40,
                 ay: -20,
                 showarrow: false
               }
             ];
  
            const newJSON_TOTALDEATH =  {
                data: [newJSONDataObserved_TOTALDEATH,newJSONDataProjected_TOTALDEATH],
                layout: {
                  title:  "Total Deaths",
                  autosize: true, 
                  showlegend: true,
                  legend: {"orientation": "h"},
                  shapes: todayLine,
                  annotations: todayAnnotation
                },
                useResizeHandler: true,
                style: { width: "100%", height: "100%"}
            }; 
 
            const newJSONDataObserved_DAILYDEATHS =  generateObservedData(newJSON.stats,'deaths','Daily Deaths') 
            const newJSONDataProjected_DAILYDEATHS = generateProjectedData(newJSON.projected,'deaths','Daily Deaths') 

            const newJSON_DAILYDEATH =  {
               data: [newJSONDataObserved_DAILYDEATHS,newJSONDataProjected_DAILYDEATHS],
               layout: {
                 title:  "Daily Deaths",
                 autosize: true, 
                 showlegend: true,
                 legend: {"orientation": "h"},
                 shapes: todayLine,
                 annotations: todayAnnotation
               },
               useResizeHandler: true,
               style: { width: "100%", height: "100%"}
           }; 

            this.setState({
               total_deaths: { json: newJSON_TOTALDEATH  },
               daily_deaths: { json: newJSON_DAILYDEATH  },
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
                            data={this.state.total_deaths.json.data}
                            layout={this.state.total_deaths.json.layout}
                            config={{displayModeBar: false}}
                        />  
                        <Plot 
                           data={this.state.daily_deaths.json.data}
                           layout={this.state.daily_deaths.json.layout}
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

   return  { 
            
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
