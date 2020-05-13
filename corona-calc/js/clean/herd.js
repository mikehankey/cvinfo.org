var default_non_tracked_factor = 4; 
var default_herd_immunity_treshold = 70; // % of the population
var max_day_to_compute = 365*5;          // If it's in more than 5 years, we stop computing

// Replace the value in the form by the default value 
// if the data entered isn't valid
function replace_invalid_data(name,value,type) {
   var cur_input_val = $('#'+name).val();

   if(cur_input_val == "" ) {
      console.log("NAME ", name ,  " is empty");
      $('#'+name).val(value);
   } 

   // Init value (yeah... each time not optimized)
   $('input[name=init_'+name+']').val(value);

}


// Fill the values on the form 
// if they don't correspond to the initial value and they aren't valid
function fill_data_for_state(data) {
  replace_invalid_data("pop",data.summary_info.state_population*1000000,"int");
  replace_invalid_data("total_infected",data.summary_info.cases,"int"); 
  replace_invalid_data("new_case_growth_per_day",parseFloat(data.summary_info.cg_last)<=1?5:data.summary_info.cg_last,"float");
  replace_invalid_data("mortality_rate",parseFloat(data.summary_info.mortality)<=.5?2:data.summary_info.mortality,"float");
  replace_invalid_data("non_tracked_factor",default_non_tracked_factor,"float");
  replace_invalid_data("herd_immunity_threshold",default_herd_immunity_treshold,"float");

  $('input[name=last_day_of_data]').val(dateFormat(data.summary_info.state_data_last_updated));  
  $('input[name=current_dead]').val(data.summary_info.deaths);
}

// County_version 
// Fill the values on the form 
// if they don't correspond to the initial value and they aren't valid
function fill_data_for_county(data,county) {

   var count_stats = data.county_stats[county];
    
   replace_invalid_data("pop",count_stats.population,"int");

   count_stats = data.county_stats[county].county_stats[data.county_stats[county].county_stats.length-1];

   console.log("case_growth ", )
   console.log(parseFloat(count_stats.case_growth)<=1?5:data.summary_info.cg_last);

   replace_invalid_data("total_infected",count_stats.cases,"int");
   //replace_invalid_data("new_case_per_day",count_stats.new_cases,"int");
   replace_invalid_data("new_case_growth_per_day",parseFloat(count_stats.case_growth)<=1?5:count_stats.case_growth,"float");
   replace_invalid_data("mortality_rate",parseFloat(count_stats.mortality)<=.5?2:count_stats.mortality,"float");
   replace_invalid_data("non_tracked_factor",default_non_tracked_factor,"float");
   replace_invalid_data("herd_immunity_threshold",default_herd_immunity_treshold,"float");

   $('input[name=last_day_of_data]').val(count_stats.day);  
   $('input[name=current_dead]').val(count_stats.deaths);

 }


// Update "explained" value on the form
function update_explained() {
   $('label[for=non_tracked_factor]').find('span.explained').text($('#non_tracked_factor').val());
   $('label[for=herd_immunity_threshold]').find('span.explained').text($('#herd_immunity_threshold').val());
}


// Warning, the name of this function is the same 
// than for the main page - see the list of js included on indexV.html vs herd_immunity_calculator.html
function new_display_data(result, state, county) {

   if(county=="" || county=="ALL") {
      fill_data_for_state(result);
   } else {
      fill_data_for_county(result,county);
   }

   update_explained(); // UI 
   compute_data_for_herd(state,county);
}

