# Create the data files for US / States & Counties
import csv
import sys
import json 
import os
import glob 
from utils import  TMP_DATA_PATH, MD_LOCAL_CSV_FILE, PATH_TO_STATES_FOLDER, MD_ZIP_CODES


# Transform the funky dates in the csv to real date
# ex: F4_11_2020  => 2020-04-11
# ex: total05_22_2020 => 2020-05-22
def transform_date(d):
   if('F' in d): 
      d = d.replace('F','0')
   elif('total' in d):
      d = d.replace('total','')
   else:
      print("WARNING THE DATE COLUMN HAS CHANGE")
      print("see create_json_MD_date_files")

   all_parts = d.split('_')

   for index, part in enumerate(all_parts):
      # We need to add a zero to the day 
      if(int(part)<10 and '0' not in part):
         all_parts[index] = '0'+part
   
   return all_parts[2] + '-' + all_parts[0] + '-' + all_parts[1]
 


# Get County Name, City, etc. based on a zip 
# (based on the data in MD_ZIP_REL_DATA.csv )
def get_zip_info(zip_code,all_zip_rel_data_rows):
   for r in all_zip_rel_data_rows:
      if(r['zip']==zip_code):
         return r


# Create JSON files for all states (or just a given state)
def create_json_MD_data_files():
   
   # We open us_states_pop.csv to get the state population
   with open(TMP_DATA_PATH + os.sep + MD_LOCAL_CSV_FILE + ".csv", mode='r') as csv_state_file:
      csv_state_file_reader = csv.DictReader(csv_state_file)
      zip_rows = list(csv_state_file_reader)
      csv_state_file.close()

   # We open MD_ZIP_REL_DATA.csv to get the proper county related to the zip
   with open(TMP_DATA_PATH + os.sep + MD_ZIP_CODES + ".csv", mode='r') as csv_zip_rel_file:
      csv_zip_rel_file_reader = csv.DictReader(csv_zip_rel_file)
      all_zip_rel_data_rows = list(csv_zip_rel_file_reader)
      csv_zip_rel_file.close()

   
   # Glob the Maryland Counties to match with the counties name in the source file
   # (these are the counties for which we have data)
   all_county_paths = glob.glob(PATH_TO_STATES_FOLDER + os.sep + "MD" +  os.sep + 'counties' +  os.sep + '*.json')
   all_county_names = []

   # We get the County Names
   for cp in all_county_paths:
      name = os.path.basename(cp)
      all_county_names.append(name[:len(name)-5])  # we remove ".json"
  
   # We need to clean up the data as the way the csv has been created is insane
   row_counter = 0

   all_zips  = [] 
   all_funky_dates = [] # for ref in the org csv

   # We get all the dates (because the csv is crazy-made)
   for row in zip_rows:
      if(row_counter==0):
         for funky_date in row:
            if("OBJECTID" not in funky_date and "ZIP_CODE" not in funky_date):
               all_funky_dates.append(funky_date)
      row_counter+=1
   
   row_counter = 0
   for row in zip_rows:
      if(row_counter!=0):
         #print("ZIP: " + row['ZIP_CODE'])

         zip_cur_data = []
         last_cases = 0

         for f_date in all_funky_dates:

            if(row[f_date]!=''):
               zip_cur_data.append({
                  transform_date(f_date): 
                    { 'cases': int(row[f_date]) - last_cases}
               })

               last_cases = int(row[f_date]) 
          
        
         # We create a file for the current zip  
         # Under /states/MD/counties/[county_name]/[zips]

         # We find the related county name in all_county_names
         # In data: all_cur_zip_info['County Name'] 
         all_cur_zip_info =  get_zip_info(row['ZIP_CODE'],all_zip_rel_data_rows)
         if all_cur_zip_info is not None :
         
            for county_name in all_county_names:
               # replace("'s",'s') for Prince George's
               if county_name.replace("'s",'s').lower() == all_cur_zip_info['County Name'].lower(): 
                  #print("FOUND  " + county_name + " == " +  all_cur_zip_info['County Name'])

                  # We create the directory /states/[STATES]/counties/[COUNTY_NAME]/
                  zip_folder = PATH_TO_STATES_FOLDER + os.sep + 'MD' + os.sep  + 'counties' + os.sep + county_name + os.sep
                  if not os.path.exists(zip_folder): 
                     os.makedirs(zip_folder) 

                  # We create the related json file for the current zip
                  zip_file_data = {
                     'stats': zip_cur_data,
                     'info': {
                        'zip'     : all_cur_zip_info['zip'],
                        'zip_name': all_cur_zip_info['Zipcode name'].title(),
                        'city'    : all_cur_zip_info['City'].title() 
                     }
                  }
                  # Create JSON File in folder
                  with open(zip_folder +  all_cur_zip_info['zip'] + ".json", mode='w+') as csv_file:
                     json.dump(zip_file_data,csv_file)
                  
                  print(row['ZIP_CODE'] + " done")
                  
      row_counter+=1 

   