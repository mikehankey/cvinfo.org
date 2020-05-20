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
         'new_cases_per_million':   parseFloat(v.ncpm), //>=0?parseFloat(v.ncpm):0,
         'new_deaths_per_million':  parseFloat(v.ndpm), //>=0?parseFloat(v.ndpm):0,
         'total_cases_per_million': parseFloat(v.tcpm), //>=0?parseFloat(v.tcpm):0,
         'total_deaths_per_million':parseFloat(v.tdpm)  //>=0?parseFloat(v.tdpm):0 
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
function draw_country_graph(init_data1,graph_data1, init_data2,graph_data2) {

      // Data1 NCPM
      var dateNCPM1 = {
         x: graph_data1.x_axis,
         y: graph_data1.new_cases_per_million,
         name: init_data1.name + " New Cases Per Million",
         type: "line+scatter", 
         marker: {color: 'rgba(200, 0 , 0,.8)'},
      };

      var dateNCPM2 = {
         x: graph_data2.x_axis,
         y: graph_data2.new_cases_per_million,
         name: init_data2.name + " New Cases Per Million",
         type: "line+scatter", 
         marker: {color: 'rgba(50, 0, 50,.8)'},
      };

      var layout = { 
         margin: {"t": 20, "b": 80, "l": 80, "r": 80},
         showlegend: true,
         legend: { orientation: "h" },
         yaxis1: {  
            title: 'Cases per million', 
            side: 'left',
            rangemode: 'nonnegative'
         }
      };

      var info = "";


      all_set =  [ dateNCPM1, dateNCPM2];
      $('#country_graph_title').html('<h3>' +  init_data1.name  +  ' <i>vs.</i> '+ init_data2.name +'</h3><p>New Cases per Million</p>');
      Plotly.newPlot('country_graph', all_set, layout);
      

      // Data1 NCPM
      var dateNDPM1 = {
         x: graph_data1.x_axis,
         y: graph_data1.new_deaths_per_million,
         name: init_data1.name + " New Deaths Per Million",
         type: "line+scatter", 
         marker: {color: 'rgba(200, 0 , 0,.8)'},
      };

      var dateNDPM2 = {
         x: graph_data2.x_axis,
         y: graph_data2.new_deaths_per_million,
         name: init_data2.name + " New Deaths Per Million",
         type: "line+scatter", 
         marker: {color: 'rgba(50, 0, 50,.8)'},
      };
  
      all_set =  [ dateNDPM1, dateNDPM2];
      $('#country_graph_title1').html('<h3>' +  init_data1.name  +  ' <i>vs.</i> '+ init_data2.name +'</h3><p>New Deaths per Million</p>');
      Plotly.newPlot('country_graph1', all_set, layout);

 

}
