
/**
 * Return the proper data based on county or state
 */
function getInitData(data,county) {
   var name, toReturn;
 
   if($.trim(county)=='') { 

      // State Data
      toReturn =  {
         type:    '  state',
         name:       data['summary_info'].state_name,
         pop:        data['summary_info'].state_population * 1000000,
         stats:      data['state_stats'],
         last_day_number_data: data['js_vals']['dates'].length,
         last_day_data: new Date(dateFormatMIT(data['js_vals']['dates'][data['js_vals']['dates'].length-1])),
         last_mortality_rate:  data['js_vals']['mortality_vals'][data['js_vals']['mortality_vals'].length-1],
         total_death: data['summary_info'].deaths,
         total_case:  data['summary_info'].cases
      }; 
 
      // Do we have State Model Data ?
      if( data['model_data'] !== undefined) {
         toReturn.model_data =  data['model_data'];
      }

   } else {
 
      // County Name to Display
      if (county.toLowerCase().indexOf("city") === -1) {   
         name = county + " County, " + data['summary_info'].state_code;  
      } else {   
         name = county + ", " + data['summary_info'].state_code;   
      } 
 
      // County Data
      toReturn = {
         type:       'county',
         name:       name,
         pop:        data['county_pop'][county],
         stats:      data['county_stats'][county]['county_stats'],
         last_day_number_data: data['county_stats'][county]['county_stats'].length,
         last_day_data:  new Date(data['county_stats'][county]['county_stats'][data['county_stats'][county]['county_stats'].length-1].day),
         last_mortality_rate:  data['county_stats'][county]['county_stats'][data['county_stats'][county]['county_stats'].length-1].mortality,
         total_death: data['county_stats'][county]['county_stats'][data['county_stats'][county]['county_stats'].length-1].deaths,
         total_case: data['county_stats'][county]['county_stats'][data['county_stats'][county]['county_stats'].length-1].cases
      };

       // Uniformize stats
      $.each(toReturn.stats,function(i,v) {
         // We have "day" in county and "date" in state but in 2 different format (!!!!!)
         toReturn.stats[i]['date'] =  v['day'].replace(/-/g, '');
         toReturn.stats[i]['day']  = '';
      });
 
   } 
  
   return toReturn;
}

/**
 * Compute all the needed data for the graphs
 */
