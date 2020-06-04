import sys
import os
import json
import numpy as np

from generate_graphs import generate_graph_with_avg
from international_covid import US_STATES_DATA_PATH

#################################################################################################
# GLOBAL VARS
dir_path = os.path.dirname(os.path.realpath(__file__))
if('/var/www/projects/' in dir_path):
   from conf_vince import *   
else:
   from conf import *

US_STATES_ABBR = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'Washington DC', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', }
GBU_IMAGE_PATH = ORG_PATH + os.sep + 'gbu_images'


# Compare State 
def compare_state(st,state_sum_data) :   
   groups = {
      'good': {},
      'bad': {},
      'ugly': {},
      'low_cases': {}
   }

   rel_data = {
      'st': {}
   } 

   day_data = {
      'st': {}
   } 
  


   # We open the related JSON file created by covid.py
   tmp_json = open(JSON_PATH + "/" + st + ".json",  'r')
   sd = json.load(tmp_json)
   cd = sd['county_stats']

   if "Unknown" in cd:
      del cd['Unknown']

   for county in sorted(cd):
      max_val = 0
      cs = cd[county]['county_stats']
      temp = []
      temp_tests = []
      temp_tests_pos = []

      rel_data[county] = {
         'cases':[],
         'avg_cases': [],
         'days': []
      } 
      day_data[county] = []

      for stat in cs:
         temp.append(stat['new_cases'])
         if len(temp) < 7:
            avg = np.mean(temp)
         else:
            avg = np.mean(temp[-7:])
         if avg < 0: 
            avg = 0
         day_data[county].append(stat['day'])
         rel_data[county]['avg_cases'].append(avg)
         if stat['new_cases'] > 0: 
            rel_data[county]['cases'].append(stat['new_cases'])
         else:
            rel_data[county]['cases'].append(0)
         rel_data[county]['days'].append(stat['day'])
         if avg > max_val:
            max_val = avg
      last_val_perc = avg / max_val 
      max_val = np.max(rel_data[county]['avg_cases'])
      if max_val <= 5:
         groups['low_cases'][county] = rel_data[county]
      elif last_val_perc >= .8 and avg > 5:
         groups['ugly'][county] = rel_data[county]
      elif .4 < last_val_perc < .8 and avg > 5:
         groups['bad'][county] = rel_data[county]
      else:
         groups['good'][county] = rel_data[county]

   jdata = {}
   jdata['groups'] = groups
   jdata['sum_data'] = state_sum_data
   jdata['day_data'] = day_data
   save_json_file("json/" + st + "-gbu.json", jdata)

