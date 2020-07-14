import sys,glob,os,csv
from utils import *
from create_json_data_files import *
from datetime import datetime 
  
def get_uwash_data(state, max_date): 
   # We first need to get the folder (which is a date like YYYY_MM_DD under TMP_DATA_PATH)
   uwash_folder = glob.glob(TMP_DATA_PATH + os.sep + "[0-9]*" + os.sep)
   date_f = uwash_folder[0]
   uwash_file = date_f + UWASH_FILE_TO_USE
      
   all_stats_per_state = {}  
 
   with open(uwash_file, mode='r') as csv_file:
          
         csv_reader = csv.DictReader(csv_file)
         rows = list(csv_reader)
         line_count = 0

         last_data = {}

         for row in reversed(rows):

            if(row["location_name"] in US_STATES_INV):
 
               loc_name = US_STATES_INV[row["location_name"]]
      
               # Does the location_name already exists in all_stats_per_state?
               if(loc_name not in all_stats_per_state):
                  if(state != '' and loc_name == state):
                     all_stats_per_state[loc_name] = {'stats' : [], 'projected': []}
                  elif(state == ''):
                     all_stats_per_state[loc_name] = {'stats' : [], 'projected': []}
                    

                  # Used to compute the daily data (as we only have totals here)
                  last_data[loc_name] = {'deaths':0,'total_d':0, 'date':''}
                 

               # We put the current data in the state dict
               if((state!='' and loc_name == state) or (state == '')):
                   
                  tmp_date = row["date"].split("-")
                  tmp_date = datetime(int(tmp_date[0]),int(tmp_date[1]),int(tmp_date[2]))
                  
                  if(tmp_date>max_date):

                     # Create Row date to save in json 
                     last_data[loc_name] = {
                           'deaths'    : round((foz(row['deaths_mean_smoothed'])),0),
                           'total_d'   : round((foz(row['totdea_mean_smoothed'])),0), 
                           'total_t'   : round((foz(row['total_tests'])),0),
                           'cases'     : round((foz(row['confirmed_infections'])),0),
                           'date'      : row['date']
                     } 
                     
                     if(row['mobility_data_type']=='projected'):
                        all_stats_per_state[loc_name]['projected'].append( last_data[loc_name]  )
                     else: 
                        all_stats_per_state[loc_name]['stats'].append( last_data[loc_name]  )

               line_count+=1 
 
   return all_stats_per_state[state]['projected']

if __name__ == "__main__":
   os.system("clear") 
   get_uwash_data("MD", datetime(2020,6,30))