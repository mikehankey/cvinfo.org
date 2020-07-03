import os,glob
import zipfile
import csv

from utils import TMP_DATA_PATH, SOURCE_TO_USE

# Parse COVID Data from UWASH
# and create the files needed to create the graphs

# Get US Data from TMP_DATA_PATH/source
def get_us_data():

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

      # We now parse the file SOURCE_TO_USE
      # inside TMP_DATA_PATH + os.sep + date + os.sep +SOURCE_TO_USE
      with open( TMP_DATA_PATH + os.sep + date + os.sep + SOURCE_TO_USE, mode='r') as csv_file:
         csv_reader = csv.DictReader(csv_file)
         line_count = 0
         for row in csv_reader:
            if line_count == 0:
                  print(f'Column names are {", ".join(row)}')
                  line_count += 1
            #print(f'\t{row["name"]} works in the {row["department"]} department, and was born in {row["birthday month"]}.')
            line_count += 1
         print(f'Processed {line_count} lines.')


# Open daily file 
   # Daily headers:
   # date,state,positive,negative,pending,hospitalizedCurrently,hospitalizedCumulative,inIcuCurrently,inIcuCumulative,onVentilatorCurrently,
   # onVentilatorCumulative,recovered,dataQualityGrade,lastUpdateEt,dateModified,checkTimeEt,death,hospitalized,dateChecked,fips,positiveIncrease,
   # negativeIncrease,total,totalTestResults,totalTestResultsIncrease,posNeg,deathIncrease,hospitalizedIncrease,hash,commercialScore,
   # negativeRegularScore,negativeScore,positiveScore,score,grade
   with open(TMP_DATA_PATH + os.sep +  "daily.csv", mode='r') as csv_file:
      
      csv_reader = csv.DictReader(csv_file)
      rows = list(csv_reader)
      line_count = 0

      last_data = {}

      for row in reversed(rows):
 
         # Does the state already exists in all_stats_per_state?
         if(row["state"] not in all_stats_per_state):
            if(state != '' and row["state"] == state):
               all_stats_per_state[row["state"]] = {'stats' : []}
            elif(state == ''):
               all_stats_per_state[row["state"]] = {'stats' : []}

            # Used to compute the daily data (as we only have totals here)
            last_data[row["state"]] = {'deaths':0,'cases':0,'test':0}

         # We put the current data in the state dict
         if((state!='' and row["state"] == state) or (state == '')):

            # Create Row date to save in json
            row_data =  {
                  'act_hosp'        : foz(row['hospitalizedCurrently']),
                  'total_c'         : foz(row['positive']), 
                  'cases'           : foz(row['positive']) - int(last_data[row["state"]]['cases']),
                  'total_d'         : foz(row['death']),
                  'deaths'          : foz(row['death'])    - int(last_data[row["state"]]['deaths']),
                  'total_t'         : foz(row['totalTestResults']),
                  'test'            : foz(row['totalTestResults'])- int(last_data[row["state"]]['test']),
            }

            last_data[row["state"]] = {
               'deaths': row_data['total_d'],
               'cases' : row_data['total_c'],
               'test'  : row_data['total_t']
            }
  
            # Positive test %  
            if(foz(row['totalTestResultsIncrease'])>0):
               row_data['test_pos_p'] = round( (foz(row_data['cases'])*100) / foz(row['totalTestResultsIncrease']), 3 )

               # Cheat for mike
               if(row_data['test_pos_p']>40):
                  row_data['test_pos_p'] = 0
            else:
               row_data['test_pos_p'] = 0
 

            # We transform the date YYYYMMDD to a real date YYYY
            date =  row["date"][0:4]+'-'+row["date"][4:6]+'-'+row["date"][6:8]

            all_stats_per_state[row["state"]]['stats'].append({
               date : row_data
            })

         line_count+=1
      
   # We now create the JSON files for each state 
   for state in all_stats_per_state:

      state_folder = PATH_TO_STATES_FOLDER + os.sep + state 
    
      # Create State Folder if doesnt exits
      if not os.path.exists(state_folder):
         os.makedirs(state_folder) 

      # Since we are at the state level, we take the opportunity to add specific info
      # for the state summary

      # What is the latest date we have?
      last_record = all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1]
      for d in last_record:
         last_update = d

      # We search the population
      cur_pop = 0
      for state_data in state_population_rows:
         if(state_data['state']==state):
            cur_pop = state_data['pop']

      all_stats_per_state[state]['sum'] = {
         'last_update'        :  last_update,
         'cur_total_deaths'   :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['total_d'],
         'cur_total_cases'    :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['total_c'],
         'cur_total_tests'    :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['total_t'],
         'cur_hosp'           :  all_stats_per_state[state]['stats'][len(all_stats_per_state[state]['stats'])-1][last_update]['act_hosp'],
         'pop'                :  int(cur_pop)
      } 
  
      # Create JSON File in folder
      with open(state_folder + os.sep +  state + ".json", mode='w+') as csv_file:
         json.dump(all_stats_per_state[state],csv_file)
      
      print(state + ".json updated")
 
      csv_state_file.close()



if __name__ == "__main__":
   os.system("clear")
   get_us_data()