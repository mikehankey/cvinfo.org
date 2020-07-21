// Return the mean of an array
function mean(ar) {
   if( ar.length>0) {
      var total = 0;
      for(var i = 0; i < ar.length; i++) {
         total += ar[i];
      }
      return  total / ar.length;
   } else {
      return 0;
   }
}

// Get a sub array from an array
var last = function(array, n) {
   return array.slice(Math.max(array.length-n,0));
}

// Compute the AVG Fatality Rate based on avg_deaths & avg_cases
function compute_avg_fatality_rate(avg_deaths, avg_cases) {

   var fatal, all_x=[], all_y=[], first_zero_past = false;

   $.each(avg_cases.y,function(i,v) {
      
      if(avg_deaths.y[i]!=0 && avg_cases.y[i]!=0 &&  !first_zero_past) {
         first_zero_past = !first_zero_past;
      } else if(first_zero_past) {
         all_x.push(avg_cases.x[i]);

         if(avg_deaths.y[i]!==0) {
            fatal =  avg_cases.y[i] / avg_deaths.y[i];
         } else {
            fatal = 0;
         } 
         all_y.push(fatal)
      }
 
   });
  
   return {'x': all_x, 'y': all_y};
    
}


// Compute the Daily Fatality Rate based on total_deaths & total_cases
function compute_fatality_rate(deaths,cases) { 
   var all_x = [], all_y = [];

   $.each(deaths['x'], function(i,v) {
     
      all_x.push(deaths['x'][i]);
   
      if(cases['y'][i]>0) {
         all_y.push(deaths['y'][i]/cases['y'][i])
      } else {
         all_y.push(0);
      }

   })
 

   return {'x': all_x, 'y': all_y }
}

 


// Return the X day averages values (X and Y)
// ex: get_X_day_average(7,data,'cases') => the 7 day average data
function get_X_day_average(max_day,data,_type) {
   var tempValForAvg = [], tempValFormax_day = [], all_x_avg = [], all_y_avg = [];
 
   $.each(data,function(d,v) {
  
      var date = Object.keys(v)[0];
      tempValForAvg.push(v[date][_type]); 
 
      if(tempValForAvg.length < max_day ) {
         tempValFormax_day = tempValForAvg; 
      } else {
         tempValFormax_day = last(tempValForAvg,max_day)
      }

      all_x_avg.push(date);
      if(mean(tempValFormax_day)>=0) {
         all_y_avg.push(mean(tempValFormax_day))
      } else {
         all_y_avg.push(0)
      }
     
   }) 

   return {'x': all_x_avg, 'y': all_y_avg }
}

// Same tham above but with a set of x and y
function get_X_day_average_2sets(max_day, all) {
  
   var tempValForAvg = [], tempValFormax_day = [], all_x_avg = [], all_y_avg = [];
   $.each(all['y'],function(i,v) {

      tempValForAvg.push(all['y'][i]); 

      if(tempValForAvg.length < max_day ) {
         tempValFormax_day = tempValForAvg; 
      } else {
         tempValFormax_day = last(tempValForAvg,max_day)
      }

      all_x_avg.push(all['x'][i]);
      if(mean(tempValFormax_day)>=0) {
         all_y_avg.push(mean(tempValFormax_day))
      } else {
         all_y_avg.push(0)
      }

   });

   return {'x': all_x_avg, 'y': all_y_avg }
 
}



// Return all the keys / val of a set of data for a given type
function get_split_data(data, _type) {
   var all_x = [], all_y= [];
   $.each(data,function(i,v) {
      var x = Object.keys(v)[0]
      all_x.push(new Date(x));
      if(v[x][_type]<0) {
         v[x][_type] = 0;
      }
      all_y.push(v[x][_type])
   });
   return {'x': all_x, 'y': all_y }
}

