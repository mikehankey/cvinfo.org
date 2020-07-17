// Display Error
function show_error(text) {
   $('<div class="error">'+text+'</div>').appendTo($('#forecast_container'));
}

// Validate 
function validate_start_data(data) {
   var all_errors_text = [], error_text;

   $.each(data, function(i, v){
      if(v.cur > v.max || v.cur < v.min) {
         all_errors_text.push("<b>"+v.name + "</b> should be between " + v.min + " and " + v.max);
      }
   })

   if(all_errors_text.length!=0) {

      if(all_errors_text.length>1) {
         error_text = "Please, correct the following data:<br>";
      } else {
         error_text = "Please, correct your data:<br> "
      }

      error_text += all_errors_text.join('<br>');

      Swal.fire({
         title: '<strong>Wrong data</strong>',
         icon: 'error',
         html: error_text 
       })
      return false;
   } else {
      return true;
   }
 
}