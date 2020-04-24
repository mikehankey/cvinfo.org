function goodBadOrUgly(days) {
   if(days<30) {
      return "good_t";
   } else if(days < 60) {
      return "bad_t";
   } else {
      return "ugly_t";
   }
}

function fillSummary(state_name,fr) {
 
   var $gaugesCont = $('#forecast'); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');
   //var $three_days = $gaugesCont.find('.3days');
   var $new =  $gaugesCont.find('.new'); 
 
   var fr_html = "<h3>Predicted outcome based on new case trajectories and curve for "+state_name+"</h3>";
   fr_html += "<h4>the pandemic in "+state_name+" could end in</h4><div id='sum_main'><div>";
   document.getElementById("summary").innerHTML= fr_html;
  
   fr_html = "";


   // Create main text
  
   var main_summary_text = state_name ;
   if (fr['14_day'].zero_day_met > 0) {   
      main_summary_text += " could have zero cases in <span class='"+goodBadOrUgly(fr['14_day'].zero_day_met)+"'>" + fr['14_day'].zero_day_met + "</span> days.";
   } else {
      main_summary_text += " won't have zero cases before <span class='"+goodBadOrUgly(fr['14_day'].herd_immunity_met)+"'>" + fr['14_day'].herd_immunity_met + "</span> days based on the latest 14 days data.";
   }
   
   if (fr['7_day'].zero_day_met > 0 && parseInt(fr['14_day'].zero_day_met) <  parseInt(fr['7_day'].zero_day_met)) {
      main_summary_text += "<br>But the latest 7 days data says it could now happened in <span class='"+goodBadOrUgly(fr['7_day'].zero_day_met)+"'>" + fr['7_day'].zero_day_met + "</span> days.";
   }



   $('#sum_main').html(main_summary_text);
    
 


   // Recreate the Gauges
   $('#sum_peak').html('')
   createSvg('summary');

   if (fr['14_day'].zero_day_met > 0) {
      $forteen_days.attr('data-ratio',fr['14_day'].zero_day_met/100);
      //fr_html += "<span class='good'><b>14-Day Trajectory</b>: zero day will occur " + fr['14_day'].zero_day_met.toString() + " days after the first reported case.</span><br>"
   }
   else {
      $forteen_days.attr('data-ratio',fr['14_day'].herd_immunity_met/100);
      //fr_html += "<span class='bad'><b>14-Day Trajectory</b>: herd immunity will occur " + fr['14_day'].herd_immunity_met.toString() + " days after the first reported case.</span><br>"
   }

   if (fr['7_day'].zero_day_met > 0) {
      $seven_days.attr('data-ratio',fr['7_day'].zero_day_met/100);
      //fr_html += "<span class='good'><b>7-Day Trajectory</b>: zero day will occur " + fr['7_day'].zero_day_met.toString() + " days after the first reported case.<br></span>"
   }
   else {
      $seven_days.attr('data-ratio',fr['7_day'].herd_immunity_met/100);
      //fr_html += "<span class='bad'><b>7-Day Trajectory</b>: herd immunity will occur " + fr['7_day'].herd_immunity_met.toString() + " days after the first reported case.</span><br>"
   }

   /*
   if (fr['3_day'].zero_day_met > 0) {
      $three_days.attr('data-ratio',fr['3_day'].zero_day_met/100);
      //fr_html += "<span class='good'><b>3-Day Trajectory</b>: zero day will occur " + fr['3_day'].zero_day_met.toString() + " days after the first reported case.</span><br>"
   }
   else {
      $three_days.attr('data-ratio',fr['3_day'].herd_immunity_met/100);
      //fr_html += "<span class='bad'><b>3-Day Trajectory</b>: herd immunity will occur " + fr['3_day'].herd_immunity_met.toString() + " days after the first reported case.</span><br>"
   }
   */

     
   if (fr['exp'].zero_day_met > 0) {
      $new.attr('data-ratio',fr['exp'].zero_day_met/100);
      //fr_html += "<span class='good'><b>Curve</b>: zero day will occur " + fr['exp'].zero_day_met.toString() + " days after the first reported case.</span><br>"
   }
   else {
      if (fr['exp'].herd_immunity_met > 0) {
         $new.attr('data-ratio',fr['exp'].herd_immunity_met/100);
         //fr_html += "<span class='bad'><b>Curve</b>: herd immunity will occur " + fr['exp'].herd_immunity_met.toString() + " days after the first reported case.</span><br>"
      }
      else {
         fr_html += "<div class='bad_d'>The curve has not peaked.</div>"
      }
   } 

   $('#sum_peak').html(fr_html);
  
   setTimeout(function(){ 
      start_gauges($gaugesCont);
   },500);
}