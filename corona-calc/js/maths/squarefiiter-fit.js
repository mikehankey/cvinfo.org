function compute_trend_square_fitter(start_day,y_data,max_time) {
   var res = [];
   for(var i=0; i<max_time; i++) {
      res.push(linearProject(y_data.slice(y_data.length-start_day,y_data.length),y_data.length+i));
   } 
   return res;
}


function SquareFitter() {
    this.count = 0;
    this.sumX = 0;
    this.sumX2 = 0;
    this.sumX3 = 0;
    this.sumX4 = 0;
    this.sumY = 0;
    this.sumXY = 0;
    this.sumX2Y = 0;
}

SquareFitter.prototype = {
    'add': function(x, y)
    {
        this.count++;
        this.sumX += x;
        this.sumX2 += x*x;
        this.sumX3 += x*x*x;
        this.sumX4 += x*x*x*x;
        this.sumY += y;
        this.sumXY += x*y;
        this.sumX2Y += x*x*y;
    },
    'project': function(x)
    {
        var det = this.count*this.sumX2*this.sumX4 - this.count*this.sumX3*this.sumX3 - this.sumX*this.sumX*this.sumX4 + 2*this.sumX*this.sumX2*this.sumX3 - this.sumX2*this.sumX2*this.sumX2;
        var offset = this.sumX*this.sumX2Y*this.sumX3 - this.sumX*this.sumX4*this.sumXY - this.sumX2*this.sumX2*this.sumX2Y + this.sumX2*this.sumX3*this.sumXY + this.sumX2*this.sumX4*this.sumY - this.sumX3*this.sumX3*this.sumY;
        var scale = -this.count*this.sumX2Y*this.sumX3 + this.count*this.sumX4*this.sumXY + this.sumX*this.sumX2*this.sumX2Y - this.sumX*this.sumX4*this.sumY - this.sumX2*this.sumX2*this.sumXY + this.sumX2*this.sumX3*this.sumY;
        var accel = this.sumY*this.sumX*this.sumX3 - this.sumY*this.sumX2*this.sumX2 - this.sumXY*this.count*this.sumX3 + this.sumXY*this.sumX2*this.sumX - this.sumX2Y*this.sumX*this.sumX + this.sumX2Y*this.count*this.sumX2;
        return (offset + x*scale + x*x*accel)/det;
    }
};

function squareProject(data,x) {
    var fitter = new SquareFitter();
    for (var i = 0; i < data.length; i++) {
        fitter.add(i, data[i]);
    }
    return fitter.project(x);
}