function compute_trend_least_square_fit(y_data,first_day,max_date) {
   var _x = [], _y = [], i=0; 
  
   while(first_day<=max_date) {
      _y.push(linearProject(y_data,y_data.length+i));
      first_day = new Date(first_day);
      first_day.setDate(first_day.getDate() + 1);
      _x.push(first_day); 
      i++;
   }
 
   return {x:_x,y:_y};
}


function LineFitter() {
    this.count = 0;
    this.sumX = 0;
    this.sumX2 = 0;
    this.sumXY = 0;
    this.sumY = 0;
}

LineFitter.prototype = {
    'add': function(x, y)  {
        this.count++;
        this.sumX += x;
        this.sumX2 += x*x;
        this.sumXY += x*y;
        this.sumY += y;
    },
    'project': function(x)
    {
        var det = this.count * this.sumX2 - this.sumX * this.sumX;
        var offset = (this.sumX2 * this.sumY - this.sumX * this.sumXY) / det;
        var scale = (this.count * this.sumXY - this.sumX * this.sumY) / det;
        return parseInt(offset + x * scale);
    }
};

function linearProject(data, x) {
    var fitter = new LineFitter();
    for (var i = 0; i < data.length; i++)  {
        fitter.add(i, data[i]);
    }
    return fitter.project(x);
}