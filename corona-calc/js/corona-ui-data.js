function goodBadOrUgly(days) {
   if(days<30) {
      return "good_t";
   } else if(days < 60) {
      return "bad_t";
   } else {
      return "ugly_t";
   }
}

function goodBadOrUglyMike(type) {
   if(type=="zero_day") {
      return "good_t";
   }  else {
      return "ugly_t";
   }
}

function fillSummary(state_name,fr) {
 
   var $gaugesCont = $('#forecast'); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');
   //var $three_days = $gaugesCont.find('.3days');
   var $new =  $gaugesCont.find('.new'); 
 
   var fr_html = "<h3>Current forecast and predicted outcome for " + state_name + " </h3>based on 7 and 14-day NEW CASE trends ";
   var fr_html =   "<div id='sum_main'><div>";
   document.getElementById("summary").innerHTML= fr_html;
  
   fr_html = "";


   // Create main text
   var main_summary_text = state_name ;

   // Just an example with zero_day
   if (fr['14_day'].zero_day_met > 0 && fr['7_day'].zero_day_met > 0) {  

      main_summary_text += " could have zero cases in <span class='"+goodBadOrUgly(fr['14_day'].zero_day_met)+"'>" + fr['14_day'].zero_day_met + "</span> days";

      if( fr['7_day'].zero_day_met>fr['14_day'].zero_day_met) {
         main_summary_text += "<br/>but based on the last 7 days trend, it may take up to <span class='"+goodBadOrUgly(fr['7_day'].zero_day_met)+"'>" + fr['7_day'].zero_day_met + "</span> days.";
      } else {
         // WARNING: Here no need to display the 7 days trend (?) - I can take care of it.
         main_summary_text += ".";
      }
   }
 
   $('#sum_main').html(main_summary_text);
    
   // Recreate the Gauges
   $('#sum_peak').html('')
   createSvg('summary');

   if (fr['14_day'].zero_day_met > 0) {
      $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero Cases in');
   }
   else {
      $forteen_days.update_gauge(fr['14_day'].herd_immunity_met/100,'Herd Immunity in'); 
   }

   if (fr['7_day'].zero_day_met > 0) {
      $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero Cases in');
   }
   else {
      $seven_days.update_gauge(fr['7_day'].herd_immunity_met/100,'Herd Immunity in');
   }  
     
 
   if (fr['exp'].zero_day_met > 0) {
      //$new.attr('data-ratio',fr['exp'].zero_day_met/100);
   }
   else {
      if (fr['exp'].herd_immunity_met > 0) {
         //$new.attr('data-ratio',fr['exp'].herd_immunity_met/100);
      }
      else {
         fr_html += "<div class='bad_d'>The curve has not peaked.</div>"
      }
   }  

   $('#sum_peak').html(fr_html);
   
   // Animate Gauges
   setTimeout(function(){ 
      start_gauges($gaugesCont);
   },850);
}
