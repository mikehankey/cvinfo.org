 

function show_loader() {
   $('body').addClass('wait');
   $('.box, .metric, #summary, .bad_d,  #results').css('visibility','hidden'); 
   $('.outcome tbody').html('');
   $('#loader').css('display','block');
}

function hide_loader(show_graphs) {
  if(typeof show_graphs == "undefined" ) show_graphs=true;
  if(show_graphs) $('.box, .metric, #summary,  .bad_d, #results').css('visibility','visible');
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


// Recreate Gauges for Summary
function createSvg() {
   $('#forecast .14days,#forecast .7days').html('\
      <svg viewBox="0 0 1000 500">\
         <path d="M 950 500 A 450 450 0 0 0 50 500"></path>\
         <text class="title" text-anchor="middle" alignment-baseline="middle" x="500" y="240" font-size="90" font-weight="normal"></text>\
         <text class="percentage" text-anchor="middle" alignment-baseline="middle" x="500" y="395" font-size="145" font-weight="bold"></text>\
         </svg><div class="trend">14-Day trend</div>');
   $("#forecast .7days .trend").text("7-Day trend");
} 


