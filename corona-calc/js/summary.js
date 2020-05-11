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
   tbody =  fillPredictedOutComeRow("Deaths",total,parseInt(sum_info.deaths),parseInt(fr['14_day'].total_dead),parseInt(fr['7_day'].total_dead));
   tbody += fillPredictedOutComeRow("Confirmed Cases",total,parseInt(sum_info.cases),parseInt(fr['14_day'].total_cases),parseInt(fr['7_day'].total_cases));
   tbody += fillPredictedOutComeRow("Non-Tracked Infected",total,parseInt(sum_info.total_infected),parseInt(fr['14_day'].total_infected),parseInt(fr['7_day'].total_infected));
   tbody += fillPredictedOutComeRow("Not Infected",total,parseInt(sum_info.not_infected),parseInt(fr['14_day'].total_not_infected),parseInt(fr['7_day'].total_not_infected));
   $('#new_trends tbody').html(tbody);
} 

// Fill Top Table
function fill_top_table(data,phantom, herd_immunity_info) {
   var tbody, total = data.pop; 
 
   var total_non_tracked_infected = (data.total_case/phantom)-data.total_death;
   var total_not_infected = data.pop-total_non_tracked_infected-data.total_case;
   
   var zero_7 = data.trend_7.reach==-1?false:true; // It means herd immunity
   var zero_14 = data.trend_14.reach==-1?false:true;

   // Herd or 0
   if(zero_7) {
      $('#7_day_date').text(data.trend_7.reach);
   } else {
      $('#7_day_date').text(dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date));
   }
   
   // Herd or 0
   if(zero_14) {
      $('#14_day_date').text(data.trend_14.reach);
   } else {
      $('#14_day_date').text(dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date));
   }
    

   // DEATHS
   tbody +='<tr><th>Deaths</th><td>' + usFormat(data.total_death) + '</td><td>' +  (data.total_death*100/total).toFixed(2) + '%</td>';
   // CONF CASES
   tbody +='<tr><th>Confirmed Cases</th><td>' + usFormat(data.total_case) + '</td><td>' +   (data.total_case*100/total).toFixed(2) + '%</td>';
   // NON TRACKED INFECTED
   tbody +='<tr><th>Non-Tracked Infected</th><td>' + usFormat(total_non_tracked_infected) + '</td><td>' +   ((total_non_tracked_infected)*100/total).toFixed(2) + '%</td>';
   // NOT INFECTED
   tbody +='<tr><th>Not Infected</th><td>' + usFormat(total_not_infected) + '</td><td>' +   ((total_not_infected)*100/total).toFixed(2) + '%</td>';


   $('#new_trends tbody').html(tbody);

}
 


// Create Main Top Sentence, compute herd immunity if necessary and fill the top of the page
function create_top_page(data, phantom) {
   var top_sentence = ""; 
   var herd_immunity_info ;
     
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
            top_sentence +=  "somewhere between <span class='wn'>" +  data.trend_14['reach'] + " and " + data.trend_7['reach'] + "</span>.";
         } else if(  data.trend_14.reach_raw_d > data.trend_7.reach_raw_d) {
            top_sentence +=  "somewhere between <span class='wn'>" +  data.trend_7['reach'] + " and " + data.trend_14['reach'] + "</span>.";
         } else { 
            top_sentence +=  "<span class='wn'>around "  + data.trend_7['reach']  + " </span>";
         }
      }

      // Fill Top Table
      fill_top_table(data, phantom);

   } else {
     
      if(data.trend_7['reach']==-1 && data.trend_14['reach']!=-1  ) { 
         
         // We need to compute the Herd Immunity for 7 day trend only
         herd_immunity_info  = get_herd_immunity_info(data,7, phantom);
         top_sentence = "Based on the 7-day trend,<br>" +  data.name;
         top_sentence += " could reach <span class='ugly_t'>herd immunity on <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date) + "</span></span>";
         top_sentence += "<br>but based on the 14-day trend,<br>";
         top_sentence += " it could have <span class='good_t'>zero cases by <span class='wn'>" + data.trend_14['reach']  + "</span>.";

      } else if(data.trend_7['reach']!=-1 && data.trend_14['reach']==-1) {

         // We need to compute the Herd Immunity for 14 day trend only
         herd_immunity_info  = get_herd_immunity_info(data,14, phantom);
         top_sentence = "Based on the 14-day trend,<br>" +  data.name;
         top_sentence += " could reach <span class='ugly_t'>herd immunity on <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span></span>";
         top_sentence += "<br>but based on the 7-day trend,<br>";
         top_sentence += " it could have <span class='good_t'>zero cases by <span class='wn'>" + data.trend_7['reach']  + "</span>.";

      } else { 

         // We need to compute the Herd Immunity for both trends
         herd_immunity_info  = get_herd_immunity_info(data,-1, phantom);
 
         
         if(herd_immunity_info.trend_7.herd_immunity_date == herd_immunity_info.trend_14.herd_immunity_date) {
            top_sentence = "Based on the latest trends,<br>" +  data.name;
            top_sentence += " could reach <span class='ugly_t'>herd immunity around"
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span></span>.";
         } else if( herd_immunity_info.trend_7.herd_immunity_date < herd_immunity_info.trend_14.herd_immunity_date ) {
            top_sentence = "Based on the latest trends,<br>" +  data.name;
            top_sentence += " could reach <span class='ugly_t'>herd immunity between"
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date) + "</span> and ";
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span>";
            top_sentence += "</span>.";
         } else {
            top_sentence = "Based on the latest trends,<br>" +  data.name;
            top_sentence += " could reach <span class='ugly_t'>herd immunity between"
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_14.herd_immunity_date) + "</span> and ";
            top_sentence += " <span class='wn'>" + dateFormatMITFromDate(herd_immunity_info.trend_7.herd_immunity_date) + "</span>";
            top_sentence += "</span>.";
          }
 

      }

       // Fill Top Table
       fill_top_table(data, phantom, herd_immunity_info);
       

   }


   // Create top Sentence
   $('#top_summary').html("<div id='sum_main'>"+top_sentence+"</div>"); 
 
} 

function createSummary(data) {
  var phantom = 1/4;
  create_top_page(data, phantom);
}