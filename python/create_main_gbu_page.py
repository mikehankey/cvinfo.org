import json
import sys
import numpy as np
import random
from utils import *
from generate_graphs import *



# Create Groups of Good, Ugly & Bad States
# for main GBU page
def rank_states():
   
   print("Ranking the states...")

   groups = {'good': [], 'bad': [], 'ugly': [] } 
  

   for st in US_STATES:  

      # Open related json file under covid-19-intl-data
      tmp_json = open(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + st + ".json",  'r')
      state_data = json.load(tmp_json)
      max_val = 0
      all_avg = []
      tmp_cases = []
 
      for day in state_data['stats']:
 
         for date in day:
          
            tmp_cases.append(float(day[date]['cases']))  
         
            if len(tmp_cases) <= 7:
               avg = int(np.mean(tmp_cases)) 
            else: 
               avg = int(np.mean(tmp_cases[-7:])) 
              
            if avg > max_val:
               max_val = avg

            all_avg.append(avg)
 
      last_val_perc = avg / max_val
 
      if last_val_perc >= .8 and avg > 5:
         groups['ugly'].append(st) 
      elif .4 < last_val_perc < .8 and avg > 5:
         groups['bad'].append(st) 
      else:
         groups['good'].append(st) 
 
   return groups



# Get the place of "DC" (for "Washington DC")
# in a list - otherwise, it doesn't sort well...
def sort_width_dc(all_groups):

   # Warning: we need to move DC
   if('DC' in all_groups):
      tmp_group = all_groups
      tmp_group = [g.replace('DC', 'WAS') for g in tmp_group]
      tmp_group = sorted(tmp_group)
      index_of_dc = tmp_group.index("WAS")
      all_groups.remove('DC')
      all_groups.insert(index_of_dc, 'DC')
   return all_groups


 

# Get Extra info for a given state
def get_state_extra_info(state):
 
   # Get the 7-day average data for the current state
   day7_avg_Dates, day7_avg_Values, delta7 = get_avg_data(7,state) 

   # Get the 14-day average data for the current state
   day14_avg_Dates, day14_avg_Values, delta14 = get_avg_data(14,state) 
 

   json_ftmp = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + '.json')
   data = json.load(json_ftmp)
   json_ftmp.close()
   
   last_update    =  data['sum']['last_update']
   total_death    =  data['sum']['cur_total_deaths']
   total_case     =  data['sum']['cur_total_cases']

   for d in data['stats'][len(data['stats'])-1]:
      last_new_cases  =  data['stats'][len(data['stats'])-1][d]['cases']
      last_new_deaths =  data['stats'][len(data['stats'])-1][d]['deaths'] 

   
   return {'last_update':  last_update, 
           'total_death': total_death,
           'total_case': total_case, 
           'last_new_cases': last_new_cases, 
           'last_new_deaths':last_new_deaths,
           'delta7': round(delta7,2) ,
           'delta14':  round(delta14,2) }


# Create Graphics for all states 
# and insert them into the GBU template (main page)
def generate_gbu_graphs_and_main_page(groups): 
   color = ""

   # Open Template
   f_template =  open(GBU_MAIN_TEMPLATE,  'r')
   template = f_template.read() 
   f_template.close() 

   # Random Number for non-cached images
   rand = random.randint(1,100000001)
  
   for group in groups:

      if(group == 'ugly'):
         color = "r"
      elif(group == 'bad'):
         color = "o"
      else:
         color = "g"
      
      domEl = ""

      all_groups =  sort_width_dc(sorted(groups[group]))

      for state in all_groups:

         # Generate the Main Graph
         generate_graph_with_avg(state, 'cases', color, PATH_TO_STATES_FOLDER + os.sep + state, '')

         # Generate Graph Detail
         # Larger version with 3d trendline 
         generate_large_graph_with_avg(state, 'cases', color, PATH_TO_STATES_FOLDER + os.sep + state)

         # Create the Summary Graphs for all the sub pages for the state
         generate_graph_with_avg(state, 'deaths', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|deaths')           # New Deaths per Day
         generate_graph_with_avg(state, 'test_pos_p', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|test_pos_p')   # Positive Tests
         generate_graph_with_avg(state, 'test', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|test')               # New Test per day  
         generate_graph_with_avg(state, 'act_hosp', color, PATH_TO_STATES_FOLDER + os.sep + state, 'for_a_state|act_hosp')       # Active Hospi

         # Get Extra Data to display (above the graphs)
         all_state_details = get_state_extra_info(state)

         # Get the DOM Element
         domEl += create_state_DOM_el(state,all_state_details,str(rand))

      # Add to the template 
      template = template.replace('{'+group.upper()+'}',domEl)


   # Update the last update value on the template
   # by the last update of the last state
   template = template.replace('{LAST_UPDATE}',all_state_details['last_update'])
   

   # Save Template as main gbu page
   main_gbu_page = open('../corona-calc/states/index.html','w+')
   main_gbu_page.write(template)
   main_gbu_page.close()

   print("Main gbu page (corona-calc/states/index.html) created")

 

# Create State HTML Element with image
def create_state_DOM_el(st,all_state_details,rand) :
   return '<div class="graph_g">\
            <h3 class="nmb">'+US_STATES[st]+'</h3>\
            <h4>&Delta;14: '+ str(all_state_details['delta14']) +' -  &Delta;7: '+ str(all_state_details['delta7']) +'</small><br>\
            <small>New cases on '+all_state_details['last_update']+': ' +  display_us_format(all_state_details['last_new_cases'],0)  + '</small>\
            <a href="./'+st+'/index.html"><img src=".'+os.sep+st+os.sep+st+'.png?v='+rand+'" width="345" alt="'+US_STATES[st]+'"/></a>\
            <small>Total Cases: '+display_us_format(all_state_details['total_case'],0) +' - Total Deaths: '+ display_us_format(all_state_details['total_death'],0) +'</small></div>' 
 
if __name__ == "__main__":
   os.system("clear")
   generate_gbu_graphs_and_main_page(rank_states())

 