function prepareData(data) {

   // New Cases
   var x_axis_new_cases  = []; 
   var y_axis_new_cases = [];
    
   // New Cases Trend
   var x_axis_new_cases_model_trend  = []; 
   var y_axis_new_cases_model_trend = [];  

   // Growth
   var x_axis_growth  = []; 
   var y_axis_growth = [];  

   //  Growth Decay
   var x_axis_growth_decay  = []; 
   var y_axis_growth_decay = []; 

   // Cases Tests
   var x_axis_tests  = []; 
   var y_axis_tests = []; 

   // New Deaths
   var x_axis_new_deaths  = []; 
   var y_axis_new_deaths = []; 

   // Deaths Growth
   var x_axis_deaths_growth  = []; 
   var y_axis_deaths_growth = []; 

   // Deaths Growth
   var x_axis_mortality  = []; 
   var y_axis_mortality = []; 

   var last_test_val = 0;              // For new test/per day as we have cumulative numbers in the data
   var last_growth_decay_val = 0;      // Idem for Growth Decay

   // Models?
   if(data['model_data'] !== undefined) { 
      
      //  MIT
      if(data['model_data']['MIT'] !== undefined) { 
         $.each(data['model_data']['MIT']['Day'], function(i,day) {
            x_axis_new_cases_model_trend.push(new Date(day));
         });

         $.each(data['model_data']['MIT']['Total_Detected'], function(i,total_detected) {
            if(i!==0) {
               y_axis_new_cases_model_trend.push(total_detected-data['model_data']['MIT']['Total_Detected'][i-1]);
            } else {
               y_axis_new_cases_model_trend.push(total_detected-data['model_data']);
            }
         }); 
      }
   }
     

   $.each(data['stats'], function(i,val) { 
       
      var tmp_growth_val = val.cg_last == undefined ? val.case_growth:  val.cg_last;         // Lack of consistencty of the data for GROWTH
      var tmp_death_growth_val = val.dg_last == undefined ? val.death_growth : val.dg_last   // Same for DEATH GROWTH
      var curDate = new Date(dateFormatMIT(val.date));
       
      // GROWTH
      x_axis_growth.push(curDate);
      y_axis_growth.push(parseFloat(tmp_growth_val));

      // NEW CASES
      // We sometimes have negative values for deaths (I guess it's some corrections?)
      // for now, we don't take them into account
      x_axis_new_cases.push(curDate);
      y_axis_new_cases.push(parseFloat(val.new_cases>0?val.new_cases:0));

      // TESTS PER DAY
      x_axis_tests.push(curDate);
      y_axis_tests.push(val.tests - last_test_val);
      last_test_val = val.tests;
       
      // DEATH GROWTH
      x_axis_deaths_growth.push(curDate);
      y_axis_deaths_growth.push(parseFloat(tmp_death_growth_val)); 

      // GROWTH DECATY
      x_axis_growth_decay.push(curDate);
      y_axis_growth_decay.push(tmp_death_growth_val - last_growth_decay_val);
      last_growth_decay_val = tmp_death_growth_val;

      // MORTALITY 
      x_axis_mortality.push(curDate);
      y_axis_mortality.push(val.mortality); 

      // DEATH
      x_axis_new_deaths.push(curDate);
      // We sometimes have negative values for deaths (I guess it's some corrections?)
      // for now, we don't take them into account
      y_axis_new_deaths.push(val.new_deaths>0?val.new_deaths:0);
       
   });
   

   return {
      'name'                  :  data.name,
      'pop'                   :  data.pop, 
      'last_mortality_rate'   :  data.last_mortality_rate,
      'total_death'           :  data.total_death,
      'total_case'            :  data.total_case,
      'last_day_data'         :  data.last_day_data,
      'last_day_number_data'  :  data.last_day_number_data,
      'new_cases'             :  [x_axis_new_cases,y_axis_new_cases],
      'tests'                 :  [x_axis_tests,y_axis_tests],
      'growth'                :  [x_axis_growth,y_axis_growth],
      'MIT_model'             :  [x_axis_new_cases_model_trend,y_axis_new_cases_model_trend],
      'death_growth'          :  [x_axis_deaths_growth,y_axis_deaths_growth],
      'growth_decay'          :  [x_axis_growth_decay,y_axis_growth_decay],
      'mortality'             :  [x_axis_mortality,y_axis_mortality],
      'deaths'                :  [x_axis_new_deaths,y_axis_new_deaths],
   }
}


/**
 * Display all data
 */
