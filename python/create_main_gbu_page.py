import json
import sys
import numpy as np
from utils import *
from generate_graphs import *


# Create Groups of Good, Ugly & Bad States
# for main GBU page
def rank_states():
   
   print("Ranking the states...")

   groups = {'good': [], 'bad': [], 'ugly': []} 
   tmp_cases = []

   for st in US_STATES:  

      # Open related json file under covid-19-intl-data
      tmp_json = open(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + st + ".json",  'r')
      state_data = json.load(tmp_json)
      max_val = 0

      for day in state_data['stats']:

         for date in day:
          
            tmp_cases.append(float(day[date]['cases']))  
         
            if len(tmp_cases) < 7:
               avg = int(np.mean(tmp_cases))
            else: 
               avg = int(np.mean(tmp_cases[-7:]))
            
            if avg > max_val:
               max_val = avg

      last_val_perc = avg / max_val 
      if last_val_perc >= .8 and avg > 5:
         groups['ugly'].append(st) 
      elif .4 < last_val_perc < .8 and avg > 5:
         groups['bad'].append(st) 
      else:
         groups['good'].append(st) 
   
   return groups



# Create State HTML Element with image
def create_state_DOM_el(st) :
   return '<div class="graph_g"><h3 class="nmb">'+US_STATES[st]+'</h3><a href="./'+st+'/index.html"><img src=".'+os.sep+st+os.sep+st+'.png" width="345" alt="'+US_STATES[st]+'"/></a></div>' 


# Create Graphics for all states 
# and insert them into the GBU template (main page)
def generate_gbu_graphs_and_main_page(groups): 
   color = ""

   # Open Template
   f_template =  open(GBU_MAIN_TEMPLATE,  'r')
   template = f_template.read() 
   f_template.close() 
  
   for group in groups:

      if(group == 'ugly'):
         color = "r"
      elif(group == 'bad'):
         color = "o"
      else:
         color = "g"
      
      domEl = ""

      for state in groups[group]:

         # Generate the Main Graph
         generate_graph_with_avg(state, 'cases', color, PATH_TO_STATES_FOLDER + os.sep + state, '')

         # Create the Summary Graphs for all the sub pages for the state
         generate_graph_with_avg(state, 'deaths', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|deaths')           # New Deaths per Day
         generate_graph_with_avg(state, 'test_pos_p', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|test_pos_p')   # Positive Tests
         generate_graph_with_avg(state, 'test', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|test')               # New Test per day  
         generate_graph_with_avg(state, 'act_hosp', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|act_hosp')       # Active Hospi

         # Get the DOM Element
         domEl += create_state_DOM_el(state)

      # Add to the template 
      template = template.replace('{'+group.upper()+'}',domEl)
    
   # Save Template as main gbu page
   main_gbu_page = open('../corona-calc/states/index.html','w+')
   main_gbu_page.write(template)
   main_gbu_page.close()

   print("Main gbu page (corona-calc/states/index.html) created")


if __name__ == "__main__":
   os.system("clear")
   generate_gbu_graphs_and_main_page(rank_states())