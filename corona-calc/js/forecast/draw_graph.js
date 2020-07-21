var all_proj_colors = {
   'easing':     ['rgba(255,162,117,0.15)','#ff5d10'],
   'estimation': ['rgba(13,188,150,0.15)','#0dbc96'],
   'masks':      ['rgba(152,113,120,0.15)','#987178'],
   'norm':       ['rgba(31,119,180,.15)','#1f77b4']
};

/**
 * Setup Options for Single Graphs 
 */
function setSingGraphOptions(domOptions,_type,opts,name,callback) {

      // Add Button for norm (bars)
      if($('#norm'+_type).length==0) {
         selected = opts.masks?"selected":"";
         $('<button class="choice '+selected+' norm bars"  name="norm'+_type+'" id="norm'+_type+'">'+name+'</button>').appendTo($('#'+domOptions));
      }
   
      // Action on estimation button
      $('#norm'+_type).click(function(e) {
         var t = $(this);
         e.stopImmediatePropagation();
         if(t.hasClass('selected')) {
            opts.norm = false;
         } else {
            opts.norm = true;
         }
         t.toggleClass('selected');
         callback();
         return false;
      });
   
   
      // Add Button for sevend_avg (7day avg)
      if($('#sevend_avg'+_type).length==0) {
         selected = opts.masks?"selected":"";
         $('<button class="choice '+selected+' norm" name="sevend_avg'+_type+'" id="sevend_avg'+_type+'">7 days avg.</button>').appendTo($('#'+domOptions));
      }
   
      // Action on estimation button
      $('#sevend_avg'+_type).click(function(e) {
         var t = $(this);
         e.stopImmediatePropagation();
         if(t.hasClass('selected')) {
            opts.sevend_avg = false;
         } else {
            opts.sevend_avg = true;
         }
         t.toggleClass('selected');
         callback();
         return false;
      });
}



/**
 * Setup Options buttons and input checkbox 
 */
