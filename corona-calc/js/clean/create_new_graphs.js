
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
         toReturn.stats[i]['day']  = v['day'].replace(/-/g, '');
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
   var data_for_summary = {}; // Bases on new cases trends
    
   // Get data based on state and/or county
   if(county !== undefined && $.trim(county)!== ''  && $.trim(county) !== "ALL") {
      all_data = getInitData(data,county);  
      type = "county"; 
   } else {
      all_data = getInitData(data);   
   } 
 
   // Prepare data 
   all_graph_data = prepareData(all_data); 
 
   // Put last mortality rate on the form
   var init_mortality_rate  =  all_graph_data.last_mortality_rate;
   $('#init_mortality').val(init_mortality_rate);

   // If we don't have a mortality in the form we put it back in
   if($('#calc_mortality').val()=='' || $('#calc_mortality').val()==0) {
      $('#calc_mortality').val(init_mortality_rate);
   } else {
      // We use the one in the form 
      all_graph_data.last_mortality_rate = parseFloat($('#calc_mortality').val());
   }
 
   // Get Data for computation
   // based on form on the page
   var phantom = 1/parseFloat($('#calc_phantom').val());
   var herd_thresh =  parseFloat($('#herd_thresh').val());
  
 
   // Graph for New Cases
   // Warning: here we get the date for the summary
   // this way we don't have to compute the same stuff twice
   data_for_summary = compute_new_graph_data( {  
         pop: all_graph_data['pop'],
         x:  all_graph_data.new_cases[0],
         y:  all_graph_data.new_cases[1],
         title:  "New Cases per Day",
         name: all_data.name,
         graph_div: 'newcases_graph',
         graph_details_div: 'newcases_graph_details',
         models: {    'MIT':  all_graph_data.MIT_model  },
         total :              all_graph_data['total_case'],     
         last_day_data:       all_graph_data['last_day_data'],         
         last_day_data_raw :  all_graph_data['last_day_number_data'],
         phantom:      phantom,
         herd_thresh: herd_thresh
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
   createSummary(data_for_summary,phantom, herd_thresh);

 }





 

/**
* Compute New Graph Data as well as the data for the summary on top of the page
**/
function compute_new_graph_data(input_data) {
 
   var add_info = "";
   var x_trend_14, y_trend_14;
   var x_trend_7, y_trend_7;
   var x_poly, y_poly; // Poly regression (curve)
   
   // MIT Model
   var x_model  = []; 
   var y_model = []; 
   var max_day = 30; // When we don't have a model, we compute the graphs until last_day + 'max_day' days
   var total_x = []; // If we have a model, it's the model X, if not it the last day of the current input_data set (x) + max_day
   var reg = {}, reg_7 = {}, reg_14 = {};
   var last_day = null;
   var toDraw = {};
   var start_day = 0, equ_res= [], new_total = 0;
   var total_real_infected = 0; // For herd
   var total_real_perc = 0;     // For herd
   var day = null;

   var phantom = input_data.phantom;
   var herd_thresh = input_data.herd_thresh;
   var toReturn = {};

 

   // Option is... optionnal!
   if(input_data.option == undefined ) {
      input_data.option = {
         type: 'bars',
         info: true
      }
   }
    
   if(input_data.models !== undefined) {
      if(input_data.models['MIT'] !== undefined) {
            // MIT Model input_data for projection for 2nd input_data set
            $.each(input_data.models['MIT'][0], function(i,val) {
               x_model.push(new Date(val));
            });

            total_x = x_model;
            y_model = input_data.models['MIT'][1]; 
            toDraw.x2 = x_model;
            toDraw.y2 = y_model;
            toDraw.title2 = "MIT Trend Model"; 
      }
   }
   
  
   // If we don't have a model, we need to compute the total_x
   if(total_x.length==0) {

      // Copy the Array of X
      $.each(input_data.x, function(i,x) {
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
   reg_7 = compute_regression_with_dates(input_data.x,input_data.y,7,new Date(total_x[total_x.length-1]),'linear');
   x_trend_7   = reg_7['x'];
   y_trend_7   = reg_7['y']; 
   if(reg_7['reach']!=-1 && input_data.option.info) {
      add_info += "<p>Based on the 7-Day Trend, " + input_data.name + "'s " + input_data.title + " could reach 0 around <b>" + reg_7['reach'] +"</b>.</p>";
   }
   toDraw.x4 = x_trend_7;
   toDraw.y4 = y_trend_7;
   toDraw.title4 = "7-Day Trend";  

   // 14-Day Trend (linear regression)
   reg_14 = compute_regression_with_dates(input_data.x,input_data.y,14,new Date(total_x[total_x.length-1]),'linear');
   x_trend_14 = reg_14['x'];
   y_trend_14 = reg_14['y'];  
   if(reg_14['reach']!=-1 && input_data.option.info) {
      add_info += "<p>Based on the 14-Day Trend, " + input_data.name + "'s " + input_data.title + " could reach 0 around <b>" + reg_14['reach'] +"</b>.</p>";
   }
   toDraw.x3 = x_trend_14;
   toDraw.y3 = y_trend_14;
   toDraw.title3  = "14-Day Trend";

   // 2th degree polynomial regression from the beginning (new curve)
   //console.log("POLY FOR ", title);
   reg = compute_Xdeg_poly_regression_with_dates(input_data.x,input_data.y,-1,new Date(total_x[total_x.length-1]),2);
   x_poly = reg['x'];
   y_poly = reg['y'];
   toDraw.x5 = x_poly;
   toDraw.y5 = y_poly;
   toDraw.title5  = "Curve";    
    
   // Other Info to draw
   toDraw.title  = input_data.name + ", " + input_data.title;
   toDraw.add_info = add_info;
   toDraw.el = input_data.graph_div;
   toDraw.el_title =  input_data.graph_details_div;
   
   // Main stuff 
   toDraw.title1 = input_data.title;
   toDraw.x1 = input_data.x;
   toDraw.y1 = input_data.y;


    
   // Draw the Graph
   draw_graph(toDraw,input_data.option);  

   // We return the info used to fill the top Summary based on the info we get from New Cases 
   if(input_data.title == "New Cases per Day" ) {

      // We need to compute the total cases at reg_7['reach'] & reg_14['reach'] (if possible)
      // for the summary

      start_day = 7;
      equ_res   = reg_7.equa[0]*start_day + reg_7.equa[1];
      new_total = input_data.total;
      total_real_infected; // For herd
      total_real_perc;     // For herd
 
      // We reach 0 with reg_7
      if(reg_7['reach']!=-1) {
        
         // We stop at 0
         while(equ_res>0) {
            equ_res   = reg_7.equa[0]*start_day + reg_7.equa[1];
            new_total += equ_res>0?equ_res:0;
            start_day++;
         }
         
         reg_7["total_at_end"] = new_total;
 
      } else {
 
         // We compute herd immunity! 
         new_total += equ_res>0?equ_res:0;
         total_real_infected = new_total / phantom + new_total;
         total_real_perc  = 100*total_real_infected/input_data.pop;

         while(total_real_perc<=herd_thresh) {
            equ_res   = reg_7.equa[0]*start_day + reg_7.equa[1];
            new_total += equ_res>0?equ_res:0;
            total_real_infected = new_total / phantom + new_total;
            total_real_perc  = (100*total_real_infected)/input_data.pop;
            start_day++;
         } 

         // Compute herd_reach_date
         tmp_day = new Date(total_x[total_x.length-1]-7);
         tmp_day.setDate(tmp_day.getDate() + start_day); 
  
         reg_7["herd_reach_day"]    = start_day;
         reg_7["herd_reach_date"]   = new Date(tmp_day); 
         reg_7["total_at_end"]      = new_total;

      }


      start_day = 14;
      equ_res   = reg_14.equa[0]*start_day + reg_14.equa[1];
      new_total = input_data.total;

      // We reach 0 with reg_7
      if(reg_14['reach']!=-1) {
        
         while(equ_res>0) {
            equ_res   = reg_14.equa[0]*start_day + reg_14.equa[1];
            new_total += equ_res>0?equ_res:0;
            start_day++;
         }
         
         reg_14["total_at_end"] = new_total;
     
      } else {

         // We compute herd immunity!  
         total_case     = new_total;
         total_infected = total_case + (total_case / phantom);
         
         total_infected_perc  = (total_infected*100)/input_data.pop;
         total_case_per       =  (total_case*100)/input_data.pop;
 
         while((total_infected_perc+total_case_per) <= herd_thresh) {
            equ_res    = reg_14.equa[0]*start_day + reg_14.equa[1];
            total_case+= equ_res>0?equ_res:0;

            total_infected = total_case + (total_case / phantom);
            total_infected_perc  = (total_infected*100)/input_data.pop;
            total_case_per       = (total_case*100)/input_data.pop;
            start_day++;
         }
        
         reg_14["total_at_end"] = total_case;

         // We now compute the date at +start_day  
         day = new Date(total_x[total_x.length-1])
         day.setDate(day.getDate() - 14 + start_day );

         reg_14["herd_reach_date"] = day;
          
      }


      toReturn =  {
         trend_7: reg_7,
         trend_14: reg_14,
         trend : reg
      };
 
      return toReturn;
   }

}
