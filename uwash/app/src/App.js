/* global Plotly:true */

import React, { Component } from 'react';

import fetch from 'isomorphic-fetch'; 
import Select from 'react-select'; 

import { Box, Container } from '@material-ui/core';

import createPlotlyComponent from 'react-plotly.js/factory'
import {stateOptions, stateDataUrl} from '~/constants'
import {getCurrentDate,generateProjectedData,generateObservedData,getTodayLine} from '~/utils'
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import {Header,Footer} from "~/components"; 

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

        this.state.visible = 'hidden'
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
            
            const todayLine = getTodayLine()

            const newJSONDataObserved_TOTALDEATH =  generateObservedData(newJSON.stats,'total_d','Total Deaths') 
            const newJSONDataProjected_TOTALDEATH = generateProjectedData(newJSON.projected,'total_d','Total Deaths') 
            
            
 
  
            const newJSON_TOTALDEATH =  {
                data: [newJSONDataObserved_TOTALDEATH,newJSONDataProjected_TOTALDEATH],
                layout: { 
                  autosize: true, 
                  showlegend: true,
                  legend: {"orientation": "h"},
                  shapes: todayLine.line,
                  annotations: todayLine.annotation,
                  xaxis: {
                     title: {
                       text: 'Total Deaths',
                     },
                  },
                },
                useResizeHandler: true,
                style: { width: "100%", height: "100%"}
            }; 
 
            const newJSONDataObserved_DAILYDEATHS =  generateObservedData(newJSON.stats,'deaths','Daily Deaths') 
            const newJSONDataProjected_DAILYDEATHS = generateProjectedData(newJSON.projected,'deaths','Daily Deaths') 

            const newJSON_DAILYDEATH =  {
               data: [newJSONDataObserved_DAILYDEATHS,newJSONDataProjected_DAILYDEATHS],
               layout: {
                 autosize: true, 
                 showlegend: true,
                 legend: {"orientation": "h"},
                 shapes: todayLine.line,
                 annotations: todayLine.annotation,
                 xaxis: {
                     title: {
                     text: 'Daily Deaths',
                     },
                  },
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
         <Container>
            <Header />
            <Router>
               <Switch>
                  <Route path="/" exact component={() => <Home />} />
                  <Route path="/about" exact component={() => <About />} />
                  <Route path="/contact" exact component={() => <Contact />} />
                  <Route component={Notfound} />
               </Switch>
            </Router>
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
                        <Box>
                           <h2>Total Deaths</h2>
                           <Plot 
                              data={this.state.total_deaths.json.data}
                              layout={this.state.total_deaths.json.layout} 
                              className={this.state.visible}
                           />  
                        </Box>
                       
                        <h2>Daily Deaths</h2>
                        <Plot 
                           data={this.state.daily_deaths.json.data}
                           layout={this.state.daily_deaths.json.layout} 
                           className={this.state.visible}
                        />
                        <h2>Cases &amp; Testing</h2>
                       
                     </div>
                  </div>
            </div>
            <Footer />
         </Container>
        );
    }
}
 

export default App;


/*
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Navigation, Footer, Home, About, Contact } from "./components";
function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
        <Switch>
          <Route path="/" exact component={() => <Home />} />
          <Route path="/about" exact component={() => <About />} />
          <Route path="/contact" exact component={() => <Contact />} />
        </Switch>
        <Footer />
      </Router>
    </div>
  );
}

export default App; 
*/