function setupGraphOptions(domOptions,_type, opts, name, callback) {
  
   // Add Button for norm (bars)
   if($('#norm'+_type).length==0) {
      selected = opts.norm?"selected":"";
      $('<button class="choice '+selected+' norm bars"  name="norm'+_type+'" id="norm'+_type+'">'+name+'</button>').appendTo($('#'+domOptions));
   }

   // Action on estimation button
   $('#norm'+_type).click(function(e) {
      var t = $(this);
      e.stopImmediatePropagation();
      if(t.hasClass('selected')) {
         opts.norm = false;
      } else {
         opts.norm = true;
      }
      t.toggleClass('selected');
      callback();
      return false;
   });


   // Add Button for sevend_avg (7day avg)
   if($('#sevend_avg'+_type).length==0) {
      selected = opts.sevend_avg?"selected":"";
      $('<button class="choice '+selected+' norm" name="sevend_avg'+_type+'" id="sevend_avg'+_type+'">7 days avg.</button>').appendTo($('#'+domOptions));
   }

   // Action on estimation button
   $('#sevend_avg'+_type).click(function(e) {
      var t = $(this);
      e.stopImmediatePropagation();
      if(t.hasClass('selected')) {
         opts.sevend_avg = false;
      } else {
         opts.sevend_avg = true;
      }
      t.toggleClass('selected');
      callback();
      return false;
   });


   // Add Button for tests (7day_avg)
   if($('#tests_avg'+_type).length==0) {
      selected = opts.tests?"selected":"";
      $('<button style="margin-left: 2rem;" class="choice '+selected+' tests" name="tests_avg'+_type+'" id="tests_avg'+_type+'">7 days avg. Tests</button>').appendTo($('#'+domOptions));
   }

   // Action o 
   $('#tests_avg'+_type).click(function(e) {
      var t = $(this);
      e.stopImmediatePropagation();
      if(t.hasClass('selected')) {
         opts.tests = false;
      } else {
         opts.tests = true;
      }
      t.toggleClass('selected');
      callback();
      return false;
   });


   // Add Button for easing
   if($('#easing'+_type).length==0) {
      selected = opts.easing?"selected":"";
      $('<br/><button class="choice '+selected+' easing" name="easing'+_type+'" id="easing'+_type+'">Easing</button>').appendTo($('#'+domOptions));
   }

   // Action on Easing button
   $('#easing'+_type).click(function(e) {
      var t = $(this);
      e.stopImmediatePropagation();
      if(t.hasClass('selected')) {
         opts.easing = false;
      } else {
         opts.easing = true;
      }
      t.toggleClass('selected');
      callback();
      return false;
   });

   // Add Button for estimation
   if($('#estimation'+_type).length==0) {
      selected = opts.estimation?"selected":"";
      $('<button class="choice '+selected+' estimation" name="estimation'+_type+'" id="estimation'+_type+'">Estimation</button>').appendTo($('#'+domOptions));
   }

   // Action on estimation button
   $('#estimation'+_type).click(function(e) {
      var t = $(this);
      e.stopImmediatePropagation();
      if(t.hasClass('selected')) {
         opts.estimation = false;
      } else {
         opts.estimation = true;
      }
      t.toggleClass('selected');
      callback();
      return false;
   });

   // Add Button for masks
   if($('#masks'+_type).length==0) {
      selected = opts.masks?"selected":"";
      $('<button class="choice '+selected+' masks" name="masks'+_type+'" id="masks'+_type+'">Masks</button>').appendTo($('#'+domOptions));
   }

   // Action on estimation button
   $('#masks'+_type).click(function(e) {
      var t = $(this);
      e.stopImmediatePropagation();
      if(t.hasClass('selected')) {
         opts.masks = false;
      } else {
         opts.masks = true;
      }
      t.toggleClass('selected');
      callback();
      return false;
   });
   

   // Add Switcher for Uncertainty (first time only)
   if($('#uncertainty'+_type+'').length==0) {
      checked = opts.uncertainty?"checked":"";
      $('<div class="choice-like"><label ' + checked + ' for="uncertainty'+_type+'"><input name="uncertainty'+_type+'" type="checkbox" id="uncertainty'+_type+'" value=""> Uncertainty</label></div>').appendTo($('#'+domOptions))
      if(opts.uncertainty) {
         $("#uncertainty"+_type).attr('checked');
      } else {
         $("#uncertainty"+_type).removeAttr('checked');
      }
   }

   // Action on Switcher
   $("#uncertainty"+_type).rcSwitcher().on({
      'turnon.rcSwitcher':function( e, dataObj ){
         e.stopImmediatePropagation();
         opts.uncertainty = true;
         callback();
         return false;
      },
      'turnoff.rcSwitcher':function( e, dataObj ){
         e.stopImmediatePropagation();
         opts.uncertainty = false;
         callback();
         return false;
      },
   });

}

