import json
import sys
import glob
import numpy as np
from utils import *
from generate_graphs import *

# Rank counties for a given state
def rank_counties(st):
   
   print("Ranking the counties for "  + US_STATES[st])

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