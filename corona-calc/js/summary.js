// Create Main Top Sentece
function create_main_top_sentence(data) {
   var top_sentence = "";
   var day_range = [];

  
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
            top_sentence +=  "somewhere between <span class='wn'>" +  data.trend_14['reach'] + " and " + data.trend_7['reach'] + ".</span>";
         } else if(  data.trend_14.reach_raw_d > data.trend_7.reach_raw_d) {
            top_sentence +=  "somewhere between <span class='wn'>" +  data.trend_7['reach'] + " and " + data.trend_14['reach'] + ".</span>";
         } else { 
            top_sentence +=  "<span class='wn'>around "  + data.trend_7['reach']  + " </span>";
         }
      }
   } else if(data.trend_7['reach']==-1 && data.trend_14['reach']==-1) {
      // HERD IMMUNITY!!!
      alert('HERD IMMUNITY');
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
   console.log("LAST  DAY DATA ", data.last_day_number_data);
   console.log("CORRESPOND TO ", data.last_day_data);

   console.log("HOW MANY DAYS TO 1200 ", how_many_day_from_now);
   console.log("HOW MANY CASES IN 1200 BASED ON 7_D TREND");
   console.log(data.trend_7.equa[0]*how_many_day_from_now+data.trend_7.equa[1]);
   
   console.log("HOW MANY CASES IN 1200 BASED ON 14_D TREND");
   console.log(data.trend_14.equa[0]*how_many_day_from_now+data.trend_14.equa[1]);

  
    
}