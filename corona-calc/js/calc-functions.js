function getFits(xs,ys) {
 
   var nxs = [];
   var ys2  = [];
   var ys3  = [];
   var ys4  = [];
   var exp_ys  = [];
   var rdata = []; 
   var point, last_x, linReg, exp;

   for (var i = 0; i <= xs.length; i++) {
      nxs.push(xs[i])
   }

   // curve fit
   for (var i  = 0; i <= xs.length -1; i++) {
      point = [xs[i], ys[i]];
      rdata.push(point);
      last_x = xs[i];
   }

   linReg = regression('polynomial', rdata);
   for (var i = 0; i<= 60; i++) {
      tx = last_x + i
      point = [tx, ys[i]]
      rdata.push(point)
   }

   exp = extraPoints(rdata,linReg)
 
   for (var i  = 0; i <= exp.length -1; i++) {
      ey = exp[i].y
      exp_ys.push(ey)
   }

   // 14 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 14, 1));
   lr_ys = ys.slice(Math.max(ys.length - 14, 1));
   lx_14 = linearRegression(lr_xs,lr_ys);

   // 7 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 7 , 1));
   lr_ys = ys.slice(Math.max(ys.length - 7, 1));
   lx_7 = linearRegression(lr_xs,lr_ys);
 
   for (var i  = 0; i <= xs.length -1; i++) {
      X = xs[i];
      Y = ys[i];

      if (xs.length - 14 < i + 1) {
         PY14 = lx_14['slope'] * X + lx_14['intercept']
      } else {
         PY14 = 0
      }

      if (xs.length - 7 < i + 1) {
         PY7 = lx_7['slope'] * X + lx_7['intercept']
      }
      else {
         PY7 = 0
      }
 
      if (PY14 < 0) {    PY14 = 0  }
      if (PY7 < 0) {  PY7 = 0   }
  
      ys2.push(PY14);
      ys3.push(PY7);
   }

   // add 60 day projections
   last_x = X;
   last_zd14_day = 9999;
   last_zd7_day = 9999;
   last_exp_day = 9999;

   proj_days = 60;
   exp_pos = 0;

   for (var i = 0; i <= proj_days; i++) {
      TX = last_x + i
      PY14 = lx_14['slope'] * TX + lx_14['intercept']
      PY7 = lx_7['slope'] * TX + lx_7['intercept'] 
      xs.push(TX)
      ys.push(0)
      ys2.push(PY14)
      ys3.push(PY7) 

      if (last_zd14_day == 9999 && PY14 <= 0) {
         last_zd14_day = i
      }
      if (last_zd7_day == 9999 && PY7 <= 0) {
         last_zd7_day = i
      }  
      if (last_exp_day == 9999 && exp_ys[i+last_x] <= 0 && exp_pos == 1) {
         last_exp_day = i
      }
      if (exp_ys[i+last_x] > 0) {
         exp_pos = 1
      }

   }
 
   robj = {
      "nxs" : nxs,
      "ys2" : ys2,
      "ys3" : ys3, 
      "exp_ys" : exp_ys
   }
 
   return(robj)
}