# Create GBU Graphics and json files
def create_gbu(): 
 
   rel_data = {}
   groups = {'good': {}, 'bad': {}, 'ugly': {}} 
   sum_data = {}

   for st in US_STATES_ABBR: 
      print(US_STATES_ABBR[st]) 

      # We open the related JSON file created by covid.py
      tmp_json = open(JSON_PATH + "/" + st + ".json",  'r')
      state_data = json.load(tmp_json)


      rel_data[st] = {
         'cases': [],
         'avg_cases': [],
         'days': [],
      }

      sum_data[st] = {
         'avg': {
            'days': [],
            'cases': [],
            'deaths': [],
            'tests_pos': [],
            'tests_neg': [],
            'hospital': [] 
         },
         'stats':  {
            'cases': [],
            'deaths': [],
            'tests_pos': [],
            'tests_neg': [],
            'hospital': [] 
         },
      }
        
      stats = state_data['state_stats']

      temp = []
      temp_deaths = []
      temp_tests_pos = []
      temp_tests_neg = []
      temp_hosp = []
      max_val = 0

      for ss in stats:
         cases = ss['new_cases']
         hospital= int(ss['hospital_now'])
         deaths = ss['new_deaths']
         tests_pos = ss['tests_new_pos']
         tests_neg = ss['tests_new_neg']
         temp.append(cases)
         temp_deaths.append(deaths)
         temp_tests_pos.append(tests_pos)
         temp_tests_neg.append(tests_neg)
         temp_hosp.append(int(hospital))
         if len(temp) < 7:
            avg = int(np.mean(temp))
            avg_deaths = int(np.mean(temp_deaths))
            avg_tests_pos = int(np.mean(temp_tests_pos))
            avg_tests_neg = int(np.mean(temp_tests_neg))
            avg_hosp = int(np.mean(temp_hosp)) 
         else: 
            avg = int(np.mean(temp[-7:]))
            avg_deaths = int(np.mean(temp_deaths[-7:]))
            avg_tests_pos = int(np.mean(temp_tests_pos[-7:]))
            avg_tests_neg = int(np.mean(temp_tests_neg[-7:])) 
            avg_hosp = int(np.mean(temp_hosp[-7:]))
        
         rel_data[st]['avg_cases'].append(avg)
         rel_data[st]['cases'].append(cases)
         dd = ss['date']
         yy = dd[0:4]
         mm = dd[4:6]
         dd = dd[6:8]
         date = yy + "-" + mm + "-" + dd
         rel_data[st]['days'].append(date) 

         sum_data[st]['avg']['days'].append(date)
         sum_data[st]['avg']['cases'].append(avg)
         sum_data[st]['avg']['deaths'].append(avg_deaths)
         sum_data[st]['avg']['tests_pos'].append(avg_tests_pos)
         sum_data[st]['avg']['tests_neg'].append(avg_tests_neg)
         sum_data[st]['avg']['hospital'].append(avg_hosp)
         sum_data[st]['stats']['cases'].append(cases)
         sum_data[st]['stats']['deaths'].append(deaths)
         sum_data[st]['stats']['tests_pos'].append(tests_pos)
         sum_data[st]['stats']['tests_neg'].append(tests_neg)
         sum_data[st]['stats']['hospital'].append(hospital)
         if avg > max_val:
            max_val = avg

      last_val_perc = avg / max_val 
      if last_val_perc >= .8 and avg > 5:
         groups['ugly'][st] = rel_data[st]
         sum_data[st]['group'] = "ugly"
      elif .4 < last_val_perc < .8 and avg > 5:
         groups['bad'][st] = rel_data[st]
         sum_data[st]['group'] = "bad"
      else:
         groups['good'][st] = rel_data[st]
         sum_data[st]['group'] = "good"
       
      compare_state(st, sum_data[st])

   json_data = {
      'groups': groups,
      'state_names': state_names
   }
   
   save_json_file("json/gbu-states.json", json_data)
   key_dates()
   herd_master()
   plot_herd()




# Create Groups of Good, Ugly & Bad States
# for main GBU page
def rank_states():
   
   groups = {'good': [], 'bad': [], 'ugly': []} 
   tmp_cases = []

   for st in US_STATES_ABBR: 
      print("Parsing " + US_STATES_ABBR[st] +  " data") 

      # Open related json file under covid-19-intl-data
      tmp_json = open(US_STATES_DATA_PATH + "/" + st + ".json",  'r')
      state_data = json.load(tmp_json)
      max_val = 0

      for day in state_data:
         tmp_cases.append(float(state_data[day]['ncpm'])) # Here we take the Number of cases per million into account
         
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

# Create Graphics for all states 
def generate_gbu_graphs():
   groups = rank_states()
   color = ""

   # Create Directory for GBU images
   if not os.path.exists(GBU_IMAGE_PATH):
      os.makedirs(GBU_IMAGE_PATH) 

   for group in groups:

      if(group == 'ugly'):
         color = "r"
      elif(group == 'bad'):
         color = "o"
      else:
         color = "g"

      for state in groups[group]:
         generate_graph_with_avg(state, 'ncpm', color, GBU_IMAGE_PATH)
  


if __name__ == "__main__":
   os.system("clear")
   generate_gbu_graphs()