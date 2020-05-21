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
 * Display top info for each graph
 */

function display_graph_top_info(last_date,name1,data1,name2,data2,type, domEl, color1, color2) {

   var slug_type = type.toLowerCase().replace(/ /g, '_') ;
   var slug_name1 = name1.toLowerCase().replace(/ /g, '_') ;
   var slug_name2 = name2.toLowerCase().replace(/ /g, '_') ;

   var formattedDate = last_date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric" 
    });

    
   $(domEl).html(
      '<h3>' +  name1  +  ' <i>vs.</i> '+ name2 +' - ' + type  +'</h3>\
      <p>On ' + formattedDate + '<br>\
      <b style="color:'+color1+'">' + name1+ '</b>: \
      <b style="color:'+color1+'">' + usFormatCommas(data1[data1.length-1]) + '</b> ' + type +' <span id="'+slug_type+"_"+slug_name1 +'"></span><br>\
      <b style="color:'+color2+'">' + name2 + '</b>: \
      <b style="color:'+color2+'">' + usFormatCommas(data2[data2.length-1]) + '</b> ' + type +' <span id="'+slug_type+"_"+slug_name2 +'"></span> \
      </p>');

      // We get the related MAX_(type.replace(" ","_")).json
      // To have the ranking 
      var settings = {
         "url": "../covid-19-intl-data/country/MAX_" + slug_type  +".json",
         "method": "GET",
         "timeout": 0,
      };
 
      $.ajax(settings).done(function (response) {

         // We find the rank of the country
         $.each(response['countries'],function(i,v) {
            if(v['name']== name1 && name1!= "World") {
               $('#'+slug_type+"_"+slug_name1).html("(currently ranked <a href='./countries_rank.html#"+slug_type+"'>#" + v['rank']+'</a> worldwide)');
            }
            if(v['name']== name2 && name2!= "World") {
               $('#'+slug_type+"_"+slug_name2).html("(currently ranked <a  href='./countries_rank.html#"+slug_type+"'>#" + v['rank']+'</a> worldwide)');
            }
         });
        
         
      });
}


/**
 * Draw one single graph 
 */
function draw_country_vs_single(name1,data1,name2,data2,x_axis1,x_axis2,type,domEl,color1,color2,layout) {
 

    var set1 = {
      x: x_axis1,
      y: data1,
      name: name1 + " " + type,
      type: "line+scatter", 
      marker: {color: color1},
   };

   
   var set2 = {
      x: x_axis2,
      y: data2,
      name: name2 + " " + type,
      type: "line+scatter", 
      marker: {color: color2},
   };

   var layout = { 
      margin: {"t": 20, "b": 80, "l": 80, "r": 80},
      showlegend: true,
      legend: { orientation: "h" },
      yaxis1: {   
         title:type
      }
   };

   Plotly.newPlot(domEl, [set1,set2], layout);

}


/**
 * US Format Float
 */
function usFormatCommas(x) {
   return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}


/**
 * Draw standard graph with 7,14 trends and eventual
 * @param {*} data 
 */
function draw_country_graph(init_data1,graph_data1, init_data2,graph_data2) {

      var color1 = 'rgba(200, 0 , 0,.8)';
      var color2 = 'rgba(50, 0, 50,.8)';
 
      draw_country_vs_single(init_data1.name,graph_data1.new_cases_per_million,init_data2.name,graph_data2.new_cases_per_million,graph_data1.x_axis,graph_data2.x_axis,"New Cases Per Million","country_graph1",color1,color2)
      display_graph_top_info(init_data1.last_date,init_data1.name,graph_data1.new_cases_per_million,init_data2.name,graph_data2.new_cases_per_million,"New Cases Per Million",'#country_graph_title1',color1,color2);
      
      draw_country_vs_single(init_data1.name,graph_data1.new_deaths_per_million,init_data2.name,graph_data2.new_deaths_per_million,graph_data1.x_axis,graph_data2.x_axis,"New Deaths Per Million","country_graph2",color1,color2)
      display_graph_top_info(init_data1.last_date,init_data1.name,graph_data1.new_deaths_per_million,init_data2.name,graph_data2.new_deaths_per_million,"New Deaths Per Million",'#country_graph_title2',color1,color2);
      
      draw_country_vs_single(init_data1.name,graph_data1.total_deaths_per_million,init_data2.name,graph_data2.total_deaths_per_million,graph_data1.x_axis,graph_data2.x_axis,"Total Deaths Per Million","country_graph3",color1,color2)
      display_graph_top_info(init_data1.last_date,init_data1.name,graph_data1.total_deaths_per_million,init_data2.name,graph_data2.total_deaths_per_million,"Total Deaths Per Million",'#country_graph_title3',color1,color2);
      
      draw_country_vs_single(init_data1.name,graph_data1.total_cases_per_million,init_data2.name,graph_data2.total_cases_per_million,graph_data1.x_axis,graph_data2.x_axis,"Total Cases Per Million","country_graph4",color1,color2)
      display_graph_top_info(init_data1.last_date,init_data1.name,graph_data1.total_cases_per_million,init_data2.name,graph_data2.total_cases_per_million,"Total Cases Per Million",'#country_graph_title4',color1,color2);
            

}
