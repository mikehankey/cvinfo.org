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
 
   var fr_html = "<h3>Current forecast and predicted outcome for " + state_name + " </h3>based on 7 and 14-day NEW CASE trends ";
   //fr_html += "<h4>the pandemic in "+state_name+" could end in</h4><div id='sum_main'><div>";
   //fr_html += "<div id='sum_main'><div>";
   var fr_html =   "<div id='sum_main'><div>";
   document.getElementById("summary").innerHTML= fr_html;
  
   fr_html = "";


   // Create main text
  
   var main_summary_text = state_name ;
   if (fr['14_day'].zero_day_met > 0) {   
      main_summary_text += " could reach zero cases in <span class='"+goodBadOrUgly(fr['14_day'].zero_day_met)+"'>" + fr['14_day'].zero_day_met + "</span> days.";
   } else {
      main_summary_text += " could reach herd immunity in <span class='"+goodBadOrUgly(fr['14_day'].herd_immunity_met)+"'>" + fr['14_day'].herd_immunity_met + "</span> days based on the latest 14-day new case trend.";
   }
   
   if (fr['7_day'].zero_day_met > 0 && parseInt(fr['14_day'].zero_day_met) <  parseInt(fr['7_day'].zero_day_met)) {
      main_summary_text += "<br>But the latest 7 days data says it could now happened in <span class='"+goodBadOrUgly(fr['7_day'].zero_day_met)+"'>" + fr['7_day'].zero_day_met + "</span> days.";
   }



   if(fr['14_day'].zero_day_met > 0 && fr['7_day'].zero_day_met > 0) {
      if(fr['14_day'].zero_day_met > fr['7_day'].zero_day_met) {
         main_summary_text += " could have zero cases in <span class='"+goodBadOrUgly(fr['14_day'].zero_day_met)+"'>" + fr['14_day'].zero_day_met + "</span> days.";
      } else {
         main_summary_text += " could have zero cases in <span class='"+goodBadOrUgly(fr['7_day'].zero_day_met)+"'>" + fr['7_day'].zero_day_met + "</span> days";
        }
   } else if(fr['14_day'].zero_day_met > 0 && fr['7_day'].zero_day_met < 0) {
         main_summary_text += " 3";
   }
  
   $('#sum_main').html(main_summary_text);
    
   // Recreate the Gauges
   $('#sum_peak').html('')
   createSvg('summary');

   if (fr['14_day'].zero_day_met > 0) {
      $forteen_days.attr('data-ratio',fr['14_day'].zero_day_met/100);
   }
   else {
      $forteen_days.attr('data-ratio',fr['14_day'].herd_immunity_met/100);
   }

   if (fr['7_day'].zero_day_met > 0) {
      $seven_days.attr('data-ratio',fr['7_day'].zero_day_met/100);
   }
   else {
      $seven_days.attr('data-ratio',fr['7_day'].herd_immunity_met/100);
   }  
     
   if (fr['exp'].zero_day_met > 0) {
      $new.attr('data-ratio',fr['exp'].zero_day_met/100);
   }
   else {
      if (fr['exp'].herd_immunity_met > 0) {
         $new.attr('data-ratio',fr['exp'].herd_immunity_met/100);
      }
      else {
         fr_html += "<div class='bad_d'>The curve has not peaked.</div>"
      }
   } 

   $('#sum_peak').html(fr_html);
   
   // Animate Gauges
   setTimeout(function(){ 
      start_gauges($gaugesCont);
   },500);
}
