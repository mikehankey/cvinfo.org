// Display one group
function display_group(result, data, color, type) {

   var selected_state  = $("#state_selector").val(), county = false;
   
   // We Build the Graphs & Display for the "Good" states;
   $.each(data,function(state_code, values ){

      if(state_code !== "Unknown") {
            // Y data
            yd = values;

            // X data
            xd = [];
            for (i = 0; i <= yd.length; i++) {
               xd.push(i);
            } 

            // Full Name (for states)
            if(result['state_names'] !== undefined) {
               full_name = result['state_names'][state_code];
            } else {
               full_name = state_code + ", " + selected_state;
               county = true;
            }
            
            // Clean the name
            state_code = state_code.replace(/[^\w!?]/g,'');

            // Create the DIV
            $('<div class="graph_c"><h3>'+full_name+'</h3><div id="' + state_code+'"></div></div>').appendTo($('#'+type));

            // Plot Graph
            plot_data_line(xd,yd,"days since first case","new cases per day",full_name, state_code,"line",color);

            // What's going on if we click a graph?
            if(!county) {
               $('#'+ state_code).click(function() {
                  window.location.href = "gbu.html?" + state_code;
               });
            } else {
               // A click will go back to the all state page
               $('#'+ state_code).click(function() {
                  window.location.href = "gbu.html";
               });
            }
      } 
   })
}



function make_gbu(result,state) { 
 
   // We select the state in the main selector 
   $('#state_selector').val(state);
  
   if(Object.keys(result['groups']['good']).length<=0) {
      // No Good Result
      $('#good_title').closest('.box').hide();
      $('#good_title, #good').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#good_title, #good, #graphs').show();
      display_group(result, result['groups']['good'], "green", "good");
   }

   if(Object.keys(result['groups']['bad']).length<=0) {
      // No Bad Result
      $('#bad_title').closest('.box').hide();
      $('#bad_title, #bad').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#bad_title, #bad, #graphs').show();
      display_group(result, result['groups']['bad'], "orange", "bad");
   }

   if (state != "ALL")  {
   if(Object.keys(result['groups']['low_cases']).length<=0) {
      // No Good Result
      $('#low_cases_title, #low_cases').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#low_cases_title, #low_cases, #graphs').show();
      display_group(result, result['groups']['low_cases'], "black", "low_cases");
   }
   } else {
      $('#low_cases_title, #low_cases').hide();
   }


   if(Object.keys(result['groups']['ugly']).length<=0) {
      // No Ugly Result
      $('#ugly_title').closest('.box').hide();
      $('#ugly_title, #ugly').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#ugly_title, #ugly, #graphs').show();
      display_group(result, result['groups']['ugly'], "red", "ugly");
   }

   
 
}

function plot_data_line(xd,yd,xl,yl,t,dv,type,color) {
  
   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      marker : {   color: color   },
      hoverinfo: 'none',
      hovermode: 'none',
      mode: 'lines',
      type: type
   };

   // Trends shouldn't start at 0
   var data = [trace1]; // , trace4
   var layout = {
      autosize: false,
      width: 345,
      height: 350,
      showlegend: false,
      margin: {"t": 5, "b": 50, "l": 50, "r": 50},
      yaxis: {fixedrange: true},
      xaxis : {fixedrange: true}
   }

   Plotly.newPlot(dv, data, layout, {responsive: true});
}

function show_gbu_loader() {
   $('#loader').css('display','block');  
   $('body').addClass('wait');
}


function hide_gbu_loader() {
   $('#loader').css('display','none');  
   $('body').removeClass('wait');
}



function gbuInit(url,state) {
   show_gbu_loader();
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",

      success: function (result, status, xhr) { 
         make_gbu(result,state);
         hide_gbu_loader();
      },
      error: function (xhr, status, error) {
         alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         hide_gbu_loader();
      }
   });

   // Action on selector 
   $('#state_selector').change(function() {
     
      if($(this).val()=='ALL') {
         window.location.href = "gbu.html";
      } else {
         window.location.href = "gbu.html?" + $(this).val();
      }
   });   
}

