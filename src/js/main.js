  $(function() {
   // Action
   actionsOnSVGState();
   actionOnTable();

   $("table thead th:eq(0)").data("sorter", false);
   $('table').tablesorter({
      widgets        : ['zebra', 'columns'],
      usNumberFormat : false,
      sortReset      : true,
      sortRestart    : true
   });
})