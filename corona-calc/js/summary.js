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
   trend_data.total_real_cases  =  (trend_data.total_case * phantom) + trend_data.total_case;
   trend_data.total_real_deaths =  (trend_data.total_real_cases * data.last_mortality_rate/100) + trend_data.total_death;
   trend_data.new_pop           =  trend_data.total_pop - trend_data.total_real_deaths;

   // So what % of the population is infected?
   trend_data.cur_perc_infected = (trend_data.total_real_cases/trend_data.new_pop)*100;

   day_counter++;

   while(trend_data.cur_perc_infected <herd_immunity_treshold) { 
      cur_new_cases = data.equa[0]*day_counter + data.equa[1];

      trend_data.total_case         = trend_data.total_case  + cur_new_cases;
      trend_data.total_real_cases   =  (trend_data.total_case * phantom) + trend_data.total_case;
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
function get_herd_immunity_info(data, which) {

   // Herd Immunitiy Treshold
   var herd_immunity_treshold = 60; // in %
   var phantom = 1/4;
     
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


// Create Main Top Sentence and compute herd immunity if necessary
function create_main_top_sentence(data) {
   var top_sentence = ""; 
   var herd_immunity_info ;
   
   console.log(data);
  
   if(data.trend_7['reach']!=-1 && data.trend_14['reach']!=-1) {
       // We reach 0 cases at one point 
      top_sentence = "Based on current data trends,<br><span class='good_t'>" +  data.name;

      if (data.trend_7['reach_raw_d'] == data.trend_14['reach_raw_d']) {
         // They will reach 0 on the same day
         if( data.trend_14['reach_raw_d'] < new Date()) {
            top_sentence += " has reached zero cases per day or is very close to doing so.";
         } else {
            top_sentence += " could have zero cases <span class='wn'>on " + data.trend_14['reach']  + "</span>.";
         } 

      } else {
         // Both will reach 0, but not on the same day
         top_sentence += " could have zero cases "; 
         if( data.trend_14.reach_raw_d < data.trend_7.reach_raw_d ) { 
            top_sentence +=  "somewhere between <span class='wn'>" +  data.trend_14['reach'] + " and " + data.trend_7['reach'] + "</span>.";
         } else if(  data.trend_14.reach_raw_d > data.trend_7.reach_raw_d) {
            top_sentence +=  "somewhere between <span class='wn'>" +  data.trend_7['reach'] + " and " + data.trend_14['reach'] + "</span>.";
         } else { 
            top_sentence +=  "<span class='wn'>around "  + data.trend_7['reach']  + " </span>";
         }
      }
   } else {
     
      if(data.trend_7['reach']==-1 && data.trend_14['reach']!=-1  ) { 
         
         // We need to compute the Herd Immunity for 7 day trend only
         herd_immunity_info  = get_herd_immunity_info(data,7);
         top_sentence = "Based on the 7-day trend,<br>" +  data.name;
         top_sentence += " could reach <span class='ugly_t'>herd immunity on <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date) + "</span></span>";
         top_sentence += "<br>but based on the 14-day trend,<br>";
         top_sentence += " it could have <span class='good_t'>zero cases by <span class='wn'>" + data.trend_14['reach']  + "</span>.";

      } else if(data.trend_7['reach']!=-1 && data.trend_14['reach']==-1) {

         // We need to compute the Herd Immunity for 14 day trend only
         herd_immunity_info  = get_herd_immunity_info(data,14);
         top_sentence = "Based on the 7-day trend,<br>" +  data.name;
         top_sentence += " could reach <span class='ugly_t'>herd immunity on <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span></span>";
         top_sentence += "<br>but based on the 7-day trend,<br>";
         top_sentence += " it could have <span class='good_t'>zero cases by <span class='wn'>" + data.trend_7['reach']  + "</span>.";

      } else { 

         // We need to compute the Herd Immunity for both trends
         herd_immunity_info  = get_herd_immunity_info(data,-1);
         
         if(herd_immunity_info.trend_7.herd_immunity_date == herd_immunity_info.trend_14.herd_immunity_date) {
            top_sentence = "Based on the latest trends,<br>" +  data.name;
            top_sentence += " could reach <span class='ugly_t'>herd immunity around"
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span></span>.";
         } else if( herd_immunity_info.trend_7.herd_immunity_date < herd_immunity_info.trend_14.herd_immunity_date ) {
            top_sentence = "Based on the latest trends,<br>" +  data.name;
            top_sentence += " could reach <span class='ugly_t'>herd immunity between"
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date) + "</span> and ";
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span>";
            top_sentence += "</span>.";
         } else {
            top_sentence = "Based on the latest trends,<br>" +  data.name;
            top_sentence += " could reach <span class='ugly_t'>herd immunity between"
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span> and ";
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date) + "</span>";
            top_sentence += "</span>.";
          }

 
         

      }
       

   }

   return top_sentence;
} 

function createSummary(data) {
   
  
   var minT, maxT;
   var data_for_array = {};
   var max_days_to_compute = 1200;
   var how_many_day_from_now; // max_days_to_compute - last day for which we have data

   $('#top_summary').html("<div id='sum_main'>"+create_main_top_sentence(data)+"</div>"); 
  
   // We compute the cur data
   data_for_array.cur_death         = data.total_death;
   data_for_array.cur_case          = data.total_case;
   data_for_array.cur_non_tracked   = data.total_case * 4;
   data_for_array.cur_non_infected  = data.pop - data.total_case - data.total_death;
 

   // 14 DAY TREND DATA
   // DEATH IN 1200 days following 14-day trend

   // What is the last day taken present in trend_7[x] compared to the current date?
   /*
   console.log("LAST  DAY DATA ", data.last_day_number_data);
   console.log("CORRESPOND TO ", data.last_day_data);

   console.log("HOW MANY DAYS TO 1200 ", how_many_day_from_now);
   console.log("HOW MANY CASES IN 1200 BASED ON 7_D TREND");
   console.log(data.trend_7.equa[0]*how_many_day_from_now+data.trend_7.equa[1]);
   
   console.log("HOW MANY CASES IN 1200 BASED ON 14_D TREND");
   console.log(data.trend_14.equa[0]*how_many_day_from_now+data.trend_14.equa[1]);
   */
  
    
}