function fillSummary(state_name,fr) {
 
   var $gaugesCont = $('#forecast'); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');
   var $three_days = $gaugesCont.find('.3days');
   var $new =  $gaugesCont.find('.new'); 
 
   var fr_html = "<h3>Predicted outcome based on new case trajectories and curve for "+state_name+"</h3>";
   fr_html += "<h4>the pandemic in "+state_name+" could end in</h4>";
   document.getElementById("summary").innerHTML= fr_html;
  
   fr_html = "";

   // Recreate the SVG
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

   if (fr['3_day'].zero_day_met > 0) {
      $three_days.attr('data-ratio',fr['3_day'].zero_day_met/100);
      //fr_html += "<span class='good'><b>3-Day Trajectory</b>: zero day will occur " + fr['3_day'].zero_day_met.toString() + " days after the first reported case.</span><br>"
   }
   else {
      $three_days.attr('data-ratio',fr['3_day'].herd_immunity_met/100);
      //fr_html += "<span class='bad'><b>3-Day Trajectory</b>: herd immunity will occur " + fr['3_day'].herd_immunity_met.toString() + " days after the first reported case.</span><br>"
   }

     
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