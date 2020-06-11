# Create the data files for US / States & Counties
import csv
import sys
import json
from update_data_src import *
from utils import *


# Return the float value from a string if string is not empty
# foz = float or zero (fonz = the cool guy from Happy Days... it's totally different)
def foz(st):
   if(st!=''):
      return float(st)
   else:      
      return 0


# Return the State Code from Full Name
def get_state_code(state_full_name):
   if(state_full_name=='District of Columbia'):
      return 'DC'
   elif(state_full_name in US_STATES.values()): 
      return list(US_STATES.keys())[list(US_STATES.values()).index(state_full_name)]

# Create JSON files for all states (or just a given state)
def create_states_data(state):
   
   all_stats_per_state = {}

   # We open us_states_pop.csv to get the state population
   with open(TMP_DATA_PATH + os.sep +  "us_states_pop.csv", mode='r') as csv_state_file:
      csv_state_file_reader = csv.DictReader(csv_state_file)
      state_population_rows = list(csv_state_file_reader)
      csv_state_file.close()
    
   # Open daily file 
   # Daily headers:
   # date,state,positive,negative,pending,hospitalizedCurrently,hospitalizedCumulative,inIcuCurrently,inIcuCumulative,onVentilatorCurrently,
   # onVentilatorCumulative,recovered,dataQualityGrade,lastUpdateEt,dateModified,checkTimeEt,death,hospitalized,dateChecked,fips,positiveIncrease,
   # negativeIncrease,total,totalTestResults,totalTestResultsIncrease,posNeg,deathIncrease,hospitalizedIncrease,hash,commercialScore,
   # negativeRegularScore,negativeScore,positiveScore,score,grade
   with open(TMP_DATA_PATH + os.sep +  "daily.csv", mode='r') as csv_file:
      
      csv_reader = csv.DictReader(csv_file)
      rows = list(csv_reader)
      line_count = 0

      last_data = {}

      for row in reversed(rows):
 
         # Does the state already exists in all_stats_per_state?
         if(row["state"] not in all_stats_per_state):
            if(state != '' and row["state"] == state):
               all_stats_per_state[row["state"]] = {'stats' : []}
            elif(state == ''):
               all_stats_per_state[row["state"]] = {'stats' : []}

            # Used to compute the daily data (as we only have totals here)
            last_data[row["state"]] = {'deaths':0,'cases':0,'test':0}

         # We put the current data in the state dict
         if((state!='' and row["state"] == state) or (state == '')):

            # Create Row date to save in json
            row_data =  {
                  'act_hosp'        : foz(row['hospitalizedCurrently']),
                  'total_c'         : foz(row['positive']), 
                  'cases'           : foz(row['positive']) - int(last_data[row["state"]]['cases']),
                  'total_d'         : foz(row['death']),
                  'deaths'          : foz(row['death'])    - int(last_data[row["state"]]['deaths']),
                  'total_t'         : foz(row['totalTestResults']),
                  'test'            : foz(row['totalTestResults'])- int(last_data[row["state"]]['test']),
            }

            last_data[row["state"]] = {
               'deaths': row_data['total_d'],
               'cases' : row_data['total_c'],
               'test'  : row_data['total_t']
            }
  
            # Positive test %  
            if(foz(row['totalTestResultsIncrease'])>0):
               row_data['test_pos_p'] = round( (foz(row_data['cases'])*100) / foz(row['totalTestResultsIncrease']), 3 )

               if(int(row_data['test_pos_p'])>70):
                  print(row["date"])
                  sys.exit()
            else:
               row_data['test_pos_p'] = 0
 

            # We transform the date YYYYMMDD to a real date YYYY
            date =  row["date"][0:4]+'-'+row["date"][4:6]+'-'+row["date"][6:8]

            all_stats_per_state[row["state"]]['stats'].append({
               date : row_data
            })

         line_count+=1
      
   # We now create the JSON files for each state 
   for state in all_stats_per_state:

      state_folder = PATH_TO_STATES_FOLDER + os.sep + state 
    
      # Create State Folder if doesnt exits
      if not os.path.exists(state_folder):
         os.makedirs(state_folder) 

      # Since we are at the state level, we take the opportunity to add specific info
      # for the state summary

      # What is the latest date we have?
      last_record = all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1]
      for d in last_record:
         last_update = d

      # We search the population
      cur_pop = 0
      for state_data in state_population_rows:
         if(state_data['state']==state):
            cur_pop = state_data['pop']

      all_stats_per_state[state]['sum'] = {
         'last_update'        :  last_update,
         'cur_total_deaths'   :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['total_d'],
         'cur_total_cases'    :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['total_c'],
         'cur_total_tests'    :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['test'],
         'cur_hosp'           :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['act_hosp'],
         'pop'                :  int(cur_pop)
      } 
  
      # Create JSON File in folder
      with open(state_folder + os.sep +  state + ".json", mode='w+') as csv_file:
         json.dump(all_stats_per_state[state],csv_file)
      
      print(state + ".json updated")
 
      csv_state_file.close()