// Compute & Display data for Herd Immunity Computation
function compute_data_for_herd(state,county) {

   var herd_met                  = false;
   var how_many_days_until_herd  = 0;
   var impacted = 0; 

   var deads                     = parseInt($('input[name=current_dead]').val());
   var pop                       = parseInt($('#pop').val());
   var total_infected            = parseInt($('#total_infected').val());
   //var new_case_per_day          = parseInt($('#new_case_per_day').val());
   var new_case_growth_per_day   = parseFloat($('#new_case_growth_per_day').val());
   var mortality_rate            = parseFloat($('#mortality_rate').val());
   var non_tracked_factor        = parseFloat($('#non_tracked_factor').val());
   var herd_immunity_threshold   = parseFloat($('#herd_immunity_threshold').val());
   
   var new_day_cases = 0;
   var non_tracked = 0;
   
   while(!herd_met) {

      new_day_cases = (total_infected * new_case_growth_per_day / 100);  

      // Newly infected based on growth per day
      total_infected += new_day_cases;  
 
      non_tracked = total_infected *non_tracked_factor;
       
      // Total deaths
      deads = total_infected * (mortality_rate/100);
       
      // % of the pop impacted
      impacted = ((total_infected + non_tracked + deads)/pop)*100;
      
      if(impacted >= herd_immunity_threshold || how_many_days_until_herd >  max_day_to_compute) {
         herd_met = true;
      }

      how_many_days_until_herd++;
 
   }


   display_top_results(state,county,how_many_days_until_herd,deads,total_infected);
   
}


function display_top_results(state,county,how_many_days_until_herd,deads,total_infected) {
   var top_sentence = "Based on the current data,<br><span class='ugly_t'>";
   var last_day, tbody= "";

   var start_deads                     = parseInt($('input[name=current_dead]').val());
   var start_pop                       = parseInt($('#pop').val());
   var start_total_infected            = parseInt($('#total_infected').val());
   //var new_case_per_day          = parseInt($('#new_case_per_day').val());
   var start_new_case_growth_per_day   = parseFloat($('#new_case_growth_per_day').val());
   var start_mortality_rate            = parseFloat($('#mortality_rate').val());
   var start_non_tracked_factor        = parseFloat($('#non_tracked_factor').val());
   var start_herd_immunity_threshold   = parseFloat($('#herd_immunity_threshold').val());
   var increase;

   // Compute death increase
   increase = start_deads>0? usFormat(parseInt(( ( deads - start_deads ) / start_deads ) * 100)) + "%":"n/a";

   if(county == "" || county == "ALL") {
      top_sentence += $('#state_selector option:selected').text();
   } else {
      if(county.indexOf("city") !== -1) {
         top_sentence+= county ;
      } else {
         top_sentence+= county + ", " + state ;
      }
   }
   
   top_sentence += " could reach herd immunity ";

   if( how_many_days_until_herd >  max_day_to_compute) {
      top_sentence += " in more than five years.";
   } else {
      // Compute the end date form last date of data
      last_day = new Date( new Date($('input[name=last_day_of_data]').val()));
      last_day.setDate(last_day.getDate() + how_many_days_until_herd); 
      
      top_sentence += "on <span class='wn'>"+dateFormatMITFromDate(last_day) + "</span></span>.";
      $("#day_end").text('on ' + dateFormatMITFromDate(last_day) );
   }

   if(increase !== "n/a")  {
      top_sentence += "<br/>The total cost of herd immunity would be ";
      top_sentence += "<span class='ugly_t'>" + usFormat(parseInt(deads)) + " deaths </span>.";
   }
  

    
   $('#sum_main').html(top_sentence);

   // Fill top table

   // IF death increase is n/a
   if(increase == "n/a" && start_total_infected > 0) {
      increase = start_total_infected>0? usFormat(parseInt(( ( total_infected - start_total_infected ) / start_total_infected ) * 100)) + "%":"n/a";
   }

   tbody = "<tr><th>Total Dead</th><td>"+usFormat(start_deads)+"</td>\
                                   <td>"+usFormat(parseInt(deads))+"</td>\
                                   <td rowspan='2'><strong class='ugly_t'>+"+  increase  +"</strong></td>\
                                   </tr>";
   tbody += "<tr><th>Total Infected</th><td>"+usFormat(start_total_infected)+"</td>\
                                   <td>"+usFormat(parseInt(total_infected))+"</td>\
                                   </tr>";
  
                                   


   $("#sum_table tbody").html(tbody);
 
}

// Redefined change_state to reset the form
function change_state() { 
   cur_json_data = "";
   cur_state = "";
   cur_county = "";
   $("#county_select").html(""); 
   $('input').val('');
   load_data();
}
// Redefined change_county to reset the form
function change_county() {  
   show_loader(false); 
   $('input').val('');
   setTimeout(function() {load_data();},150);
}


 