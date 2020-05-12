 

function show_loader() {
   $('body').addClass('wait');
   $('.box, .metric, #summary, .bad_d,  #results, #std').css('visibility','hidden'); 
   $('.outcome tbody').html('');
   $('#loader').css('display','block');
}

function hide_loader(show_graphs) {
  if(typeof show_graphs == "undefined" ) show_graphs=true;
  if(show_graphs) $('.box, .metric, #summary,  .bad_d, #results, #std').css('visibility','visible');
  $('body').removeClass('wait');
  $('#loader').css('display','none');
  $('#state_select').css('display','block');
}

function reset() {
   var init_mort = parseFloat($('#init_mortality').val())*100;
   $('#herd_thresh').val(60);
   $('#calc_phantom').val(4);
   $('#calc_mortality').val(init_mort.toFixed(2));
}
 
/**
 * Fill County Selector
 */
function countySelect(p, state) {
   var sel = "<select id='county_selector'><option value='ALL'>All Counties</option>"
   var sortable = [];
   var all_counties = [];

   for (var key in p) {
      if (p.hasOwnProperty(key)) {
         sortable.push([key, p[key]]) 
      }
   } 
   sorted = sortable.sort(function(a,b) {
      return b[1] - a[1];
   }); 
   for (i = 0; i <= sorted.length-1; i++) { 
         sel += "<option value=\"" + sorted[i][0] + "\">" + sorted[i][0] + " (" + usFormat(sorted[i][1]) + " cases)</option>\n";
         all_counties.push(sorted[i][0]);
   }

   sel += "<input type=hidden id='state' value='" + state + "'></select>";
   $('#county_select').change(function() {change_county()});
   $('#county_select').html(sel);
} 