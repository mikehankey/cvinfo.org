import os 
import json
import numpy as np

# REPO FOR LOCAL TMP DATA
TMP_DATA_PATH = "." + os.sep + "tmp_json_data"

US_STATES = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'Washington DC', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', }
PATH_TO_STATES_FOLDER = '..' +  os.sep + 'corona-calc' + os.sep + 'states'
GBU_STATE_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'gbu_state.html'
GBU_MAIN_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'gbu.html'

HOTSPOTS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'hotspots.html' 

ALERTS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'alerts.html'
ALERTS_TEMPLATE_DELTA = '..' + os.sep + 'templates' + os.sep + 'alerts-d.html'


# KEY DATES (lockdown)
KEY_DATES =   TMP_DATA_PATH + os.sep + 'key-dates.csv'
 
############# FOR MD ONLY
MD_LOCAL_CSV_FILE = "MD_ZIP_DATA"
MD_ZIP_CODES      = "MD_ZIP_REL_DATA"
MD_ZIPS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'gbu_MD_zip.html'
MD_ALERTS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'alerts_MD.html'
MD_MOST_ACTIVE_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'most_active_MD.html'


def display_us_format(_float,prec): 
   _format =  '{:,.'+str(prec)+'f}'
   return _format.format(_float)


# Get X day average cases data for a state
def get_avg_data(max_day,state):

   # Open the related json
   json_ftmp = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + '.json')
   data = json.load(json_ftmp)
   json_ftmp.close()
 
   # X days average
   first_val = -1
   total_day = 0  
   tempValForAvg = []
   tempValFormax_day = []

   all_x_avg = []
   all_y_avg = []

   for d in data['stats']:
      for day in d:
 
         # For average of _type
         tempValForAvg.append(float(d[day]["cases"]))

         if(len(tempValForAvg) <  max_day):
            tempValFormax_day = tempValForAvg 
         else: 
            tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)] 
               
         # We have strings...
         tempValFormax_day = [float(i) for i in tempValFormax_day]
 
         all_x_avg.append(day)
         all_y_avg.append(np.mean(tempValFormax_day))   
   

   cur_new_cases     = all_y_avg[-1] 
   max_day = 0 - max_day
   last_new_cases    = all_y_avg[max_day] 
   
   if last_new_cases  > 0:
      delta = cur_new_cases / last_new_cases
   else:
      delta = 0 

   return all_x_avg, all_y_avg, delta
 
if __name__ == "__main__":
   print(display_us_format(46854684864653.5665,2))