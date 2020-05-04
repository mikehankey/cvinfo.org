var init_select_county;



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
   $('#reset').click(function() {
      reset();
      $('#recalculate').trigger('click');
   })
}


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
      // Don't display "Unknown anymore"
      if($.trim(sorted[i][0])!="Unknown"){
         sel += "<option value=\"" + sorted[i][0] + "\">" + sorted[i][0] + " (" + usFormat(sorted[i][1]) + " conf. cases)</option>\n";
         all_counties.push(sorted[i][0]);
      }
   }

   sel += "<input type=hidden id='state' value='" + state + "'></select>"
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

$(function() {
   var cururl, params, selState, possibleStates=[];

   // Once the page is loaded we enable the state select
   $('#state_selector').removeAttr('disabled');
   $('body').removeClass('wait');

   // Create action on state select 
   $('#state_selector').change(function() {change_state();});

   // Creation action on recalculate button
   $('#recalculate').click(function() { 
      $(this).attr('data-htmlx',$(this).html()).html('Computing...');
      $('body').addClass('wait');
      load_data(false); 
   }) 

   // Creation action on reset button
   $('#reset').click(function() {reset(); }) 

   // ... 
   hide_loader(false);

   // Do we have parameters we can work with 
   // We want 
   // coronafiles.us/?MD+Baltimore
   // or 
   // coronafiles.us/?MD
   cururl = decodeURIComponent(window.location.href);
   if(cururl.indexOf('?')>0) {
      selState = cururl.substring(cururl.indexOf('?')+1, cururl.length);

      if(selState.indexOf('+')>0) {
         init_select_county = selState.substring(selState.indexOf('+')+1, selState.length);
         selState = selState.substring(0,selState.indexOf('+')).toUpperCase();
      } else {
         selState = selState.toUpperCase();
      }

      // Get all the possible state value
      $('#state_selector option').each(function(i,v){
         possibleStates.push(v.value);
      })
      
      if(possibleStates.indexOf(selState)>0) {
         // Select State
         $('#state_selector').val(selState).trigger('change');

         // Update Soc Sharing with Full State Name
         setShareLinks({state:$("#state_selector option[value='"+selState+"']").text(), state_code:selState});
 
      }

      possibleStates = null;
        
   } 

   // Scroll Top even with hidden elements
   window.scrollTo(0,0);

})
