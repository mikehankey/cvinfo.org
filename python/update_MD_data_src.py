import os
from utils import MD_LOCAL_CSV_FILE

# Get the datasource specific for MD
# see https://coronavirus.maryland.gov/datasets/mdcovid19-master-zip-code-cases
# the original name of the file is MDCOVID19_MASTER_ZIP_CODE_CASES.csv
MD_DATA_SRC = {
   MD_LOCAL_CSV_FILE : 'https://opendata.arcgis.com/datasets/5f459467ee7a4ffda968139011f06c46_0.csv'
}
 
 
# Update All Data Sources
def update_MD_data_sources():
   
   if not os.path.exists(TMP_DATA_PATH): 
      os.makedirs(TMP_DATA_PATH) 
  
   print("Updating MD Data Sources")

   for src_file in MD_DATA_SRC:
     os.system("wget -N " + MD_DATA_SRC[src_file] + "  -P "  +  TMP_DATA_PATH  + ' -O ' + TMP_DATA_PATH+os.sep+src_file  +'.csv')
     print(MD_DATA_SRC[src_file] + " done")
   
   os.system("clear")
   
   print("---------------------------------")
   print(" All MD Sources are now up to date")
   print("---------------------------------") 