// Return all they dates / val of a set of data for proj data
// WARNING: we return ym, yl, yu (lower, mean, upper)
function get_split_data_proj(data, _type, nonzero) {
   var all_x = [], all_ym= [], all_yu= [], all_yl=[];
 
   $.each(data,function(i,v) {
      var date = Object.keys(v)[0]

      if((nonzero && v[date][_type+'m']>0 && v[date][_type+'u']>0 && v[date][_type+'l']>0) || !nonzero ) {
         all_x.push(new Date(date));
         all_ym.push(v[date][_type+'m'])
         all_yu.push(v[date][_type+'u'])
         all_yl.push(v[date][_type+'l'])
      }
   });
 
   return {'x': all_x, 'ym': all_ym, 'yu': all_yu, 'yl': all_yl }
}


/**
 * get_fatality_rate_from_2_sets
 */
function get_fatality_rate_from_2_sets(cases,deaths) {
   var all_x = [], all_ym= [], all_yu= [], all_yl=[];

   // In the Proj data we have the daily new data
   // but for the fatality rate we need to the TOTAL DATA...
   var prev_data_l = 0, prev_data_m = 0, prev_data_u = 0;

   // We reverse all the arrays
   $.each(cases,function(i,v){cases[i].reverse()})
   $.each(deaths,function(i,v){deaths[i].reverse()})
   
   new_cases = cases;
   new_deaths = deaths;

   // We add the daily data to have a "total"
   $.each(new_cases['x'], function(i,v) {
      y = prev_data_l;
      m = prev_data_m;
      u = prev_data_u;
      prev_data_l =  new_cases['yl'][i];
      prev_data_m =  new_cases['ym'][i];
      prev_data_u =  new_cases['yu'][i];
      new_cases['yl'][i] = y;
      new_cases['ym'][i] = m;
      new_cases['yu'][i] = u;
   })

   prev_data_l = 0, prev_data_m = 0, prev_data_u = 0;
 
   $.each(new_deaths['x'], function(i,v) {
      y = prev_data_l;
      m = prev_data_m;
      u = prev_data_u;
      prev_data_l =  new_deaths['yl'][i];
      prev_data_m =  new_deaths['ym'][i];
      prev_data_u =  new_deaths['yu'][i];
      new_deaths['yl'][i] = y;
      new_deaths['ym'][i] = m;
      new_deaths['yu'][i] = u;
   })
 
 
   $.each(new_cases['x'],function(i,v) {
      all_x.push(new_cases['x'][i]);

      if(new_deaths['yl'][i]>0) {
         all_yl.push(new_deaths['yl'][i]/new_cases['yl'][i])
      } else {
         all_yl.push(0);
      }
      if(new_deaths['yu'][i]>0) {
         all_yu.push(new_deaths['yl'][i]/new_cases['yu'][i])
      } else {
         all_yu.push(0);
      }
      if(new_deaths['ym'][i]>0) {
         all_ym.push(new_deaths['yl'][i]/new_cases['ym'][i])
      } else {
         all_ym.push(0);
      }


   });


   console.log({'x': all_x, 'ym': all_ym, 'yu': all_yu, 'yl': all_yl })

   return {'x': all_x, 'ym': all_ym, 'yu': all_yu, 'yl': all_yl }
}


/**
 * Clean All DomEl
 */
function cleanAll() {
   $(['newcases','deaths','cases','fatal']).each(function(i,v) {
      $(['_graph_details','_graph_options','_graph']).each(function(x,vv) {
         $('#'+v+'vv').html('');
      });
   });
}

 


/**
 * 
 * Input is a JSON:
 *    data 
 *    state_code 
 *    state_name 
 *    county 
 */
