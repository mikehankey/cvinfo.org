function launch_sorter() {
 
   $('table').tablesorter({
      widgets        : ['zebra', 'columns'],
      usNumberFormat : true,
      sortReset      : true,
      sortRestart    : true
   });

   if(typeof dsc !='undefined') {
      console.log("DSC ", dsc);
      $('th[data-column='+dsc+']').click().click();
   }
   
   // Color column
   /*
   $("table thead th:eq(0)").data("sorter", false);
   $('table').tablesorter({
         widgets        : ['zebra', 'columns'],
         usNumberFormat : false,
         sortReset      : true,
         sortRestart    : true,
         headers: {
            2:{ sorter:'us_format'},
            3:{ sorter:'us_format'},
            4:{ sorter:'us_format'},
            5:{ sorter:'us_format'},
            6:{ sorter:'us_format'},
            7:{ sorter:'us_format'},
            8:{ sorter:'us_format'} 
         }
   });

   // Default Sorting: CPM
   
  */
  
}