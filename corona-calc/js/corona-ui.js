function makeStateSelect(states) {
   var sel = "<select id=\"state_selector\" onchange='load_data()'>"
   sel += "<option value=''>Select a State</option>";
   for (var i = 0; i < states.length; i++) {
      sel += "<option value='" + states[i].state_code + "'>" + states[i].state_name + "</option>"
   }
   sel += "</select>";
   document.getElementById("state_select").innerHTML= sel;
}

 
function load_data() { 
   var url = "../json/" + $('#state_selector').val() + ".json"
   getJSONData(url, 1);
}

function show_loader() {
   $('#loader').css('display','block');
   $('#graphs,.gauge_cont').css('visibility','hidden'); 
}

function hide_loader() {
   setTimeout(function() {
      $('#loader').css('display','none');
      $('#graphs,.gauge_cont').css('visibility','visible');
   }, 50);
}


$(function() {
   // Function called when the page is fully loaded
   getJSONData("../json/states.json", 2);
})