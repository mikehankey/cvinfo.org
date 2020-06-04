# Generate static graphs 
import os
import sys
import json
import plotly.graph_objects as go
from statistics import mean 
 
TYPES_SLUG = ['ncpm','ndpm','tcpm','tdpm']
DATA_PATH = "." + os.sep + "covid-19-intl-data"
US_STATES_DATA_PATH = DATA_PATH + os.sep + "US"
US_STATES_ABBR = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'Washington DC', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', }
 
# Generate a graph based on state, type (see TYPES_SLUG) & color
def generate_graph_with_avg(state, _type, _color, folder):

   

   # Get JSON Data for current state
   cur_json_file = open(US_STATES_DATA_PATH + os.sep + state + ".json", 'r')
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
   
   # Get the DATA
   for d in data:
      all_x.append(d) 
      all_y.append(data[d][_type]) 

      # Average
      tempValForAvg.append(data[d][_type])

      if(len(tempValForAvg)<max_day):
         tempValFormax_day = tempValForAvg;
      else:
         tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)];

      # We have strings...
      tempValFormax_day = [float(i) for i in tempValFormax_day]

      all_x_avg.append(d)
      all_y_avg.append(mean(tempValFormax_day))  


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

 
   fig.update_layout(
      width=350,
      height=350, 
      margin=dict(l=30, r=20, t=5, b=20),
      paper_bgcolor='rgba(255,255,255,1)',
      plot_bgcolor='rgba(255,255,255,1)',
      showlegend= False,
      title={ 
        'y':1,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top' 
      }  
   )

   # Add State as title
   #fig.update_layout(
   #      title =  dict(
   #         text =US_STATES_ABBR[state],
   #         font =   dict( 
   #                  color = 'black')
   #      )
   #)
   
   fig.write_image(folder + os.sep + state + ".png") 
   #print(folder + os.sep + state + ".png  created")
   print("Graph for " + state + ' (' +  _color + ') created')
       


def main_menu():
   print("---------------")
   print(" Enter the attributes of the graph ")
   print("---------------") 
   state = input("State Code (ex: AK): ") 
   _type = input("Type ('ncpm','ndpm','tcpm' or 'tdpm'):")
   _color = input("Color ('r' for red ,'g' for green, 'o' for orange, 'b' for black):")
   generate_graph_with_avg(state,_type, _color)

if __name__ == "__main__":
   os.system("clear")
   main_menu()