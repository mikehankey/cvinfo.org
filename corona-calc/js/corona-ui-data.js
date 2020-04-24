function goodBadOrUgly(days,outcome) {
      // use green colors
      if(days<30) {
         return "good_t";
      } else if(days < 60) {
         return "bad_t";
      } else {
         return "ugly_t";
      }
}  



function goodBadOrUglyMike(days,outcome) {
   if (outcome == 'zeroday') {
       return("good_t")
   }
   else {
      
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

   // BOTH 14/7 RESULT IN ZERO DAY
   if (fr['14_day'].zero_day_met > 0 && fr['7_day'].zero_day_met > 0) {  
      var  main_summary_text = "<span class='good_t'>" + state_name 
      drange = [fr['14_day'].zero_day_met , fr['7_day'].zero_day_met ]
      main_summary_text += " could have zero cases in " + Math.min.apply(null,drange).toString() 
      //main_summary_text += " could have zero cases in <span class='"+goodBadOrUglyMike(Math.max.apply(null,drange),'zeroday')+"'>" + Math.min.apply(null,drange).toString() + "</span> ";
      main_summary_text += " to " + Math.max.apply(null,drange).toString() + " days.</span>";

      if( fr['7_day'].zero_day_met>fr['14_day'].zero_day_met) {
         // add note here (optional) if the 7 day trend is worse than the 14 day trend.
         //main_summary_text += "<br/>but based on the last 7 days trend, it may take up to <span class='"+goodBadOrUglyMike(fr['7_day'].zero_day_met)+"'>" + fr['7_day'].zero_day_met + "</span> days.";
      } else {
         // WARNING: Here no need to display the 7 days trend (?) - I can take care of it.
         main_summary_text += ".";
      }
   }
   // BOTH 14/7 RESULT IN HERD DAY
   if (fr['14_day'].zero_day_met == 0 && fr['7_day'].zero_day_met == 0) {

      var  main_summary_text = "<span class='ugly_t'>" + state_name 
      drange = [fr['14_day'].herd_immunity_met, fr['7_day'].herd_immunity_met]
      main_summary_text += " could reach herd immunity in " + Math.min.apply(null,drange).toString() 
      main_summary_text += " to " + Math.max.apply(null,drange).toString() + "days. </span> ";

   }

 
   $('#sum_main').html(main_summary_text);
    
   // Recreate the Gauges
   $('#sum_peak').html('')
   createSvg('summary');

   if (fr['14_day'].zero_day_met > 0) {
      $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero Cases in','good');
   }
   else {
      $forteen_days.update_gauge(fr['14_day'].herd_immunity_met/100,'Herd Immunity in','bad'); 
   }

   if (fr['7_day'].zero_day_met > 0) {
      $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero Cases in','good');
   }
   else {
      $seven_days.update_gauge(fr['7_day'].herd_immunity_met/100,'Herd Immunity in','bad');
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
