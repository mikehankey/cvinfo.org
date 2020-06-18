import glob
import os
import numpy as np
from create_json_data_files import *
from update_data_src import * 
from create_main_gbu_page import *
from create_state_gbu_pages import * 

def create_MD_alerts_and_hotspots():

   hotspots = []     # more than 100 new COVID-19 cases per day
   alerts   = []     # 7-day avergae for new cases has spiked compared to 7 days ago
   
   # Glob all MD zip code area 
   all_zip_json_file = glob.glob(PATH_TO_STATES_FOLDER + os.sep + 'MD' + os.sep + "counties"  + os.sep  + "**" + os.sep +  "*.json")
   

   for zip_file in all_zip_json_file:
      
      # We read the file
      tmp_json    = open(zip_file,  'r')
      data = json.load(tmp_json)

      all_x = []
      all_y = []
      all_x_avg = []
      all_y_avg = []

      # 7 days average
      first_val = -1
      total_day = 0
      max_day = 7 # Average based on max_day days

      _type = "cases"

      tempValForAvg = []
      tempValFormax_day = []

      for d in data['stats']:
         for day in d:
            
            # Warning - it looks like in Maryland, they put a lot of cases on the first day in the stats
            # so we ignore the data in the graphs to have something legible
            d_day = day.split('-')
            b1 = date(int(d_day[0]), int(d_day[1]), int(d_day[2]))

            if(b1 > date(2020, 4, 15)):

               # Org Data
               all_x.append(day) 
               all_y.append(d[day][_type]) 
            
               # For average of _type
               tempValForAvg.append(float(d[day][_type]))

               if(len(tempValForAvg) <  max_day):
                  tempValFormax_day = tempValForAvg 
               else: 
                  tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)] 
                  
               # We have strings...
               tempValFormax_day = [float(i) for i in tempValFormax_day]

               all_x_avg.append(day)
               all_y_avg.append(np.mean(tempValFormax_day))  

      # We test the data to know if it's an alert, an hotspot
      if len(all_y_avg) > 14: 
         
         cur_new_cases     = all_y_avg[-1] 
         last_new_cases7   = all_y_avg[-7] 
         last_new_cases14  = all_y_avg[-14] 

         if last_new_cases7 < 1:
            last_new_cases7 = 1

         if last_new_cases14 < 1:
            last_new_cases14 = 1
         
         if last_new_cases7 > 0:
            perc7 = cur_new_cases / last_new_cases7
         else:
            perc7 = 0
         
         if last_new_cases14 > 0:
            perc14 = cur_new_cases / last_new_cases14
         else:
            perc14 = 0
 

         if cur_new_cases >= 100: 
            hotspots.append({
               "zip_name":    data['info']['zip_name'],
               "zip":         data['info']['zip'],
               "delta7":      round(perc7,2), 
               "delta14":     round(perc14,2),
               "last_n_c":    all_y[len(all_y)-1]  # Real last new cases
            })
            
         if (perc7 > 1.25 or perc14 > 1.25) and cur_new_cases >= 10 and perc7 > 1:
            alerts.append({
               "zip_name":    data['info']['zip_name'],
               "zip":         data['info']['zip'],
               "delta7":      round(perc7,2), 
               "delta14":     round(perc14,2),
               "last_n_c":    all_y[len(all_y)-1] # Real last new cases
            })
   
   print("ALERTS")
   print(alerts)

   print("HOTSPOTS")
   print(hotspots)



if __name__ == "__main__":
   create_MD_alerts_and_hotspots()