function usFormat(n) {
  return String(n).replace(/(.)(?=(\d{3})+$)/g,'$1,');
}
 

function dateFormat(s) {
   return s.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
}

function show_loader() {
   $('body').addClass('wait');
   $('.box, .metric, #summary, .bad_d').css('visibility','hidden'); 
   $('.outcome tbody').html('');
}

function hide_loader(show_graphs) {
  if(typeof show_graphs == "undefined" ) show_graphs=true;
  if(show_graphs) $('.box, .metric, #summary,  .bad_d').css('visibility','visible');
  $('body').removeClass('wait');
}


function countySelect(p, state) {
   var sel = "<select id='county_selector'><option value='ALL'>All Counties</option>"
   var sortable = [];
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
      if($.trim(sorted[i][0])!="Unknow"){
         sel += "<option value=\"" + sorted[i][0] + "\">" + sorted[i][0] + " (" + usFormat(sorted[i][1]) + ")</option>\n";
      }
   }

   sel += "<input type=hidden id='state' value='" + state + "'></select>"
   document.getElementById("county_select").innerHTML= sel
}

function createSvg() {
   // For the Summary   
   $('#forecast .14days,#forecast .7days').html('\
      <svg viewBox="0 0 1000 500">\
         <path d="M 950 500 A 450 450 0 0 0 50 500"></path>\
         <text class="title" text-anchor="middle" alignment-baseline="middle" x="500" y="240" font-size="90" font-weight="normal"></text>\
         <text class="percentage" text-anchor="middle" alignment-baseline="middle" x="500" y="395" font-size="145" font-weight="bold"></text>\
         </svg><div class="trend">14 days trend</div>');
   $("#forecast .7days .trend").text("7 days trend");
    
} 

$(function() {
  

   // Once the page is loaded we enable the state select
   $('#state_selector').removeAttr('disabled');
   $('body').removeClass('wait');

   // Create action on state select 
   $('#state_selector').change(function() {change_state();});

   // Creation action on recalculate button
   $('#recalculate').click(function() {recalculate(); }) 

   // Scroll Top even with hidden elements
   window.scrollTo(0,0);

})
