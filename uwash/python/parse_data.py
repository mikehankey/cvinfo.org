import os,glob,sys
import zipfile
import csv,json

from utils import TMP_DATA_PATH, SOURCE_TO_USE,DATA_PATH, US_STATES_INV


# Return the float value from a string if string is not empty
# foz = float or zero (fonz = the cool guy from Happy Days... it's totally different)
def foz(st): 
   try:
      return float(st)
   except:      
      return 0


# Parse COVID Data from UWASH
# and create the files needed to create the graphs

# Get US Data from TMP_DATA_PATH/source
def get_us_data(state):

   # Read the CSV file 
   # TMP_DATA_PATH/[DATE]/SOURCE_TO_USE

   # Find the latest date in record
   date = -1
   all_subds = [x[0] for x in os.walk(TMP_DATA_PATH)]  
   for sub_folders in all_subds:
      if(sub_folders != TMP_DATA_PATH):

         # Date is the name of the folder where the files we need are stored
         date = os.path.basename(os.path.normpath(sub_folders))
   
   if(date==-1):
      print("Impossible to retrieve the data sources - parse_data.py")
   else:
 
      # Headers:
      # "V1","location_name","date","allbed_mean","allbed_lower","allbed_upper","ICUbed_mean","ICUbed_lower",
      # "ICUbed_upper","InvVen_mean","InvVen_lower","InvVen_upper","admis_mean","admis_lower","admis_upper",
      # "newICU_mean","newICU_lower","newICU_upper","bedover_mean","bedover_lower","bedover_upper","icuover_mean",
      # "icuover_lower","icuover_upper","deaths_mean","deaths_lower","deaths_upper","totdea_mean","totdea_lower",
      # "totdea_upper","deaths_mean_smoothed","deaths_lower_smoothed","deaths_upper_smoothed","totdea_mean_smoothed",
      # "totdea_lower_smoothed","totdea_upper_smoothed","mobility_data_type","mobility_composite","total_tests_data_type",
      # "total_tests","confirmed_infections","est_infections_mean","est_infections_lower","est_infections_upper"
      all_stats_per_state = {}

      with open( TMP_DATA_PATH + os.sep + date + os.sep + SOURCE_TO_USE, mode='r') as csv_file:
         
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
                  print(row['location_name'])

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
      
 
    
   # We now create the JSON files for all location
   for state in all_stats_per_state:

      state_folder = DATA_PATH + os.sep + 'states' + os.sep + state 
    
      # Create State Folder if doesnt exits
      if not os.path.exists(state_folder):
         os.makedirs(state_folder) 
 
      # Add Extra Info
      all_stats_per_state[state]['sum'] = {'last_update': date}

      # Create JSON File in folder
      with open(state_folder + os.sep +  state + ".json", mode='w+') as csv_file:
         json.dump(all_stats_per_state[state],csv_file)
      

      print(state_folder + os.sep +  state + ".json" + " updated")
 


if __name__ == "__main__":
   os.system("clear")
   get_us_data('FL')