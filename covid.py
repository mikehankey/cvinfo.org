#!/usr/bin/python3 

"""
covid.py -- COVID-19 data downloader and analyzer. 
copyright : Mike Hankey LLC
project started : 3/30/2020 
reason for this code : 
   1) To add a level of intellegence and enchanced reporting to the covid data. Something that is currently missing from most websites.
how this approach is different: 
   1) Analyzer and visualizer focuses on determination of KPIs (PPM Values, Growth, Growth Decay, Mortality), 
   2) calculating KPIs over time and graphing them on regional basis for the purpose of 
   3) ranking states and counties to find outliers. 


This program will:
  - downloads USA state and county data from covidtracking.com and the NYT COVID-19 data repo on git hub.
    http://covidtracking.com/api/states/daily.csv
    https://github.com/nytimes/covid-19-data
  - analyze the data and compute the following for each state, county and day.
    - CPM, DPM per day per state, per county (Case / Death Per Million)
    - Zero Day date (number of days since first death for each entry)
    - Mortality rate per entry (deaths / cases per day,state,county)
    - Case and death growth rates (change in cases and deaths per day,state,county)
    - Growth decay (change in growth per day)
  - After data has been analyzed the program:
    - creates simplified "Level2" json data structures for all state and county data
    - generates plots for each state
    - generates country plots
    - creates HTML page with county data for each state
    - creates main page for USA


"""

#################################################################################################
# GLOBAL VARS
ORG_PATH =  "/home/ams/covid"

 
# PATHS 
PATH_TO_US_SVG_MAP  = ORG_PATH + "/templates/USA_map_template.svg"
PATH_TO_MAIN_TEMPLATE = ORG_PATH + "/templates/main.html"

# INPUT
STATE_DATA =  ORG_PATH + "/data/states-level2.json"
STATES_JSON_DATA_FOLDER =  ORG_PATH + "/data/"

TEMPLATES_FOLDER = ORG_PATH + "/templates/"

#OUTPUT
OUT_PATH = "/var/www/projects/COVID/LIVE/out"
OUT_INDEX = OUT_PATH  + "/index.html"

#UI
COLORS=['b','g','y','o','r']

# END GLOBAL VARS
#################################################################################################


from PIL import Image, ImageFont, ImageDraw
import json
import numpy as np
from pathlib import Path
import os
import matplotlib
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from scipy.optimize import curve_fit
import cv2

import sys

STATE_DAY_URL = "http://covidtracking.com/api/states/daily.csv"

def update_data_sources():
  if cfe("./data/", 1) != 1:
     os.makedirs("./data")
  print("updating NYT COVID-19 git hub data repo. ")
  if cfe("./covid-19-data/", 1) == 0:
     # NYT REPO IS NOT INSTALLED, CLONE IT NOW. 
     os.system("git clone https://github.com/nytimes/covid-19-data.git")
  os.system("cd ./covid-19-data/; git pull")
  print("updating covidtracking.com daily.csv data file.")
  os.system("wget " + STATE_DAY_URL + " -O covid-19-data/covidtracking.com-daily.csv" )

 

def main_menu(): 
   if len(sys.argv) > 1:
      print("What are the args we have here???")
   print("cvinfo.org -- COVID-19 DATA ANALYZER AND REPORTING APPLICATION ")
   print("Select Function")
   print("---------------")
   print("1) Update data sources.")
   print("2) Analyze data and make level2 state and county files.")
   print("3) Generate state pages.")
   print("4) Generate main page.")
   print("5) Generate all counties page.")
   print("6) Quit.")

   cmd = input("What function do you want to run: ")
   if cmd == "1":
      print ("Updating data sources.")
      update_data_sources()
   if cmd == "2":
      print ("Making Level 2 Data.")
      make_level2_data()


