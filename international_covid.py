#!/usr/bin/python3 
import os 
import sys
import csv, json
import glob
import collections
from datetime import datetime, timedelta
from operator import itemgetter 


DATA_PATH = "." + os.sep + "covid-19-intl-data"
DATA_PATH_PER_COUNTRY = "." + os.sep + "covid-19-intl-data"  + os.sep + "country"
FILE_TYPES = ['new_cases_per_million','new_deaths_per_million','total_cases_per_million','total_deaths_per_million']
TYPES_SLUG = ['ncpm','ndpm','tcpm','tdpm']
ALL_COUNTRIES =  DATA_PATH + os.sep + "all_countries.json"  # File for the UI
US_STATES_DATA_PATH = DATA_PATH + os.sep + "US"
US_STATES_ORG_DATA_PATH = '.' + os.sep + 'json' 
US_RANKS = US_STATES_DATA_PATH + os.sep + "ranks"

# Get Data from 
# https://github.com/owid/covid-19-data/blob/master/public/data/
def update_data_sources():
   
  if not os.path.exists(DATA_PATH):
   os.makedirs(DATA_PATH) 

  if not os.path.exists(DATA_PATH_PER_COUNTRY):
   os.makedirs(DATA_PATH_PER_COUNTRY)
 
  print("Updating international COVID-19 gitHub data repo.")
  for file_name in FILE_TYPES:
     os.system("wget -N https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/"+file_name+".csv  -P " + DATA_PATH)
 
  
# Read a csv file 
# and create a corresponding dictionary
def  get_all_countries(file):
   
   all_countries= [] 
   
   # Get All Countrie Names (including "World")
   with open(file, mode='r') as f:
      lines = [line.rstrip() for line in f] 

   line_count = 0

   for line in lines: 
      splitted_line = line.split(',')

      if(line_count == 0):
         # Get All countries
         for country in splitted_line:
            if(country != 'date'):
               all_countries.append(country)
      line_count+=1
      
   return all_countries
 
   
# Create a json file per country
def create_files_per_country(all_countries):
   
   all_open_files = []

   # For each country
   for country in all_countries:

      # We open all the JSON files we need
      for file_name in FILE_TYPES:
 
         # We open the json
         cur_json_file = open(DATA_PATH + os.sep + file_name + ".json", 'r')
  
         # We get all the info for the given country
         json.loads(cur_json_file)


# Parse Intl Data
def parse_all_data(): 
   all_countries = "No country found"

   # Create  get All Countries from the first file
   all_countries = get_all_countries(DATA_PATH + os.sep + FILE_TYPES[0] + ".csv"); 
 
   all_data = {}

   # Create file with all country for UI (select)
   all_countries_file = open(ALL_COUNTRIES, 'w+') 
   all_countries_file.write('{"countries":')
   json.dump(all_countries,all_countries_file)
   all_countries_file.write('}')
   all_countries_file.close()

   cur_date = "" 
    
 
   # For each CSV, we get the data: date & value
   # HEAVY LOOP!
   for index, file_name in enumerate(FILE_TYPES):
      tmp_csv = open(DATA_PATH + os.sep + file_name + ".csv",  'r')
      cur_slug  =  TYPES_SLUG[index]

      # Opened 
      reader = csv.DictReader(tmp_csv)

      # Total Rows (we assume last date is on last row)
      rows = list(reader)
      total_rows = len(rows)-1

      for index, row in enumerate(rows):
         cur_date = row['date'] 
           
         for country in all_countries: 

            if(country not in all_data):
               all_data[country] = {}

            if(cur_date not in all_data[country]):
               all_data[country][cur_date] = {} 
            
            if( row[country]==""):
               val  = "0"
            else:
               val = row[country]  
            
            all_data[country][cur_date][cur_slug] = val

         if(index == total_rows):
            # We build a file with all the countries value at the last date
            cur_country_file = open(DATA_PATH_PER_COUNTRY + os.sep + "MAX_" + file_name + ".json", 'w+')
            
            all_max_data = {"date": cur_date, "countries": []}

            for country in all_countries: 
               if(country != "World" and country != "International"):

                  if(row[country]==""):
                     row[country]= "0"

                  all_max_data['countries'].append({
                     "name":country, 
                     str(cur_slug): float(row[country])
                  })
            
            # We sort the current all_max_data['countries']
            newall_max_data  = sorted(all_max_data['countries'], key=itemgetter(str(cur_slug)), reverse=True)
            
            # We add the current rank of the country
            cur_rank = 0
            prev_value = 99999
            for country in newall_max_data:
               if(country[str(cur_slug)]!=prev_value):
                  cur_rank+= 1
               country['rank'] = cur_rank
               prev_value = float(country[str(cur_slug)])
 
            all_max_data = {"date": cur_date, "countries":newall_max_data}

            json.dump(all_max_data,cur_country_file)
            cur_country_file.close() 

   # Create Files per Country 
   for country in all_countries:

      # Create the file where to dump the data
      cur_country_file = open(DATA_PATH_PER_COUNTRY + os.sep + country + ".json", 'w+')
  
      # Dump the data
      json.dump(all_data[country],cur_country_file)

      cur_country_file.close()
   

