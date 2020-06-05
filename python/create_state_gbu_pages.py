import json
import sys
import glob
import numpy as np
from utils import *
from generate_graphs import *


def generate_gbu_graphs_and_state_page(state,groups): 
   
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

      for county in groups[group]:
 
         # Get county name
         county_name = os.path.basename(county).replace('.json','')

         # Generate the Image
         ##print("Create Graph for " + county_name)
         generate_graph_with_avg(state, 'cases', color, PATH_TO_STATES_FOLDER + os.sep + state + os.sep + 'counties', county)

         # Get the DOM Element
         domEl += create_county_DOM_el(state,county_name)

      # Add to the template 
      template = template.replace('{'+group.upper()+'}',domEl)
    
   # Save Template as main state page
   main_gbu_page = open('../corona-calc/states/'+state+'/index.html','w+')
   main_gbu_page.write(template)
   main_gbu_page.close()

   print("State gbu page (../corona-calc/states/"+state+"/index.html) created")

# Rank counties for a given state
def rank_counties(st):
   
   print("Ranking  "  + US_STATES[st] + "'s counties")

   groups = {'good': [], 'bad': [], 'ugly': []} 
   tmp_cases = []

   # Glob the related directory 
   all_countries_json_file = glob.glob(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + "counties"  + os.sep  + "*.json")
   
   for county in all_countries_json_file:  

      # Open related json file under covid-19-intl-data
      tmp_json = open(county,  'r')
      county_data = json.load(tmp_json)
      max_val = 0 

      # Get county name from path
      county_name = os.path.basename(county).replace('.json','')

      for day in county_data: 
         
         for date in day:

            tmp_cases.append(float(day[date]['cases']))  
            
            if len(tmp_cases) < 7:
            
               avg = int(np.mean(tmp_cases))
            
            else: 
              
               avg = int(np.mean(tmp_cases[-7:]))
            
            if avg > max_val:
               max_val = avg
      
      if(max_val!=0):
         last_val_perc = avg / max_val 
      else:
         last_val_perc = 0

      if last_val_perc >= .8 and avg > 5:
         groups['ugly'].append(county_name) 
      elif .4 < last_val_perc < .8 and avg > 5:
         groups['bad'].append(county_name) 
      else:
         groups['good'].append(county_name) 
   
   return groups


# Create County HTML Element with image
def create_county_DOM_el(st,ct) :
   return '<div class="graph_g"><h3 class="nmb">'+ct+', ' + st +'</h3><img  src="./states'+os.sep+st+os.sep+st+'counties'+os.sep+ct+'.png" width="345" alt="'+ct+'"/></div>' 