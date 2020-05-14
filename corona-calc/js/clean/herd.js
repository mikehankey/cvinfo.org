var default_non_tracked_factor = 4; 
var default_herd_immunity_treshold = 70; // % of the population
var max_day_to_compute = 365*5;          // If it's in more than 5 years, we stop computing


// Utils for date
Date.prototype.addDays = function(days) {
   var date = new Date(this.valueOf());
   date.setDate(date.getDate() + days);
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

// Fill the values on the form 
// if they don't correspond to the initial value and they aren't valid
function fill_data_for_state(data) {

   fill_values("pop",data.summary_info.state_population*1000000);
   // For ui
   $('#pop_val').text(usFormat(data.summary_info.state_population*1000000));

   fill_values("total_infected",parseInt(data.summary_info.cases)); 
   // For ui
   $('#total_infected_val').text(usFormat(data.summary_info.cases));

   fill_values("non_tracked_factor",default_non_tracked_factor);
    
   // Case Growth (if<=1, we put 2)
   fill_values("new_case_growth_per_day",parseFloat(data.summary_info.cg_last)<=1?2:data.summary_info.cg_last);
  
   // Mortality Rate (if<=.5, we put .6)
   fill_values("mortality_rate",parseFloat(data.summary_info.mortality)<=.5?.6:data.summary_info.mortality);
  
   fill_values("non_tracked_factor",default_non_tracked_factor);
   fill_values("herd_immunity_threshold",default_herd_immunity_treshold);

 
   $('input[name=last_day_of_data]').val(dateFormat(data.summary_info.state_data_last_updated));  
   $('input[name=current_dead]').val(data.summary_info.deaths);
}

// County_version 
// Fill the values on the form 
// if they don't correspond to the initial value and they aren't valid
function fill_data_for_county(data,county) {

   var count_stats = data.county_stats[county];

   fill_values("pop",count_stats.population);
   // For ui
   $('#pop_val').text(usFormat(count_stats.population));

   // Now we need the last day stats for the county
   count_stats = data.county_stats[county].county_stats[data.county_stats[county].county_stats.length-1];

   fill_values("total_infected",parseInt(count_stats.cases)); 
   // For ui
   $('#total_infected_val').text(usFormat(count_stats.cases));

   fill_values("non_tracked_factor",default_non_tracked_factor);
   
   // Case Growth (if<=1, we put 2)
   fill_values("new_case_growth_per_day",parseFloat(count_stats.case_growth)<=1?2:count_stats.case_growth);

   // Mortality Rate (if<=.5, we put .6)
   fill_values("mortality_rate",parseFloat(count_stats.mortality)<=.5?2:count_stats.mortality);

   fill_values("herd_immunity_threshold",default_herd_immunity_treshold);
 
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
   var name_to_display = "";
 
   if(county=="" || county=="ALL") {
      fill_data_for_state(result);
   } else {
      fill_data_for_county(result,county);
   }

   update_explained(); // UI 


   // Name to display
   if(county == "" || county == "ALL") {
      name_to_display = $('#state_selector option:selected').text();
   } else { 
      if(county.toLowerCase().indexOf("city") !== -1) {
         name_to_display+= county ;
      } else {
         name_to_display+= county + ", " + state ;
      }
   }


   compute_data_for_herd(state,county,name_to_display);
}


// Display Error
function show_error(text) {
   $('<div class="error">'+text+'</div>').appendTo($('#forecast_container'));
}

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

   // Validate the start_data
   if(start_data.new_case_growth_per_day<=0 || start_data.new_case_growth_per_day>50) {
      swal({
         title: "WRONG DATA",
         text: "Please, enter a realistic New Cases growth per day (between 0.1% and 50%)",
         icon: "error", 
         dangerMode: true,
       });
       return false;
   }

 
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

   // Test if the current non-tracked factor is too high and we go beyond the current total population
   if(    start_data.non_tracked_infected > start_data.pop 
      || (start_data.non_tracked_infected+start_data.total_infected)>start_data.pop 
      || (start_data.total_infected + start_data.non_tracked_infected + start_data.deads)/pop*100 >= start_data.herd_immunity_threshold) {

      // Compute the max non-tracked factor for the current state or county
      max_non_tracked_factor_1 = (start_data.pop - start_data.total_infected - start_data.deads) / start_data.total_infected;
      max_non_tracked_factor_2 = (( start_data.herd_immunity_threshold*pop/100)- start_data.total_infected  -start_data.deads)/start_data.total_infected;

      max_non_tracked_factor_1 = Math.min(max_non_tracked_factor_1,max_non_tracked_factor_2);

      swal({
         title: "WRONG DATA",
         text: "The maximum possibly value for the non-tracked factor in " + name_to_display + " is " +  max_non_tracked_factor_1.toFixed(2)+ ".\
               If the non-tracked is " +  max_non_tracked_factor_1.toFixed(2)+ " it means 100% of the population is already infected.\
               Since new cases are still being added, this value is not possible.\n\nPlease lower the non-tracked factor.",
         icon: "error", 
         dangerMode: true,
       });

      return false;
   } 
    
   while(!herd_met) {
      
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
         swal({
            title: "WRONG DATA",
            text: "The current data you entered don't allow us to compute a realistic herd immunity date.",
            icon: "error", 
            dangerMode: true,
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

 


function fill_top_table(herd_immunity_reached_day,start_data,end_data) {
   var tbody = ""; 
 
   // For having 100% total despite the round
   var perc_not_infected_start = 100;
   var per_start = [];
   var per_end = [];
   var temp_per_start, temp_per_end;
   perc_not_infected_end = perc_not_infected_start;
  
   // Date on table head
   $(".day_end").text('on ' + dateFormatMITFromDate(herd_immunity_reached_day) );

   temp_per_start = parseFloat(start_data.deads*100/start_data.pop).toFixed(2);
   temp_per_end = parseFloat(end_data.deads*100/end_data.pop).toFixed(2);

   per_start.push(temp_per_start);
   per_end.push(temp_per_end);

   tbody += "<tr><th>COVID-19 Deaths</th>\
                 <td>"+usFormat(start_data.deads)+"</td>\
                 <td>"+temp_per_start+"%</td>\
                 <td>"+usFormat(parseInt(end_data.deads))+ "</td>\
                 <td>"+temp_per_end+"%</td></tr>";

   temp_per_start = parseFloat(start_data.total_infected*100/start_data.pop).toFixed(2);
   temp_per_end   = parseFloat(end_data.total_infected*100/end_data.pop).toFixed(2);

   per_start.push(temp_per_start);
   per_end.push(temp_per_end);

   tbody += "<tr><th>Confirmed Infected people</th>\
                <td>"+usFormat(start_data.total_infected)+"</td>\
                <td>"+parseFloat(start_data.total_infected*100/start_data.pop).toFixed(2)+"%</td>\
                <td>"+usFormat(parseInt(end_data.total_infected))+"</td>\
                <td>"+parseFloat(end_data.total_infected*100/end_data.pop).toFixed(2)+"%</td></tr>";
   
   temp_per_start = parseFloat(start_data.non_tracked_infected*100/start_data.pop).toFixed(2);
   temp_per_end   = parseFloat(end_data.non_tracked_infected*100/end_data.pop).toFixed(2);

   per_start.push(temp_per_start);
   per_end.push(temp_per_end);

   tbody += "<tr><th>Non-Tracked Infected people</th>\
               <td>"+usFormat(parseInt(start_data.non_tracked_infected))+"</td>\
               <td>"+parseFloat(start_data.non_tracked_infected*100/start_data.pop).toFixed(2)+"%</td>\
               <td>"+usFormat(parseInt(end_data.non_tracked_infected))+"</td>\
               <td>"+parseFloat(end_data.non_tracked_infected*100/end_data.pop).toFixed(2)+"%</td></tr>";


   // In order to have really 100% despited the round 
   $.each(per_start, function(i,v) {
      perc_not_infected_start -= parseFloat(v);
   }); 
   $.each(per_end, function(i,v) {
      perc_not_infected_end -= parseFloat(v);
   }); 
   

   tbody += "<tr><th>Non-Infected people</th>\
               <td>"+usFormat(parseInt(start_data.not_infected))+"</td>\
               <td>"+perc_not_infected_start.toFixed(2)+"%</td>\
               <td>"+usFormat(parseInt(end_data.not_infected))+"</td>\
               <td>"+perc_not_infected_end.toFixed(2)+"%</td></tr>";
   
   /*
   tbody += "<tr><th>Non-Infected people</th>\
               <td>"+usFormat(parseInt(start_data.not_infected))+"</td>\
               <td>"+perc_not_infected_start.toFixed(2)+"%</td>\
               <td>"+usFormat(parseInt(end_data.not_infected))+"</td>\
               <td>"+(end_data.not_infected*100/end_data.pop).toFixed(2)+"%</td></tr>";

   /*
   tbody += "<tr><th>Population*</th>\
               <td>"+usFormat(start_data.pop)+"</td>\
               <td>&nbsp;</td>\
               <td>"+usFormat(parseInt(end_data.pop))+"</td>\
               <td>&nbsp;</td></tr>";
   */
   $("#sum_table tbody").html(tbody);


}


function fill_top_sentence(state,county,herd_immunity_reached_day,end_data,name_to_display) {
   var top_sentence = "Based on the current data,<br><span class='ugly_t'>" + name_to_display;
 
   top_sentence += " could reach herd immunity on <span class='wn'>"+dateFormatMITFromDate(herd_immunity_reached_day) + "</span></span>.";
   top_sentence += "<br/>And it could cost <span class='ugly_t'>" + usFormat(parseInt(end_data.deads)) + " deaths </span>";
   if(county !== "" && county !== "ALL") {
      if(name_to_display.toLowerCase().indexOf("city")!==-1) {
         top_sentence += " in the city.";
      } else {
         top_sentence += " in the county.";
      }
     
   } else {
      top_sentence += " in the state.";
   }

   $('#sum_main').html(top_sentence);
}


function create_pies(start_data,end_data,herd_immunity_reached_day) {
   var pie_lb = [ 'Not Infected', 'Infected', 'Confirmed Cases', 'Deaths'];
   plot_pie([start_data.not_infected, start_data.non_tracked_infected, start_data.total_infected,  start_data.deads],pie_lb,"Current","current_pie");
   plot_pie([end_data.not_infected, end_data.non_tracked_infected, end_data.total_infected,  end_data.deads],pie_lb,"On " + dateFormatMITFromDate(herd_immunity_reached_day),"end_pie");

}



function display_top_results(state,county,how_many_days_until_herd,start_data,end_data, name_to_display, graph_data_y) {
   // We compute the herd_immunity day
   var herd_immunity_reached_day_start = new Date($('input[name=last_day_of_data]').val());
   var herd_immunity_reached_day; 
   herd_immunity_reached_day =  herd_immunity_reached_day_start.addDays(how_many_days_until_herd);


   herd_immunity_reached_day_start = new Date($('input[name=last_day_of_data]').val());
   var graph_x = [];

   fill_top_table(herd_immunity_reached_day,start_data,end_data);
   fill_top_sentence(state,county,herd_immunity_reached_day,end_data,name_to_display);
   create_pies(start_data,end_data,herd_immunity_reached_day);

   // Create X for the graphs
   while (herd_immunity_reached_day_start <= herd_immunity_reached_day) {
         graph_x.push(new Date (herd_immunity_reached_day_start));
         herd_immunity_reached_day_start = herd_immunity_reached_day_start.addDays(1);
   }
 
   // We draw the graph
   draw_graph_herd({
      x1: graph_x,
      y1: graph_data_y.new_cases,
      title1: "% of Confirmed Daily Cases",

      x2: graph_x,
      y2: graph_data_y.non_tracked_infected,
      title2: "% of Non Tracked Daily Cases",
      
      x3: graph_x,
      y3: graph_data_y.deads,
      title3: "% of COVID-19 Deaths",

      title: "<b>" + name_to_display + " % of COVID-19 Cases</b>",
      threshold: start_data.herd_immunity_threshold/100,

      el: 'perc_graph',
      el_title: 'perc' 
   });
   
    
 
}

// Redefined change_state to reset the form
function change_state() { 
   cur_json_data = "";
   cur_state = "";
   cur_county = "";
   $("#county_select, .pie_chart h3, .pig_e").html(""); 
   $('input').val('');
   load_data();
}
// Redefined change_county to reset the form
function change_county() {  
   show_loader(false); 
   $(".inout h3, .pie_chart h3,  .pig_e").html(""); 
   $('input').val('');
   setTimeout(function() {load_data();},150);
}


 