# Clean Up US DATA to have 
# One JSON per State & one JSON per County
# It allows not to have to deal with files with more than 65k lines
def clean_us_data():
   states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

   if not os.path.exists(US_STATES_DATA_PATH):
      os.makedirs(US_STATES_DATA_PATH)

   for state in states:

      # We open the related JSON file created by covid.py
      tmp_json = open(US_STATES_ORG_DATA_PATH + os.sep + state + ".json",  'r')
      state_data = json.load(tmp_json)

      clean_data_state = {}

      # We need to recompute the cpm & dpm with floats!
      cur_pop = state_data['summary_info']['state_population']*1000000 
       
      # For the All State
      for daily_state in state_data['state_stats']: 

         # Get real date format
         real_date = daily_state['date'] 
         date_time_object = datetime.strptime(real_date,'%Y%m%d')
         real_date = date_time_object.strftime('%Y-%m-%d')

         if(daily_state['new_cases']/cur_pop):
            ncpm = str("%.3f" % round(daily_state['new_cases']*1000000/cur_pop, 3))
         else:
            ncpm = "0"
         
         if(daily_state['new_deaths']/cur_pop):
            ndpm = str("%.3f" % round(daily_state['new_deaths']*1000000/cur_pop, 3))
         else:
            ndpm = "0"
         
         if(daily_state['cases']/cur_pop):
            tcpm = str("%.3f" % round(daily_state['cases']*1000000/cur_pop, 3))
         else:
            tcpm = "0"
         
         if(daily_state['deaths']/cur_pop):
            tdpm = str("%.3f" % round(daily_state['deaths']*1000000/cur_pop, 3))
         else:
            tdpm = "0"


         clean_data_state[real_date] =   {
               'ncpm' : ncpm,
               'ndpm' : ndpm,  
               'tcpm' : tcpm,  
               'tdpm' : tdpm,  
         }
      

      # We create the new JSON Dir (for the counties)
      if not os.path.exists(US_STATES_DATA_PATH + os.sep + state):
         os.makedirs(US_STATES_DATA_PATH + os.sep + state)
      
      all_counties_for_cur_state = []

      # For each county
      for county in state_data['county_stats']:
         clean_data_county = {}
         all_counties_for_cur_state.append({"name":county,"fips":state_data['county_stats'][county]['fips']})
 

         # We get the population where it is...
         # and build the related data set
         if(county in state_data['county_pop']):
            cur_pop = state_data['county_pop'][county] 
             
            for daily_county in state_data['county_stats'][county]['county_stats']:
                
               if(daily_county['new_cases']/cur_pop):
                  ncpm = str("%.3f" % round(daily_county['new_cases']*1000000/cur_pop, 3))
               else:
                  ncpm = "0"
               
               if(daily_county['new_deaths']/cur_pop):
                  ndpm = str("%.3f" % round(daily_county['new_deaths']*1000000/cur_pop, 3))
               else:
                  ndpm = "0"
               
               if(daily_county['cases']/cur_pop):
                  tcpm = str("%.3f" % round(daily_county['cases']*1000000/cur_pop, 3))
               else:
                  tcpm = "0"
               
               if(daily_county['deaths']/cur_pop):
                  tdpm = str("%.3f" % round(daily_county['deaths']*1000000/cur_pop, 3))
               else:
                  tdpm = "0"


               clean_data_county[daily_county['day']]  =   {
                     'ncpm' : ncpm,
                     'ndpm' : ndpm,  
                     'tcpm' : tcpm,  
                     'tdpm' : tdpm,  
               }
  
            # We create the file for the county level & Dump the Data
            tmp_json = open(US_STATES_DATA_PATH + os.sep + state + os.sep + county  +  ".json",  'w+')
            json.dump(clean_data_county,tmp_json) 

      # We create the file for the state level & Dump the Data
      tmp_json = open(US_STATES_DATA_PATH + os.sep + state + ".json",  'w+')
      json.dump(clean_data_state,tmp_json)
      tmp_json.close()  

      # We create a file with all the countries name and fips (for which we have data!)
      # for the current state 
      tmp_json = open(US_STATES_DATA_PATH + os.sep + state + "_counties.json",  'w+')
      json.dump({"counties":all_counties_for_cur_state},tmp_json)
      tmp_json.close()  

      print(state + ' done')



 
