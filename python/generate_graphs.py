# Generate static graphs 
import os
import sys
import json
import csv
import plotly.graph_objects as go
import plotly.express as px
import numpy as np

from plotly.subplots import make_subplots
from datetime import *
from utils import *

# Generate a graph (cases) for Maryland Zip Code
# Here we pass all the data
def generate_MD_zip_graph_with_avg(data,name,folder,_color):
    
   if(len(data['stats'])>0):
      all_x = []
      all_y = []
      all_x_avg = []
      all_y_avg = []

      # 7 days average
      first_val = -1
      total_day = 0
      max_day = 7 # Average based on max_day days

      _type = "cases"

      tempValForAvg = []
      tempValFormax_day = []

      for d in data['stats']:
         for day in d:
            
            # Warning - it looks like in Maryland, they put a lot of cases on the first day in the stats
            # so we ignore the data in the graphs to have something legible
            d_day = day.split('-')
            b1 = date(int(d_day[0]), int(d_day[1]), int(d_day[2]))

            if(b1 > date(2020, 4, 12)):

               # Org Data
               all_x.append(day) 
               all_y.append(d[day][_type]) 
            
               # For average of _type
               tempValForAvg.append(float(d[day][_type]))

               if(len(tempValForAvg) <  max_day):
                  tempValFormax_day = tempValForAvg 
               else: 
                  tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)] 
                  
               # We have strings...
               tempValFormax_day = [float(i) for i in tempValFormax_day]

               all_x_avg.append(day)
               all_y_avg.append(np.mean(tempValFormax_day))  

      if(_color=="r"):
         _color = "red"
      elif(_color=="g"):
         _color = "green"
      elif(_color=="o"):
         _color = "orange"
      else:
         _color = "black"

      print("Generating graph for zip: " + name + " color: " + _color)
 
      fig = go.Figure()
      fig.add_trace(go.Bar(x=all_x, y=all_y, marker_color='rgba(158,158,158,.4)' ))
      fig.add_trace(go.Scatter(x=all_x_avg, y=all_y_avg, marker_color=_color))

      # Add line to every 1s & 15th of all months
      for d in all_x:
         if(d.endswith('15') or d.endswith('01')):
            fig.add_shape(
               type="line",
               x0=d,
               y0=0,
               x1=d,
               y1=np.max(all_y),
               opacity=0.4,
               line=dict(
                  color="rgba(0,0,0,.7)",
                  width=1,
                  dash="dot",
               )
            )


      fig.update_xaxes(rangemode="nonnegative")
      fig.update_yaxes(rangemode="nonnegative")
   
      fig.update_layout(
         width=350,
         height=350, 
         margin=dict(l=30, r=20, t=0, b=20),   # Top 0 with no title
         paper_bgcolor='rgba(255,255,255,1)',
         plot_bgcolor='rgba(255,255,255,1)',
         showlegend= False        
      )  

      #print(folder + name + " > created")
      fig.write_image(folder + name + ".png") 
         

