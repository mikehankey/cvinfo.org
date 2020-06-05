import json
import sys
import numpy as np
from utils import *


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


if __name__ == "__main__":
   os.system("clear")
   print(rank_states())