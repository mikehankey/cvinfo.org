import os, zipfile, glob
from utils import TMP_DATA_PATH

# Update DATA SOURCES for coronafiles.us 
SOURCES = {
   'daily'        :    "http://covidtracking.com/api/v1/states/daily.csv",
   'us'           :    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us.csv",
   'us-states'    :    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv",
   'us-counties'  :    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv",
   'uwash'        :    "https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip" 
}
 
 
# Update All Data Sources
def update_data_sources():
   
   if not os.path.exists(TMP_DATA_PATH):
      os.makedirs(TMP_DATA_PATH) 
  
   print("Updating Data Sources")


   # We delete all the zip files in the folder to 
   # avoid keeping unecessary files
   all_zip_files = glob.glob(os.path.join(TMP_DATA_PATH, '*.zip'))
   for zip_file in all_zip_files:   
      os.remove(zip_file)

   for src_file in SOURCES:
      os.system("wget -N " + SOURCES[src_file] + "  -P " + TMP_DATA_PATH)
      if('zip' not in SOURCES[src_file]):
         print(SOURCES[src_file] + " done")
      else:
         with zipfile.ZipFile(TMP_DATA_PATH + os.sep + src_file['name'], 'r') as zip_ref:
            zip_ref.extractall(TMP_DATA_PATH)
         print(src_file['name'] + " unzipped")



   os.system("clear")
   
   print("---------------------------------")
   print(" All Sources are now up to date")
   print("---------------------------------")
   print("see ./corona-calc/states files")


if __name__ == "__main__":
   os.system("clear")
   update_data_sources()