# Generate Large Graph for the State Detail page
# with 3day average line value, new cases & tests
# WARNING THIS IS THE DUAL AXIS VERSION WITH CASES & TESTS
def generate_dual_graph_test_and_cases(state, _color, folder, large = False):
   
   # Daily Data
   cur_json_file = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + ".json", 'r')
   data = json.load(cur_json_file)

   all_x = []
   all_y = []

   all_x_test=[]
   all_y_test=[]

   for d in data['stats']:
     
      for day in d:

         # Org Data
         all_x.append(day) 
         all_y.append(d[day]['cases']) 

         all_x_test.append(day) 
         all_y_test.append(d[day]['test']) 

   # Get 3Day average data (only on large version)
   if(large is True):
      all_x_avg3, all_y_avg3, delta3 = get_avg_data(3,state,'cases')

   # Get 7Day average data 
   all_x_avg7, all_y_avg7, delta7 = get_avg_data(7,state,'cases')
 
   if(_color=="r"):
      _color = "red"
      _3dcolor = "rgba(255,0,0,0.5)"
   elif(_color=="g"):
      _color = "green"
      _3dcolor = "rgba(34,139,34,0.5)"
   elif(_color=="o"):
      _color = "orange"
      _3dcolor = "rgba(255,165,0,0.5)"
   else:
      _color = "black"
      _3dcolor = "rgba(0,0,0,0.5)"
   
   # Create Fig with secondary ax
   fig = make_subplots(specs=[[{"secondary_y": True}]])
 
   fig.update_xaxes(rangemode="nonnegative")
   fig.update_yaxes(rangemode="nonnegative")
   
   # Add the cases bars
   fig.add_trace(go.Bar(x=all_x, y=all_y, marker_color='rgba(158,158,158,.4)', name="New Cases" ),  secondary_y=True )

   # We had the # of tests on a secondary y-axis
   if(large is True):
      # With put the raw data
      fig.add_trace(go.Scatter(x=all_x_test, y=all_y_test, name="Tests",  line=dict(  color= "purple",  width=2 )))   
   else:
      # Get 7Day average data for Tests (so we have a smoother line)
      all_x_test, all_y_test, deltaX = get_avg_data(7,state,'test')
      fig.add_trace(go.Scatter(x=all_x_test, y=all_y_test, name="7-Day Avg Tests",  line=dict(  color= "purple",  width= 1 )))   

   # Add Cases on Secondary 
   fig.add_trace(go.Scatter(x=all_x_avg7, y=all_y_avg7, marker_color=_color, name="Day-7 Avg. New Cases",  line=dict(  color=  _color,  width=2 )),  secondary_y=True )
  
   
   if(large is True):
      fig.add_trace(go.Scatter(x=all_x_avg3, y=all_y_avg3, name="Day-3 Avg. New Cases",  line=dict(  color= _3dcolor,  width=2  )),  secondary_y=True)
   

   # Get MAX Y for drawing the 1st & 15th lines
   # + the lockdown period 
   max_y = np.max([np.max(all_y),np.max(all_y_test)])
 
   # Add line to every 1s & 15th of all months
   for date in all_x:
      if(date.endswith('15') or date.endswith('01')):
         fig.add_shape(
            type="line",
            x0=date,
            y0=0,
            x1=date,
            y1=max_y, 
            opacity=0.4,
            line=dict(
               color="rgba(0,0,0,.5)",
               width=1,
            ),
             layer="below"
         )
 

   # Do we have a period in key-dates.txt
   # for the current state?
   key_dates = open(KEY_DATES,'r')
   csv_reader = csv.DictReader(key_dates)
   rows = list(csv_reader) 
   start_lockdown_date  = -1
   end_lockdown_date    = -1

   for key_date_row in rows:
      if(key_date_row['state']==state):
         start_lockdown_date = key_date_row['start']  
         
         if(key_date_row['end'] is not None):
            end_lockdown_date = key_date_row['end']

   # Add lockdown period
   if(start_lockdown_date!=-1 and start_lockdown_date is not None ):

      if(end_lockdown_date!=-1 and end_lockdown_date is not None):

         fig.add_shape(
            type="rect",
            x0=start_lockdown_date,
            y0=0,
            x1=end_lockdown_date,
            y1=max_y,
            fillcolor="LightSalmon",
            opacity=0.1, 
            line_width=0,
            layer="below"
         )

      elif(start_lockdown_date is not None):
         
         fig.add_shape( 
            type="rect",
            x0=start_lockdown_date,
            y0=0,
            x1=all_x[len(all_x)-1],
            y1=max_y,
            fillcolor="LightSalmon",
            opacity=0.1, 
            line_width=0, 
            layer="below"
         )


   if(large is True):
      fig.update_layout(
         width=1000,
         height=450, 
         title = US_STATES[state] + " Tests and New Cases",
         margin=dict(l=30, r=20, t=45, b=30),   # Top Title
         paper_bgcolor='rgba(255,255,255,1)',
         plot_bgcolor='rgba(255,255,255,1)',
         showlegend= True,
         yaxis2=dict(  showgrid=False,
             titlefont=dict(
               color=_color
            )
         ),
          yaxis1=dict(  showgrid=False,
             titlefont=dict(
               color="purple"
            ) 
         ),
         legend_orientation="h"
      )  

      fig.update_yaxes(title_text="<b>Tests</b>", secondary_y=False)
      fig.update_yaxes(title_text="<b>New Cases</b>", secondary_y=True)

   else:
      fig.update_layout(
         width=455,
         height=290, 
         margin=dict(l=30, r=20, t=0, b=20),   # Top 0 with no title
         paper_bgcolor='rgba(255,255,255,1)',
         plot_bgcolor='rgba(255,255,255,1)',
         showlegend= False,
         yaxis2=dict(
            showgrid=False,
            titlefont=dict(   color=_color   ) 
         ),
         yaxis1=dict( 
            showgrid=False,
            titlefont=dict(   color="purple"  ) 
         ),
         legend_orientation="h"
      )  

         
      fig.update_yaxes(title_text="<b>7D Avg. Tests</b>", secondary_y=False)
      fig.update_yaxes(title_text="<b>New Cases</b>", secondary_y=True)

 

   if(large is True):
      fig.write_image(folder + os.sep + state + "_blg.png") 
   else:
      fig.write_image(folder + os.sep + state + "_tac.png")  # Tac for test & cases

