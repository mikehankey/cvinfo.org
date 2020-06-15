import os


# REPO FOR LOCAL TMP DATA
TMP_DATA_PATH = "." + os.sep + "tmp_json_data"

US_STATES = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'Washington DC', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', }
PATH_TO_STATES_FOLDER = '..' +  os.sep + 'corona-calc' + os.sep + 'states'
GBU_STATE_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'gbu_state.html'
GBU_MAIN_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'gbu.html'

HOTSPOTS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'hotspots.html' 

ALERTS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'alerts.html'
ALERTS_TEMPLATE_DELTA = '..' + os.sep + 'templates' + os.sep + 'alerts-d.html'


# KEY DATES (lockdown)
KEY_DATES =   TMP_DATA_PATH + os.sep + 'key-dates.csv'
 
############# FOR MD ONLY
MD_LOCAL_CSV_FILE = "MD_ZIP_DATA"
MD_ZIP_CODES      = "MD_ZIP_REL_DATA"
MD_ZIPS_TEMPLATE = '..' + os.sep + 'templates' + os.sep + 'gbu_MD_zip.html'


def display_us_format(_float,prec):
   _format =  '{:,.'+str(prec)+'f}'
   return _format.format(_float)


if __name__ == "__main__":
   print(display_us_format(46854684864653.5665,2))