#!/usr/bin/python3 

import os
import numpy as np
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt
from pylab import savefig


from covid import cfe, load_json_file, save_json_file, load_state_names


def make_plot(title, x_lab, y_lab, xd, yd,outfile):
   print("XD:", xd)
   print("YD:", yd)
   sns.set(style="darkgrid")
   index = []
   for i in range(0,len(xd)):
      index.append(0)
   if len(xd) == 1:
      df = pd.DataFrame(dict(time=np.array(xd),
                        value=np.array(yd), index=index))
   else:
      df = pd.DataFrame(dict(time=np.array(xd),
                        value=np.array(yd),index=index ))

   print(df)

   g = sns.relplot(x="time", y="value", kind="line", data=df)
   g.fig.autofmt_xdate()
   g.set_axis_labels(x_lab, y_lab)

   g.fig.savefig(outfile, dpi=400)

field_desc = {
      'new_cases' : "New Cases ",
      'new_deaths' : "New Deaths ",
      'cases' : "Total Cases",
      'deaths' : "Total Deaths",
      'cpm' : "Cases Per Million",
      'dpm' : "Deaths Per Million",
      'case_growth' : "Case Growth % (1 day)",
      'death_growth' : "Death Growth % (1 day)",
      'cg_med' : "Case Growth % (3 day median)",
      'dg_med' : "Death Growth % (3 day median)",
      'mortality' : "Mortality % ",
      'recovered' : "Recovered",
      'hospital_now' : "Hospitalized",
      'icu_now' : "ICU",
      'vent_now' : "On Ventilator"
}


state = "USA"
js = load_json_file("json/USA.json")
js_vals = js['js_vals']
zdays = []
for field in js_vals:
   if field == 'dates':
      dates = js_vals['dates']
      for d in range(0,len(dates)):
         zdays.append(d)
   else:
      for i in range(0,len(dates)):
         if i > 0:
            zero_days = zdays[0:i]
            plot_dates = dates[0:i]
            plot_vals = js_vals[field][0:i]
         else:
            zero_days = zdays[0:i]
            plot_dates = dates[0]
            plot_vals = js_vals[field][0]
         outfile = "anim/graphs/" + state + "/" + state + "-" + field + "-" + dates[i] + ".png"
         if cfe(outfile) == 0:
            print("PLOT!",field) 
            title = "test"
            x_lab = "Zero Day"
            y_lab = field_desc[field]
            outdir = "anim/graphs/" + state + "/" 
            if cfe(outdir, 1) == 0:
               os.makedirs(outdir)
            print("AR:", zero_days ) 
            print("AR:", plot_vals) 
            make_plot(title, x_lab, y_lab, zero_days,plot_vals,outfile)