# Generate a graph based on state, type (like deaths, cases, mortality etc.) & color
# For states & county
def generate_graph_with_avg(state, _type, _color, folder, county, large=False):
   
   # Get JSON Data for current state or county
   if(county != '' and 'for_a_state' not in county):
      cur_json_file = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + "counties" + os.sep +  county + ".json", 'r')
   else:
      cur_json_file = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + ".json", 'r')
   
   data = json.load(cur_json_file)
 
   # Do we have a period in key-dates.txt
   # for the current state?
   key_dates = open(KEY_DATES,'r')
   csv_reader = csv.DictReader(key_dates)
   rows = list(csv_reader) 
   start_lockdown_date  = -1
   end_lockdown_date    = -1

   for key_date_row in rows:
      if(key_date_row['state']==state):
         start_lockdown_date = key_date_row['start']  
         
         if(key_date_row['end'] is not None):
            end_lockdown_date = key_date_row['end']
         

   if(county=="" or 'for_a_state' in county):
      all_data = data['stats']
   else:
      all_data = data
      # We sort the data by inverse date for counties
      all_data = list(reversed(all_data))
   
   # All Data
   all_x = []
   all_y = []


   if(_type != 'mortality'):
      # 7day Average Data
      all_x_avg, all_y_avg, delta = get_X_day_avg(7,all_data,_type)
     
      for d in all_data:
         for day in d:
            # Org Data
            all_x.append(day) 
            all_y.append(d[day][_type]) 

   else:
  
      # We compute the Mortality rate
      # (total_dead/total_cases) *100 
      for d in all_data:
         for day in d: 
            all_x.append(day)
            if(d[day]['total_c']>0):
               all_y.append(d[day]['total_d']*100/d[day]['total_c'])
            else:
               all_y.append(0)

      # Compute the 7d avg for mortality
      tempValForAvg = []
      tempValFormax_day = []
      all_x_avg = []
      all_y_avg = []
      max_day = 7

      for c,y in enumerate(all_y): 

         # For average of _type
         tempValForAvg.append(y)

         if(len(tempValForAvg) <  max_day):
            tempValFormax_day = tempValForAvg 
         else: 
            tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)] 
                 
         all_x_avg.append(all_x[c])
         all_y_avg.append(np.mean(tempValFormax_day))   
 
   if(_color=="r"):
      _color = "red"
   elif(_color=="g"):
      _color = "green"
   elif(_color=="o"):
      _color = "orange"
   else:
      _color = "black"
    
   fig = go.Figure()
   fig.add_trace(go.Bar(x=all_x, y=all_y, marker_color='rgba(158,158,158,.4)'))
   fig.add_trace(go.Scatter(x=all_x_avg, y=all_y_avg, marker_color=_color))
   
 
   # Add line to every 1s & 15th of all months
   for date in all_x:
      if(date.endswith('15') or date.endswith('01')):
         fig.add_shape(
            type="line",
            x0=date,
            y0=0,
            x1=date,
            y1=np.max(all_y),
            opacity=0.4,
            line=dict(
                color="rgba(0,0,0,.5)",
                width=1,

            )
         )


   # Add lockdown period
   if(start_lockdown_date!=-1 and start_lockdown_date is not None ):

      if(end_lockdown_date!=-1 and end_lockdown_date is not None):
 
         fig.add_shape(
            type="rect",
            x0=start_lockdown_date,
            y0=0,
            x1=end_lockdown_date,
            y1=np.max(all_y),
            fillcolor="LightSalmon",
            opacity=0.1,
            layer="below",
            line_width=0,
         )
 
      elif(start_lockdown_date is not None):
           
         fig.add_shape( 
            type="rect",
            x0=start_lockdown_date,
            y0=0,
            x1=all_x[len(all_x)-1],
            y1=np.max(all_y),
            fillcolor="LightSalmon",
            opacity=0.1,
            layer="below",
            line_width=0, 
         )
 

   fig.update_xaxes(rangemode="nonnegative")
   fig.update_yaxes(rangemode="nonnegative")
 

   fig.update_layout(
      width=350,
      height=350, 
      margin=dict(l=30, r=20, t=0, b=20),   # Top 0 with no title
      paper_bgcolor='rgba(255,255,255,1)',
      plot_bgcolor='rgba(255,255,255,1)',
      showlegend= False,
   )  
 
   if(county ==""):
      fig.write_image(folder + os.sep + state + ".png") 
      print("Graph for " + state + ' Cases (' +  _color + ') created')
   elif('for_a_state' in county):
      tmp = county.split('|')[1]
      fig.write_image(folder + os.sep + tmp + ".png") 
      print("Graph for " + state + '  ' +  tmp + '  created')
   else:
      fig.write_image(folder + os.sep + county + ".png") 
      print("Graph for " + county + ", " + state + ' Cases (' +  _color + ') created')
  

   if(large is True):
      # We also save the larger version of the graph
      fig.update_layout(
         width=1000,
         height=350, 
         margin=dict(l=30, r=20, t=0, b=20),   # Top 0 with no title
         paper_bgcolor='rgba(255,255,255,1)',
         plot_bgcolor='rgba(255,255,255,1)',
         showlegend= False,
      )  

      if(county ==""):
         fig.write_image(folder + os.sep + state + "_lg.png") 
         print("Graph for " + state + ' Cases (' +  _color + ') Larger Version created')
      elif('for_a_state' in county):
         tmp = county.split('|')[1]
         fig.write_image(folder + os.sep + tmp + "_lg.png") 
         print("Graph for " + state + '  ' +  tmp + ' Larger Version created')
      else:
         fig.write_image(folder + os.sep + county + "_lg.png") 
         print("Graph for " + county + ", " + state + ' Cases (' +  _color + ') Larger Version created')