function prepare_data(all_data) {
    

   // We get the tests values to add the possibility to add the tests on every graphs (2nd y-axis)
   var tests = get_X_day_average(7,all_data['data']['stats'],'test');

   // For New Cases a day, 
   // we need to the 7  & 14 days average
   // as well as  Normalize data (x,y)
   var cases = {
      'domGraph'  : 'newcases_graph',
      'domTitle'  : 'newcases_graph_details',
      'domOptions': 'newcases_graph_options',
      'title'     : 'Daily Cases',
      '7d_avg'    : get_X_day_average(7, all_data['data']['stats'],'cases'),
      'norm'      : get_split_data(all_data['data']['stats'],'cases'),
      'tests'     : tests
   };

   var deaths = {
      'domGraph'  : 'deaths_graph',
      'domTitle'  : 'deaths_graph_details',
      'domOptions': 'deaths_graph_options',
      'title'     : 'Daily Deaths',
      '7d_avg'    : get_X_day_average(7, all_data['data']['stats'],'deaths'),
      'norm'      : get_split_data(all_data['data']['stats'],'deaths'),
      'tests'     : tests 
   }

 
 
   var fatality_rate = {
      'domGraph'  : 'fatal_graph',
      'domTitle'  : 'fatal_graph_details',
      'domOptions': 'fatal_graph_options',
      'title'     : 'Average Fatality Rate',
      'norm'      : compute_fatality_rate(get_split_data(all_data['data']['stats'],'total_d'),get_split_data(all_data['data']['stats'],'total_c'))
    };

   // 7-d avg 
   fatality_rate['7d_avg'] =  get_X_day_average_2sets(7,fatality_rate['norm']); 
 

   // Do we have projected data?
   if( all_data['data']['proj'] !== undefined) { 
      cases['proj'] = []
      cases['proj']['estimation']         = get_split_data_proj(all_data['data']['proj']['estimation'],'c',false); // We use 'c' for case for smaller json files
      cases['proj']['masks']              = get_split_data_proj(all_data['data']['proj']['masks'],'c',true);
      cases['proj']['easing']             = get_split_data_proj(all_data['data']['proj']['easing'],'c',true);

      deaths['proj'] = []
      deaths['proj']['estimation']         = get_split_data_proj(all_data['data']['proj']['estimation'],'d',false); // We use 'd' for deaths for smaller json files
      deaths['proj']['masks']              = get_split_data_proj(all_data['data']['proj']['masks'],'d',true);
      deaths['proj']['easing']             = get_split_data_proj(all_data['data']['proj']['easing'],'d',true);
 
      /*
      fatality_rate['proj'] = []
      fatality_rate['proj']['estimation']  =  get_fatality_rate_from_2_sets(cases['proj']['estimation'],deaths['proj']['estimation']) 
      fatality_rate['proj']['masks']       =  get_fatality_rate_from_2_sets(cases['proj']['masks'],deaths['proj']['masks']) 
      fatality_rate['proj']['easing']      =  get_fatality_rate_from_2_sets(cases['proj']['easing'],deaths['proj']['easing']) 
      */
      
   }

 
 
   // Default options
   var options = { 
      uncertainty : false,  
      easing      : true,  
      estimation  : true, 
      masks       : true,  
      norm        : true, 
      sevend_avg  : true,
      tests       : false
   }

   var name = all_data['state_name'];

   cleanAll();
  
   // We Draw the Graph1
   if(all_data['county'] !== 0 && all_data['county'] !== "0"  ) {
      name = all_data['county'] +', '+all_data['state_code'];
   }
   
   // It's a state
   draw_graph(name,cases,'cases',options);
   draw_graph(name,deaths,'deaths',options);
   draw_graph_sing(name,fatality_rate,'fatality_rate',options);

   
}    

// We compute the 14 & 7-Day Trend lines
// cases['7d_trend']  = compute_regression_with_dates(cases['norm']['x'],cases['norm']['y'],7,new Date(cases['norm']['x'][cases['norm']['x']-1]),'linear');
// cases['14d_trend'] = compute_regression_with_dates(cases['norm']['x'],cases['norm']['y'],14,new Date(cases['norm']['x'][cases['norm']['x']-1]),'linear');