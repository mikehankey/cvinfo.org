import os

# UWASH DATA SOURCES 
SOURCES = [
   {
      "url": "https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip",
      "name": "ihme-covid19.zip"
   }
]

SOURCE_TO_USE = 'Reference_hospitalization_all_locs.csv'


# Tmp Folder for data
TMP_DATA_PATH = os.sep + "python" + os.sep + "tmp_data"

# Folder for data
DATA_PATH = os.sep + "data"