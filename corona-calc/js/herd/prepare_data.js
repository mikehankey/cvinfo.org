var default_non_tracked_factor = 4; 
var default_herd_immunity_treshold = 70; // % of the population
var max_day_to_compute = 365*5;
var cur_all_data;

// Return the mean of an array
function mean(ar) {
   if( ar.length>0) {
      var total = 0;
      for(var i = 0; i < ar.length; i++) {
         total += ar[i];
      }
      return  total / ar.length;
   } else {
      return 0;
   }
}

// Get a sub array from an array
var last = function(array, n) {
   return array.slice(Math.max(array.length-n,0));
}


// Utils for date
Date.prototype.addDays = function(days) {
   var date = new Date(this.valueOf());
   date.setDate(date.getDate() + days);
   return date;
}
Date.prototype.removeDays = function(days) {
   var date = new Date(this.valueOf());
   date.setDate(date.getDate() - days);
   return date;
}


// Replace the value in the form by the default value 
// if the user didn't enter specific data
function fill_values(name,value) {
   var cur_input_val = $('#'+name).val();

   // Init value (yeah... each time not optimized)
   $('input[name=init_'+name+']').val(value);

   if(cur_input_val == "" || $('input[name=init_'+name+']').val() != value ) {
      $('#'+name).val(value);
   }  
} 

// Return the X day averages values (X and Y)
// ex: get_X_day_average(7,data,'cases') => the 7 day average data
function get_X_day_average(max_day,data,_type) {
   var tempValForAvg = [], tempValFormax_day = [], all_x_avg = [], all_y_avg = [];
 
   $.each(data,function(d,v) {
  
      var date = Object.keys(v)[0];
      tempValForAvg.push(v[date][_type]); 
 
      if(tempValForAvg.length < max_day ) {
         tempValFormax_day = tempValForAvg; 
      } else {
         tempValFormax_day = last(tempValForAvg,max_day)
      }

      all_x_avg.push(date);
      if(mean(tempValFormax_day)>=0) {
         all_y_avg.push(mean(tempValFormax_day))
      } else {
         all_y_avg.push(0)
      }
     
   }) 

   return {'x': all_x_avg, 'y': all_y_avg }
}


// For the Daily growth, we use the 7 day average values of the cases
function get_daily_growth(data) {

   var seven_davg = get_X_day_average(7,data['stats'],'cases');

   // We get the case growth form the latest date & latest date - 1
   var last_update_val = seven_davg['y'][seven_davg['y'].length-1];
   var prev_update_val = seven_davg['y'][seven_davg['y'].length-2];

   if(prev_update_val>0) {
      return (last_update_val-prev_update_val)/prev_update_val*100
   } else {
      return 0
   } 
}

// Mortality Rate
function get_mortality_rate(data) {
   
   var total_cases   =  data['sum']['cur_total_cases'];
   var total_deaths  =  data['sum']['cur_total_deaths'];
   
   if(total_cases>0) {
      return total_deaths/total_cases*100;
   } else {
      return 0;
   }
}


// Fill Form & Details values 
// based on the user selected state
function fill_data_for_state(data) {

   // Population
   fill_values("pop",data['sum']['pop']);
   $('input[name=init_pop]').val(usFormat(data['sum']['pop']));

   // Non-Tracked Factor
   fill_values("non_tracked_factor",default_non_tracked_factor);

   // Currently # of cases
   fill_values("total_infected",parseInt(data['sum']['cur_total_cases'])); 
   $('#total_infected_val').text(usFormat(data['sum']['cur_total_cases']));

   // Daily Case Growth
   var daily_cg = get_daily_growth(data); 
   fill_values("new_case_growth_per_day",daily_cg<=1?2:daily_cg.toFixed(2));

   // Mortality Rate
   var mortality_rate = get_mortality_rate(data); 
   fill_values("mortality_rate",parseFloat(mortality_rate)<=.5?.6:mortality_rate.toFixed(2));
     
  
   fill_values("non_tracked_factor",default_non_tracked_factor);
   fill_values("herd_immunity_threshold",default_herd_immunity_treshold);
 
   $('input[name=last_day_of_data]').val(data['sum']['last_update']);  
   $('input[name=current_dead]').val(data['sum']['cur_total_deaths']);

}

// Update "explained" value on the form
function update_explained() {
   $('label[for=non_tracked_factor]').find('span.explained').text($('#non_tracked_factor').val());
   $('label[for=herd_immunity_threshold]').find('span.explained').text($('#herd_immunity_threshold').val());
}


// Setup reset button
function reset_reset_button() {
   $('#reset_herd').unbind('click').click(function() {
      $.each($('.inttv'), function(i,v){
         var id   = $(v).attr('name');
         var val  = $(v).val();
        
         // We remove init_ to get the ID on the form
         id = id.substring(5, id.length);
         $('#'+ id).val(val);

         // Recalculate
         $('#recalculate').click();
      });
   });
}

function prepare_data(all_data) {
  
   var json_data  = all_data['data'];
   var state_code = all_data['state_code'];
   var state_name = all_data['state_name'];
   var county     = all_data['county'];
   

   cur_all_data = all_data;

   if(county=="0") {
      fill_data_for_state(json_data);
      name_to_display = $('#state_selector option:selected').text();
   } else {
      fill_data_for_county(json_data,county);
      if(county.toLowerCase().indexOf("city") !== -1) {
         name_to_display+= county ;
      } else {
         name_to_display+= county + ", " + state ;
      }
   }

   update_explained(); // UI
   reset_reset_button();   // Reset button

   // So nice to have the enter key working fine
   $('input').on("keypress", function(e) { 
      if (e.keyCode == 13) {
         $('#recalculate').click();
         return false;
      }
   });

   compute_data_for_herd(state_code,county,name_to_display)

}

 