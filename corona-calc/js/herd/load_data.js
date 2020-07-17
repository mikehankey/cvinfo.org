// Change State
function state_select_action_setup() {
   $('#state_selector').change(function(e){ 
      var state = $(this).val(); 

      if(state != 0)  {
         update_county_list($(this).val(), function() { data_updated();});
         $('#compute_button').show();
      } else {
         $('#county_select').html('');
         $('#compute_button').hide();
      }
       
      return false;
   })
}

// Change County
function county_select_action_setup() {
   $('#county_selector').unbind('change').change(function() {
      data_updated();
   })
}

// Loading...
function loading(text) {
   $('#state_selector').attr('disabled','disabled');
   Swal.fire({  
      title: '<div class="lds-hourglass"></div>',
      html: "<b>"+text+"</b>",
      showConfirmButton: false,
      toast: true 
   });
}

// No more loading...
function done() {
   $('#state_selector').removeAttr('disabled');
   $('.swal2-container').remove();
}

// Update County list based on the state
function update_county_list(state, callback) {
   var url = "./data/" + state + "_counties.json";

   loading("Loading counties");
   
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",
      success: function (result, status, xhr) {
         var all_options = "";
         var all_names = [];
         $.each(result['counties'],function(i,v){
            all_names.push(v['name'])
         });
         all_names.sort();
         all_options+= "<option value='0' selected>All Counties</option>"
         $.each(all_names,function(i,v){
            all_options+= "<option value='"+v+"'>"+v+"</option>"
         }); 
         $('#county_select').html('<select id="county_selector">' + all_options + '</select>');
         county_select_action_setup(); 
         callback();
         done();
      }
   });
 
}


// Do what we have to do with the selected options
function data_updated() {
   var url_to_load = "./states/"

   if($('#county_selector').val()=="0") {
      // We load the data for the state
      url_to_load += $('#state_selector').val() + "/" + $('#state_selector').val() + ".json";
      setShareLinks({state:$("#state_selector option[value='"+$('#state_selector').val()+"']").text(), state_code:$('#state_selector').val(),county:""});   
   } else {
      // We load the data for the county
      url_to_load += $('#state_selector').val() + "/counties/" + $('#county_selector').val() + ".json" ;
      setShareLinks({state:$("#state_selector option[value='"+$('#state_selector').val()+"']").text(), state_code:$('#state_selector').val(), county:$('#county_selector').val()});
   }
    
   loading('Getting data...');

   $.ajax({
      type: "get",
      url:  url_to_load,
      dataType: "json",
      success: function (result, status, xhr) {
         prepare_data({
            data:  result,
            state_code: $('#state_selector').val(),
            state_name: $("#state_selector option[value='"+$('#state_selector').val()+"']").text(),
            county:  $('#county_selector').val()
         });
         $('#forecast_container').css('visibility','visible');
         done();
      }
   });
 
}


$(function() {
   loading("Loading...");
   setupActions();
   state_select_action_setup();
   done(); 
})