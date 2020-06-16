
## WARNING :
##pip install bar_chart_race
##pip install pandas

import bar_chart_race as bcr
import pandas as pd
import csv
import os, sys


from utils import *  
 
def prepare_data():
   # Prepare the CSV structure
   new_csv_headers = ['date'] 
   for st in US_STATES: 
      new_csv_headers.append(US_STATES[st])

   index_of_date = 0
   index_of_date_we_need = 0
   index_of_state = 0

   data_for_csv = {}


   # First we create the panda dataframe 
   # for all states 
   # date,state1,state2...
   # 2020-03-07,45,456
   with open(TMP_DATA_PATH + os.sep + 'daily.csv', newline='') as csvfile:
      rows = csv.reader(csvfile)
      r_counter = 0
      
      for row in rows: 
         
         # Get the indexes for the info we need
         if(r_counter == 0):
            index_of_date              = row.index('date')
            index_of_date_we_need      = row.index('positiveIncrease') #row.index('positive')
            index_of_state             = row.index('state')

         # Get the info we need to generate the csv file
         if(r_counter!=0):
            tmp_date = row[index_of_date]

            # Transform date format
            date =  tmp_date[0:4]+'-'+tmp_date[4:6]+'-'+tmp_date[6:8]

            if(date not in data_for_csv):
               data_for_csv[date] = {}

            # We only take into account the states defined in US_STATES
            if(row[index_of_state] in US_STATES ):
               data_for_csv[date][US_STATES[row[index_of_state]]] = row[index_of_date_we_need]
   
         
         r_counter+=1


   # We now create the csv file from data_for_csv
   with open(TMP_DATA_PATH + os.sep + 'barchar_race.csv', 'w+') as csvfile:
      
      row_to_write = []

      # Prepare the header
      for h in new_csv_headers:
         row_to_write.append('"'+h+'"')

      # Write the header
      csvfile.write(','.join(row_to_write))
      csvfile.write("\n")

      # Write all the other lines
      for date in sorted(data_for_csv):
         row_to_write = [date] 
         for state in new_csv_headers:
            
            if(state!='date'):
               if(state in data_for_csv[date]):
                  row_to_write.append(str(float(data_for_csv[date][state])))
               else:
                  row_to_write.append('')

         csvfile.write(','.join(row_to_write))
         csvfile.write("\n")

    

prepare_data()
  
df = pd.read_csv("./tmp_json_data/barchar_race.csv",index_col='date', parse_dates=[0]) 
html = bcr.bar_chart_race(df=df, n_bars=10,orientation='h', sort='desc',title='COVID-19 Cases by State',
    title_size='',
    bar_label_size=7,
    tick_label_size=7,
    shared_fontdict={'family' : 'Helvetica', 'color' : '.1'},scale='linear',
    bar_kwargs={'alpha': .7},
    filter_column_colors=False,
    bar_size=.95,
    period_label={'x': .99, 'y': .25, 'ha': 'right', 'va': 'center'},
    period_fmt='%B %d, %Y',
    period_summary_func=lambda v, r: {'x': .99, 'y': .18,
         's': f'Total Cases: {v.nlargest(6).sum():,.0f}',
         'ha': 'right', 'size': 8 },)
print(html.data)