# Create JSON file for all counties
def create_county_state_data(_state):
   all_stats_per_county = {}
  
   print("Parsing counties data...")
  
   # Open history file (https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv)
   # Headers:
   # date,county,state,fips,cases,deaths
   with open(TMP_DATA_PATH + os.sep +  "us-counties.csv", mode='r') as csv_file:
      csv_reader = csv.DictReader(csv_file)
      rows = list(csv_reader)
      line_count = 0
      last_data = {}
 
      for row in reversed(rows): 
 
         # Get Code from full name
         cur_state = get_state_code(row["state"])

         if(cur_state == _state or _state == ""):
         
            # We have "none" states for Guam, Virgin Islands...
            if(cur_state is not None and row['county'] != 'Unknown'):
            
               cur_county = row['county']
   
               # Does the state already exists in all_stats_per_county?
               if(cur_state not in all_stats_per_county):
                  all_stats_per_county[cur_state] = {'stats' : {}} 
   
               # Does the county already exists in the related state stats dict?
               if(cur_county not in all_stats_per_county[cur_state]['stats']):
                  all_stats_per_county[cur_state]['stats'][cur_county] = []
   
               # Row data
               row_data = {
                  row["date"] : {
                     'total_c'   : foz(row['cases']),
                     'total_d'   : foz(row['deaths']),
                  }
               }
   
               # Create data for the given date 
               all_stats_per_county[cur_state]['stats'][cur_county].append(row_data)
   
         line_count+=1
 
   print("Sorting counties data...") 

   # We now have all stats in all_stats_per_county
   # {'WA': {'stats': {'Snohomish|53061': [{'2020-01-22': {'cases': 1.0, 'deaths': 0.0}}, {'2020-01-23': {'cases': 1.0, 'deaths': 0.0}}...
   # We now create a JSON per county (and we compute the daily cases & deaths at the same time)
   for state in all_stats_per_county:

      if(_state=="" or _state == state):
 
         for county in all_stats_per_county[state]['stats']:
            last_county_deaths = 0
            last_county_cases  = 0
         
            for day in list(reversed(all_stats_per_county[state]['stats'][county])):
               
               for d in day: 

                  day[d]['deaths']     = day[d]['total_d'] - last_county_deaths
                  day[d]['cases']      = day[d]['total_c'] - last_county_cases

                  last_county_deaths   =  day[d]['total_d']
                  last_county_cases    =  day[d]['total_c'] 
            
            # We put all the JSON under the State folder / County
            county_folder =  PATH_TO_STATES_FOLDER + os.sep + state + os.sep +  "counties"  
            
            # Create County Folder if doesnt exits
            if not os.path.exists(county_folder):
               os.makedirs(county_folder) 

            # Create JSON File in folder
            with open(county_folder +  os.sep + county + ".json", mode='w+') as csv_file:
               json.dump(all_stats_per_county[state]['stats'][county],csv_file)

         print( state + "'s counties done")

if __name__ == "__main__":
   os.system("clear")
   create_states_data('FL') 
   #create_county_state_data('')