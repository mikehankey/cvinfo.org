import os, zipfile, glob
from utils import TMP_DATA_PATH, INTL_TMP_DATA_PATH, INTL_FILE_TYPES, INTL_DATA_URL

# Update DATA SOURCES for coronafiles.us 
SOURCES = {
   'daily'        :        "http://covidtracking.com/api/v1/states/daily.csv",
   'us'           :        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us.csv",
   'us-states'    :        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv",
   'us-counties'  :        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv",
   'ihme-covid19.zip'   :  "https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip",
} 
 
# Update All Data Sources
def update_data_sources():
   
   if not os.path.exists(TMP_DATA_PATH):
      os.makedirs(TMP_DATA_PATH) 
  
   print("Updating US Data Sources")
 
   for src_file in SOURCES:
      os.system("wget -N " + SOURCES[src_file] + "  -P " + TMP_DATA_PATH)
      if('zip' not in SOURCES[src_file]):
         print(SOURCES[src_file] + " done")
      else:
         print(src_file)
         with zipfile.ZipFile(TMP_DATA_PATH + os.sep + src_file, 'r') as zip_ref:
            zip_ref.extractall(TMP_DATA_PATH)
         print(src_file + " unzipped")
 

   # We delete all the zip files in the folder to 
   # avoid keeping unecessary files
   all_zip_files = glob.glob(os.path.join(TMP_DATA_PATH, '*.zip'))
   for zip_file in all_zip_files:   
      os.remove(zip_file)


   print("Updating Intl. Data Sources")
   
   # We create the intl subfold
   if not os.path.exists(INTL_TMP_DATA_PATH):
      os.makedirs(INTL_TMP_DATA_PATH)
   
   for file_name in INTL_FILE_TYPES:
     os.system("wget -N "+INTL_DATA_URL+file_name+".csv  -P " + INTL_TMP_DATA_PATH)

   os.system("clear")
   
   print("---------------------------------")
   print(" All Sources are now up to date  ")
   print("---------------------------------")
   print("see "+ TMP_DATA_PATH + "  files")


if __name__ == "__main__":
   os.system("clear")
   update_data_sources()