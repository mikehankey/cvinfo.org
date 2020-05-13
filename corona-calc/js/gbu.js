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

function display_sum_info(result,state) {

   $('#sum_info_title, #sum_info, #graphs').show();
   state_code = state
   type = "sum_info"

   full_name = "Avg New Cases Per Day for " + state
   div_id = "sum_info_cases"

   color = "red"
   grp = result['sum_data']['group']
   if (grp == 'bad') {
      color = "orange"
   }
   if (grp == 'good') {
      color = "green"
   }


   var xd = []
   yd = result['sum_data']['avg']['cases']
   for (i = 0; i < yd.length; i++) {
      xd.push(i)
   }
   title_si_cases = "New Cases Per Day for " + state
   title_si_deaths = "New Deaths Per Day for " + state
   title_si_tests = "New Tests Per Day for " + state
   title_si_tests_pos_perc = "Positive % of Tests " + state

   document.getElementById("title_si_cases").innerHTML= title_si_cases;
   document.getElementById("title_si_deaths").innerHTML= title_si_deaths;
   document.getElementById("title_si_tests").innerHTML= title_si_tests;
   document.getElementById("title_si_tests_pos_perc").innerHTML= title_si_tests_pos_perc;
   plot_data_line(xd,yd,"days since first case","new cases per day",full_name, "sum_info_cases" ,"line",color);


   var xd = []
   yd = result['sum_data']['avg']['deaths']
   for (i = 0; i < yd.length; i++) {
      xd.push(i)
   }
   plot_data_line(xd,yd,"days since first case","new deaths per day",full_name, "sum_info_deaths" ,"line",color);

   var xd = []
   var yd = []
   var yd_pp = []

   yd1 = result['sum_data']['avg']['tests_pos']
   yd2 = result['sum_data']['avg']['tests_neg']
   for (i = 0; i < yd1.length; i++) {
      yd.push(yd1[i] + yd2[i])
      xd.push(i)
      pp = 1 - (yd1[i]/(yd1[i] + yd2[i]))
      yd_pp.push( pp*100)
   }

   plot_data_line(xd,yd,"days since first case","new tests per day",full_name, "sum_info_tests" ,"line",color);

   plot_data_line(xd,yd_pp,"days since first case","new tests per day",full_name, "sum_info_tests_pos_perc" ,"line",color);

}

function make_gbu(result,state) { 
 
   // We select the state in the main selector 
   $('#state_selector').val(state);

   if (state == "ALL") {
      $('#sum_info_title').closest('.box').hide();
      $('#sum_info_title, #sum_info').hide();
   }
   else {
      //$('<div class="graph_c"><h3>'+full_name+'</h3><div id=sum_info_"' + state_code+'"></div></div>').appendTo($('#sum_info'));
      display_sum_info(result,state)
      // file summary info div when we are looking at a specific state
      // for the summary show 3 graphs total cases in state, total deaths in state, total_tests in state

   }
  
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

    
   if(typeof result['groups']['low_cases'] == "undefined" || Object.keys(result['groups']['low_cases']).length<=0) {
      // No Good Result
      $('#low_cases_title').closest('.box').hide();
      $('#low_cases_title, #low_cases').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#low_cases_title, #low_cases, #graphs').show();
      display_group(result, result['groups']['low_cases'], "black", "low_cases");
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
      margin: {"t": 5, "b": 50, "l": 50, "r": 30},
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