function new_display_data(data,state,county) {
   var all_data = {}, all_graph_data, type = "state"; 
   var data_for_summary; // Bases on new cases trendss
    
   // Get data based on state and/or county
   if(county !== undefined && $.trim(county) !== ''  && $.trim(county) !== "ALL") {
      all_data = getInitData(data,county);  
      type = "county";
   } else {
      all_data = getInitData(data);  
   } 
     
   // Prepare data 
   all_graph_data = prepareData(all_data);
   
   // Graph for New Cases
   // Warning: here we get the date for the summary
   // this way we don't have to compute the same stuff twice
   data_for_summary = compute_new_graph_data(
      {
         x:  all_graph_data.new_cases[0],
         y:  all_graph_data.new_cases[1],
         title:  "New Cases per Day",
         name: all_data.name,
         graph_div: 'newcases_graph',
         graph_details_div: 'newcases_graph_details',
         models: {    'MIT':  all_graph_data.MIT_model  },
         total :              all_graph_data['total_case'],     
         last_day_data:       all_graph_data['last_day_data'],         
         last_day_data_raw :  all_graph_data['last_day_number_data']     
      }
   ); 

   // And we complete with other info useful for the summary
   data_for_summary.name                  = all_graph_data['name'];
   data_for_summary.pop                   = all_graph_data['pop'];
   data_for_summary.last_mortality_rate   = all_graph_data['last_mortality_rate'];
   data_for_summary.total_death           = all_graph_data['total_death'];
   data_for_summary.total_case            = all_graph_data['total_case'];
   data_for_summary.last_day_data         = all_graph_data['last_day_data'];
   data_for_summary.last_day_number_data  = all_graph_data['last_day_number_data'];
      
   
   // Graph for Growth
   compute_new_graph_data({
      x:all_graph_data.growth[0],
      y:all_graph_data.growth[1],
      title:"New Cases Growth", 
      name:all_data.name, 
      graph_div:'growth_graph', 
      graph_details_div:'growth_graph_details',
      option: {  type: "bars", info: false}      // Specific Options
   });
   
   // Graph for Tests
   if(type !== "county") {
      compute_new_graph_data({
         x:all_graph_data.tests[0],
         y:all_graph_data.tests[1],
         title:"Tests per Day", 
         name:all_data.name, 
         graph_div:'tests_graph', 
         graph_details_div:'tests_graph_details',
         option: {  type: "bars", info: false}  
      });
   }  else {
      // We reset the DOM elements
      $('#tests_graph,#tests_graph_details').html('');
   }
 
   
   // Graph for Death Growth
   compute_new_graph_data({
      x:all_graph_data.death_growth[0],
      y: all_graph_data.death_growth[1],
      title:"Death Growth", 
      name:all_data.name, 
      graph_div:'death_growth_graph', 
      graph_details_div:'death_growth_graph_details' 
   });

   // Graph for Growth Decay
   compute_new_graph_data({
      x: all_graph_data.growth_decay[0],
      y: all_graph_data.growth_decay[1],
      title:"Growth Decay", 
      name:all_data.name, 
      graph_div:'growth_decay_graph', 
      graph_details_div:'growth_decay_graph_details',
      option:{ type: 'line_not_to_zero', info: false}      // Specific Options
   });
    
   
   // Graph for Mortality
   compute_new_graph_data({
      x:all_graph_data.mortality[0],
      y:all_graph_data.mortality[1],
      title:"% of Mortality among positive tested people", 
      name:all_data.name, 
      graph_div:'mortality_graph', 
      graph_details_div:'mortality_details',
      option:{ type: 'line_not_to_zero'}      // Specific Options
   });  

   // Graph for Deaths
   compute_new_graph_data({
      x:all_graph_data.deaths[0],
      y:all_graph_data.deaths[1],
      title:"Deaths", 
      name:all_data.name, 
      graph_div:'deaths_graph', 
      graph_details_div:'deaths_graph_details' 
   });  
     
   // And Now we can fill the summary
   createSummary(data_for_summary);

 }


/**
 * Compute New Graph Data as well as the data for the summary on top of the page
*
 {
         x:  all_graph_data.new_cases[0],
         y:  all_graph_data.new_cases[1],
         title:  "New Cases per Day",
         name: all_data.name,
         graph_div: 'newcases_graph'
         graph_details_div: 'newcases_graph_details',
         modes: [all_graph_data.MIT_model]
 }
 *
 */