/**
 * Draw standard graph 
*/
function draw_graph(name,data,type,opts) {

   var dataSetBars = {};
   var all_set = [];  
   var doubleYAxis = false;
 
   // Reset the Graph
   $('#'+data['domGraph']).html('');
   done(); 

 


   // Compute Range of the Graph
   var min, max;
   min = new Date(Math.min.apply(null,data['norm']['x']))    
   if(data['proj'] !== undefined && (opts.easing  || opts.masks || opts.estimation)) {
      // The max is in "estimation"
      max = new Date(Math.max.apply(null,data['proj']['estimation']['x']))   
   } else {
      max = new Date(Math.max.apply(null,data['norm']['x'])) 
   }
   
       
   // We draw the UWASH Projections
   if(data['proj'] !== undefined) {
      
      // We build the array of projected data based on the options
      var all_projected_data = [];
      if(opts.easing==true)         all_projected_data.push('easing');
      if(opts.masks==true)          all_projected_data.push('masks');
      if(opts.estimation==true)     all_projected_data.push('estimation');
     

      // We have 3 sets of data here:
      // easing, estimation, masks
      $.each(all_projected_data, function(ind,set_of_data) {
 
         // uncertainty: show hide u & l
         if(opts.uncertainty) {
            vals = ['l','m','u'];
         } else {
            vals = ['m'];
         }
  
         // We're generating a filled area with 
         // the 3 y values: m,l,u
         $.each(vals,function(i,v){
              
            tmpDataSet = {
               x: data['proj'][set_of_data]['x'],
               y: data['proj'][set_of_data]['y' + v],
               legendgroup: ind,
               styles: [{target:'UWASH Projection & Estimation'}],
               hovertemplate: '%{y:.2f}',
               xaxis: 'x2',
               type: "scatter", 
               mode: "lines" 
            }

            if(v == "m" || v== "u") {
               if(opts.uncertainty) {
                  tmpDataSet.fill = "tonexty";
               }
               tmpDataSet.fillcolor = all_proj_colors[set_of_data][0]; //'rgba(255,162,117,0.15)';
            }

            if(v == "l" || v  == "u") {
               tmpDataSet.line = { width: 0 } ;
               tmpDataSet.showlegend = false; 
            } else {

               if(set_of_data=='easing') {
                  tmpDataSet.line = { color: all_proj_colors[set_of_data][1], dash:'dot', width:4 };
               } else {
                  tmpDataSet.line = { color: all_proj_colors[set_of_data][1], dash:'dot', width:2};
               }
               
            }

            if(v=="m") {
               tmpDataSet.name =  "UWash " + set_of_data;
            } else if (v=="l") {
               tmpDataSet.name =  "UWash (lower)";
            } else  {
               tmpDataSet.name =  "UWash (upper)";
            }
   
            all_set.push(tmpDataSet);
         })
      })
          
   }

   // We draw bars
   if(data['norm'] !== undefined && opts.norm) {
      
      dataSetBars = {
         x: data['norm']['x'],
         y: data['norm']['y'],
         name: data['title'],
         type: "bar",
         marker: { color: all_proj_colors['norm'][0] },
         hovertemplate: '%{y:.0f}'
      };

      all_set.push(dataSetBars);
   }

   // We draw the 7 days average
   if(data['7d_avg'] !== undefined && opts.sevend_avg) {

      dataSet7dAvg = {
         x: data['7d_avg']['x'],
         y: data['7d_avg']['y'],
         name: "7 days avg",
         type: "line_not_to_zero",
         hovertemplate: '%{y:.2f}', 
         line: { color: '#1f77b4' }
      };

      all_set.push(dataSet7dAvg);
   } 

   // We draw the tests
   if(data['tests'] !== undefined && opts.tests) {

      dataTests = {
         x: data['tests']['x'],
         y: data['tests']['y'],
         name: "'7 days avg. Tests",
         type: "line_not_to_zero",
         hovertemplate: '%{y:.2f}', 
         line: { color: '#c54cbb' },
         yaxis: 'y2'
      }

      doubleYAxis = true;
      all_set.push(dataTests);
   }

   var layout = { 
      margin: {"t": 20, "b": 80, "l": 50, "r": 50},
      showlegend: false,
      legend: { 
         orientation: "h",
      },
      xaxis: {   range: [min,max]   },
      xaxis2: {
        overlaying: 'x',
        range: [min,max]
      } 
   }; 

   // Double Y Axis?
   if(doubleYAxis) {
      layout.yaxis2 = {
         title: '7 days avg. Tests',
         titlefont: {color: 'rgb(148, 103, 189)'},
         tickfont: {color: 'rgba(148, 103, 189)'},
         overlaying: 'y',
         side: 'right',
         showgrid : false
      };
      layout.margin.r = 80;
   }

   Plotly.purge(data['domGraph']);
   Plotly.newPlot(data['domGraph'], all_set, layout);

   // Add title info
   $('#'+data.domTitle).html("<h3>"+name +", " +data.title +"</h3>");

   // Setup Options
   setupGraphOptions(data['domOptions'],type, opts, data.title ,function() {  draw_graph(name,data,type,opts); });
 
}


