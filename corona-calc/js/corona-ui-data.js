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

function goodOrBadRow(val1,val2) {
   if(val1<val2) {
      return "ar good";
   } else if( val1>val2) {
      return "ar bad";
   } else {
      return "";
   }
}
 

function plot_pie(xd,lb,title,dv) {

   // Add Title as DOM element
   if($('#'+dv).parent().find('h3').length==0) {
      $('#'+dv).parent().prepend('<h3>'+title+'</h3>');
   }
 

   var colors =  [
      '#ff5252',
      '#e5ac9d',
      '#97e486',
      '#cc0000'
   ];
   
   // cases, infected, not infected deaths
   var data = [{
      labels: lb,
      values: xd,
      type: 'pie',
      textinfo: "label+percent",
      textposition: "inside",
      automargin: true,
      marker: {
         colors: colors
      }
   }];

   var layout = { 
      margin: {"t": 0, "b": 20, "l": 0, "r": 0},
      showlegend: false
   }
   Plotly.newPlot(dv, data,layout,{responsive: true})

   // Create Legend
   var lg="<ul>";
   $.each(lb,function(i,v) {
      lg+= "<li><span style='background-color:"+colors[i]+"'></span> " + lb[i] + " " + usFormat(parseInt(xd[i])) + "</li>";
   });
   lg+="</ul>";
   
   $('#'+dv).closest('.pie_chart').find('.leg').html(lg);

}



function fillPredictedOutcome(fr,sum_info) {
   var tbody = "";
   // Build Predicted Outcome Table 
   if(fr['14_day'].total_dead<fr['7_day'].total_dead)   {
      _class = "row_good";
   } else {
      _class = "row_bad";
   }  
   tbody += '<tr><th>Deaths</th>\
                <td>' + usFormat(parseInt(sum_info.deaths)) + '</td>\
                <td>' + usFormat(parseInt(fr['14_day'].total_dead)) + '</td>\
                <td  class="'+goodOrBadRow(fr['14_day'].total_dead,fr['7_day'].total_dead)+'">' + usFormat(parseInt(fr['7_day'].total_dead)) + '</td></tr>';
   tbody += '<tr><th>Confirmed Cases</th>\
                <td>' + usFormat(parseInt(sum_info.cases))  + '</td>\
                <td>' + usFormat(parseInt(fr['14_day'].total_cases)) + '</td>\
                <td  class="'+goodOrBadRow(fr['14_day'].total_dead,fr['7_day'].total_cases)+'">' + usFormat(parseInt(fr['7_day'].total_cases)) + '</td></tr>';  
   tbody += '<tr><th>Non-Tracked Infected</th>\
                <td>' + usFormat(parseInt(sum_info.total_infected)) + '</td>\
                <td>' +  usFormat(parseInt(fr['14_day'].total_infected)) + '</td>\
                <td>'+ usFormat(parseInt(fr['7_day'].total_infected)) + '</td></tr>';     
   tbody += '<tr><th>Not Infected</th>\
               <td>' + usFormat(parseInt(sum_info.not_infected)) + '</td>\
               <td>' + usFormat(parseInt(fr['14_day'].total_not_infected))  + '</td>\
               <td>'+ usFormat(parseInt(fr['7_day'].total_not_infected)) + '</td></tr>';        
      
   $('#new_trends tbody').html(tbody);
}

function fillSummary(state_name,fr,sum_info) {
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
      if (fr['14_day'].zero_day_met == fr['7_day'].zero_day_met) {
         var  main_summary_text = "Based on current data trends,<br> <span class='good_t'>" + state_name 
         main_summary_text += " could have zero cases in " + fr['14_day'].zero_day_met.toString()  + " days."

      } else {
         var  main_summary_text = "Based on current data trends<br><span class='good_t'>" + state_name 
         drange = [fr['14_day'].zero_day_met , fr['7_day'].zero_day_met ]
         main_summary_text += " could have zero cases in " + Math.min.apply(null,drange).toString() 
         //main_summary_text += " could have zero cases in <span class='"+goodBadOrUglyMike(Math.max.apply(null,drange),'zeroday')+"'>" + Math.min.apply(null,drange).toString() + "</span> ";
         main_summary_text += " to " + Math.max.apply(null,drange).toString() + " days.</span>";
      }
   }
   // BOTH 14/7 RESULT IN HERD DAY
   else if (fr['14_day'].zero_day_met == 0 && fr['7_day'].zero_day_met == 0) {
      var  main_summary_text = "<small>Based on current data trends, </small><br><span class='ugly_t'>" + state_name 
      drange = [fr['14_day'].herd_immunity_met, fr['7_day'].herd_immunity_met]
      main_summary_text += " could reach herd immunity in " + Math.min.apply(null,drange).toString() 
      main_summary_text += " to " + Math.max.apply(null,drange).toString() + " days. </span> ";
   }
   // 14/7 RESULT IN HERD DAY AND ZERO
   else {
      if  (fr['14_day'].zero_day_met > 0 ) {
         var  main_summary_text = "<span class='good_t'>Based on the 14-day trend, " + state_name 
         main_summary_text += " could have zero cases in " + fr['14_day'].zero_day_met.toString() 
         main_summary_text += "  days, </span> <br> but based on the 7-day trend,  " 
      }
      else {
         var  main_summary_text = "<span class='ugly_t'>Based on the 14-day trend, " + state_name 
         main_summary_text += " could reach herd immunity in " + fr['14_day'].herd_immunity_met.toString() 
         main_summary_text += " days, </span> <br> but based on the 7-day trend, " 

      }
      if  (fr['7_day'].zero_day_met > 0 ) {
         main_summary_text += "<br><span class='good_t'> " 
         main_summary_text += " it could have zero cases in " + fr['7_day'].zero_day_met.toString()
         main_summary_text += " days .</span> " 
      }
      else {
         main_summary_text += "<br><span class='ugly_t'> "  
         main_summary_text += " it could reach herd immunity in " + fr['7_day'].herd_immunity_met.toString()
         main_summary_text += " days .</span> "
      }
   }
 
   $('#sum_main').html(main_summary_text);
    
   // Recreate the Gauges
   $('#sum_peak').html('')
   createSvg();

   if (fr['14_day'].zero_day_met > 0) {
      $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero Cases in','good');
   }
   else {
      $forteen_days.update_gauge(fr['14_day'].herd_immunity_met/100,'Herd Immunity in','ugly'); 
   }

   if (fr['7_day'].zero_day_met > 0) {
      $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero Cases in','good');
   }
   else {
      $seven_days.update_gauge(fr['7_day'].herd_immunity_met/100,'Herd Immunity in','ugly');
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
    
   // Pies
   pie_data = [fr['14_day'].total_cases, fr['14_day'].total_infected, fr['14_day'].total_not_infected, fr['14_day'].total_dead]
   pie_lb = ['Confirmed Cases', 'Infected', 'Not Infected', 'Deaths'];
   plot_pie(pie_data,pie_lb,"14-Day Trend","new_cases_pie_14")

   pie_data = [fr['7_day'].total_cases, fr['7_day'].total_infected, fr['7_day'].total_not_infected, fr['7_day'].total_dead]
   plot_pie(pie_data,pie_lb,"7-Day Trend","new_cases_pie_7")
    
   // Table
   fillPredictedOutcome(fr,sum_info);

   // Animate Gauges
   setTimeout(function(){ 
      start_gauges($gaugesCont);
   },850);
}
