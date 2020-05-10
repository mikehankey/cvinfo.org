


function make_gbu(result,state) {
   good_html = "<h1>Winning</h1> <p>Current value is less than 40% of the highest peak value.</p>"
   //for (const prop in result['groups']['good']) {
   Object.keys(result['groups']['good']).sort().forEach(function(prop) {
      if (result['groups']['good'].hasOwnProperty(prop)) {
         div = prop.replace("'", "")
         good_html += "<div id='" + div + "' class='sq_plot'></div>" 
      }
   })

   document.getElementById("good").innerHTML= good_html

   bad_html = "<h1>Improving</h1><p>Current value is between 40-80% of the highest peak value.</p>"
   //for (const prop in result['groups']['bad']) {
   Object.keys(result['groups']['bad']).sort().forEach(function(prop) {
      if (result['groups']['bad'].hasOwnProperty(prop)) {
         div = prop.replace("'", "")
         bad_html += "<div id='" + div + "' class='sq_plot'></div>"
      }
   })

   document.getElementById("bad").innerHTML= bad_html

   ugly_html = "<h1>Loosing</h1><p>Current value is greater than 80% of the highest peak value.</p>"
   //for (const prop in result['groups']['ugly']) {
   Object.keys(result['groups']['ugly']).sort().forEach(function(prop) {
      if (result['groups']['ugly'].hasOwnProperty(prop)) {
         div = prop.replace("'", "")
         ugly_html += "<div id='" + div + "' class='sq_plot'></div>"
      }
   })

   document.getElementById("ugly").innerHTML= ugly_html

   for (const prop in result['groups']['good']) {
      yd = result['groups']['good'][prop]
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      if (state == "ALL") {
         sn = result['state_names'][prop]
      } 
      else {
         sn = prop 
      }
      div = prop.replace("'", "")
      plot_data_line(xd,yd,"days since first case","new cases per day",sn,div,"line","green")
   }

   for (const prop in result['groups']['bad']) {
      yd = result['groups']['bad'][prop]
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      if (state == "ALL") {
         sn = result['state_names'][prop]
      }
      else {
         sn = prop
      }
      div = prop.replace("'", "")
      plot_data_line(xd,yd,"days since first case","new cases per day",sn,div,"line","orange")
   }

   for (const prop in result['groups']['ugly']) {
      yd = result['groups']['ugly'][prop]
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      if (state == "ALL") {
         sn = result['state_names'][prop]
      }
      else {
         sn = prop
      }
      div = prop.replace("'", "")
      plot_data_line(xd,yd,"days since first case","new cases per day",sn,div,"line","red")
   }


}

function plot_data_line(xd,yd,xl,yl,t,dv,type,color) {
   var ymax = Math.max.apply(Math, yd) * 1.2;

   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      marker : {
         color: color
      },
      type: type
   };

   // Trends shouldn't start at 0
   var data = [trace1]; // , trace4
   var layout = {
      title :  { 
         text: t,
         y: 0.10,
         yanchor: 'bottom'
      }
   }

   Plotly.newPlot(dv, data, layout, {responsive: true});
}

function gbuInit(url,state) {
   /*
   if(typeof reload == 'undefined') {
      show_loader();
   }
   */

   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",

      success: function (result, status, xhr) {

         // Create Select County
         /*
         countySelect(getAllCounties(result) , state);
         $('#county_selector').unbind("change").change(function(e) {
            change_county();
            return false;
         })
         */

         cur_json_data = result;
         //cur_county     = county;
         cur_state      = state;
         make_gbu(result,state)
         //hide_loader();
         //$('#recalculate').html($('#recalculate').attr('data-htmlx'));
         //$('#recalculate').removeAttr('data-htmlx');


      },
      error: function (xhr, status, error) {
         alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         //hide_loader();
      }
   });
}