def make_level2_data():
   state_data,state_pop = load_state_data()
   #state_data structure: [date,cases,deaths,case_increase,death_increase,tests])

   level2_data = analyze_data_for_state("NY", state_data,state_pop)
   #(this_state,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm)

   level2_data = add_enhanced_growth_stats("MD", level2_data)
   #(state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med) 

   #print("state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay") 

   # Create state stats json object
   state_stats = []
   for data in level2_data:
      stat_obj = {}
      (state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay) = data 
      print(state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay)
      stat_obj = { 
         "state_code" : state_code,
         "state_pop" : pop,
         "date" : date,
         "zero_day" : zero_day,
         "cases" : cases,
         "deaths" : deaths,
         "new_cases" : new_cases,
         "new_deaths" : new_deaths,
         "tests" : tests,
         "tpm" : tpm,
         "cpm" : cpm,
         "dpm" : dpm,
         "cg_last" : case_growth,
         "dg_last" : death_growth,
         "cg_avg" : cg_avg,
         "dg_avg" : dg_avg,
         "cg_med" : cg_med,
         "dg_med" : dg_med,
         "cg_med_decay" : cg_med_decay,
         "dg_med_decay" : dg_med_decay
      }
      state_stats.append(stat_obj)

   # Create final state json object:
   state_obj = {}
   state_obj['summary_info'] = {}
   state_obj['summary_info']['state_code'] = state_code
   state_obj['summary_info']['state_name'] = state_name
   state_obj['summary_info']['state_population'] = state_population
   state_obj['summary_info']['cases'] = cases
   state_obj['summary_info']['deaths'] = deaths
   state_obj['summary_info']['new_cases'] = new_cases
   state_obj['summary_info']['new_deaths'] = new_deaths
   state_obj['summary_info']['tests'] = tests
   state_obj['summary_info']['tpm'] = tpm
   state_obj['summary_info']['cpm'] = cpm
   state_obj['summary_info']['dpm'] = dpm
   state_obj['summary_info']['cg_last'] = case_growth
   state_obj['summary_info']['dg_last'] = death_growth
   state_obj['summary_info']['cg_avg'] = cg_avg
   state_obj['summary_info']['dg_avg'] = dg_avg
   state_obj['summary_info']['cg_med'] = cg_med
   state_obj['summary_info']['dg_med'] = dg_med
   state_obj['summary_info']['cg_med_decay'] = cg_med_decay
   state_obj['summary_info']['dg_med_decay'] = dg_med_decay
   state_obj['state_stats'] = state_stats
   if cfe("./json", 1) == 0:
      os.makedirs("./json")
   save_json_file("./json/" + state_code + ".json")
   print("Saved: ./json/" + state_code + ".json")

   for stobj in state_stats:
      print(stobj)
 
   

def add_enhanced_growth_stats(state_code, l2s):
   extra = []
   final = []
   case_grs = []
   death_grs = []
   # add avg growth and median growth to l2 data
   first_death_day = None
   dc = 0
   for data in l2s:
      (state_code,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm) = data
      pop = round(pop,2)
      if first_death_day is None and deaths > 0:
         first_death_day = dc
         first_death_date = date

      if len(case_grs) > 3:
         cg_avg = round(np.mean(case_grs),2)
         cg_med = round(np.median(case_grs),2)
      else:
         cg_avg = case_growth
         cg_med = case_growth

      if len(death_grs) > 3:
         dg_avg = round(np.mean(death_grs),2)
         dg_med = round(np.median(death_grs),2)
      else:
         dg_avg = death_growth 
         dg_med = death_growth 

      extra.append((state_code,pop,date,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med) )
      if cases > 0:
         case_grs.append(case_growth)
      if deaths > 0:
         death_grs.append(death_growth)
      dc = dc + 1

   # add median growth decay to l2 data 
   last_cg_med = 0
   last_dg_med = 0
   dc = 0
   for data in extra:
      (state_code,pop,date,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med) = data
    
      if cases > 0:
         cg_med_decay = round(cg_med - last_cg_med,2)
      else:
         cg_med_decay = 0
      
      if deaths > 0:
         dg_med_decay = round(dg_med - last_dg_med,2) 
      else:
         dg_med_decay = 0
      zero_day = dc - first_death_day
      final.append((state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay) )
      last_cg_med = cg_med 
      last_dg_med = dg_med
      dc += 1

   for data in final:
      print(data)
 
   return(final)