def main_menu():
   print("---------------")
   print(" Enter the attributes of the graph ")
   print("---------------") 
   state = input("State Code (ex: AK): ") 
   _color = input("Color ('r' for red ,'g' for green, 'o' for orange, 'b' for black):")
   generate_graph_with_avg(state, 'cases', _color, PATH_TO_STATES_FOLDER + os.sep + state, '')


if __name__ == "__main__":
   os.system("clear")
   #main_menu()
   #generate_graph_with_avg("FL", 'test_pos_p', "r", PATH_TO_STATES_FOLDER + os.sep + "FL"  + os.sep , 'for_a_state|test_pos_p')
   #generate_graph_with_avg("CA", 'mortality', "r", PATH_TO_STATES_FOLDER + os.sep + "CA"  + os.sep , 'for_a_state|mortaliy')
   #generate_graph_with_avg("CA", 'mortality', "r", PATH_TO_STATES_FOLDER + os.sep + "CA"  + os.sep , 'for_a_state|mortaliy', True)

   #generate_large_graph_with_avg("CA",  "r", PATH_TO_STATES_FOLDER + os.sep + "CA"  + os.sep)
   generate_dual_graph_test_and_cases("CA", "r", PATH_TO_STATES_FOLDER + os.sep + "CA"  + os.sep, True)
   generate_dual_graph_test_and_cases("CA", "r", PATH_TO_STATES_FOLDER + os.sep + "CA"  + os.sep, False)