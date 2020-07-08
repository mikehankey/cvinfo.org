import os

US_STATES = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'Washington DC', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', }
US_STATES_INV = { 'Alabama':'AL', 'Alaska':'AK','Arizona':'AZ', 'Arkansas':'AR', 'California':'CA', 'Colorado':'CO', 'Connecticut':'CT', 'Delaware':'DE', 'Florida':'FL', 'Georgia':'GA', 'Hawaii':'HI','Idaho':'ID','Illinois':'IL', 'Indiana':'IN', 'Iowa':'IA','Kansas':'KS','Kentucky':'KY', 'Louisiana':'LA', 'Maine':'ME','Maryland':'MD', 'Massachusetts':'MA', 'Michigan':'MI', 'Minnesota':'MN', 'Mississippi':'MS', 'Missouri':'MO', 'Montana':'MT', 'Nebraska':'NE', 'Nevada':'NV','New Hampshire':'NH', 'New Jersey':'NJ', 'New Mexico':'NM', 'New York':'NY', 'North Carolina':'NC', 'North Dakota':'ND', 'Ohio':'OH','Oklahoma':'OK', 'Oregon':'OR','Pennsylvania':'PA', 'Rhode Island':'RI', 'South Carolina':'SC', 'South Dakota':'SD', 'Tennessee':'TN', 'Texas':'TX','Utah':'UT','Vermont':'VT', 'Virginia':'VA', 'Washington':'WA', 'Washington DC':'DC', 'West Virginia':'WV', 'Wisconsin':'WI', 'Wyoming':'WY'}

# UWASH DATA SOURCES 
SOURCES = [
   {
      "url": "https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip",
      "name": "ihme-covid19.zip"
   }
]

SOURCE_TO_USE = 'Reference_hospitalization_all_locs.csv'


# Tmp Folder for data
TMP_DATA_PATH = "." + os.sep + "tmp_data"

# Folder for data
DATA_PATH = ".." + os.sep + "app" + os.sep + "public" + os.sep + "data"