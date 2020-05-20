
/**
 * Return the proper data based on Country
 */
function getInitDataCountry(data,country, country_name) {
   var name, toReturn;
  

   var country_stats = [], all_dates = [];

   $.each(data,function(i,v) {
      country_stats.push({
         'confirmed': v.Confirmed,
         'deaths': v.Deaths,
         'recovered': v.Recovered,
         'active': v.Active,
         'date': v.Date
      });
      all_dates.push(v.Date);
   })

 
   // State Data
   toReturn =  { 
      name:       country_name,
      slug:       country,
      stats:      country_stats,
      last_date:  new Date(Math.max.apply(null,all_dates))
   };  
  
   return toReturn;
}

/**
 * Compute all the needed data for the graphs
 */
function prepareData(data) {

   // Confirmed
   var x_axis_confirmed  = [];   // They all share the same X axis
   var y_axis_confirmed = [];
   // New Deaths 
   var y_axis_deaths = [];
   // New Recovered 
   var y_axis_recovered = [];
   // New Active 
   var y_axis_active = [];

   $.each(data['stats'], function(i,val) { 
  
      x_axis_confirmed.push(val.date);

      y_axis_confirmed.push(val.confirmed);
      y_axis_deaths.push(val.deaths);
      y_axis_recovered.push(val.recovered);
      y_axis_active.push(val.active);
      
   });
    
   return {
      x_axis:     x_axis_confirmed,
      confirmed:  y_axis_confirmed,
      deaths:     y_axis_deaths,
      recovered:  y_axis_recovered,
      active:     y_axis_active
   }
}

 



/**
 * Draw standard graph with 7,14 trends and eventual
 * @param {*} data 
 */
function draw_country_graph(init_data,graph_data) {
   
 

   // Org Data
   var dataDeaths = {
      x: graph_data.x_axis,
      y: graph_data.deaths,
      name: "Deaths",
      type: "bar",
      yaxis: 'y2',
      marker: {color: 'rgba(55, 83, 109,.2)'},
   };
 
   var dataConfirmed = {
      x: graph_data.x_axis,
      y: graph_data.confirmed,
      name: "Confirmed Cases",
      type: 'scatter',
      mode: 'lines',
      yaxis: 'y1',
      line: {
         color: 'rgb(55, 128, 191)',
         width: 3
       }
   };

   var dataRecovered = {
      x: graph_data.x_axis,
      y: graph_data.recovered,
      name: "Recovered",
      type: 'scatter',
      mode: 'lines',
      yaxis: 'y1',
   };

   var dataActive = {
      x: graph_data.x_axis,
      y: graph_data.active,
      name: "Active",
      type: 'scatter',
      mode: 'lines',
      yaxis: 'y1',
   };
   

   var layout = { 
      margin: {"t": 20, "b": 80, "l": 80, "r": 80},
      showlegend: true,
      legend: { orientation: "h" },
      yaxis2: { 
         title: 'Total Deaths', 
         overlaying: 'y',
         side: 'right',
         rangemode: 'nonnegative',
         autorange: true,
         showgrid: false,
         zeroline: false,
         showline: false,
         autotick: true,
         ticks: '',
         showticklabels: false
       },
       yaxis1: {  
         title: 'Total Cases', 
         side: 'left',
         rangemode: 'nonnegative'
       }
      
   };


 
 
   all_set =  [ dataConfirmed, dataRecovered, dataActive, dataDeaths];
   Plotly.newPlot('country_graph', all_set, layout);

   $('#country_graph_title').html('<h3>' + init_data.name +  '</h3>');
    

}
