# Get COVID Data from UWASH

import os, glob, sys, shutil
import zipfile
from utils import TMP_DATA_PATH, SOURCES
 
# Update Data Sources
def update_data_sources(remove_previous = True):
   
   # We remove everything from the folder 
   # so we don't keep files & folders for nothing
   if os.path.exists(TMP_DATA_PATH): 
      os.system('rm -rf ' + "."+os.sep+TMP_DATA_PATH) 
    
   os.makedirs(TMP_DATA_PATH, exist_ok=True)  
    
   print("Updating Data Sources")
  
   for src_file in SOURCES:
      os.system("wget -N " + src_file['url'] + "  -P " + TMP_DATA_PATH)

      with zipfile.ZipFile(TMP_DATA_PATH + os.sep + src_file['name'], 'r') as zip_ref:
         zip_ref.extractall(TMP_DATA_PATH)

      print(src_file['name'] + " unzipped")
 
   # We delete all the zip files in the folder to 
   # avoid keeping unecessary files
   all_zip_files = glob.glob(os.path.join(TMP_DATA_PATH, '*.zip'))
   for zip_file in all_zip_files:   
      os.remove(zip_file)
  
   print("---------------------------------")
   print(" All Sources are now up to date  ")
   print("---------------------------------") 


if __name__ == "__main__":
   os.system("clear")
   update_data_sources(True)