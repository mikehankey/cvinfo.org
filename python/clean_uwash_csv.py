import glob
import pandas as pd
from utils import *

def clean_uwash_csv():
   # We first need to get the folder (which is a date like YYYY_MM_DD under TMP_DATA_PATH)
   uwash_folder = glob.glob(TMP_DATA_PATH + os.sep + "[0-9]*" + os.sep)

   # Warning: on Vagrant/Windows we cannot delete the folder for the "old dates" (while the files inside the folders are deleted)
   # so here we loop through all the folders to see which one isn't empty
   date_f = uwash_folder[0]
   for i in range(0,len(uwash_folder)):
      how_many_files = num_files = len([f for f in os.listdir(date_f) if os.path.isfile(os.path.join(date_f, f))])
      if(how_many_files>0):
         break
   
   for files in UWASH_FILE_TO_USE:

      uwash_file = date_f + UWASH_FILE_TO_USE[files]
      df = pd.read_csv(uwash_file)  

      # We keep only the columns we need
      col_list = ['location_name',
                  'date',
                  # Cases
                  'est_infections_mean',
                  'est_infections_lower',
                  'est_infections_upper',
                  # Deaths
                  'deaths_mean_smoothed',
                  'deaths_lower_smoothed',
                  'deaths_upper_smoothed',
                  # Tests
                  'total_tests'
      ]
      df = df[col_list]
      df = df[(df.location_name == 'District of Columbia') | (df.location_name == 'Alabama') | (df.location_name == 'Alaska') | (df.location_name == 'Arizona') | (df.location_name == 'Arkansas') | (df.location_name == 'California') | (df.location_name == 'Colorado') | (df.location_name == 'Connecticut') | (df.location_name == 'Delaware') | (df.location_name == 'Florida') | (df.location_name == 'Georgia') | (df.location_name == 'Hawaii') | (df.location_name == 'Idaho') | (df.location_name == 'Illinois') | (df.location_name == 'Indiana') | (df.location_name == 'Iowa') | (df.location_name == 'Kansas') | (df.location_name == 'Kentucky') | (df.location_name == 'Louisiana') | (df.location_name == 'Maine') | (df.location_name == 'Maryland') | (df.location_name == 'Massachusetts') | (df.location_name == 'Michigan') | (df.location_name == 'Minnesota') | (df.location_name == 'Mississippi') | (df.location_name == 'Missouri') | (df.location_name == 'Montana') | (df.location_name == 'Nebraska') | (df.location_name == 'Nevada') | (df.location_name == 'New Hampshire') | (df.location_name == 'New Jersey') | (df.location_name == 'New Mexico') | (df.location_name == 'New York') | (df.location_name == 'North Carolina') | (df.location_name == 'North Dakota') | (df.location_name == 'Ohio') | (df.location_name == 'Oklahoma') | (df.location_name == 'Oregon') | (df.location_name == 'Pennsylvania') | (df.location_name == 'Rhode Island') | (df.location_name == 'South Carolina') | (df.location_name == 'South Dakota') | (df.location_name == 'Tennessee') | (df.location_name == 'Texas') | (df.location_name == 'Utah') | (df.location_name == 'Vermont') | (df.location_name == 'Virginia') | (df.location_name == 'Washington') | (df.location_name == 'Washington DC') | (df.location_name == 'West Virginia') | (df.location_name == 'Wisconsin') | (df.location_name == 'Wyoming') ]
   
      # We replace the CSV 
      df.to_csv(uwash_file)
      print(uwash_file , " cleaned")
  
if __name__ == "__main__":
   clean_uwash_csv()