# Create Ranks files per county  for all dates
def create_rank_files_county():

   # We create the folder for the ranks file
   if not os.path.exists(US_RANKS):
      os.makedirs(US_RANKS)

   all_states_folders = glob.glob(US_STATES_DATA_PATH + os.sep + "*" + os.sep)

   for _type in TYPES_SLUG:
      
      all_data = {}  # for current slug

      state_counter = 1

      for state_folder in all_states_folders:
 
         if(state_folder!='ranks'):

            # Get state name
            tmp = state_folder.split(os.sep)
            state_name = tmp[len(tmp)-2]
   
            all_county_files_for_current_state = glob.glob(state_folder + "*.json")

            for county_json_file in all_county_files_for_current_state:
   
               # Get County Name
               county_json_file_name = os.path.basename(county_json_file)
               county_name = os.path.splitext(county_json_file_name)[0]
               county_name += '|'+state_name
               #print(county_name + " ************")

               # We open the county file
               tmp_json = open(county_json_file,  'r')
               county_data = json.load(tmp_json)

               for day in county_data:

                  if(day not in all_data):
                     all_data[day] = {}
                  if(county_name not in all_data[day]):
                     all_data[day][county_name] = {}
                  
                  all_data[day][county_name] = float(county_data[day][_type])

               #print(county_name +  " parsed")

         print(state_name + " parsed  " + str(state_counter) + "/52")
         # Here we have
         # {'2020-03-29': {'Clarendon|SC': '257.356', 'Marion|SC': '0', 'Richland|SC': '44.213'
        
         #state_counter += 1
         #if(state_counter>3):
         #   break
 

      print("Sorting all the data...")
 
      # Here we sort the data for the current slug
      rank_data = {}
      day_counter = 0

      all_data_for_the_day_for_rank = {}

      for day in all_data: 
         sorted_all_data_day =  sorted(all_data[day].items(), key=itemgetter(1), reverse=True)
     
         cur_rank = 0
         prev_value = -999999999

         # Add the rank to the tuple
         for _tuple in sorted_all_data_day:
 
            if(prev_value != _tuple[1]):
               cur_rank+=1
 
            _tuple = _tuple + (cur_rank,) 
            prev_value = _tuple[1]
  
            # Get State/County from tuple
            tmp =  _tuple[0].split('|')

            county_name = tmp[0] 
            state_name  = tmp[1]
 
            # Create the directory if necessary for the county stats
            cur_dir = US_STATES_DATA_PATH + os.sep + state_name + os.sep + county_name  
            if not os.path.exists(cur_dir):
               os.makedirs(cur_dir) 

            cur_file = cur_dir + os.sep + _type + ".json"
            
            # Does the county file exists?
            if(os.path.isfile(cur_file)):

               #print(cur_file + " already exists")
                
               # Open (+) the related JSON file
               with open(cur_file, "r+") as tmp_json_file:

                  _str = tmp_json_file.read() 
 
  
                  # We load the current data
                  if(_str is not ""):
                      tmp_json_data = json.loads(_str) 
                  else:
                     tmp_json_data = {}  

                  # We add the current data
                  tmp_json_data[day] = {"r":_tuple[2],"v":_tuple[1]}  # rank & value 
                  tmp_json_file.seek(0)
                  tmp_json_file.write(json.dumps(tmp_json_data)) 
                  tmp_json_file.close()


 
            else: 
               # Open (+) the related JSON file
               with open(cur_file, "a+") as tmp_json_file:
                  tmp_json_data = {day:{"r":_tuple[2],"v":_tuple[1]}}
                  json.dump(tmp_json_data, tmp_json_file)
                  tmp_json_file.close()   
 

            if(_tuple[2] in all_data_for_the_day_for_rank):
               all_data_for_the_day_for_rank[_tuple[2]].append({"c":county_name, "s":state_name, "v":_tuple[1]})
            else:
               all_data_for_the_day_for_rank[_tuple[2]] = []
               all_data_for_the_day_for_rank[_tuple[2]].append({"c":county_name, "s":state_name, "v":_tuple[1]})
 
 
         print(day + " done")

         # We write all the data for the current day in the relate "rank" file   
         cur_daily_file = US_RANKS + os.sep + day+"_"+_type 
         # Write the "rank" file for the give date / slug
         with open(cur_daily_file, "a+") as tmp_daily_json_file:   
            json.dump(all_data_for_the_day_for_rank,tmp_daily_json_file) 
            tmp_daily_json_file.close()
            all_data_for_the_day_for_rank = {}

def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update International Data") 
   print("2) Parse International Data") 
   print("3) Clean Up US Data (use covid update first to get the latest data)") 
   print("4) DO ALL ABOVE (1,2 and 3)")
   print("5) Create Rank Files for Counties (long)") 
   
   cmd = input("Run: ")
   cmd = int(cmd) 

   if cmd == 1:
      print ("UPDATING DATA.")
      update_data_sources()
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 2:
      print("PARSING DATA.")
      parse_all_data()
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 3:
      print("CLEANING UP US DATA.")
      clean_us_data()
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 4:
      print ("UPDATING DATA.")
      update_data_sources()
      print("\n>>>TASK DONE \n\n") 
      print("PARSING DATA.")
      parse_all_data()
      print("\n>>>TASK DONE \n\n") 
      print("CLEANING UP US DATA.")
      clean_us_data()
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 5:
      print("CREATING RANK FILES.")
      create_rank_files_county()
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 0:
      print("Exit.")
      sys.exit(0)
      print("\n>>>TASK DONE \n\n") 
   else:
      print("\n*>>>ERROR: Command Not Found \n\n")
      
   main_menu()

if __name__ == "__main__":
   os.system("clear")
   main_menu()