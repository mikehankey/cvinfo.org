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
   var url = "./json/" + $('#state_selector').val() + ".json"
   $('#loader').css('display','block');
   getJSONData(url, 1);
}