def analyze_data_for_state(this_state,state_data,state_pop):
   last_cases = 0
   last_deaths = 0

   level2_data = []

   print("THIS STATE:", this_state)
   for sd in state_data:
      if this_state == sd:
         print("STATE FOUND IN STATE DATA:", this_state, sd)
   for sd in state_pop:
      if this_state == sd:
         print("STATE FOUND IN STATE POP DATA:", this_state, sd)


   temp = sorted(state_data[this_state], key=lambda x: x[0], reverse=False)

   last_cases = 0
   last_deaths = 0
   last_cpm = 0
   last_dpm = 0
   case_growth = 0
   death_growth = 0


   for data in temp:
      date, cases, deaths, case_increase, death_increase,tests = data
      new_cases = cases - last_cases
      new_deaths = deaths - last_deaths
      #if this_state == "DE":
      #   print("NEW CASES:", date, cases, last_cases, new_cases)
      if last_cases < 0:
         last_cases = 0
         new_cases = 0
      if last_deaths < 0:
         last_deaths = 0
         new_deaths = 0
      pop = state_pop[this_state]
      cpm = int(cases / pop)
      dpm = int(deaths / pop)
      tpm = int(tests / pop)
      if deaths != 0:
         death_growth = (1 - (last_deaths / deaths)) * 100
         death_growth = round(death_growth,2)
         #print(deaths, " / ", last_deaths)
      if cases != 0:
         case_growth = (1 - (last_cases / cases)) * 100
         case_growth = round(case_growth,2)
      if cases > 0 and deaths > 0:
         mortality = (deaths / cases) * 100
         mortality = round(mortality,2)
      else:
         mortality = 0
      level2_data.append((this_state,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm))
      last_cpm = cpm
      last_dpm = dpm
      last_cases = cases
      last_deaths = deaths
   return(level2_data)



def load_state_data(): 
   fp = open("data/killers.txt", "r")
   for line in fp:
      line = line.replace("\n", "")
      death, number = line.split(",")
      pm = int(number) / 328



   fp = open("data/state-pop.txt", "r")
   state_pop = {}
   for line in fp:
      line = line.replace("\n", "")
      state, pop = line.split("\t")
      pop = pop.replace(",", "")
      state_pop[state] = int(pop) / 1000000
   fp.close()

   state_data = {}
   fp = open("covid-19-data/covidtracking.com-daily.csv", "r")
   lc = 0
   for line in fp:
      line = line.replace("\n", "")
      fields = line.split(",")
      if len(fields) == 17 and lc > 0:
         date = fields[0]
         state = fields[1]
         cases = fields[2]
         deaths = fields[6]
         tests = fields[10]
         death_increase = fields[12]
         case_increase = fields[15]

         if state not in state_data:
            state_data[state] = []
         if deaths == "":
            deaths = 0
         else:
            deaths = int(deaths)

         if tests == "":
            tests = 0
         else:
            tests = int(tests)
         if cases == "":
            cases = 0
         else:
            cases = cases.replace(",", "")
            cases = int(cases)
         if case_increase == "":
            cases_increase = 0
         else:
            case_increase = int(case_increase)
         if death_increase == "":
            death_increase = 0
         else:
            death_increase = int(death_increase)
         state_data[state].append([date,cases,deaths,case_increase,death_increase,tests])
      lc += 1

   #for st in state_data:
   #   print("LATEST STATE DATA: ", st, state_data[st][0])
      #for day in state_data[st]:
      #   print("LATEST STATE DATA: ", st, day)

   return(state_data, state_pop)


def copy_wasabi(state_code, mode=0):
   print("Copy " + state_code + ".html to wasabi")
   os.system("cp plots/" + state_code + ".html /mnt/archive.allsky.tv/covid/states/" )
   if mode == 1:
      print("Copy " + state_code + "*.png to wasabi")
      os.system("cp plots/" + state_code + "-*.png /mnt/archive.allsky.tv/covid/plots/" )

def save_json_file(json_file, json_data, compress=False):
   with open(json_file, 'w') as outfile:
      if(compress==False):
         json.dump(json_data, outfile, indent=4, allow_nan=True)
      else:
         json.dump(json_data, outfile, allow_nan=True)
   outfile.close()

def load_json_file(json_file):
   cjson = {}
   with open(json_file, 'r' ) as infile:
      json_data = json.load(infile)

   return(json_data)


def cfe(file,dir = 0):
   """ check if file exists 
       args : 
          file = full path and file name, 
          dir = is this a directory 0=no 1=yes
       returns = 0 or 1
   """

   if dir == 0:
      file_exists = Path(file)
      if file_exists.is_file() is True:
         return(1)
      else:
         return(0)
   if dir == 1:
      file_exists = Path(file)
      if file_exists.is_dir() is True:
         return(1)
      else:
         return(0)


if __name__ == "__main__":
    # execute only if run as a script
    main_menu()
