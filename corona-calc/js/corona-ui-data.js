/**
 * Fill PredictedOutCome summary
 */

 // Fill Row
function fillPredictedOutComeRow(title,total,cur,trend1,trend2) {
   return '<tr><th>'+title+'</th>\
   <td>' + usFormat(cur) + '</td><td>' +   (cur*100/total).toFixed(2) + '%</td>\
   <td>' + usFormat(trend1) + '</td><td>' +    (trend1*100/total).toFixed(2) + '%</td>\
   <td >' + usFormat(trend2) + '</td><td>' +   (trend2*100/total).toFixed(2) + '%</td></tr>';
}

// Fill Entire Table
function fillPredictedOutcome(fr,sum_info) {
   var tbody, total = parseInt($("#f_state_pop").val());
   tbody = fillPredictedOutComeRow("Deaths",total,parseInt(sum_info.deaths),parseInt(fr['14_day'].total_dead),parseInt(fr['7_day'].total_dead));
   tbody += fillPredictedOutComeRow("Confirmed Cases",total,parseInt(sum_info.cases),parseInt(fr['14_day'].total_cases),parseInt(fr['7_day'].total_cases));
   tbody += fillPredictedOutComeRow("Non-Tracked Infected",total,parseInt(sum_info.total_infected),parseInt(fr['14_day'].total_infected),parseInt(fr['7_day'].total_infected));
   tbody += fillPredictedOutComeRow("Not Infected",total,parseInt(sum_info.not_infected),parseInt(fr['14_day'].total_not_infected),parseInt(fr['7_day'].total_not_infected));
   $('#new_trends tbody').html(tbody);
}


