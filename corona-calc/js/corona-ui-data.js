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
   /*
   if(val1<val2) {
      return "ar good";
   } else if( val1>val2) {
      return "ar bad";
   } else {
      return "";
   }
   */
  return "";
}
 

function plot_pie(xd,lb,title,dv) {

   // Add Title as DOM element
   if($('#'+dv).parent().find('h3').length==0) {
      $('#'+dv).parent().prepend('<h3>'+title+'</h3>');
   }
  
   var colors =  [
      '#eaeaea',
      '#e5ac9d',      
      '#d35e60',
      '#cc0000'
   ];
   
   // cases, infected, not infected deaths
   var data = [{
      labels: lb,
      values: xd,
      type: 'pie',
      textinfo: "percent", // label+
      textposition: "inside",
      automargin: true,
      marker: {
         colors: colors
      }
   }];

   var layout = { 
      margin: {"t": 0, "b": 20, "l": 0, "r": 0},
      showlegend: false
   };
   Plotly.newPlot(dv, data,layout,{responsive: true, displayModeBar: false});
   
   // Create Legend
   var lg="<ul>";
   $.each(lb,function(i,v) {
      lg+= "<li><span style='background-color:"+colors[i]+"'></span> " + lb[i] + " - " + usFormat(parseInt(xd[i])) + "</li>";
   });
   lg+="</ul>";
   
   $('#'+dv).closest('.pie_chart').find('.leg').html(lg);
} 

function fillPredictedOutcome(fr,sum_info) {
   var tbody = "", total = parseInt($("#f_state_pop").val());
  
   tbody += '<tr><th>Deaths</th>\
                <td>' + usFormat(parseInt(sum_info.deaths)) + '</td><td>' +   (parseInt(sum_info.deaths)*100/total).toFixed(2) + '%</td>\
                <td>' + usFormat(parseInt(fr['14_day'].total_dead)) + '</td><td>' +    (parseInt(fr['14_day'].total_dead)*100/total).toFixed(2) + '%</td>\
                <td >' + usFormat(parseInt(fr['7_day'].total_dead)) + '</td><td>' +   (parseInt(fr['7_day'].total_dead)*100/total).toFixed(2) + '%</td></tr>';
   tbody += '<tr><th>Confirmed Cases</th>\
                <td>' + usFormat(parseInt(sum_info.cases))  + '</td><td>' +    (parseInt(sum_info.cases)*100/total).toFixed(2) + '%</td>\
                <td>' + usFormat(parseInt(fr['14_day'].total_cases)) + '</td><td>' +    (parseInt(fr['14_day'].total_cases)*100/total).toFixed(2) + '%</td>\
                <td>' + usFormat(parseInt(fr['7_day'].total_cases)) + '</td><td>' +   (parseInt(fr['7_day'].total_cases)*100/total).toFixed(2) + '%</td></tr>';  
   tbody += '<tr><th>Non-Tracked Infected</th>\
               <td>' + usFormat(parseInt(sum_info.total_infected))  + '</td><td>' +    (parseInt(sum_info.total_infected)*100/total).toFixed(2) + '%</td>\
               <td>' + usFormat(parseInt(fr['14_day'].total_infected)) + '</td><td>' +    (parseInt(fr['14_day'].total_infected)*100/total).toFixed(2) + '%</td>\
               <td>' + usFormat(parseInt(fr['7_day'].total_infected)) + '</td><td>' +    (parseInt(fr['7_day'].total_infected)*100/total).toFixed(2) + '%</td></tr>';  
   tbody += '<tr><th>Not Infected</th>\
               <td>' + usFormat(parseInt(sum_info.not_infected)) + '</td><td>' +    (parseInt(sum_info.not_infected)*100/total).toFixed(2) + '%</td>\
               <td>' + usFormat(parseInt(fr['14_day'].total_not_infected)) + '</td><td>' +   (parseInt(fr['14_day'].total_not_infected)*100/total).toFixed(2) + '%</td>\
               <td>' + usFormat(parseInt(fr['7_day'].total_not_infected)) + '</td><td>' +   (parseInt(fr['7_day'].total_not_infected)*100/total).toFixed(2) + '%</td></tr>';  
               
 
   $('#new_trends tbody').html(tbody);
}


