function usFormat(n) {
  return String(n).replace(/(.)(?=(\d{3})+$)/g,'$1,');
}

function makeStateSelectNOTHERE(states) {
   var sel = "<select id=\"state_selector\" onchange='load_data()'>"
   sel += "<option value=''>Select a State</option>";
   for (var i = 0; i < states.length; i++) {
      if (states[i].state_code != 'VI') {
         sel += "<option value='" + states[i].state_code + "'>" + states[i].state_name + "</option>"
      }
   }
   sel += "</select>";
   document.getElementById("state_select").innerHTML= sel;
}

 
function load_dataNOTHERE() { 
   var url = "../json/" + $('#state_selector').val() + ".json";
   getJSONData(url, 1);
}

function getJSONDataNOTHERE(url, cb_func) {
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
        hide_loader();
      }
   });
}


function show_loader() {
   $('body').addClass('wait');
   $('.box').css('visibility','hidden');
    
   //$('.percentage').text('0 days');
   //$('.data-arc').remove();
   //$('#loader').css('display','block');
   //$('#graphs,.gauge_cont').css('visibility','hidden');
}

function hide_loader(show_graphs) {
  if(typeof show_graphs == "undefined" ) show_graphs=true;
  if(show_graphs) $('.box').css('visibility','visible');
  $('body').removeClass('wait');
}

function createSvg(which) {
   /*
   // Clean all the gauges
   if(which != 'summary') {
      // ,.3days
      $('.14days,.7days,.new').html('\
      <svg viewBox="0 0 1000 500">\
         <path d="M 950 500 A 450 450 0 0 0 50 500"></path>\
         <text class="percentage" text-anchor="middle" alignment-baseline="middle" x="500" y="280" font-size="140" font-weight="bold"></text>\
         <text class="title" text-anchor="middle" alignment-baseline="middle" x="500" y="450" font-size="90" font-weight="normal">Zero Cases</text>\
      </svg>'); 
      $('.7days .title').text('based on 7 days trend');
      //$('.3days .title').text('based on 3 days trend');
      $('.new .title').text('based on curve');
   }
   */
   // For the Summary 
   if(which == 'summary' || which == 'all') { 
      //,#forecast .new
      $('#forecast .14days,#forecast .7days').html('\
         <svg viewBox="0 0 1000 500">\
            <path d="M 950 500 A 450 450 0 0 0 50 500"></path>\
            <text class="title" text-anchor="middle" alignment-baseline="middle" x="500" y="240" font-size="90" font-weight="normal"></text>\
            <text class="percentage" text-anchor="middle" alignment-baseline="middle" x="500" y="395" font-size="145" font-weight="bold"></text>\
            </svg><div class="trend">14 days trend</div>');
      $("#forecast .7days .trend").text("7 days trend");
      
   } 
}



$(function() {
   // Create SVG
   createSvg('all');

   // Function called when the page is fully loaded
   getJSONData("../json/states.json", 2);
})
