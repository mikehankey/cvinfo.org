
// Compute & Display data for Herd Immunity Computation
function compute_data_for_herd(state,county,name_to_display) {

   var herd_met                  = false;
   var how_many_days_until_herd  = 0;
    
   var start_data = {
      deads:                     parseInt($('input[name=current_dead]').val()),
      pop:                       parseInt($('#pop').val()),
      total_infected:            parseInt($('#total_infected').val()),
      new_case_growth_per_day:   parseFloat($('#new_case_growth_per_day').val()),
      mortality_rate:            parseFloat($('#mortality_rate').val()),
      non_tracked_factor:        parseFloat($('#non_tracked_factor').val()),
      herd_immunity_threshold:   parseFloat($('#herd_immunity_threshold').val()),
      non_tracked_infected:      parseInt($('#total_infected').val())*parseFloat($('#non_tracked_factor').val()),
      not_infected:              parseInt($('#pop').val())
                                 -parseInt($('#total_infected').val())
                                 -(parseInt($('#total_infected').val())*parseFloat($('#non_tracked_factor').val()))
   }; 
 
 
   var end_data = {}; 
   var new_day_cases = start_data.total_infected;
   var non_tracked = 0;
   var not_infected = 0;
   var impacted = 0; 
   var total_infected = start_data.total_infected;
   var deads = start_data.deads;
   var pop   = start_data.pop;
 

   // For the graphs
   var graph_data_y = {
      new_cases: [start_data.total_infected/start_data.pop],
      non_tracked_infected: [start_data.non_tracked_infected/start_data.pop],
      deads: [start_data.deads/start_data.pop]
   }  
   
   var max_non_tracked_factor_1 = 0;
   var max_non_tracked_factor_2 = 0;

   // In case we reach a % of impacted > 100%, we can take the previous data of the loop 
   // to give an answer
   var previous_data = {}; 
 
   // Validate start data
   if(!validate_start_data(
      [  { name: "Herd Immunity Threshold", cur: start_data.herd_immunity_threshold, max: 100, min: 0 },
         { name: "New Cases growth per day", cur: start_data.new_case_growth_per_day, max: 100, min: 0 },
         { name: "Mortality rate", cur: start_data.mortality_rate, max: 100, min: 0 },
      ]
   )) {
      return false;
   };
 
   // Test if the current non-tracked factor is too high and we go beyond the current total population
   if(    start_data.non_tracked_infected > start_data.pop 
      || (start_data.non_tracked_infected+start_data.total_infected)>start_data.pop 
      || (start_data.total_infected + start_data.non_tracked_infected + start_data.deads)/pop*100 >= start_data.herd_immunity_threshold) {

      // Compute the max non-tracked factor for the current state or county
      max_non_tracked_factor_1 = (start_data.pop - start_data.total_infected - start_data.deads) / start_data.total_infected;
      max_non_tracked_factor_2 = (( start_data.herd_immunity_threshold*pop/100)- start_data.total_infected  -start_data.deads)/start_data.total_infected;

      max_non_tracked_factor_1 = Math.min(max_non_tracked_factor_1,max_non_tracked_factor_2);
 
      Swal.fire({
         icon: 'info',
         title: 'Unrealistic Data',
         html: "The maximum possibly value for the <b>Non-tracked Factor</b> in " + name_to_display + " is <b>" +  parseInt(max_non_tracked_factor_1) + "</b>.<br><br>\
         If the non-tracked is " +  parseInt(max_non_tracked_factor_1) + " <b>it means 100% of the population is already infected</b>.\
         Since new cases are still being added, this value is not possible.<br><br><b>Please lower the Non-tracked Factor.</b>" 
      });

      return false;
   } 
    
   while(!herd_met) {

      previous_data = {
         deads: deads,
         total_infected: total_infected,
         not_infected: not_infected,
         non_tracked_infected: non_tracked,
         how_many_days_until_herd: how_many_days_until_herd,
         impacted: impacted 
      }
      
      // Newly infected based on growth per day
      new_day_cases =  total_infected * start_data.new_case_growth_per_day / 100;  
     
      // New Total Infected (tracked)
      total_infected += new_day_cases;  

      // Push new daily cases in % of the population
      graph_data_y.new_cases.push(total_infected/start_data.pop);
      
      // New Non Tracked Infected
      non_tracked = total_infected * start_data.non_tracked_factor;
      graph_data_y.non_tracked_infected.push(non_tracked/start_data.pop);
      
      // Total deaths
      deads = total_infected * (start_data.mortality_rate/100);
      graph_data_y.deads.push(deads/start_data.pop);
      
      // % of the pop impacted
      impacted = ((total_infected + non_tracked + deads)/pop)*100;

      if(impacted>100) {

         Swal.fire({
            icon: 'info',
            title: 'Unrealistic Data',
            html:  "<b>The current data you entered don't allow us to compute a realistic Herd Immunity date.</b><br/><br/>\
                   Based on your data, the Herd Immunity could be reached somewhere around " +  dateFormatMITFromDate(new Date($('input[name=last_day_of_data]').val()).addDays(previous_data.how_many_days_until_herd)) +"\
                   but we cannot give you more details.<br><br><b>Please, enter more realstic data.</b>" 
         });
          
   
         return false;
      }
  
      if(impacted >= start_data.herd_immunity_threshold || how_many_days_until_herd >  max_day_to_compute) {
         herd_met = true;
      } else {
         how_many_days_until_herd++;
      }

      // BIG FLOW HERE: WE HAVE A CONSTANT POPULATION!
      // pop = pop - deads; 
      
   }

   not_infected = pop - total_infected - non_tracked - deads;

   end_data = {
      deads:                  deads,
      pop:                    pop,
      total_infected:         total_infected,
      not_infected:           not_infected,
      non_tracked_infected:   non_tracked
   }

   display_top_results(state,county,how_many_days_until_herd,start_data,end_data,name_to_display, graph_data_y);
 
 
}