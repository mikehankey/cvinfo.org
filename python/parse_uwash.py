import sys,glob,os,csv
from utils import * 
from datetime import datetime 


# Return the float value from a string if string is not empty
# foz = float or zero (fonz = the cool guy from Happy Days... it's totally different)
def foz(st):
   if(st!='' and st is not None):
      return float(st)
   else:      
      return 0

def get_uwash_data(state): 

   # We first need to get the folder (which is a date like YYYY_MM_DD under TMP_DATA_PATH)
   uwash_folder = glob.glob(TMP_DATA_PATH + os.sep + "[0-9]*" + os.sep)

   # Warning: on Vagrant/Windows we cannot delete the folder for the "old dates" (while the files inside the folders are deleted)
   # so here we loop through all the folders to see which one isn't empty
   date_f = uwash_folder[0]
   for i in range(0,len(uwash_folder)):
      how_many_files = num_files = len([f for f in os.listdir(date_f) if os.path.isfile(os.path.join(date_f, f))])
      if(how_many_files>0):
         break

   # Create the Dict to return 
   toReturn = {}
   all_stats = {}  
 
   for type_of_data in UWASH_FILE_TO_USE:

      uwash_file = date_f + UWASH_FILE_TO_USE[type_of_data]
     
      with open(uwash_file, mode='r') as csv_file:
            
            csv_reader = csv.DictReader(csv_file)
            rows = list(csv_reader) 
 
            #print(uwash_file , " >>>")

            for row in reversed(rows):
   
               if(row["location_name"] in US_STATES_INV or row['location_name'] == 'District of Columbia'):

                  if(row['location_name'] == 'District of Columbia'):
                     loc_name = "DC"
                  else:
                     loc_name = US_STATES_INV[row["location_name"]]

                  # Here is the state you want to deal with 
                  if(loc_name == state):
                    
                     # Does the location_name already exists in all_stats_per_state?
                     if(loc_name not in all_stats): 
                        all_stats[loc_name] = {}

                     # Does the current type_of_data exists for the current location?
                     if(type_of_data not in all_stats[loc_name]):
                        all_stats[loc_name][type_of_data] = []
 
                     all_stats[loc_name][type_of_data].append({
                        row['date']: {
                           'du'      :  round(foz(row['deaths_upper_smoothed']),2),
                           'dm'      :  round(foz(row['deaths_mean_smoothed']),2),
                           'dl'      :  round(foz(row['deaths_lower_smoothed']),2),
                           'cu'      :  round(foz(row['est_infections_upper']),2),
                           'cm'      :  round(foz(row['est_infections_mean']),2),
                           'cl'      :  round(foz(row['est_infections_lower']),2),
                           'tests'   :  round(foz(row['total_tests']),2)
                        }
                     })
   if(state in all_stats): 
      return all_stats[state]
   else: 
      # Certain states don't have projection data (like NH for instance)
      return None 
 
if __name__ == "__main__":
   os.system("clear") 
   get_uwash_data("TX")