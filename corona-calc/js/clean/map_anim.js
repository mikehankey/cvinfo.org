var ANIM_INTER; // Anim Interval (timer)
var ANIM_SPEED = 350; 

/**
 * Warning cur_state needs to be defined on the page
 */
function init_type_select() {
   // Change values
   $('#anim_selector').change(function() {
      // Change the css
      $('#map_css').attr('href','../states/'+cur_state+'/maps/'+$(this).val()+'.css?v='+ Math.floor(Math.random() * Math.floor(10000000)));
      // Switch the legend
      $('.legend').css('display','none');
      $('#leg_'+ $(this).val()).attr('style','')
   });   
}

function init_play_button() {
   $('.btn-anim.m').unbind('click').click(function(e) {
      
      e.stopPropagation();
      var cur_type = $('#anim_selector').val();
 
      if($(this).hasClass('btn-play')) {
         $(this).removeClass('btn-play').addClass('btn-pause');
         //anim_play(cur_type,'next');
         ANIM_INTER = setInterval(function(){  anim_play(cur_type,'next'); }, ANIM_SPEED);
      } else {
         $(this).removeClass('btn-pause').addClass('btn-play');
         clearInterval(ANIM_INTER);
      }
      return false;
   });

    // Backward
    $('.btn-backward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      anim_play(new_type,'prev');
   });


    // Forward
    $('.btn-forward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      anim_play(new_type,'next');
   });


   // FastBackward
   $('.btn-fastbackward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      anim_play(new_type,'prev',true);
   });
   
   
   // Forward
   $('.btn-fastforward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      anim_play(new_type,'next',true);
   });
}
 

// Init slider based on how many days between the max and min date
function init_slider() {

   // Get type
   var type = $('#anim_selector').val();
   
   // Get Min/Max Dates
   var min_date = str_to_date(dates[type]['min']);
   var max_date = str_to_date(dates[type]['max']);

   // How many days between the two days?
   var res = Math.abs(max_date - min_date) / 1000;
   var days = Math.floor(res / 86400);

   $('#dateSlider').attr('min',0);
   $('#dateSlider').attr('max',days);
   $('#dateSlider').val(days);

   $('#dateSlider').change(function(e) {
      console.log($(this).val())

      // Pause if it's playing
      if($('.btn-anim.m').hasClass('play')) {
         $('.btn-anim.m').click();
      }

      // Go to the proper address
      // min_date + $(this).val()days

   })
}


// Add a zero 
function addZ(n){return n<10? '0'+n:''+n;}

/**
 * Warning: cur_date needs to be defined on the page
 */
function anim_play(type, dir, max) { 

   // Get current type min & max date
   var min_date = str_to_date(dates[type]['min']);
   var max_date = str_to_date(dates[type]['max']);
   current_date = str_to_date(cur_date);
  
   if(dir=='next') {
      if(max==true) {
         next_date = max_date;
      } else {
         if(current_date>=max_date) {
            next_date = min_date;
         } else {
            current_date.setDate(current_date.getDate() + 1);
            next_date = current_date;
         }
      }
    
   } else {
      if(max==true) {
         next_date = min_date;
      } else {
         if(current_date<=min_date) {
            next_date = max_date; 
         } else {
            current_date.setDate(current_date.getDate() - 1);
            next_date = current_date;
         }
      }
     
   }
 
   next_date_formatted = next_date.getFullYear() + '-' + addZ(next_date.getMonth()+1) + '-' +  addZ(next_date.getDate())
 
   // Update Date (text)
   $('#anim_date').text(next_date_formatted);

   // Get next_date as a string (YYYYMMDD)
   next_date = next_date.getFullYear() + '' + addZ(next_date.getMonth()+1) + '' +  addZ(next_date.getDate());

   // We change the class of the map accordingly
   $('#svg_map svg').removeClass().addClass('map_'+next_date);
   
   // Update main var
   cur_date = next_date_formatted;
      
}

// Transform a US format date to a javascript date
// YYYY-MM-DD
function str_to_date(str) {
   var det = str.split('-');
   return new Date(Date.UTC(det[0],det[1]-1,det[2]));
}


$(function() {
   init_type_select();
   init_play_button();
   init_slider();
})