function compute_new_graph_data(data) {
  
   var add_info = "";
   var x_trend_14, y_trend_14;
   var x_trend_7, y_trend_7;
   var x_poly, y_poly; // Poly regression (curve)
   
   // MIT Model
   var x_model  = []; 
   var y_model = []; 
   var max_day = 30; // When we don't have a model, we compute the graphs until last_day + 'max_day' days
   var total_x = []; // If we have a model, it's the model X, if not it the last day of the current data set (x) + max_day
   var reg, reg_7, reg_14;
   var last_day = null;
   var toDraw = {};


   // Option is... optionnal!
   if(data.option == undefined ) {
      data.option = {
         type: 'bars',
         info: true
      }
   }
    
   if(data.models !== undefined) {
      if(data.models['MIT'] !== undefined) {
            // MIT Model Data for projection for 2nd data set
            $.each(data.models['MIT'][0], function(i,val) {
               x_model.push(new Date(val));
            });

            total_x = x_model;
            y_model = data.models['MIT'][1]; 
            toDraw.x2 = x_model;
            toDraw.y2 = y_model;
            toDraw.title2 = "MIT Trend Model"; 
      }
   }
   
  
   // If we don't have a model, we need to compute the total_x
   if(total_x.length==0) {

      // Copy the Array of X
      $.each(data.x, function(i,x) {
         total_x.push(x);
      }) 
      
      // Fill the last days until max_days
      last_day = new Date(total_x[total_x.length-1]);
      for(var i=1;i<=max_day; i++) {
         last_day = new Date(last_day);
         last_day.setDate(last_day.getDate() + 1); 
         total_x.push(last_day);
      }
   } 
 
   // 7-Day Trend  (linear regression) 
   reg_7 = compute_regression_with_dates(data.x,data.y,7,new Date(total_x[total_x.length-1]),'linear');
   x_trend_7   = reg_7['x'];
   y_trend_7   = reg_7['y']; 
   if(reg_7['reach']!=-1 && data.option.info) {
      add_info += "<p>Based on the 7-Day Trend, " + data.name + "'s " + data.title + " could reach 0 around <b>" + reg_7['reach'] +"</b>.</p>";
   }
   toDraw.x4 = x_trend_7;
   toDraw.y4 = y_trend_7;
   toDraw.title4 = "7-Day Trend";  

   // 14-Day Trend (linear regression)
   reg_14 = compute_regression_with_dates(data.x,data.y,14,new Date(total_x[total_x.length-1]),'linear');
   x_trend_14 = reg_14['x'];
   y_trend_14 = reg_14['y'];  
   if(reg_14['reach']!=-1 && data.option.info) {
      add_info += "<p>Based on the 14-Day Trend, " + data.name + "'s " + data.title + " could reach 0 around <b>" + reg_14['reach'] +"</b>.</p>";
   }
   toDraw.x3 = x_trend_14;
   toDraw.y3 = y_trend_14;
   toDraw.title3  = "14-Day Trend";

   // 2th degree polynomial regression from the beginning (new curve)
   //console.log("POLY FOR ", title);
   reg = compute_Xdeg_poly_regression_with_dates(data.x,data.y,-1,new Date(total_x[total_x.length-1]),2);
   x_poly = reg['x'];
   y_poly = reg['y'];
   toDraw.x5 = x_poly;
   toDraw.y5 = y_poly;
   toDraw.title5  = "Curve";    
    
   // Other Info to draw
   toDraw.title  = data.name + ", " + data.title;
   toDraw.add_info = add_info;
   toDraw.el = data.graph_div;
   toDraw.el_title =  data.graph_details_div;
   
   // Main stuff 
   toDraw.title1 = data.title;
   toDraw.x1 = data.x;
   toDraw.y1 = data.y;
    
   // Draw the Graph
   draw_graph(toDraw,data.option);  

   // We return the info used to fill the top Summary based on the info we get from New Cases 
   if(data.title == "New Cases per Day" ) {

      // We need to compute the total cases at reg_7['reach'] & reg_14['reach'] (if possible)
      // for the summary
      
      // We reach 0 with reg_7
      if(reg_7['reach']!=-1) {
       
         var start_day = 7;
         var equ_res   = reg_7.equa[0]*start_day + reg_7.equa[1];
         var new_total = data.total;

         while(equ_res>0) {
            equ_res   = reg_7.equa[0]*start_day + reg_7.equa[1];
            new_total += equ_res>0?equ_res:0;
            start_day++;
           
         }
         
         reg_7["total_at_end"] = new_total;


     
      }


      // We reach 0 with reg_7
      if(reg_14['reach']!=-1) {
       
         var start_day = 14;
         var equ_res   = reg_14.equa[0]*start_day + reg_14.equa[1];
         var new_total = data.total;

         while(equ_res>0) {
            equ_res   = reg_14.equa[0]*start_day + reg_14.equa[1];
            new_total += equ_res>0?equ_res:0;
            start_day++;
           
         }
         
         reg_14["total_at_end"] = new_total;
     
      }

      return {
         trend_7: reg_7,
         trend_14: reg_14,
         trend : reg
      };
   }

}


 

