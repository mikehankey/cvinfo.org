
## WARNING :
##pip install bar_chart_race
##pip install pandas
## see https://www.dexplo.org/bar_chart_race/

import bar_chart_race as bcr
import pandas as pd
import csv
import os, sys
import numpy as np
import matplotlib.pyplot as plt

from matplotlib import ticker 

import datetime
from utils import *  


# debug only
only_states= ['MI','NJ','NY']
 
def prepare_data(_type,_7avg,per_pop):
   # Prepare the CSV structure
   new_csv_headers = ['date'] 
   for st in US_STATES: 
      new_csv_headers.append(US_STATES[st])


   # per_pop = we need the population of each state
   if(per_pop==True):
      with open(TMP_DATA_PATH + os.sep + 'us_states_pop.csv', newline='') as csvPopfile:
         pop_rows = csv.reader(csvPopfile)
         popDict = {rows[0]:rows[1] for rows in pop_rows}
         

   index_of_date = 0
   index_of_date_we_need = 0
   index_of_state = 0

   data_for_csv = {}

   tmp_data_for_csv = {}  # For 7 day average
   max_day          = 7 # Average based on max_day days
   tempValFormax_day = []

   # First we create the panda dataframe 
   # for all states 
   # date,state1,state2...
   # 2020-03-07,45,456
   print("Parsing the data")
   with open(TMP_DATA_PATH + os.sep + 'daily.csv', newline='') as csvfile:
      rows = csv.reader(csvfile)
      r_counter = 0
      
      for row in rows: 
         
         # Get the indexes for the info we need
         if(r_counter == 0):
            index_of_date              = row.index('date')
            index_of_date_we_need      = row.index(_type) #row.index('positive')
            index_of_state             = row.index('state')

         # Get the info we need to generate the csv file
         if(r_counter!=0):
            tmp_date = row[index_of_date]

            # Transform date format
            _date =  tmp_date[0:4]+'-'+tmp_date[4:6]+'-'+tmp_date[6:8]

            d_day = _date.split('-')
            b1 = datetime.date(int(d_day[0]),int(d_day[1]),int(d_day[2])) 

            # A minimum date (otherwise, we don't have enough data)
            if(b1 > datetime.date(2020, 3, 2)):

               if(_date not in data_for_csv):
                  data_for_csv[_date] = {}
                  tmp_data_for_csv[_date] = {}

               # We only take into account the states defined in US_STATES
               # For debug: and (index_of_state in only_states)
               if(row[index_of_state] in US_STATES ):
 
                  if(_7avg is True):
                     
                     if(per_pop is False):
                        # 7-DAY AVG
                        if(US_STATES[row[index_of_state]] not in  tmp_data_for_csv):
                           if(row[index_of_date_we_need]!=''):
                              tmp_data_for_csv[US_STATES[row[index_of_state]]] = [row[index_of_date_we_need]]
                           else:
                              tmp_data_for_csv[US_STATES[row[index_of_state]]] = ['0']
                        else:
                           if(row[index_of_date_we_need]!=''):
                              tmp_data_for_csv[US_STATES[row[index_of_state]]].append(row[index_of_date_we_need])
                           else:
                              tmp_data_for_csv[US_STATES[row[index_of_state]]].append('0')

                     else:
                         # 7-DAY AVG PPM
                        if(US_STATES[row[index_of_state]] not in tmp_data_for_csv):
                           if(row[index_of_date_we_need]!=''):
                              tmp_data_for_csv[US_STATES[row[index_of_state]]] = [float(row[index_of_date_we_need])*1000000/float(popDict[row[index_of_state]])]
                           else:
                              tmp_data_for_csv[US_STATES[row[index_of_state]]] = ['0']
                        else:
                           if(row[index_of_date_we_need]!=''):
                              tmp_data_for_csv[US_STATES[row[index_of_state]]].append(float(row[index_of_date_we_need])*1000000/float(popDict[row[index_of_state]]))
                           else:
                              tmp_data_for_csv[US_STATES[row[index_of_state]]].append('0')

                     if(len(tmp_data_for_csv[US_STATES[row[index_of_state]]]) <  max_day):
                        tempValFormax_day =  tmp_data_for_csv[US_STATES[row[index_of_state]]]
                     else: 
                        tempValFormax_day =  tmp_data_for_csv[US_STATES[row[index_of_state]]][len(tmp_data_for_csv[US_STATES[row[index_of_state]]])-max_day:len(tmp_data_for_csv[US_STATES[row[index_of_state]]])] 
           
                     # We have strings, we need floats 
                     tempValFormax_day = [float(i) for i in tempValFormax_day]

                     if(per_pop is False):
                        data_for_csv[_date][US_STATES[row[index_of_state]]] = round(np.mean(tempValFormax_day),2)
                     else:
                        data_for_csv[_date][US_STATES[row[index_of_state]]] = round(np.mean(tempValFormax_day),6)
                  else:
                     # RAW Data
                     data_for_csv[_date][US_STATES[row[index_of_state]]] = row[index_of_date_we_need]
         
         r_counter+=1
 

   # We now create the csv file from data_for_csv
   print("Creating cleaned SVG file")
   with open(TMP_DATA_PATH + os.sep + 'barchar_race.csv', 'w+') as csvfile:
      
      row_to_write = []

      # Prepare the header
      for h in new_csv_headers:
         row_to_write.append('"'+h+'"')

      # Write the header
      csvfile.write(','.join(row_to_write))
      csvfile.write("\n")

      # Write all the other lines
      for _date in sorted(data_for_csv):
         row_to_write = [_date] 
         for state in new_csv_headers:
            
            if(state!='date'):
               if(state in data_for_csv[_date]):
                  row_to_write.append(str(float(data_for_csv[_date][state])))
               else:
                  row_to_write.append('')

         csvfile.write(','.join(row_to_write))
         csvfile.write("\n")


