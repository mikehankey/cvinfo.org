/**
 * Get county list + # of cases at day-1
 * from State and fill the related select element
 * @param {*} json_data 
 */
function getAllCounties(json_data) {
   var counties = json_data['county_stats'];
   var county_list = {}, all_cases;

   $.each(counties, function(key,vals) { 
      if(key!=='Unknown') {
         county_list[key] = vals.county_stats[vals.county_stats.length-1].cases;
      }
   })
 
   return county_list;
}

/**
 * Compute & Display analysis
 * @param {*} json_data 
 */
function displayData(json_data ,state,county) {
 
   var ctype = "state";                                        // Default
   var state_name = json_data['summary_info'].state_name;
   var state_code = json_data['summary_info'].state_code; 
   var state_total_cases = json_data['summary_info'].cases; 
   var sum_info = json_data['summary_info'];

   var state_pop = json_data['summary_info'].state_population * 1000000; // Default - State pop
   var ss = json_data['state_stats'];                                     // Default - State stats
 
      
   if (typeof(county) === 'undefined' || $.trim(county)=='') {
      // If no county is selected, we get the stats for all state
      full_state_name = state_name; 
      county = "ALL";
   } else { 
      // If one county is selected, we update the default values
      state_pop = json_data['county_pop'][county];
      ss = json_data['county_stats'][county]['county_stats'];
      
      // County / City names
      if (county.toLowerCase().indexOf("city") === -1) {   full_state_name = county + " County, " + state_code;   }
      else {   full_state_name = county + ", " + state_code;   }
      ctype = "county"
   }
 
 
   var date_vals = [];
   var zero_day_vals = [];
   var total_cases_vals = [];
   var new_cases_vals = [];
   var new_deaths_vals = [];
   var case_growth_vals = [];
   var death_growth_vals = [];
   var decay_vals = [];
   var test_vals = [];
   var mortality_vals = [];

   var zd = 0;
   var last_growth = 0;

   // Prepare all data
   var last_tests = 0;
   
   var last_county_mortality = 0;

   ss.forEach(function (arrayItem) {
      if (typeof(arrayItem.date) != "undefined") {
         date_vals.push(arrayItem.date);
         this_date = arrayItem.date
         test_pd = arrayItem.tests - last_tests
         test_vals.push(test_pd)
         last_tests = arrayItem.tests
      }
      else {
         // county record here
         date_vals.push(arrayItem.day.replace(/-/g,""));
         this_date = arrayItem.day.replace(/-/g,"") 
      }
      zero_day_vals.push(zd);
      total_cases_vals.push(arrayItem.cases);
      last_cases = arrayItem.cases
      last_deaths = arrayItem.deaths
      new_cases_vals.push(arrayItem.new_cases);
      new_deaths_vals.push(arrayItem.new_deaths);

      if (typeof(arrayItem.cg_last) != "undefined") {
         case_growth_vals.push(arrayItem.cg_last);
         death_growth_vals.push(arrayItem.dg_last);
         decay = arrayItem.cg_last - last_growth
         last_growth = arrayItem.cg_last 
      } else {
         case_growth_vals.push(arrayItem.case_growth);
         death_growth_vals.push(arrayItem.death_growth);
         decay = arrayItem.case_growth - last_growth
         last_growth = arrayItem.case_growth
      }

      mortality_vals.push(arrayItem.mortality);
      zd = zd + 1
      last_date = this_date 
      decay_vals.push(decay);
      last_county_mortality = arrayItem.mortality;
   });

 
   
   // We take the last county mortality into account note that for the state, it's the same
   var mortality = last_county_mortality/100;
   $("#init_mortality").val(mortality); 

   // If the user entered another value, we take it into account instead
   if($('#calc_mortality').val() !== "" && parseFloat($('#calc_mortality').val())!==0) { 
      mortality = parseFloat($('#calc_mortality').val()/100);  
   }
   
   $('#calc_mortality').val((mortality*100).toFixed(2));
    
   // make some JS dates
   js_dates = convert_zero_day_to_date(total_cases_vals, date_vals)
   // important dates are
   // first case date for area being examined
   // national lock down date 
   // reopen protests dates
   // other important / interesting dates
   // these dates will be marked with a line on the graph
   // so we can see the impact of events on data

   nc_org = new_cases_vals.slice();
   nc_org2 = new_cases_vals.slice();
   zdv = zero_day_vals.slice();

   fit_days = 14;
 
   zdv2 = zero_day_vals.slice();
   zdv3 = zero_day_vals.slice();
   zdv4 = zero_day_vals.slice();
   zdv5 = zero_day_vals.slice();
   zdv6 = zero_day_vals.slice();

   // Growth
   model_data = []
   title = "<b>" + full_state_name  + " - Growth</b><br> per day since first case";
   out = makeGraph(zdv, case_growth_vals,title, "days since first case", "Growth", "growth_div", fit_days, 60,[])
    
   // New Deaths
   title = "<b>" + full_state_name  + " - New Deaths</b><br> per day since first case";
   pred = makeGraph(zdv2, new_deaths_vals,title, "Days since first case", "New Deaths", "new_deaths_div", fit_days, 60,[]);
  
   // Death Growth
   title = "<b>" + full_state_name  + " - Death Growth</b><br> per day since first case";
   out2 = makeGraph(zdv3, death_growth_vals,title, "Days since first case", "Death Growth", "deaths_growth_div", fit_days, 60,[])

   // Growth Decay
   title = "<b>" + full_state_name  + " - Growth Decay</b><br> per day since first case";
   fitsObj = getFits(zdv4, decay_vals); 
   out2 = plot_data_line(zdv4, decay_vals,fitsObj['ys2'], fitsObj.ys3, fitsObj.ys4, fitsObj.exp_ys, "Days since first case", "Growth Decay", title, "decay_div", "line")

   // Tests
   if (ctype == 'state') {
      title = "<b>" + full_state_name  + " - Tests per day</b><br> per day since first case";
      out2 = makeGraph(zdv2, test_vals ,title, "Days since first case", "Tests per day", "test_div", fit_days, 60,model_data)
   }

   // Mortality
   fitsObj = getFits(zdv5, mortality_vals)
   title = "<b>" + full_state_name  + " - Mortality</b><br> per day since first case"; 
   out2 = plot_data_line(zdv5, mortality_vals,fitsObj['ys2'], fitsObj.ys3, fitsObj.ys4, fitsObj.exp_ys, "Days since first case", "Mortality Percentage", title, "mortality_div", "line")

   var total_cases = new_cases_vals.reduce(function(a, b){  return a + b;  }, 0);
   var total_deaths = new_deaths_vals.reduce(function(a, b){  return a + b;  }, 0);

   phantom = parseFloat(document.getElementById("calc_phantom").value )
   herd_thresh = parseFloat(document.getElementById("herd_thresh").value/100 )
   current_zero_day = nc_org2.length

   // This is the MAIN summary at the top of the page.
   MIT = json_data['model_data']['MIT']
   LA = json_data['model_data']['MIT']

   if (county != "ALL") {
      county_perc = (total_cases / state_total_cases )
   }
   else {
      county_perc = 1
   }
   
   
   fr = forecast(zdv6,nc_org2,total_cases,total_deaths,mortality,phantom,state_pop,current_zero_day,herd_thresh,MIT,LA,county_perc);

   if (county == "ALL") {
      total_cases = json_data['summary_info']['cases']
      total_deaths = json_data['summary_info']['deaths']
   }
   else {
      county_stats = json_data['county_stats'][county]['county_stats']
      last = county_stats.length - 1
      total_cases = county_stats[last].cases
      total_deaths= county_stats[last].deaths

   }
   

   document.getElementById("calc_mortality").value = (mortality*100).toFixed(2)
   document.getElementById("f_xs").value = zdv6
   document.getElementById("f_ys").value = nc_org2 
   document.getElementById("f_total_cases").value = total_cases
   document.getElementById("f_total_deaths").value = total_deaths
   document.getElementById("f_state_pop").value = state_pop 
   document.getElementById("f_current_zero_day").value = current_zero_day 
   document.getElementById("f_state_name").value = state_name
   document.getElementById("f_county").value = county;

   $('#f_mortality').val(mortality); 

   // See corona-ui-data.js
   sum_info['cases'] = total_cases 
   sum_info['deaths'] = total_deaths 
   sum_info['total_infected'] = total_cases * phantom
   sum_info['not_infected'] = state_pop - ((total_cases * phantom)  + total_cases + last_deaths)
   document.getElementById("f_total_infected").value = sum_info['total_infected'] 
   document.getElementById("f_not_infected").value = sum_info['not_infected'] 
   document.getElementById("f_cases").value = last_cases 
   document.getElementById("f_deaths").value = last_deaths


   // We are near the end so we're missing data
   if(typeof fr['7_day'].total_dead  == "undefined" ) {
      fr['7_day'].total_dead  = sum_info.deaths;
   }

   if(typeof fr['14_day'].total_dead  == "undefined" ) {
      fr['14_day'].total_dead  = fr['7_day'].total_dead;
   }
   
   if(typeof fr['7_day'].total_cases  == "undefined" ) {
      fr['7_day'].total_cases  = sum_info.cases;
   }

   if(typeof fr['14_day'].total_cases  == "undefined" ) {
      fr['14_day'].total_cases  = fr['7_day'].total_cases;
   }

   if(typeof fr['7_day'].total_infected  == "undefined" ) {
      fr['7_day'].total_infected  =  herd_thresh * fr['7_day'].total_cases;
   }

   if(typeof fr['14_day'].total_infected  == "undefined" ) {
      fr['14_day'].total_infected  =  herd_thresh * fr['14_day'].total_cases;
   }

   if(typeof fr['7_day'].not_infected  == "undefined" ) {
      fr['7_day'].not_infected  = state_pop - fr['7_day'].total_infected - fr['7_day'].total_cases - fr['7_day'].total_dead;
   }

   if(typeof fr['14_day'].not_infected  == "undefined" ) {
      fr['14_day'].not_infected  =  state_pop - fr['14_day'].total_infected - fr['14_day'].total_cases - fr['14_day'].total_dead;
   }
 
   // add model data to these graphs
   title = "<b>" + full_state_name  + " New Cases</b><br>per day since first case"; 
   makeGraph(zero_day_vals, nc_org, title, "Days since first case", "New Cases", "new_cases_div", fit_days, 60,fr['MIT']['ys']);

 
   fillSummary(full_state_name,fr,sum_info);
   
   $('body').removeClass('wait');
   hide_loader();
   $('#recalculate').html($('#recalculate').attr('data-htmlx'));
   $('#recalculate').removeAttr('data-htmlx');

}






function extraPoints(data,polyReg) {
name = "polynomial"
var extrapolatedPts = [];
for(var i = 0; i < data.length; i++){
   var val = data[i][0];
   switch(name){
   case "polynomial":
       extrapolatedPts.push({x: val, y: polyReg.equation[2] * Math.pow(val,2) + polyReg.equation[1] * val + polyReg.equation[0]});
       break;
   case "exponential":
       extrapolatedPts.push({x: val, y: expoReg.equation[0] * Math.exp(val * expoReg.equation[1])}); //or use numbers.js per https://gist.github.com/zikes/4279121, var regression = numbers.statistic.exponentialRegression(pts);
       break;
   case "power":
       extrapolatedPts.push({x: val, y: powReg.equation[0] * Math.pow(val,powReg.equation[1])});
       break;
   case "logarithmic":
       extrapolatedPts.push({x: val, y: logReg.equation[0] + logReg.equation[1] * Math.log(val)});
       break;
   case "linear":
   default:
       extrapolatedPts.push({x: val, y: linReg.equation[0] * val + linReg.equation[1]});
   }
}
return extrapolatedPts;
}






 