/**
 * Draw standard Single Graph (ex: Fatality Rate)
 */
function draw_graph_sing(name,data,type,opts) {

   var all_set = [];  


   // Reset the Graph
   $('#'+data['domGraph']).html('');
   done();  

   // We draw the UWASH Projections
   if(data['proj'] !== undefined) {
  
      // We build the array of projected data based on the options
      var all_projected_data = [];
      if(opts.easing==true)         all_projected_data.push('easing');
      if(opts.masks==true)          all_projected_data.push('masks');
      if(opts.estimation==true)     all_projected_data.push('estimation');
     

      // We have 3 sets of data here:
      // easing, estimation, masks
      $.each(all_projected_data, function(ind,set_of_data) {
 
         // uncertainty: show hide u & l
         if(opts.uncertainty) {
            vals = ['l','m','u'];
         } else {
            vals = ['m'];
         }
  
         // We're generating a filled area with 
         // the 3 y values: m,l,u
         $.each(vals,function(i,v){
              
            tmpDataSet = {
               x: data['proj'][set_of_data]['x'],
               y: data['proj'][set_of_data]['y' + v],
               legendgroup: ind,
               styles: [{target:'UWASH Projection & Estimation'}],
               //hovertemplate: '%{y:.2f}%', 
               //type: "scatter", 
               mode: "lines" 
            }

            if(v == "m" || v== "u") {
               if(opts.uncertainty) {
                  tmpDataSet.fill = "tonexty";
               }
               tmpDataSet.fillcolor = all_proj_colors[set_of_data][0]; //'rgba(255,162,117,0.15)';
            }

            if(v == "l" || v  == "u") {
               tmpDataSet.line = { width: 0 } ;
               tmpDataSet.showlegend = false; 
            } else {

               if(set_of_data=='easing') {
                  tmpDataSet.line = { color: all_proj_colors[set_of_data][1], dash:'dot', width:4 };
               } else {
                  tmpDataSet.line = { color: all_proj_colors[set_of_data][1], dash:'dot', width:2};
               }
               
            }

            if(v=="m") {
               tmpDataSet.name =  "UWash " + set_of_data;
            } else if (v=="l") {
               tmpDataSet.name =  "UWash (lower)";
            } else  {
               tmpDataSet.name =  "UWash (upper)";
            }
   
            all_set.push(tmpDataSet);
         })
      })
          
   }  
   
   // We draw bars
   if(data['norm'] !== undefined && opts.norm) {
      
      dataSetBars = {
         x: data['norm']['x'],
         y: data['norm']['y'],
         name: data['title'],
         type: "bar",
         marker: { color: all_proj_colors['norm'][0] } 
      };

      all_set.push(dataSetBars);
   }

   // We draw the 7 days average
   if(data['7d_avg'] !== undefined && opts.sevend_avg) {

      dataSet7dAvg = {
         x: data['7d_avg']['x'],
         y: data['7d_avg']['y'],
         name: "7 days avg",
         type: "line_not_to_zero", 
         line: { color: '#1f77b4' }
      };

      all_set.push(dataSet7dAvg);
   } 


   var layout = { 
      margin: {"t": 20, "b": 80, "l": 50, "r": 50},
      showlegend: false,
      legend: { 
         orientation: "h",
      },
      yaxis: {
         tickformat: ',.2%' 
      } 
   };  

   Plotly.newPlot(data['domGraph'], all_set, layout);

   // Add title info
   $('#'+data.domTitle).html("<h3>"+name +", " +data.title +"</h3>");

 
   setSingGraphOptions(data['domOptions'],type,opts, data.title, function(){draw_graph_sing(name,data,type,opts)});

}
 