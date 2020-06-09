import glob
import os
import numpy as np
from create_json_data_files import *
from update_data_src import * 
from create_main_gbu_page import *
from create_state_gbu_pages import * 


def create_hotspots_and_alerts():
   
   for st in US_STATES:
   
      # Get all the county json files 
      all_countries_json_file = glob.glob(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + "counties"  + os.sep  + "*.json")

      for county_json_file in all_countries_json_file:

         # We read the file
         tmp_json    = open(county_json_file,  'r')
         county_data = json.load(tmp_json)

         # We get the avg cases 
         # Get the DATA
         max_day = 7
         for d in reversed(county_data):
         
            for day in d:
               all_x.append(day) 
               all_y.append(d[day]['cases']) 
            
               # Average
               tempValForAvg.append(float(d[day]['cases']))

               if(len(tempValForAvg) <  max_day):
                  tempValFormax_day = tempValForAvg 
               else:
                  tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)] 
      
               # We have strings...
               tempValFormax_day = [float(i) for i in tempValFormax_day]

               all_x_avg.append(day)
               all_y_avg.append(np.mean(tempValFormax_day))  
   

def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update data source")   
   print("2) Clean all counties data")  
   print("3) Create Hotspot Page")   
   print("6) Do it all")  
   
   cmd = input("Run: ")
   cmd = int(cmd) 
 
   if cmd == 1:
      print ("UPDATING DATA.")
      update_data_sources()
      print("\n>>>TASK DONE \n\n") 
   
   elif cmd== 2:
      print ("CLEANING COUNTIES DATA.") 
      create_county_state_data('')
      print("\n>>>TASK DONE \n\n") 
   
   elif cmd== 3:
      print ("CREATING HOSTPOT & ALERTS PAGE") 
      create_hotspots_and_alerts()
      print("\n>>>TASK DONE \n\n") 


if __name__ == "__main__":
   os.system("clear")
   main_menu()