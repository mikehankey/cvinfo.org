 // Fill Row
 function fillPredictedOutComeRow(title,total,cur,trend1,trend2) {
   return '<tr><th>'+title+'</th>\
   <td>' + usFormat(cur) + '</td><td>' +   (cur*100/total).toFixed(2) + '%</td>';
   /*
   <td>' + usFormat(trend1) + '</td><td>' +    (trend1*100/total).toFixed(2) + '%</td>\
   <td >' + usFormat(trend2) + '</td><td>' +   (trend2*100/total).toFixed(2) + '%</td></tr>'
   */;
}

// Fill Entire Table
function fillPredictedOutcome(fr, sum_info, pop) {
   var tbody, total = pop;
   tbody =  fillPredictedOutComeRow("Deaths",total,parseInt(sum_info.deaths),parseInt(fr['14_day'].total_dead),parseInt(fr['7_day'].total_dead));
   tbody += fillPredictedOutComeRow("Confirmed Cases",total,parseInt(sum_info.cases),parseInt(fr['14_day'].total_cases),parseInt(fr['7_day'].total_cases));
   tbody += fillPredictedOutComeRow("Non-Tracked Infected",total,parseInt(sum_info.total_infected),parseInt(fr['14_day'].total_infected),parseInt(fr['7_day'].total_infected));
   tbody += fillPredictedOutComeRow("Not Infected",total,parseInt(sum_info.not_infected),parseInt(fr['14_day'].total_not_infected),parseInt(fr['7_day'].total_not_infected));
   $('#new_trends tbody').html(tbody);
} 


function createSummary(data) {
   
   var top_sentence = "";
   var minT, maxT;
   var data_for_array = {};
   var max_days_to_compute = 1200;
   var how_many_day_from_now; // max_days_to_compute - last day for which we have data
 
  
   // We reach 0 cases at one point (0 cases)
   if(data.trend_7['reach']!=-1 && data.trend_14['reach']==-1) {
      // Only 7 day
      top_sentence += "Based on the 7-Day trend " + data.name + " could reach 0 cases on <span class='wn'>" + dateFormatMIT(data.trend_7['reach']) + "</span>"  ;
   } else if(data.trend_14['reach']!=-1 && data.trend_7['reach']==-1 ) {
      // Only 14 day
      top_sentence += "Based on the 14-Day trend " + data.name + " could reach 0 cases on <span class='wn'>" + dateFormatMIT(data.trend_14['reach']) + "</span>"  ;
   } else if(data.trend_14['reach']!=-1 && data.trend_7['reach']!=-1 ) {

      // We compare the reach_raw_d (real dates)
      if(data.trend_14['reach_raw_d']<data.trend_7['reach_raw_d']) {
         minT = data.trend_14['reach_raw_d'];
         maxT = data.trend_7['reach_raw_d']
      } else {
         minT = data.trend_7['reach_raw_d']
         maxT = data.trend_14['reach_raw_d'];
      }
 
      top_sentence += "Based on the latest data trends " + data.name + " could reach 0 cases <span class='wn'>between " + dateFormatMITFromDate(minT) + " and "  + dateFormatMITFromDate(maxT) + "</span>.";
   }  

    
   // We compute the cur data
   data_for_array.cur_death         = data.total_death;
   data_for_array.cur_case          = data.total_case;
   data_for_array.cur_non_tracked   = data.total_case * 4;
   data_for_array.cur_non_infected  = data.pop - data.total_case - data.total_death;

   // We compute the future data (1200 days) for both trends
   how_many_day_from_now = max_days_to_compute-data.last_day_number_data;
   data_for_array.trend7_case       = data.trend_7.equa[0]*how_many_day_from_now+data.trend_7.equa[1];


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

   $('#top_summary').html("<div id='sum_main'>"+top_sentence+"</div>");
    
}