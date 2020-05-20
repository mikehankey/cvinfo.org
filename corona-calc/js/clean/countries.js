function compare( a, b ) {
   if ( a.date < b.date ){
     return -1;
   }
   if ( a.date > b.date ){
     return 1;
   }
   return 0;
 }
 
 


/**
 * Return the proper data based on Country
 */
function getInitDataCountry(data,country) {
   var toReturn;
   
   var country_stats = [], all_dates = [];

   $.each(data,function(i,v) { 
      country_stats.push({
         'date':                    i,
         'new_cases_per_million':   parseFloat(v.ncpm)>=0?parseFloat(v.ncpm):0,
         'new_deaths_per_million':  parseFloat(v.ndpm)>=0?parseFloat(v.ndpm):0,
         'total_cases_per_million': parseFloat(v.tcpm)>=0?parseFloat(v.tcpm):0,
         'total_deaths_per_million':parseFloat(v.tdpm)>=0?parseFloat(v.tdpm):0 
      });
      all_dates.push(new Date(i));
   })
 
   // Sort country states per date
   country_stats.sort( compare );

   // State Data
   toReturn =  { 
      name:       country, 
      stats:      country_stats,
      last_date:  new Date(Math.max.apply(null,all_dates))
   };  
 
  
   return toReturn;
}

/**
 * Compute all the needed data for the graphs
 */
function prepareData(data) {

   
   var x_axis  = [];  

   // new_cases_per_million  
   var y_axis_ncpm = [];

   // new_deaths_per_million 
   var y_axis_ndpm = [];
   
   // total_cases_per_million 
   var y_axis_tcpm = [];

   // total_deaths_per_million 
   var y_axis_tdpm = [];
 

   $.each(data['stats'], function(i,val) { 
      x_axis.push(val.date);
      y_axis_ncpm.push(val.new_cases_per_million);
      y_axis_ndpm.push(val.new_deaths_per_million);
      y_axis_tcpm.push(val.total_cases_per_million);
      y_axis_tdpm.push(val.total_deaths_per_million);
       
      
   });
    
   return {
      x_axis:     x_axis,
      new_cases_per_million:        y_axis_ncpm,
      new_deaths_per_million:       y_axis_ndpm,
      total_cases_per_million:      y_axis_tcpm,
      total_deaths_per_million:     y_axis_tdpm
   }
}

 



/**
 * Draw standard graph with 7,14 trends and eventual
 * @param {*} data 
 */
function draw_country_graph(init_data,graph_data) {
   
  
   // Org Data
   var dateNCPM = {
      x: graph_data.x_axis,
      y: graph_data.new_deaths_per_million,
      name: "New Deaths Per Million",
      type: "bar",
      //yaxis: 'y2',
      marker: {color: 'rgba(55, 83, 109,.2)'},
   };
 
   var dataNDPM = {
      x: graph_data.x_axis,
      y: graph_data.new_cases_per_million,
      name: "New Cases Per Million",
      type: 'scatter',
      mode: 'lines',
      //yaxis: 'y1',
      line: {
         color: 'rgb(55, 128, 191)',
         width: 3
       }
   };

   /*
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
   */

   var layout = { 
      margin: {"t": 20, "b": 80, "l": 80, "r": 80},
      showlegend: true,
      legend: { orientation: "h" },
      yaxis2: { 
         title: 'Deaths  per million', 
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
         title: 'Cases per million', 
         side: 'left',
         rangemode: 'nonnegative'
       }
      
   };


 
 
   all_set =  [ dateNCPM, dataNDPM];
   Plotly.newPlot('country_graph', all_set, layout);

   $('#country_graph_title').html('<h3>' + init_data.name +  '</h3>');
    

}
