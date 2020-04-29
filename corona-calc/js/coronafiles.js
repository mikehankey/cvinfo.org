function polar_to_cartesian(t,e,a,s){var r;return r=(s-90)*Math.PI/180,[Math.round(100*(t+a*Math.cos(r)))/100,Math.round(100*(e+a*Math.sin(r)))/100]}function svg_circle_arc_path(t,e,a,s,r){var o,n;return n=polar_to_cartesian(t,e,a,r),o=polar_to_cartesian(t,e,a,s),"M "+n[0]+" "+n[1]+" A "+a+" "+a+" 0 0 0 "+o[0]+" "+o[1]}function animate_arc(a,s,r){var o,n,d;return o=s.path(""),0,d=a,Snap.animate(0,a,function(t){var e;if(t<1){if(o.remove(),e=svg_circle_arc_path(500,500,450,-90,180*t-90),(o=s.path(e)).attr({class:"data-arc"}),100<=(n=Math.round(100*t)))return r.text(Math.round(100*a)+" days"),!(a=1);0==n?r.text("Passed"):r.text(Math.round(100*t)+" days")}else o.remove(),e=svg_circle_arc_path(500,500,450,-90,90),(o=s.path(e)).attr({class:"data-arc"}),r.text(Math.round(100*d)+" days")},Math.round(1e3*a),mina.easeinout,function(){r.text(Math.round(100*d)+" days")})}function start_gauges(t){t.find(".metric").each(function(){animate_arc($(this).attr("data-ratio"),Snap($(this).find("svg")[0]),$(this).find("text.percentage"))})}function convert_zero_day_to_date(t,e){var a=[];for(i=0;i<=t.length-1;i++)dt=e[i].substring(0,4)+"-"+e[i].substring(4,6)+"-"+e[i].substring(6,8),a.push(new Date(dt));return a}function goodBadOrUgly(t,e){return t<30?"good_t":t<60?"bad_t":"ugly_t"}function goodBadOrUglyMike(t,e){if("zeroday"==e)return"good_t"}function goodBadOrUglyMike(t){return"zero_day"==t?"good_t":"ugly_t"}function goodOrBadRow(t,e){return""}function plot_pie(a,s,t,e){0==$("#"+e).parent().find("h3").length&&$("#"+e).parent().prepend("<h3>"+t+"</h3>");var r=["#eaeaea","#e5ac9d","#d35e60","#cc0000"],o=[{labels:s,values:a,type:"pie",textinfo:"percent",textposition:"inside",automargin:!0,marker:{colors:r}}];Plotly.newPlot(e,o,{margin:{t:0,b:20,l:0,r:0},showlegend:!1},{responsive:!0,displayModeBar:!1});var n="<ul>";$.each(s,function(t,e){n+="<li><span style='background-color:"+r[t]+"'></span> "+s[t]+" - "+usFormat(parseInt(a[t]))+"</li>"}),n+="</ul>",$("#"+e).closest(".pie_chart").find(".leg").html(n)}function fillPredictedOutcome(t,e){var a="",s=parseInt($("#f_state_pop").val());_class=t["14_day"].total_dead<t["7_day"].total_dead?"row_good":"row_bad",a+="<tr><th>Deaths</th>                <td>"+usFormat(parseInt(e.deaths))+"</td><td>"+(100*parseInt(e.deaths)/s).toFixed(2)+"%</td>                <td>"+usFormat(parseInt(t["14_day"].total_dead))+"</td><td>"+(100*parseInt(t["14_day"].total_dead)/s).toFixed(2)+"%</td>                <td >"+usFormat(parseInt(t["7_day"].total_dead))+"</td><td>"+(100*parseInt(t["7_day"].total_dead)/s).toFixed(2)+"%</td></tr>",a+="<tr><th>Confirmed Cases</th>                <td>"+usFormat(parseInt(e.cases))+"</td><td>"+(100*parseInt(e.cases)/s).toFixed(2)+"%</td>                <td>"+usFormat(parseInt(t["14_day"].total_cases))+"</td><td>"+(100*parseInt(t["14_day"].total_cases)/s).toFixed(2)+"%</td>                <td>"+usFormat(parseInt(t["7_day"].total_cases))+"</td><td>"+(100*parseInt(t["7_day"].total_cases)/s).toFixed(2)+"%</td></tr>",a+="<tr><th>Non-Tracked Infected</th>               <td>"+usFormat(parseInt(e.total_infected))+"</td><td>"+(100*parseInt(e.total_infected)/s).toFixed(2)+"%</td>               <td>"+usFormat(parseInt(t["14_day"].total_infected))+"</td><td>"+(100*parseInt(t["14_day"].total_infected)/s).toFixed(2)+"%</td>               <td>"+usFormat(parseInt(t["7_day"].total_infected))+"</td><td>"+(100*parseInt(t["7_day"].total_infected)/s).toFixed(2)+"%</td></tr>",a+="<tr><th>Not Infected</th>               <td>"+usFormat(parseInt(e.not_infected))+"</td><td>"+(100*parseInt(e.not_infected)/s).toFixed(2)+"%</td>               <td>"+usFormat(parseInt(t["14_day"].total_not_infected))+"</td><td>"+(100*parseInt(t["14_day"].total_not_infected)/s).toFixed(2)+"%</td>               <td>"+usFormat(parseInt(t["7_day"].total_not_infected))+"</td><td>"+(100*parseInt(t["7_day"].total_not_infected)/s).toFixed(2)+"%</td></tr>",$("#new_trends tbody").html(a)}function fillSummary(t,e,a){var s=$("#forecast"),r=s.find(".14days"),o=s.find(".7days"),n=(s.find(".new"),"<h3>Current forecast and predicted outcome for "+t+" </h3>based on 7 and 14-day NEW CASE trends ");n="<div id='sum_main'><div>";if(document.getElementById("summary").innerHTML=n,n="",0<e["14_day"].zero_day_met&&0<e["7_day"].zero_day_met)if(e["14_day"].zero_day_met==e["7_day"].zero_day_met){var d="Based on current data trends,<br> <span class='good_t'>"+t;d+=" could have zero cases in "+e["14_day"].zero_day_met.toString()+" days."}else{d="Based on current data trends<br><span class='good_t'>"+t;drange=[e["14_day"].zero_day_met,e["7_day"].zero_day_met],d+=" could have zero cases in "+Math.min.apply(null,drange).toString(),d+=" to "+Math.max.apply(null,drange).toString()+" days.</span>"}else if(0==e["14_day"].zero_day_met&&0==e["7_day"].zero_day_met){d="<small>Based on current data trends, </small><br><span class='ugly_t'>"+t;drange=[e["14_day"].herd_immunity_met,e["7_day"].herd_immunity_met],d+=" could reach herd immunity in "+Math.min.apply(null,drange).toString(),d+=" to "+Math.max.apply(null,drange).toString()+" days. </span> "}else{if(0<e["14_day"].zero_day_met){d="<span class='good_t'>Based on the 14-day trend, "+t;d+=" could have zero cases in "+e["14_day"].zero_day_met.toString(),d+="  days, </span> <br> but based on the 7-day trend,  "}else{d="<span class='ugly_t'>Based on the 14-day trend, "+t;d+=" could reach herd immunity in "+e["14_day"].herd_immunity_met.toString(),d+=" days, </span> <br> but based on the 7-day trend, "}0<e["7_day"].zero_day_met?(d+="<br><span class='good_t'> ",d+=" it could have zero cases in "+e["7_day"].zero_day_met.toString()):(d+="<br><span class='ugly_t'> ",d+=" it could reach herd immunity in "+e["7_day"].herd_immunity_met.toString()),d+=" days .</span> "}$("#sum_main").html(d),$("#sum_peak").html(""),createSvg(),0<e["14_day"].zero_day_met?r.update_gauge(e["14_day"].zero_day_met/100,"Zero Cases in","good"):r.update_gauge(e["14_day"].herd_immunity_met/100,"Herd Immunity in","ugly"),0<e["7_day"].zero_day_met?o.update_gauge(e["7_day"].zero_day_met/100,"Zero Cases in","good"):o.update_gauge(e["7_day"].herd_immunity_met/100,"Herd Immunity in","ugly"),0<e.exp.zero_day_met||0<e.exp.herd_immunity_met||(n+="<div class='bad_d'>The curve has not peaked.</div>"),$("#sum_peak").html(n),pie_data=[e["14_day"].total_not_infected,e["14_day"].total_infected,e["14_day"].total_cases,e["14_day"].total_dead],pie_lb=["Not Infected","Infected","Confirmed Cases","Deaths"],plot_pie(pie_data,pie_lb,"14-Day Trend","new_cases_pie_14"),pie_data=[e["7_day"].total_not_infected,e["7_day"].total_infected,e["7_day"].total_cases,e["7_day"].total_dead],plot_pie(pie_data,pie_lb,"7-Day Trend","new_cases_pie_7"),fillPredictedOutcome(e,a),setTimeout(function(){start_gauges(s)},850)}function plot_data_line(t,e,a,s,r,o,n,d,_,l,i){var c=[{x:t,y:e,name:d,type:i},{x:t,y:a,name:"14-Day Trend",type:i},{x:t,y:s,name:"7-Day Trend",type:i},{x:t,y:o,name:"Curve",type:i}],u={range:[0,1.2*Math.max.apply(Math,e)],autorange:!1,yaxis:{title:{text:d},autorange:!0,autotick:!0,ticks:"outside",tick0:0,dtick:.25,ticklen:8,tickwidth:1,tickcolor:"#000"},xaxis:{autotick:!0,ticks:"outside",tick0:0,dtick:.25,ticklen:8,tickwidth:1,tickcolor:"#000"},title:_,margin:{t:80,b:80,l:80,r:80},showlegend:!0,legend:{orientation:"h"}};Plotly.newPlot(l,c,u,{responsive:!0})}function plot_data(t,e,a,s,r,o,n,d,_,l,i){for(var c=Math.max.apply(Math,e)+Math.max.apply(Math,e)/8,u=0;u<=t.length-1;u++)0<e[u]&&(cur_day=t[u]);var y=[{x:t,y:e,name:d,type:i},{x:t,y:a,name:"14-Day Trend",type:"line"},{x:t,y:s,name:"7-Day Trend",type:"line"},{x:t,y:o,name:"Curve",type:"line"}],f={shapes:[{type:"line",x0:cur_day,y0:0,x1:cur_day,yref:"paper",y1:1,line:{color:"grey",width:1.5,dash:"dot"}}],yaxis:{title:{text:d},range:[0,c],autorange:!1,autotick:!0,ticks:"outside",tick0:0,dtick:.25,ticklen:8,tickwidth:1,tickcolor:"#000"},xaxis:{autotick:!0,ticks:"outside",tick0:0,dtick:.25,ticklen:8,tickwidth:1,tickcolor:"#000"},title:_,margin:{t:80,b:80,l:80,r:50},showlegend:!0,legend:{orientation:"h"}};Plotly.newPlot(l,y,f,{responsive:!0})}function linearRegression(t,e){for(var a={},s=e.length,r=0,o=0,n=0,d=0,_=0,l=0;l<e.length;l++)r+=t[l],o+=e[l],n+=t[l]*e[l],d+=t[l]*t[l],_+=e[l]*e[l];return a.slope=(s*n-r*o)/(s*d-r*r),a.intercept=(o-a.slope*r)/s,a.r2=Math.pow((s*n-r*o)/Math.sqrt((s*d-r*r)*(s*_-o*o)),2),a}function forecast_html(t,e,a){var s=$("#"+e.replace(/\s/g,"")+"_cont"),r=s.find(".14days"),o=s.find(".7days"),n=s.find(".3days"),d=s.find(".new");return 9999==t[0]?r.attr("data-ratio",1):r.attr("data-ratio",t[0]/100),9999==t[1]?o.attr("data-ratio",1):o.attr("data-ratio",t[1]/100),9999==t[2]?n.attr("data-ratio",1):n.attr("data-ratio",t[2]/100),9999==t[3]?d.attr("data-ratio",1):t[3]<=0?d.attr("data-ratio",0):d.attr("data-ratio",t[3]/100),setTimeout(function(){start_gauges(s)},2500),out="",9999==t[0]?out+="<li class='bad'>Based on the "+e+" 14 day trajectory, "+a+" will not reach a zero day. </li>":out+="<li class='good'>Based on the "+e+" 14 day trajectory, "+a+" will reach the zero day in "+t[0].toString()+" more days.</li>",9999==t[1]?out+="<li class='bad'>Based on the "+e+" 7 day trajectory, "+a+" will not reach a zero day. ":out+="<li class='good'>Based on the "+e+" 7 day trajectory, "+a+" will reach the zero day in "+t[1].toString()+" more days.",9999==t[2]?out+="<li class='bad'>Based on the "+e+" 3 day trajectory, "+a+" will not reach a zero day. ":out+="<li class='good'>Based on the "+e+" 3 day trajectory, "+a+" will reach the zero day in "+t[2].toString()+" more days.",9999==t[3]?out+="<li class='bad'>Based on the "+e+" curve, "+a+" will not reach a zero day in the next 60 days. ":t[3]<=0?out+="<li class='good'>Based on the "+e+" curve, the zero day for "+a+" has already passed. ":out+="<li class='good'>Based on the "+e+" curve, "+a+" will reach the zero day in "+t[3].toString()+" more days.",out+="</ul>",out}function displayData(t,e,a){ctype="state";var s=t.summary_info.state_name,r=t.summary_info.state_code,o=t.summary_info;if(void 0===a){var n={};for(var d in p=t.county_stats,p)p.hasOwnProperty(d)&&(tc=p[d].county_stats,ccc=tc[tc.length-1].cases,n[d]=ccc);countySelect(n,r),a="ALL"}s=t.summary_info.state_name;var _=parseFloat($("#calc_mortality").val()/100);0==_&&(_=t.summary_info.mortality/100);t.summary_info.cg_med,t.summary_info.cg_med_decay;if(void 0===a||"ALL"==a){var l=1e6*t.summary_info.state_population,i=t.state_stats;full_state_name=s}else{l=t.county_pop[a];i=t.county_stats[a].county_stats;full_state_name=-1===a.toLowerCase().indexOf("city")?a+" County, "+r:a+", "+r,ctype="county"}var c=[],u=[],y=[],f=[],h=[],m=[],g=[],x=[],v=[],b=[],z=0,w=0,I=0,M=0;i.forEach(function(t){void 0!==t.date?(c.push(t.date),this_date=t.date,test_pd=t.tests-I,v.push(test_pd),I=t.tests):(c.push(t.day.replace(/-/g,"")),this_date=t.day.replace(/-/g,"")),u.push(z),y.push(t.cases),last_cases=t.cases,last_deaths=t.deaths,f.push(t.new_cases),h.push(t.new_deaths),w=void 0!==t.cg_last?(m.push(t.cg_last),g.push(t.dg_last),decay=t.cg_last-w,t.cg_last):(m.push(t.case_growth),g.push(t.death_growth),decay=t.case_growth-w,t.case_growth),b.push(t.mortality),z+=1,last_date=this_date,x.push(decay),M=t.mortality}),_=M/100,js_dates=convert_zero_day_to_date(y,c),nc_org=f.slice(),nc_org2=f.slice(),zdv=u.slice(),fit_days=14,title="<b>"+full_state_name+" New Cases</b><br>at "+dateFormat(last_date)+" in days since first case",pred=makeGraph(u,nc_org,title,"Days since first case","New Cases","new_cases_div",fit_days,60),zdv2=u.slice(),zdv3=u.slice(),zdv4=u.slice(),zdv5=u.slice(),zdv6=u.slice(),title="<b>"+full_state_name+" - Growth</b><br>at "+dateFormat(last_date)+" in days since first case",makeGraph(zdv,m,title,"days since first case","Growth","growth_div",fit_days,60),title="<b>"+full_state_name+" - New Deaths</b><br>at "+dateFormat(last_date)+" in days since first case",pred=makeGraph(zdv2,h,title,"Days since first case","New CaDeathsses","new_deaths_div",fit_days,60),title="<b>"+full_state_name+" - Death Growth</b><br>at "+dateFormat(last_date)+" in days since first case",out2=makeGraph(zdv3,g,title,"Days since first case","Death Growth","deaths_growth_div",fit_days,60),title="<b>"+full_state_name+" - Growth Decay</b><br>at "+dateFormat(last_date)+" in days since first case",fitsObj=getFits(zdv4,x),out2=plot_data_line(zdv4,x,fitsObj.ys2,fitsObj.ys3,fitsObj.ys4,fitsObj.exp_ys,"Days since first case","growth decay",title,"decay_div","line"),"state"==ctype&&(title="<b>"+full_state_name+" - Tests per day</b>",out2=makeGraph(zdv2,v,title,"Days since first case","Tests per day","test_div",fit_days,60)),fitsObj=getFits(zdv5,b),title="<b>"+full_state_name+" - Mortality</b><br>at "+dateFormat(last_date)+" in days since first case",out2=plot_data_line(zdv5,b,fitsObj.ys2,fitsObj.ys3,fitsObj.ys4,fitsObj.exp_ys,"Days since first case","mortality percentage",title,"mortality_div","line");var k=f.reduce(function(t,e){return t+e},0);phantom=parseFloat(document.getElementById("calc_phantom").value),herd_thresh=parseFloat(document.getElementById("herd_thresh").value/100),current_zero_day=nc_org2.length,fr=forecast(zdv6,nc_org2,k,_,phantom,l,current_zero_day,herd_thresh),document.getElementById("calc_mortality").value=(100*_).toFixed(2),document.getElementById("f_xs").value=zdv6,document.getElementById("f_ys").value=nc_org2,document.getElementById("f_total_cases").value=k,document.getElementById("f_state_pop").value=l,document.getElementById("f_current_zero_day").value=current_zero_day,document.getElementById("f_state_name").value=s,document.getElementById("f_county").value=a,$("#f_mortality").val(_),o.cases=last_cases,o.deaths=last_deaths,o.total_infected=last_cases*phantom,o.not_infected=l-(last_cases*phantom+last_cases+last_deaths),document.getElementById("f_total_infected").value=o.total_infected,document.getElementById("f_not_infected").value=o.not_infected,document.getElementById("f_cases").value=last_cases,document.getElementById("f_deaths").value=last_deaths,fillSummary(full_state_name,fr,o)}function getFits(t,e){nxs=[],ys2=[],ys3=[],ys4=[],_=[];for(var a=0;a<=t.length;a++)nxs.push(t[a]);var s=[];for(a=0;a<=t.length-1;a++){var r=[t[a],e[a]];s.push(r);var o=t[a]}var n=regression("polynomial",s);for(n.equation[0].toFixed(4),n.equation[1].toFixed(2),n.r2.toFixed(3),a=0;a<=60;a++)tx=o+a,r=[tx,e[a]],s.push(r);var d=extraPoints(s,n),_=[];for(a=0;a<=d.length-1;a++)ey=d[a].y,_.push(ey);lr_xs=t.slice(Math.max(t.length-14,1)),lr_ys=e.slice(Math.max(e.length-14,1)),lx_14=linearRegression(lr_xs,lr_ys),lr_xs=t.slice(Math.max(t.length-7,1)),lr_ys=e.slice(Math.max(e.length-7,1)),lx_7=linearRegression(lr_xs,lr_ys),lr_xs=t.slice(Math.max(t.length-3,1)),lr_ys=e.slice(Math.max(e.length-3,1)),lx_3=linearRegression(lr_xs,lr_ys);for(a=0;a<=t.length-1;a++)X=t[a],Y=e[a],PY14=t.length-14<a+1?lx_14.slope*X+lx_14.intercept:0,PY7=t.length-7<a+1?lx_7.slope*X+lx_7.intercept:0,PY3=t.length-3<a+1?lx_3.slope*X+lx_3.intercept:0,PY14<0&&(PY14=0),PY7<0&&(PY7=0),PY3<0&&(PY3=0),ys2.push(PY14),ys3.push(PY7),ys4.push(PY3);o=X,last_zd14_day=9999,last_zd7_day=9999,last_zd3_day=9999,last_exp_day=9999,proj_days=60;for(a=exp_pos=0;a<=proj_days;a++)TX=o+a,PY14=lx_14.slope*TX+lx_14.intercept,PY7=lx_7.slope*TX+lx_7.intercept,PY3=lx_3.slope*TX+lx_3.intercept,t.push(TX),e.push(0),ys2.push(PY14),ys3.push(PY7),ys4.push(PY3),9999==last_zd14_day&&PY14<=0&&(last_zd14_day=a),9999==last_zd7_day&&PY7<=0&&(last_zd7_day=a),9999==last_zd3_day&&PY3<=0&&(last_zd3_day=a),9999==last_exp_day&&_[a+o]<=0&&1==exp_pos&&(last_exp_day=a),0<_[a+o]&&(exp_pos=1);return robj={nxs:nxs,ys2:ys2,ys3:ys3,ys4:ys4,exp_ys:_},robj}function extraPoints(t,e){name="polynomial";for(var a=[],s=0;s<t.length;s++){var r=t[s][0];switch(name){case"polynomial":a.push({x:r,y:e.equation[2]*Math.pow(r,2)+e.equation[1]*r+e.equation[0]});break;case"exponential":a.push({x:r,y:expoReg.equation[0]*Math.exp(r*expoReg.equation[1])});break;case"power":a.push({x:r,y:powReg.equation[0]*Math.pow(r,powReg.equation[1])});break;case"logarithmic":a.push({x:r,y:logReg.equation[0]+logReg.equation[1]*Math.log(r)});break;case"linear":default:a.push({x:r,y:linReg.equation[0]*r+linReg.equation[1]})}}return a}function recalculate(){for(f_xs_str=document.getElementById("f_xs").value,f_ys_str=document.getElementById("f_ys").value,f_xs_ar=f_xs_str.split(","),f_ys_ar=f_ys_str.split(","),f_xs=[],f_ys=[],i=0;i<f_xs_ar.length;i++)f_xs.push(parseFloat(f_xs_ar[i])),f_ys.push(parseFloat(f_ys_ar[i]));herd_thresh=parseFloat(document.getElementById("herd_thresh").value/100),f_total_cases=parseFloat(document.getElementById("f_total_cases").value),f_mortality=parseFloat(document.getElementById("calc_mortality").value/100),f_phantom=parseFloat(document.getElementById("calc_phantom").value),f_state_pop=parseFloat(document.getElementById("f_state_pop").value),f_current_zero_day=parseFloat(document.getElementById("f_current_zero_day").value),state_name=document.getElementById("f_state_name").value,county=document.getElementById("f_county").value,sum_info={},sum_info.cases=document.getElementById("f_cases").value,sum_info.deaths=document.getElementById("f_deaths").value,sum_info.total_infected=document.getElementById("f_total_infected").value,sum_info.not_infected=document.getElementById("f_not_infected").value,fr=forecast(f_xs,f_ys,f_total_cases,f_mortality,f_phantom,f_state_pop,f_current_zero_day,herd_thresh),fillSummary(state_name,fr,sum_info),extra_data={yd2:fr["14_day"].dys,yd3:fr["14_day"].iys,yd4:[],exp_yd:[]},extra_labels={yd:"Confirmed Cases",yd2:"Deaths",yd3:"Infected",yd4:"",exp_yd:""},title="Impact Forecast for "+state_name+" based on linear projection of 14-Day Trend",div_id="forecast_bar_14",extra_data={yd2:fr["7_day"].dys,yd3:fr["7_day"].iys,yd4:[],exp_yd:[]},extra_labels={yd:"Confirmed Cases",yd2:"Deaths",yd3:"Infected",yd4:"",exp_yd:""},title="Impact Forecast for "+state_name+" based on linear projection of 7-Day Trend",div_id="forecast_bar_7"}function forecast(t,e,a,s,r,o,n,d){ys=e,total_cases_org=a,lr_xs=t.slice(Math.max(t.length-14,1)),lr_ys=ys.slice(Math.max(ys.length-14,1)),lx_14=linearRegression(lr_xs,lr_ys),lr_xs=t.slice(Math.max(t.length-7,1)),lr_ys=ys.slice(Math.max(ys.length-7,1)),lx_7=linearRegression(lr_xs,lr_ys),lr_xs=t.slice(Math.max(t.length-3,1)),lr_ys=ys.slice(Math.max(ys.length-3,1)),lx_3=linearRegression(lr_xs,lr_ys),forecast_result={"14_day":{},"7_day":{},"3_day":{},exp:{}};for(var _=[],l=0;l<=t.length-1;l++){var i=[t[l],ys[l]];_.push(i);var c=t[l];c=l}var u=regression("polynomial",_);for(u.equation[0].toFixed(4),u.equation[1].toFixed(2),u.r2.toFixed(3),l=0;l<=1200;l++)tx=c+l,i=[tx,0],_.push(i);var y=extraPoints(_,u),f=[];last_ey=0,curve_total_cases=total_cases_org,curve_start_day=t.length,curve_end=0;for(l=forecast_result.exp.herd_immunity_met=0;l<=y.length-1;l++)ey=y[l].y,0<l&&last_ey<ey||(ey<0&&0==curve_end&&5<l&&(curve_end=l),0<ey&&(curve_total_cases+=ey)),forecast_result.exp.total_cases=curve_total_cases,forecast_result.exp.total_dead=curve_total_cases*s,forecast_result.exp.death_percent=curve_total_cases*s/o*100,forecast_result.exp.total_infected=curve_total_cases*r,forecast_result.exp.infected_percent=curve_total_cases*r/o*100,80<=forecast_result.exp.death_percent+forecast_result.exp.infected_percent&&0==final_status14&&(forecast_result.exp.herd_immunity_met=l-n),f.push(ey),last_ey=ey;forecast_result.exp.zero_day_met=curve_end-n,forecast_result.exp.total_cases=curve_total_cases,forecast_result.exp.total_not_infected=o-forecast_result.exp.total_infected-forecast_result.exp.total_dead,forecast_result.exp.niperc=forecast_result.exp.total_not_infected/o*100,fxs_14=[],fxs_7=[],fxs_3=[],fxs_exp=[],fys_14=[],fys_7=[],fys_3=[],fys_exp=[],final_status=0,zero_day_met=0,l=herd_met=0;var p=a,h=a,m=a;for(forecast_result["14_day"].zero_day_met=0,forecast_result["7_day"].zero_day_met=0,forecast_result["3_day"].zero_day_met=0,final_status14=0,final_status7=0,final_status3=0,forecast_result["14_day"].herd_immunity_met=0,forecast_result["7_day"].herd_immunity_met=0,forecast_result["3_day"].herd_immunity_met=0,forecast_result["14_day"].xs=[],forecast_result["7_day"].xs=[],forecast_result["3_day"].xs=[],forecast_result["14_day"].ys=[],forecast_result["7_day"].ys=[],forecast_result["3_day"].ys=[],forecast_result["14_day"].dys=[],forecast_result["7_day"].dys=[],forecast_result["3_day"].dys=[],forecast_result["14_day"].niys=[],forecast_result["7_day"].niys=[],forecast_result["3_day"].niys=[],forecast_result["14_day"].iys=[],forecast_result["7_day"].iys=[],forecast_result["3_day"].iys=[];0==final_status14||0==final_status7||0==final_status3;)TX=n+l,PY14=lx_14.slope*TX+lx_14.intercept,PY7=lx_7.slope*TX+lx_7.intercept,PY3=lx_3.slope*TX+lx_3.intercept,PY14<0&&(PY14=0),PY7<0&&(PY7=0),PY3<0&&(PY3=0),0<PY14&&0==final_status14&&(p+=PY14),0<PY7&&(h+=PY7),0<PY3&&(m+=PY3),PY14<=0&&0==forecast_result["14_day"].zero_day_met&&(forecast_result["14_day"].zero_day_met=TX-n,final_status14=1),PY7<=0&&0==forecast_result["7_day"].zero_day_met&&(forecast_result["7_day"].zero_day_met=TX-n,final_status7=1),PY3<=0&&0==forecast_result["3_day"].zero_day_met&&(forecast_result["3_day"].zero_day_met=TX-n,final_status3=1),1!=final_status14&&(forecast_result["14_day"].total_cases=parseInt(p),forecast_result["14_day"].total_dead=parseInt(p*s),forecast_result["14_day"].death_percent=p*s/o*100,forecast_result["14_day"].total_infected=p*r+p,forecast_result["14_day"].infected_percent=forecast_result["14_day"].total_infected/o*100,forecast_result["14_day"].dys.push(PY14*s),forecast_result["14_day"].niys.push(forecast_result["14_day"].total_not_infected),forecast_result["14_day"].iys.push(r*PY14),forecast_result["14_day"].xs.push(TX),forecast_result["14_day"].ys.push(PY14)),1!=final_status7&&(forecast_result["7_day"].total_cases=parseInt(h),forecast_result["7_day"].total_dead=parseInt(h*s),forecast_result["7_day"].death_percent=h*s/o*100,forecast_result["7_day"].total_infected=h*r+h,forecast_result["7_day"].infected_percent=forecast_result["14_day"].total_infected/o*100,forecast_result["7_day"].dys.push(PY7*s),forecast_result["7_day"].niys.push(forecast_result["7_day"].total_not_infected),forecast_result["7_day"].iys.push(r*PY7),forecast_result["7_day"].xs.push(TX),forecast_result["7_day"].ys.push(PY7)),1!=final_status3&&(forecast_result["3_day"].total_cases=parseInt(m),forecast_result["3_day"].dys.push(p*s),forecast_result["3_day"].total_dead=parseInt(m*s),forecast_result["3_day"].death_percent=m*s/o*100,forecast_result["3_day"].total_infected=parseInt(m*r)+parseInt(m),forecast_result["3_day"].infected_percent=m*r/o*100,forecast_result["3_day"].xs.push(TX),forecast_result["3_day"].ys.push(PY3)),impacted_14t=forecast_result["14_day"].total_cases+forecast_result["14_day"].total_dead+forecast_result["14_day"].total_infected,impacted_7t=forecast_result["7_day"].total_cases+forecast_result["7_day"].total_dead+forecast_result["7_day"].total_infected,impacted_3t=forecast_result["3_day"].total_cases+forecast_result["3_day"].total_dead+forecast_result["3_day"].total_infected,impacted_14=(forecast_result["14_day"].total_cases+forecast_result["14_day"].total_dead+forecast_result["14_day"].total_infected)/o,impacted_7=(forecast_result["7_day"].total_cases+forecast_result["7_day"].total_dead+forecast_result["7_day"].total_infected)/o,impacted_3=(forecast_result["3_day"].total_cases+forecast_result["3_day"].total_dead+forecast_result["3_day"].total_infected)/o,impacted_14>d&&0==final_status14&&(final_status14=1,forecast_result["14_day"].herd_immunity_met=TX-n),impacted_7>=d&&0==final_status7&&(final_status7=1,forecast_result["7_day"].herd_immunity_met=TX-n),impacted_3>=d&&0==final_status3&&(final_status3=1,forecast_result["3_day"].herd_immunity_met=TX-n),5e3<(l+=1)&&(final_status7=1,final_status14=1,final_status3=1);return impacted_14=(forecast_result["14_day"].total_cases+forecast_result["14_day"].total_dead+forecast_result["14_day"].total_infected)/o,impacted_7=(forecast_result["7_day"].total_cases+forecast_result["7_day"].total_dead+forecast_result["7_day"].total_infected)/o,impacted_3=(forecast_result["3_day"].total_cases+forecast_result["3_day"].total_dead+forecast_result["3_day"].total_infected)/o,forecast_result["14_day"].total_not_infected=o-impacted_14t,forecast_result["14_day"].niperc=impacted_14/o*100,forecast_result["7_day"].total_not_infected=o-impacted_7t,forecast_result["7_day"].niperc=impacted_7/o*100,forecast_result["3_day"].total_not_infected=o-impacted_3t,forecast_result["3_day"].niperc=impacted_3/o*100,forecast_result}function makeGraph(t,e,a,s,r,o,n,d){for(var _,l=t.slice(0),i=e.slice(0),c=[],u=[],y=[],f=0;f<=l.length-1;f++){var p=[l[f],i[f]];y.push(p);var h=l[f]}var m=regression("polynomial",y);for(m.equation[0].toFixed(4),m.equation[1].toFixed(2),m.r2.toFixed(3),f=0;f<=60;f++)p=[h+f,i[f]],y.push(p);var g=extraPoints(y,m),x=[],v=0;for(f=0;f<=g.length-1;f++)v=g[f].y,x.push(v);var b=linearRegression(l.slice(Math.max(l.length-n,1)),i.slice(Math.max(i.length-n,1))),z=linearRegression(l.slice(Math.max(l.length-7,1)),i.slice(Math.max(i.length-7,1)));for(f=0;f<=l.length-1;f++){var w=l[f];i[f];if(l.length-14<f+1)var I=b.slope*w+b.intercept;else I=0;if(l.length-7<f+1)var M=z.slope*w+z.intercept;else M=0;if(I<0)I=0;if(M<0)M=0;c.push(I),u.push(M)}h=w,last_zd14_day=9999,last_zd7_day=9999,last_zd3_day=9999,last_exp_day=9999;for(f=exp_pos=0;f<=d;f++)TX=h+f,I=b.slope*TX+b.intercept,M=z.slope*TX+z.intercept,l.push(TX),i.push(0),c.push(I),u.push(M),9999==last_zd14_day&&I<=0&&(last_zd14_day=f),9999==last_zd7_day&&M<=0&&(last_zd7_day=f),9999==last_exp_day&&x[f+h]<=0&&1==exp_pos&&(last_exp_day=f),0<x[f+h]&&(exp_pos=1);return 9999==last_exp_day&&x.slice(-1)[0]<=0&&(last_exp_day=0),_=[last_zd14_day,last_zd7_day,last_exp_day],plot_data(l,i,c,u,[],x,s,r,a,o,"bar"),_}function load_data(t){var e=$("#state_selector").val(),a=$("#county_selector").val(),s="../json/"+e+".json";""!==$.trim(e)&&getJSONData(s,e,a,t)}function change_state(){$("#county_select").html(""),load_data()}function getJSONData(t,d,_,l){void 0===l&&show_loader(),$.ajax({type:"get",url:t,dataType:"json",success:function(t,e,a){if(displayData(t,d,_),$("#county_selector").unbind("change").change(function(){load_data()}),""!=init_select_county){var s=[],r=[];$("#county_selector option").each(function(t,e){s.push(e.value),s.push(e.value.replace(/\s/g,"")),s.push(e.value.replace("'","").replace(/\s/g,"")),s.push(e.value.replace("'","")),s.push(e.value.replace(".","")),s.push(e.value.replace(".","").replace("'","")),s.push(e.value.replace(".","").replace("'","").replace(/\s/g,"")),r.push(t),r.push(t),r.push(t),r.push(t),r.push(t),r.push(t),r.push(t)});var o=s.indexOf(init_select_county);if(0<o){var n=$("#county_selector option").get(r[o]);$("#county_selector").val($(n).attr("value")).trigger("change")}s=null,init_select_county=""}void 0===l?hide_loader():($("#recalculate").html($("#recalculate").attr("data-htmlx")),$("#recalculate").removeAttr("data-htmlx"),$("body").removeClass("wait"))},error:function(t,e,a){alert("Result: "+e+" "+a+" "+t.status+" "+t.statusText),hide_loader()}})}function plot_data_bars(t,e,a,s,r,o,n,d,_){var l=[{x:t,y:e,name:s.yd,type:_},{x:t,y:extra_data.yd2,name:o,name:s.yd2,type:_},{x:t,y:extra_data.yd3,name:o,name:s.yd3,type:_},{x:t,y:extra_data.yd4,name:"3-Day Trend",type:_},{x:t,y:extra_data.exp_yd,name:"Curve",type:_}],i={barmode:"stack",title:n,yaxis:{title:{text:o},autorange:!0,autotick:!0,ticks:"outside",tick0:0,dtick:.25,ticklen:8,tickwidth:4,tickcolor:"#000"},xaxis:{title:{text:r},autotick:!0,ticks:"outside",tick0:0,dtick:.25,ticklen:8,tickwidth:4,tickcolor:"#000"}};Plotly.newPlot(d,l,i,{responsive:!0,displayModeBar:!1})}var init_select_county;function usFormat(t){return String(t).replace(/(.)(?=(\d{3})+$)/g,"$1,")}function dateFormat(t){return t.replace(/(\d{4})(\d{2})(\d{2})/,"$1/$2/$3")}function show_loader(){$("body").addClass("wait"),$(".box, .metric, #summary, .bad_d,  #results").css("visibility","hidden"),$(".outcome tbody").html(""),$("#loader").css("display","block")}function hide_loader(t){void 0===t&&(t=!0),t&&$(".box, .metric, #summary,  .bad_d, #results").css("visibility","visible"),$("body").removeClass("wait"),$("#loader").css("display","none"),$("#state_select").css("display","block")}function reset(){$("#herd_thresh").val(60),$("#calc_phantom").val(4),$("#calc_mortality").val((100*$("#f_mortality").val()).fixed(2)),$("#reset").click(function(){reset(),$("#recalculate").trigger("click")})}function countySelect(t,e){var a="<select id='county_selector'><option value='ALL'>All Counties</option>",s=[],r=[];for(var o in t)t.hasOwnProperty(o)&&s.push([o,t[o]]);for(sorted=s.sort(function(t,e){return e[1]-t[1]}),i=0;i<=sorted.length-1;i++)"Unknown"!=$.trim(sorted[i][0])&&(a+='<option value="'+sorted[i][0]+'">'+sorted[i][0]+" ("+usFormat(sorted[i][1])+")</option>\n",r.push(sorted[i][0]));a+="<input type=hidden id='state' value='"+e+"'></select>",$("#county_select").html(a)}function createSvg(){$("#forecast .14days,#forecast .7days").html('      <svg viewBox="0 0 1000 500">         <path d="M 950 500 A 450 450 0 0 0 50 500"></path>         <text class="title" text-anchor="middle" alignment-baseline="middle" x="500" y="240" font-size="90" font-weight="normal"></text>         <text class="percentage" text-anchor="middle" alignment-baseline="middle" x="500" y="395" font-size="145" font-weight="bold"></text>         </svg><div class="trend">14-Day trend</div>'),$("#forecast .7days .trend").text("7-Day trend")}$.fn.extend({update_gauge:function(t,e,a){$(this).attr("data-ratio",t),$(this).find(".title").text(e),$(this).removeClass("good bad ugly"),$(this).addClass(a)}}),function(t,e){"function"==typeof define&&define.amd?define("regression",e):"undefined"!=typeof module?module.exports=e():t.regression=e()}(this,function(){"use strict";function h(t,o){var s=t.reduce(function(t,e){return t+e[1]},0)/t.length,e=t.reduce(function(t,e){var a=e[1]-s;return t+a*a},0);return 1-t.reduce(function(t,e,a){var s=o[a],r=e[1]-s[1];return t+r*r},0)/e}function m(t,e){var a=Math.pow(10,e);return Math.round(t*a)/a}var o={linear:function(t,e,a){for(var s,r,o,n=[0,0,0,0,0],d=t.length,_=0;_<d;_++)null!==t[_][1]&&(n[0]+=t[_][0],n[1]+=t[_][1],n[2]+=t[_][0]*t[_][0],n[3]+=t[_][0]*t[_][1],n[4]+=t[_][1]*t[_][1]);return r=(d*n[3]-n[0]*n[1])/(d*n[2]-n[0]*n[0]),o=n[1]/d-r*n[0]/d,s=t.map(function(t){var e=t[0];return[e,r*e+o]}),{r2:h(t,s),equation:[r,o],points:s,string:"y = "+m(r,a.precision)+"x + "+m(o,a.precision)}},linearthroughorigin:function(t,e,a){for(var s,r,o=[0,0],n=0;n<t.length;n++)null!==t[n][1]&&(o[0]+=t[n][0]*t[n][0],o[1]+=t[n][0]*t[n][1]);return s=o[1]/o[0],r=t.map(function(t){var e=t[0];return[e,s*e]}),{r2:h(t,r),equation:[s],points:r,string:"y = "+m(s,a.precision)+"x"}},exponential:function(t,e,a){for(var s,r,o,n,d=[0,0,0,0,0,0],_=0;_<t.length;_++)null!==t[_][1]&&(d[0]+=t[_][0],d[1]+=t[_][1],d[2]+=t[_][0]*t[_][0]*t[_][1],d[3]+=t[_][1]*Math.log(t[_][1]),d[4]+=t[_][0]*t[_][1]*Math.log(t[_][1]),d[5]+=t[_][0]*t[_][1]);return s=d[1]*d[2]-d[5]*d[5],r=Math.exp((d[2]*d[3]-d[5]*d[4])/s),o=(d[1]*d[4]-d[5]*d[3])/s,n=t.map(function(t){var e=t[0];return[e,r*Math.exp(o*e)]}),{r2:h(t,n),equation:[r,o],points:n,string:"y = "+m(r,a.precision)+"e^("+m(o,a.precision)+"x)"}},logarithmic:function(t,e,a){for(var s,r,o,n=[0,0,0,0],d=t.length,_=0;_<d;_++)null!==t[_][1]&&(n[0]+=Math.log(t[_][0]),n[1]+=t[_][1]*Math.log(t[_][0]),n[2]+=t[_][1],n[3]+=Math.pow(Math.log(t[_][0]),2));return r=(d*n[1]-n[2]*n[0])/(d*n[3]-n[0]*n[0]),s=(n[2]-r*n[0])/d,o=t.map(function(t){var e=t[0];return[e,s+r*Math.log(e)]}),{r2:h(t,o),equation:[s,r],points:o,string:"y = "+m(s,a.precision)+" + "+m(r,a.precision)+" ln(x)"}},power:function(t,e,a){for(var s,r,o,n=[0,0,0,0],d=t.length,_=0;_<d;_++)null!==t[_][1]&&(n[0]+=Math.log(t[_][0]),n[1]+=Math.log(t[_][1])*Math.log(t[_][0]),n[2]+=Math.log(t[_][1]),n[3]+=Math.pow(Math.log(t[_][0]),2));return r=(d*n[1]-n[2]*n[0])/(d*n[3]-n[0]*n[0]),s=Math.exp((n[2]-r*n[0])/d),o=t.map(function(t){var e=t[0];return[e,s*Math.pow(e,r)]}),{r2:h(t,o),equation:[s,r],points:o,string:"y = "+m(s,a.precision)+"x^"+m(r,a.precision)}},polynomial:function(t,e,a){var s,r,o,n,d,_,l,i,c=[],u=[],y=0,f=0,p=t.length;for(r=void 0===e?3:e+1,o=0;o<r;o++){for(d=0;d<p;d++)null!==t[d][1]&&(y+=Math.pow(t[d][0],o)*t[d][1]);for(c.push(y),s=[],n=y=0;n<r;n++){for(d=0;d<p;d++)null!==t[d][1]&&(f+=Math.pow(t[d][0],o+n));s.push(f),f=0}u.push(s)}for(u.push(c),l=function(t,e){var a=0,s=0,r=0,o=0,n=0,d=t.length-1,_=new Array(e);for(a=0;a<d;a++){for(s=(o=a)+1;s<d;s++)Math.abs(t[a][s])>Math.abs(t[a][o])&&(o=s);for(r=a;r<1+d;r++)n=t[r][a],t[r][a]=t[r][o],t[r][o]=n;for(s=a+1;s<d;s++)for(r=d;a<=r;r--)t[r][s]-=t[r][a]*t[a][s]/t[a][a]}for(s=d-1;0<=s;s--){for(n=0,r=s+1;r<d;r++)n+=t[r][s]*_[r];_[s]=(t[d][s]-n)/t[s][s]}return _}(u,r),_=t.map(function(t){var s=t[0],e=l.reduce(function(t,e,a){return t+e*Math.pow(s,a)},0);return[s,e]}),i="y = ",o=l.length-1;0<=o;o--)i+=1<o?m(l[o],a.precision)+"x^"+o+" + ":1===o?m(l[o],a.precision)+"x + ":m(l[o],a.precision);return{r2:h(t,_),equation:l,points:_,string:i}},lastvalue:function(t,e,a){for(var s=[],r=null,o=0;o<t.length;o++)null!==t[o][1]&&isFinite(t[o][1])?(r=t[o][1],s.push([t[o][0],t[o][1]])):s.push([t[o][0],r]);return{r2:h(t,s),equation:[r],points:s,string:""+m(r,a.precision)}}};return function(t,e,a,s){var r="object"==typeof a&&void 0===s?a:s||{};return r.precision||(r.precision=2),"string"==typeof t?o[t.toLowerCase()](e,a,r):null}}),$(function(){var t,e,a=[];$("#state_selector").removeAttr("disabled"),$("body").removeClass("wait"),$("#state_selector").change(function(){change_state()}),$("#recalculate").click(function(){$(this).attr("data-htmlx",$(this).html()).html("Computing..."),$("body").addClass("wait"),load_data(!1)}),$("#reset").click(function(){reset()}),hide_loader(!1),0<(t=decodeURIComponent(window.location.href)).indexOf("?")&&(0<(e=t.substring(t.indexOf("?")+1,t.length)).indexOf("+")&&(init_select_county=e.substring(e.indexOf("+")+1,e.length),e=e.substring(0,e.indexOf("+"))),$("#state_selector option").each(function(t,e){a.push(e.value)}),0<a.indexOf(e)&&$("#state_selector").val(e).trigger("change"),a=null),window.scrollTo(0,0)});