function forecastTable(fr) {
   exp_ys_sliced = fr['exp']['ys'].slice(fr['exp']['current_zero_day'], fr['exp']['ys'].length-1)
   exp_dys_sliced = fr['exp']['dys'].slice(fr['exp']['current_zero_day'], fr['exp']['dys'].length-1)
   drange = [fr['7_day']['ys'].length, fr['14_day']['ys'].length, exp_ys_sliced.length]
   max = Math.max.apply(null,drange);
   total_cases = fr['14_day']['total_cases_start']
   total_deaths= fr['14_day']['total_deaths_start']
   day14_new_cases = total_cases
   day14_new_deaths = total_deaths
   day7_new_cases = total_cases
   day7_new_deaths = total_deaths
   exp_new_cases = total_cases
   exp_new_deaths = total_deaths
   fhtml = "<table><tr><td>Forecast<br>Day</td><td>New Cases<br>14-Day Trend</td><td>New Cases<BR>7-Day Trend</td><td>Curve <br>New Cases</td></tr> "
   for (i = 0; i <= max; i++) {
      if (i < fr['14_day']['ys'].length) {
         day14_new_cases += parseInt(fr['14_day'].ys[i])
         day14_new_deaths += parseInt(fr['14_day'].dys[i])
      }
      else {
         day14_new_cases = 0
         day14_new_deaths= 0
      }
      if (i < fr['7_day']['ys'].length) {
         day7_new_cases += parseInt(fr['7_day']['ys'][i])
         day7_new_deaths += parseInt(fr['7_day'].dys[i])
      }
      else {
         day7_new_cases = 0
         day7_new_deaths = 0
      }
      if (i < exp_ys_sliced.length) {
         exp_new_cases  += parseInt(exp_ys_sliced[i])
         exp_new_deaths  += parseInt(exp_dys_sliced[i])
      }
      else {
         exp_new_cases = 0
         exp_new_deaths = 0
      }
      fhtml += "<tr><td>" + i + "</td><td>" + day14_new_cases + " / " + day14_new_deaths +  "</td><td>" + day7_new_cases + " / " + day7_new_deaths + "</td><td>" + exp_new_cases + " / " + exp_new_deaths + "</td></tr>"
   }
   fhtml += "</table>"
   return(fhtml) 

}

