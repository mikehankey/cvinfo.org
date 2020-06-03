# Generate static graphs 
import os
import sys
import json
import plotly.graph_objects as go

FILE_TYPES = ['new_cases_per_million','new_deaths_per_million','total_cases_per_million','total_deaths_per_million']
TYPES_SLUG = ['ncpm','ndpm','tcpm','tdpm']
DATA_PATH = "." + os.sep + "covid-19-intl-data"
US_STATES_DATA_PATH = DATA_PATH + os.sep + "US"

# Type = related slug
def generate_graph_with_avg(state, _type, title):

   print("Creating the graph...")

   # Get JSON Data for current state
   cur_json_file = open(US_STATES_DATA_PATH + os.sep + state + ".json", 'r')
   data = json.load(cur_json_file)

   all_x = []
   all_y = []

   # Get the X (dates)
   for d in data:
      all_x.append(d) 
      all_y.append(data[d][_type]) 
      
   fig = go.Figure(data=[go.Bar(x=all_x, y=all_y)])
   fig.update_traces(marker_color='rgba(158,158,158,.8)')
   fig.update_layout(title_text=title)
 
   fig.write_image("test.png") 
       


def main_menu():
   print("---------------")
   print(" Enter the state and the type ('ncpm','ndpm','tcpm','tdpm') of graph you want to generate ")
   print("---------------") 
   state = input("State Code: ") 
   _type = input("Type:")
   _title = input("Graph title:")
   generate_graph_with_avg(state,_type, _title)

if __name__ == "__main__":
   os.system("clear")
   main_menu()