/**
 * Draw standard graph with 7,14 trends and eventual
 * @param {*} data 
 */
function draw_graph(data,option ) {
   var maxDate1, minDate1, maxDate2, minDate2, min, max;
   var dataSet1,dataSet2,dataSet3,dataSet4,dataSet5;
 
   // Get Range for X AXIS
   maxDate1 = new Date(Math.max.apply(null,data.x1));
   minDate1 = new Date(Math.min.apply(null,data.x1));
   
   if(data.x2 !== undefined) {
      // We have models
      maxDate2=new Date(Math.max.apply(null,data.x2));
      minDate2=new Date(Math.min.apply(null,data.x2)); 
      max = (maxDate1<maxDate2)?maxDate2:maxDate1;
      min = (minDate1<minDate2)?minDate1:minDate2;
   } else {
      // We don't have models
      // We take max in data.x3 (one of the Trend)
      max = new Date(Math.max.apply(null,data.x3));
      min = new Date(Math.min.apply(null,data.x1));
   }
    
   // MAX for Y AXIS
   var maxY = 1.25*( Math.max.apply(null,data.y1));

   // The dashed line will appear at dateSet max date + 1
   var curDay = maxDate1;
   curDay.setDate(curDay.getDate() + 1); 
 
   // Org Data
   dataSet1 = {
      x: data.x1,
      y: data.y1,
      name: data.title1,
      type: "bar",
      marker: {  color: 'rgb(31,119,180)'    }
   };
 

   // Typically for Growth Decay
   if(option.type !== "bars") {
      dataSet1.type = "scatter";
      dataSet1.mode =  'lines';
      dataSet1.line =  {shape: 'spline'};
   }

   // MIT Prevision
   if(data.x2 !== undefined) {
      dataSet2 = {
         x: data.x2,
         y: data.y2,
         name: data.title2,
         type: "bar",
         xaxis: 'x2',
         marker: {  color: 'rgb(158,202,225)'  }
      };  
   }

   // Linear Trend 1
   dataSet3 = {
         x: data.x3,
         y: data.y3,
         name: data.title3,
         type: "line",
         mode: 'lines',
         xaxis: 'x2',
         line: {
            color: 'rgba(255,127,14,.8)' 
         }
   };  

   // Linear Trend 2
   dataSet4 = {
         x: data.x4,
         y: data.y4,
         name: data.title4,
         type: "line", 
         mode: 'lines',
         xaxis: 'x2',
         line: {
            color: 'rgba(44,160,44,.8)',
         }
   };  


   // Curve
   dataSet5 = {
      x: data.x5,
      y: data.y5,
      name: data.title5,
      type: "line",
      xaxis: 'x2',
      line: {
         color: 'rgba(169,25,147,.8)',
      }
   };  

   var layout = { 
      xaxis: {   range: [min,max]   },
      xaxis2: {
        overlaying: 'x',
        range: [min,max]
      },
      yaxis: { range:[0,maxY] }, 
      margin: {"t": 20, "b": 80, "l": 50, "r": 10},
      showlegend: true,
      legend: { orientation: "h" },
      // Dashed grey line
      shapes : [{ 
         type: 'line',
         x0: curDay,
         y0: 0,
         x1: curDay,
         yref: 'paper',
         y1: 1,
         line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot'
         }
      }]
   };

   // Specific option for y values < 0
   // Typically for Growth Decay 
   if(option.type !== "bar") {
      layout.yaxis.range = [Math.min.apply(null,data.y1), Math.max.apply(null,data.y1)];
   }

   if(data.x2 !== undefined) {
      // With Model
      all_set = [dataSet1,dataSet2,dataSet3,dataSet4,dataSet5];
   } else { 
      // Without Model
      all_set =  [dataSet1, dataSet3,dataSet4,dataSet5];
   }

   Plotly.newPlot(data.el, all_set, layout);
   
   // Add more info 
   $('#'+data.el_title).html("<h3>"+data.title +"</h3>" + data.add_info);

}