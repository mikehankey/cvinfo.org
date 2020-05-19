
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
      name: "Total Deaths",
      type: "bar" 
   };
 
   var dataConfirmed = {
      x: graph_data.x_axis,
      y: graph_data.confirmed,
      name: "Total Confirmed Cases",
      type: "line" 
   };

   var dataRecovered = {
      x: graph_data.x_axis,
      y: graph_data.recovered,
      name: "Total Recovered",
      type: "line" 
   };

   var dataActive = {
      x: graph_data.x_axis,
      y: graph_data.active,
      name: "Total Active",
      type: "line" 
   };
   

   var layout = { 
      margin: {"t": 20, "b": 80, "l": 50, "r": 10},
      showlegend: true,
      legend: { orientation: "h" },
      
   };
 
   all_set =  [dataDeaths, dataConfirmed, dataRecovered, dataActive];
   Plotly.newPlot('country_graph', all_set, layout);
    

}