def create_video(title,counter_title,out_file_name):    
  
   max_state_to_show = 10
  
   dpi = 120
   
   video_size_w_in_px = 1920
   video_size_h_in_px = 1080

   video_size_w = video_size_w_in_px/dpi  # In inch!
   video_size_h = video_size_h_in_px/dpi  # In inch!
 
   print("CREATING VIDEO")

   # Get the data from the csv created with prepare_data
   df = pd.read_csv("./tmp_json_data/barchar_race.csv",index_col='date', parse_dates=[0]) 

   # Create custom figure
   fig, ax = plt.subplots(figsize=(video_size_w, video_size_h), dpi=dpi)
   fig.suptitle(title, fontsize=30,ha='left',va='bottom',fontweight='bold',y=0.91, x=0.13) 
   ax.yaxis.set_tick_params(labelsize = 15)
   ax.yaxis.set_major_formatter(ticker.StrMethodFormatter('{y:,.2f}'))

   ax.spines['top'].set_visible(False)
   ax.spines['right'].set_visible(False)
   ax.spines['left'].set_color('#cccccc') 
   ax.spines['bottom'].set_color('#cccccc')
   ax.set_facecolor((1, 1, 1, .3))   

   bcr.bar_chart_race(
      fig=fig,
      df=df, 
      cmap= ['#f9cdac', '#f3aca2', '#ee8b97', '#e96a8d', '#db5087', '#b8428c', '#973490', '#742796', '#5e1f88', '#4d1a70', '#3d1459', '#2d0f41'],
      n_bars=max_state_to_show,
      orientation='h', 
      sort='desc',
      filename=out_file_name,
      title=title, 
      bar_label_size  = 18,   # Numbers next to bars 
      shared_fontdict = { 'color' : '.1', 'size': 130 },
      scale='linear',
      bar_kwargs={
         'alpha': 0.7, 
         'lw': 0},
      filter_column_colors=True,
      bar_size=.95, 
      period_length=1000,
      period_label={
         'x': .97, 
         'y': .25, 
         'ha': 'right', 
         'va': 'center',
         'size': 22,
         'fontweight':'bold'},
      period_fmt='%B %d, %Y',
      period_summary_func=lambda v, 
         r: {
            'x': .97, 
            'y': .18,
            's' : f'{counter_title}: {v.nlargest(6).sum():,.2f}',
            'ha': 'right', 
            'size': 20
         }
   )

   print(out_file_name  + " created")

 

prepare_data('deathIncrease',True,True)
title = "COVID-19 Day-7 Average Deaths per Million by State"
counter_title = "Day-7 Average Deaths per Million"
out_file_name = "covid19_7deaths_ppm.mp4"
create_video(title,counter_title,out_file_name)