function fillSummary(state_name,fr,sum_info) {
   //fhtml = forecastTable(fr)   
   fhtml = ""
   var $gaugesCont = $('#forecast'); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');  
   var main_summary_text = "";
   var fr_html = ""; // for curve peak
  
   // ADD CURVE SENTENCE
   // BOTH 14/7 OUTCOME RESULTS IN ZERO DAY
   if ((fr['14_day'].outcome == 'zero' && fr['7_day'].outcome == 'zero' )  ) {  

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
   curve_end_days = fr['exp'].curve_end - fr['exp'].current_zero_day
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
      //if (typeof(fr['14_day']['herd_immunity_met']) != "undefined" && typeof(fr['7_day']['herd_immunity_met']) != "undefined" && fr['14_day']['herd_immunity_met'] == 0 && fr['7_day']['herd_immunity_met'] == 0 ) {
      if (fr['14_day']['herd_immunity_met'] >= 0 && fr['7_day']['herd_immunity_met'] >= 0 ) {
         // here we have herd immunity outcome for both trends
         main_summary_text = "<small>Based on current data trends, </small><br><span class='ugly_t'>" + state_name 
         drange = [fr['14_day'].herd_immunity_met, fr['7_day'].herd_immunity_met];
         fr['14_day'].zero_success = 0
         fr['7_day'].zero_success = 0

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
         //drange = [fr['14_day'].herd_immunity_met, fr['7_day'].herd_immunity_met];

         //min = Math.min.apply(null,drange);
         //max = Math.max.apply(null,drange);

         main_summary_text += " has reached the zero day, or will very soon.</span>" ;
         //if( min != max) {
         //   main_summary_text += " to " + max + " days.</span>";
         //} else {
         //   main_summary_text +=  " days.</span>";
         //}
 

      }
      // ADD CURVE SENTENCE ONLY IF IT HAS PEAKED.
      if (fr['exp'].curve_end != 0) {
         curve_end_days = fr['exp'].curve_end - fr['exp'].current_zero_day
         if (curve_end_days > 0) {
            main_summary_text += "<br><span class='good_t'>The curve is projected to end in&nbsp;" + curve_end_days + "&nbsp;days.</span>" 
         }
      } 
      else {

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
   main_summary_text += fhtml 
   $('#summary').html('<div id="sum_main">'+main_summary_text+'</div>'); 
    
   // Recreate the Gauges
   $('#sum_peak').html('')
   createSvg();

     
   if (fr['14_day'].outcome == 'zero') {
      $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero Cases in','good');
      outcome = "zero"
   }
   else {

      if (fr['14_day'].outcome == 'herd') {
         $forteen_days.update_gauge(fr['14_day'].herd_immunity_met/100,'Herd Immunity in','ugly'); 
         outcome = "herd"
      }
      else {
         $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero day in','good'); 
         outcome = "zero"
      }
   }

   if (fr['7_day'].outcome == 'zero') {
      $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero Cases in','good');
      outcome = "zero"
   }
   else {
      if (fr['7_day'].outcome == 'herd') {
         $seven_days.update_gauge(fr['7_day'].herd_immunity_met/100,'Herd Immunity in','ugly');
         outcome = "herd"
      }
      else {
         $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero day in','good');
         outcome = "zero"
      }
   }  
  
   curve_flag = fr['exp'].curve_end - fr['exp'].current_zero_day 
   if (fr['exp'].curve_end == 0 ) {
      fr_html += "<div class='bad_d'>The curve has not peaked.</div>"
   }  

   $('#sum_peak').html(fr_html);
   
   // Pies
   pie_data = [fr['14_day'].total_not_infected, fr['14_day'].total_infected, fr['14_day'].total_cases, fr['14_day'].total_dead];
   pie_lb = [ 'Not Infected', 'Infected', 'Confirmed Cases', 'Deaths'];
   plot_pie(pie_data,pie_lb,"14-Day Trend","new_cases_pie_14");

   pie_data = [fr['7_day'].total_not_infected, fr['7_day'].total_infected, fr['7_day'].total_cases, fr['7_day'].total_dead]; 
   plot_pie(pie_data,pie_lb,"7-Day Trend","new_cases_pie_7")
    
   // Table
   fillPredictedOutcome(fr,sum_info);

   // Animate Gauges
   setTimeout(function(){ 
      start_gauges($gaugesCont);
   },850);
}


// Create Line Graphs (?)
function plot_data_line(xd,yd,yd2,yd3,yd4,exp_yd,xl,yl,t,dv,type) {
   var ymax = Math.max.apply(Math, yd) * 1.2;

   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      type: type
   };

   // Trends shouldn't start at 0
 
   var trace2 = {
      x: xd,
      y: yd2,
      name: yl,
      name: "14-Day Trend",
      type: type  
   };

   var trace3 = {
      x: xd,
      y: yd3,
      name: yl,
      name: "7-Day Trend",
      type: type  
   };
 

   var trace5 = {
      x: xd,
      y: exp_yd,
      name: yl,
      name: "Curve",
      type: type  
   };
   var data = [trace1,trace2,trace3,trace5]; // , trace4
   var layout = { 
      range: [0,ymax],
      autorange: false, 
      yaxis : {
         /*
         title: {
            text: yl
         },
         */
         autorange: true,
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000',
      },
      xaxis : { 
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000'
      },
      title :  t,
      margin: {"t": 80, "b": 80, "l": 80, "r": 80},
      showlegend: true,
      legend: {
         orientation: "h" 
      }
   }

   Plotly.newPlot(dv, data, layout, {responsive: true});

}



// Create real graphs
function plot_data(xd,yd,yd2,yd3,yd4,exp_y,xl,yl,t,dv,type,model_ys) {
 
 
   var ymax = Math.max.apply(Math, yd) + Math.max.apply(Math, yd)/8;
    
   for (var i = 0; i <= xd.length-1; i++) {
      if (yd[i] > 0) {
         cur_day = xd[i]
      }
   }

   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      type: type
   };

 

   var trace2 = {
      x: xd,
      y: yd2,
      name: "14-Day Trend",
      type: "line"
   };

   var trace3 = {
      x: xd,
      y: yd3,
      name: "7-Day Trend",
      type: "line" 
   };
   
   /*
   var trace4 = {
      x: xd,
      y: yd4,
      name: "3-Day Trend",
      type: "line" 
   };
   */

   var trace5 = {
      x: xd,
      y: exp_y,
      name: "Curve",
      type: "line" 
   };

   if (model_ys.length > 0) {
      var mxs = xd.slice(0, model_ys.length)
      var trace6 = {
         x: xd,
         y: model_ys,
         name: "MIT Model",
         type: "line" 
      };
      var data = [trace1, trace2, trace3,trace5,trace6]; //
   }
   else {
      var data = [trace1, trace2, trace3,trace5]; //

   }

   var layout = {
      shapes : [{ 
         type: 'line',
         x0: cur_day,
         y0: 0,
         x1: cur_day,
         yref: 'paper',
         y1: 1,
         line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot'
         }
      }],
      yaxis : {
         range: [0,ymax],
         autorange: false,
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000' 
      }, 
      xaxis : { 
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000', 
      },
      title :  t,
      margin: {"t": 80, "b": 80, "l": 80, "r": 50},
      showlegend: true,
      legend: {
         orientation: "h" 
      },
   };
   Plotly.newPlot(dv, data, layout, {responsive: true});
} 
