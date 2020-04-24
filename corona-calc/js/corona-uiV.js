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
   var url = "../json/" + $('#state_selector').val() + ".json";
   getJSONData(url, 1);
}

function getJSONData(url, cb_func) {
   show_loader();
   
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",
 
      success: function (result, status, xhr) {
          if (cb_func == 1) {
 
            doSomethingWithJsonData(result );
            hide_loader(true);
          }
          if (cb_func == 2) {
             makeStateSelect(result );
             hide_loader(false);
          }
          
      },
      error: function (xhr, status, error) {
        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText);
        hide_loader(true);
      }
   });
}


function show_loader() {
   $('body').addClass('wait');
    
   //$('.percentage').text('0 days');
   //$('.data-arc').remove();
   //$('#loader').css('display','block');
   //$('#graphs,.gauge_cont').css('visibility','hidden');
}

function hide_loader(show_graphs) {
   /*
   setTimeout(function() {
      $('#loader').css('display','none');
      if(show_graphs)  {
         $('#graphs,.gauge_cont').css('visibility','visible'); 
      }
   }, 50);
   */
   $('body').removeClass('wait');
}

function renewSvg() {
   // Clean all the gauges
   $('.good,.bad,.ugly').removeClass('good bad ugly');
   $('.14days,.7days,.3days,.new').html('');
   $('.14days,.7days,.3days,.new').html('\
   <svg viewBox="0 0 1000 500">\
      <path d="M 950 500 A 450 450 0 0 0 50 500"></path>\
      <text class="percentage" text-anchor="middle" alignment-baseline="middle" x="500" y="280" font-size="140" font-weight="bold"></text>\
      <text class="title" text-anchor="middle" alignment-baseline="middle" x="500" y="450" font-size="90" font-weight="normal">based on 14 days trend</text>\
   </svg>');
   //$('.14days,.7days,.3days,.new').removeAttr('data-ratio','');
   $('.7days .title').text('based on 7 days trend');
   $('.3days .title').text('based on 3 days trend');
   $('.new .title').text('based on curve');
}



$(function() {
   // Function called when the page is fully loaded
   getJSONData("../json/states.json", 2);
})