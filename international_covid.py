#!/usr/bin/python3 
import os 
import sys
import csv, json


DATA_PATH = "." + os.sep + "covid-19-intl-data"
DATA_PATH_PER_COUNTRY = "." + os.sep + "covid-19-intl-data"  + os.sep + "country"
FILE_TYPES = ['new_cases_per_million','new_deaths_per_million','total_cases_per_million','total_deaths_per_million']
TYPES_SLUG = ['ncpm','ndpm','tcpm','tdpm']
ALL_COUNTRIES =  DATA_PATH + os.sep + "all_countries.json"  # File for the UI

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

      for row in reader:
         cur_date = row['date'] 
         for country in all_countries: 

            if(country not in all_data):
               all_data[country] = {}

            if(cur_date not in all_data[country]):
               all_data[country][cur_date] = {} 
            
            all_data[country][cur_date][cur_slug] = row[country] 
          

   # Create Files per Country 
   for country in all_countries:

      # Create the file where to dump the data
      cur_country_file = open(DATA_PATH_PER_COUNTRY + os.sep + country + ".json", 'w+')

      # Dump the data
      json.dump(all_data[country],cur_country_file)

      cur_country_file.close()
   



def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update Data") 
   print("2) Parse Data") 
   
   cmd = input("Run: ")
   cmd = int(cmd) 

   if cmd == 1:
      print ("Updating data sources.")
      update_data_sources()
      print("\n  TASK DONE \n\n") 
   elif cmd== 2:
      print("Parsing data.")
      parse_all_data()
      print("\n  TASK DONE \n\n") 
   elif cmd== 0:
      print("Exit.")
      sys.exit(0)
      print("\n  TASK DONE \n\n") 
   else:
      print("\n*** Command Not Found \n\n***")
      
   main_menu()

if __name__ == "__main__":
   os.system("clear")
   main_menu()