
/**
 * Load_init_data (from url parameter)
 */
function load_init_data(urlInfo) {
   var state  = (urlInfo&&urlInfo.state)?urlInfo.state:"0";
   var county;

   if(state!=0) {
      $('#state_selector').val(state);
      county =  (urlInfo&&urlInfo.county)?urlInfo.county:"undefined";
      cur_state = state;
   } 
   getInitJSONData($.trim(state),$.trim(county));
}

/**
 * Load Init JSON (from url parameter)
 */
function getInitJSONData(state,county) {
      
      var url = "../json/" + state + ".json";
      
      // Does the state exists?
      if($("#state_selector option[value="+state+"]").length!=0 && state!=0) {
         show_loader();
         $.ajax({
            type: "get",
            url:  url,
            dataType: "json",
      
            success: function (result, status, xhr) {
             
               // Create Select County
               countySelect(getAllCounties(result) , state); 
       
               if(county === undefined || $("#county_selector option[value='"+decodeURIComponent(county)+"']").length==0) {
                  $('#county_selector').val("ALL");    
                  county = ""; // County doesnt exist for this state     
                  setShareLinks({state:county+", "+ state, state_code:state,county:county});   
               } else {
                  $('#county_selector').val(county); 
                  cur_county = county;
                  setShareLinks({state:$("#state_selector option[value='"+state+"']").text(), state_code:state});
               }
                  
               cur_json_data = result;
               displayData(result,state,county);
               hide_loader();	 
               
       
            },
            error: function (xhr, status, error) {
               alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
               hide_loader();	
            }
         });
      }


}
