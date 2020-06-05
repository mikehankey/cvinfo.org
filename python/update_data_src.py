import os

# Update DATA SOURCES for coronafiles.us 
SOURCES = {
   'daily'        :    "http://covidtracking.com/api/v1/states/daily.csv",
   'us'           :    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us.csv",
   'us-states'    :    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv",
   'us-counties'  :    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv" 
   # https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv"  # Latest Day Only
}
 
# REPO FOR LOCAL TMP DATA
TMP_DATA_PATH = "." + os.sep + "tmp_json_data"
 
# Update All Data Sources
def update_data_sources():
   
   if not os.path.exists(TMP_DATA_PATH):
      os.makedirs(TMP_DATA_PATH) 
  
   print("Updating Data Sources")

   for src_file in SOURCES:
     os.system("wget -N " + SOURCES[src_file] + "  -P " + TMP_DATA_PATH)
     print(SOURCES[src_file] + " done")
   
   os.system("clear")
   
   print("---------------------------------")
   print(" All Sources are now up to date")
   print("---------------------------------")
   print("see ./corona-calc/states files")


if __name__ == "__main__":
   os.system("clear")
   update_data_sources()