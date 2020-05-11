

// Compute HERD Immunity for a given set of data (linear regression)
// At constent mortality rate !
function compute_herd_immunity(data, day_counter, phantom, herd_immunity_treshold, first_day) {
   
   var cur_new_cases = data.equa[0]*day_counter + data.equa[1];
   var trend_data = {
      total_case        :  data.total_case + cur_new_cases,
      total_death       :  data.total_death + cur_new_cases*data.last_mortality_rate,
      total_pop         :  data.pop
   };

   // We compute the other data
   trend_data.total_real_cases  =  (trend_data.total_case / phantom) + trend_data.total_case;
   trend_data.total_real_deaths =  (trend_data.total_real_cases * data.last_mortality_rate/100) + trend_data.total_death;
   trend_data.new_pop           =  trend_data.total_pop - trend_data.total_real_deaths;

   // So what % of the population is infected?
   trend_data.cur_perc_infected = (trend_data.total_real_cases/trend_data.new_pop)*100;

   day_counter++;

   while(trend_data.cur_perc_infected <herd_immunity_treshold) { 
      cur_new_cases = data.equa[0]*day_counter + data.equa[1];

      trend_data.total_case         = trend_data.total_case  + cur_new_cases;
      trend_data.total_real_cases   =  (trend_data.total_case / phantom) + trend_data.total_case;
      trend_data.total_real_deaths  =  (trend_data.total_real_cases * data.last_mortality_rate/100) + trend_data.total_death;
      trend_data.new_pop            = trend_data.total_pop - trend_data.total_real_deaths;
      trend_data.cur_perc_infected  = (trend_data.total_real_cases/trend_data.new_pop)*100;
      
      day_counter++;
   }

   return {res: trend_data,  
           herd_immunity_days: day_counter, 
           herd_immunity_date: new Date(first_day.setDate(first_day.getDate() + day_counter))  };
}


// Compute DATA for Herd Immunity
function get_herd_immunity_info(data, which, phantom) {

   // Herd Immunitiy Treshold
   var herd_immunity_treshold = 60; // in %
   
   var first_day_7 = data.last_day_data; // The last day for which we have data
   var first_day_14 = data.last_day_data; // The last day for which we have data

   // For the trend_7 day 
   var data_7_trend_res; 
   var data_7_trend = {
      equa: data.trend_7.equa,
      pop: data.pop,
      total_case: data.total_case,
      total_death: data.total_death,
      last_mortality_rate: data.last_mortality_rate
   };

   // For the trend_14 day 
   var data_14_trend_res; 
   var data_14_trend = {
      equa: data.trend_14.equa,
      pop: data.pop,
      total_case: data.total_case,
      total_death: data.total_death,
      last_mortality_rate: data.last_mortality_rate
   }; 
 
   // 7 DAY TREND
   if(which == 7 || which == -1) { 
      data_7_trend.equa = data.trend_7['equa']; // Add the solution of the linear regression
      data_7_trend_res = compute_herd_immunity(data_7_trend, 7, phantom, herd_immunity_treshold, first_day_7);
   }  

   
   // 14 DAY TREND
   if(which == 14 || which == -1) { 
      data_14_trend.equa = data.trend_14['equa']; // Add the solution of the linear regression
      data_14_trend_res = compute_herd_immunity(data_14_trend, 14, phantom, herd_immunity_treshold, first_day_14);
   }

   return {
      'trend_7' : data_7_trend_res,
      'trend_14': data_14_trend_res
   }
 
    
}
