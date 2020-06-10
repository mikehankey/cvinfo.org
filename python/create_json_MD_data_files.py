# Create the data files for US / States & Counties
import csv
import sys
import json 
import os
from utils import  TMP_DATA_PATH, MD_LOCAL_CSV_FILE


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
   
   return all_parts[2] + '-' + all_parts[1] + '-' + all_parts[0]
 


# Create JSON files for all states (or just a given state)
def create_json_MD_data_files():
   
   # We open us_states_pop.csv to get the state population
   with open(TMP_DATA_PATH + os.sep + MD_LOCAL_CSV_FILE + ".csv", mode='r') as csv_state_file:
      csv_state_file_reader = csv.DictReader(csv_state_file)
      zip_rows = list(csv_state_file_reader)
      csv_state_file.close()

   # We need to clean up the data as the way the csv has been created is insane
   row_counter = 0

   all_zips  = []
   all_dates = []

   for row in zip_rows:

      # The dates with the weirdest format ever
      # ex: F4_28_2020 of 04/28/2020
      # or: total06_08_2020 for 06/08/2020
      cur_zip_code = row['ZIP_CODE'] 

      # For the given zip... what do we have
      for key in row:

            print("ROW[key] "   +  row[key])
               

            # We get all the dates
            if(row_counter == 0): 
               
               if("OBJECTID" not in key and "ZIP_CODE" not in key):
                  all_dates.append(transform_date(key))
               
            else:
               print("KEY "  +  key)
                
                  
      row_counter+=1

   print(all_dates)
