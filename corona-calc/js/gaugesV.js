function polar_to_cartesian(cx, cy, radius, angle) {
   var radians;
   radians = (angle - 90) * Math.PI / 180.0;
   return [Math.round((cx + (radius * Math.cos(radians))) * 100) / 100, Math.round((cy + (radius * Math.sin(radians))) * 100) / 100];
};

function svg_circle_arc_path(x, y, radius, start_angle, end_angle) {
   var end_xy, start_xy;
   start_xy = polar_to_cartesian(x, y, radius, end_angle);
   end_xy = polar_to_cartesian(x, y, radius, start_angle);
   return "M " + start_xy[0] + " " + start_xy[1] + " A " + radius + " " + radius + " 0 0 0 " + end_xy[0] + " " + end_xy[1];
};

function animate_arc(ratio, svg, perc) {
   var arc, center, radius, startx, starty, value;
   arc = svg.path('');
   center = 500;
   radius = 450;
   startx = 0;
   starty = 450; 
   return Snap.animate(0, ratio, (function(val) {
      var path;
      if(val<1) {
         arc.remove();
         path = svg_circle_arc_path(500, 500, 450, -90, val * 180.0 - 90);
         arc = svg.path(path);
         arc.attr({ class: 'data-arc'});
         value = Math.round(val * 100);
         if(value>=100) { 
            perc.text(Math.round(ratio * 100) + ' days'); 
            ratio = 1; 
            return false;
         } else if(value==0) {
            perc.text('Passed'); 
         } else {
            perc.text(Math.round(val * 100) + ' days'); 
         }
      } else {
         arc.remove();
         path = svg_circle_arc_path(500, 500, 450, -90, 180.0 - 90);
         arc = svg.path(path);
         arc.attr({ class: 'data-arc'});
         perc.text(Math.round(ratio * 100) + ' days'); 
         console.log(ratio * 100 + "!!!!")
      }
     
   }), Math.round(1000 * ratio), mina.easeinout, function() { /* Nothing */} );
};

function start_gauges($cont) {
   var $all = $cont.find('.metric');
   $all.each(function() {
      var ratio, svg, perc;
      ratio = $(this).attr('data-ratio'); 
      svg   = Snap($(this).find('svg')[0]);
      perc  = $(this).find('text.percentage');  
      if(ratio<=0.3) {
         $(this).removeClass('good bad ugly').addClass('good');
      } else if(ratio<=0.6) {
         $(this).removeClass('good bad ugly').addClass('bad');
      } else {
         $(this).removeClass('good bad ugly').addClass('ugly'); 
      } 
      animate_arc(ratio, svg, perc); 
   });
}