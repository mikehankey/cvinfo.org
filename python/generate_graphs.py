# Generate static graphs 
import os
import sys
import json
import plotly.graph_objects as go
import plotly.express as px
import numpy as np

from utils import PATH_TO_STATES_FOLDER, display_us_format 
  
# Generate a graph based on state, type (like deaths, cases, etc.) & color
def generate_graph_with_avg(state, _type, _color, folder, county):
   
   # Get JSON Data for current state
   if(county==''):
      cur_json_file = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + ".json", 'r')
   elif(county != '' and 'for_a_state' not in county):
      cur_json_file = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + "counties" + os.sep +  county + ".json", 'r')
   else:
      cur_json_file = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + ".json", 'r')
   
   data = json.load(cur_json_file)

   all_x = []
   all_y = []

   all_x_avg = []
   all_y_avg = []

   # 7 days average
   first_val = -1
   total_day = 0
   max_day = 7 # Avergage based on max_day days

   tempValForAvg = []
   tempValFormax_day = []
   
   if(county=="" or 'for_a_state' in county):
      all_data = data['stats']
   else:
      all_data = data
      # We sort the data by inverse date for counties
      all_data = list(reversed(all_data))
 
 
  
   # Get the DATA & Compute the max_day average
   for d in all_data:
     
      for day in d:

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
    
   fig = go.Figure()
   fig.add_trace(go.Bar(x=all_x, y=all_y, marker_color='rgba(158,158,158,.4)' ))
   fig.add_trace(go.Scatter(x=all_x_avg, y=all_y_avg, marker_color=_color))
    
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
      print("Graph for " + state + ' (' +  _color + ') created')
   elif('for_a_state' in county):
      tmp = county.split('|')[1]
      fig.write_image(folder + os.sep + tmp + ".png") 
      print("Graph for " + state + '  ' +  tmp + '  created')
   else:
      fig.write_image(folder + os.sep + county + ".png") 
      print("Graph for " + county + ", " + state + ' (' +  _color + ') created')
  

def main_menu():
   print("---------------")
   print(" Enter the attributes of the graph ")
   print("---------------") 
   state = input("State Code (ex: AK): ") 
   _color = input("Color ('r' for red ,'g' for green, 'o' for orange, 'b' for black):")
   generate_graph_with_avg(state, 'cases', _color, PATH_TO_STATES_FOLDER + os.sep + state, '')


if __name__ == "__main__":
   os.system("clear")
   main_menu()
   #generate_graph_with_avg("CA", 'cases', "r", PATH_TO_STATES_FOLDER + os.sep + "CA" + os.sep + "counties" + os.sep, 'Los Angeles')