// Create Sentences on top of the forecase page
function getMainSentences(fr,state_name) {

   // ADD CURVE SENTENCE
   // BOTH 14/7 OUTCOME RESULTS IN ZERO DAY
   if ((fr['14_day'].outcome == 'zero' && fr['7_day'].outcome == 'zero' )) {  

      if (fr['14_day'].zero_day_met == fr['7_day'].zero_day_met) {

         main_summary_text = "Based on current data trends,<br> <span class='good_t'>" + state_name;
         
        if(fr['14_day'].zero_day_met ==0) {
            main_summary_text += " has reached zero cases per day or is very close to doing so.";
         } else {
            main_summary_text += " could have zero cases in&nbsp;" + fr['14_day'].zero_day_met  + "&nbsp;days.";
         } 

      } else {
         main_summary_text = "Based on current data trends<br><span class='good_t'>" + state_name 
         drange = [fr['14_day'].zero_day_met , fr['7_day'].zero_day_met ]

         min = Math.min.apply(null,drange);
         max = Math.max.apply(null,drange);

         main_summary_text += " could have zero cases in&nbsp;" + min;
         if( min != max) { 
             main_summary_text += "&nbsp;to&nbsp;" + max + "&nbsp;days.</span>";
         } else {
            main_summary_text +=  "&nbsp;days.</span>";
         }
      }

      // ADD CURVE SENTENCE
      curve_end_days = fr['exp'].curve_end - fr['exp'].current_zero_day;

      if (curve_end_days < 0 && fr['exp'].curve_end > 0) {
         main_summary_text += "<br><span class='good_t'>The curve reached the zero day mark " + Math.abs(curve_end_days) + "&nbsp;days ago.</span>" 
      }

      // ADD CURVE SENTENCE ONLY IF IT HAS PEAKED.
      if (fr['exp'].curve_end != 0) {
         curve_end_days = fr['exp'].curve_end - fr['exp'].current_zero_day
         if (curve_end_days > 0) {
            main_summary_text += "<br><span class='good_t'>The curve is projected to end in&nbsp;" + Math.abs(curve_end_days) + "&nbsp;days.</span>" 
         }
      }
  
   }

   // BOTH 14/7 RESULT IN HERD DAY OR WE HAVE HIT THE ZERO DAY!!!
   else if (fr['14_day'].outcome == 'herd' && fr['7_day'].outcome == 'herd') {

      // if the outcome for both is herd do this:
      if (fr['14_day']['herd_immunity_met'] >= 0 && fr['7_day']['herd_immunity_met'] >= 0 ) {
         // here we have herd immunity outcome for both trends
         main_summary_text = "<small>Based on current data trends, </small><br><span class='ugly_t'>" + state_name;
         drange = [fr['14_day'].herd_immunity_met, fr['7_day'].herd_immunity_met];
         fr['14_day'].zero_success = 0;
         fr['7_day'].zero_success = 0;

         min = Math.min.apply(null,drange);
         max = Math.max.apply(null,drange);

         main_summary_text += " could reach herd immunity in&nbsp;" + min;
         if( min != max) { 
            main_summary_text += "&nbsp;to&nbsp;" + max + "&nbsp;days.</span>";
         } else {
            main_summary_text +=  "&nbsp;days.</span>";
         }
      }
      else {
         // here we have met the zero day outcome for both trends
         fr['14_day'].zero_success = 1
         fr['7_day'].zero_success = 1
         main_summary_text = "<small>Based on current data trends, </small><br><span class='good_t'>" + state_name
         main_summary_text += " has reached the zero day, or will very soon.</span>" ;
      }

      // ADD CURVE SENTENCE ONLY IF IT HAS PEAKED.
      if (fr['exp'].curve_end != 0) {
         curve_end_days = fr['exp'].curve_end - fr['exp'].current_zero_day
         if (curve_end_days > 0) {
            main_summary_text += "<br><span class='good_t'>The curve is projected to end in&nbsp;" + curve_end_days + "&nbsp;days.</span>" 
         }
      }  
   }
   // 14/7 RESULT IN HERD DAY AND ZERO
   else {
      if  (fr['14_day'].outcome == 'zero' ) {
         main_summary_text = "<span class='good_t'>Based on the 14-day trend, " + state_name 
         main_summary_text += " could have zero cases in&nbsp;" + fr['14_day'].zero_day_met 
         main_summary_text += "&nbsp;days,</span><br>but based on the 7-day trend,  " 
      }
      else {
         main_summary_text = "<span class='ugly_t'>Based on the 14-day trend, " + state_name 
         main_summary_text += " could reach herd immunity in&nbsp;" + fr['14_day'].herd_immunity_met 
         main_summary_text += "&nbsp;days,</span><br>but based on the 7-day trend, " 
      }

      if  (fr['7_day'].outcome == 'zero' ) {
         main_summary_text += "<br><span class='good_t'> " 
         main_summary_text += " it could have zero cases in&nbsp;" + fr['7_day'].zero_day_met
         main_summary_text += "&nbsp;days.</span> " 
      }
      else {
         main_summary_text += "<br><span class='ugly_t'> "  
         main_summary_text += " it could reach herd immunity in&nbsp;" + fr['7_day'].herd_immunity_met
         main_summary_text += "&nbsp;days.</span> "
      }
      // ADD CURVE SENTENCE ONLY IF IT HAS PEAKED.
      if (fr['exp'].curve_end != 0) {
         curve_end_days = fr['exp'].curve_end - fr['exp'].current_zero_day
         if (curve_end_days > 0) {
            main_summary_text += "<br><span class='good_t'>The curve is projected to end in&nbsp;" + curve_end_days + "&nbsp;days.</span>"
         }
         else {
            main_summary_text += "<br><span class='good_t'>The curve was projected to end&nbsp;" + curve_end_days + "&nbsp;days&nbsp;ago.</span>"

         }
      } 
   }

   return main_summary_text;
}



/**
 * Fill Top of the Forecast page
 * @param {*} state_name 
 * @param {*} fr 
 * @param {*} sum_info 
 */
function fillSummary(state_name,fr,sum_info) {
   
   // Update Main Summary Text
   $('#summary').html('<div id="sum_main">'+getMainSentences(fr,state_name)+'</div>'); 
       
   // Update Main Summary Table
   fillPredictedOutcome(fr,sum_info);
   
   // Update Gauges
   updateGauges(fr);
    
   // Curve Sentency
   if (fr['exp'].curve_end == 0 ) { 
      $('#sum_peak').html("<div class='bad_d'>The curve has not peaked.</div>");
   } else {
      $('#sum_peak').html('');
   }   

   // Create Pies Pies
   pie_lb = [ 'Not Infected', 'Infected', 'Confirmed Cases', 'Deaths'];
   plot_pie([fr['14_day'].total_not_infected, fr['14_day'].total_infected, fr['14_day'].total_cases, fr['14_day'].total_dead],pie_lb,"14-Day Trend","new_cases_pie_14");
   plot_pie( [fr['7_day'].total_not_infected, fr['7_day'].total_infected, fr['7_day'].total_cases, fr['7_day'].total_dead],pie_lb,"7-Day Trend","new_cases_pie_7")
} 
