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


This program :
  - downloads USA state and county data from covidtracking.com and the NYT COVID-19 data repo on git hub.
    http://covidtracking.com/api/states/daily.csv
    https://github.com/nytimes/covid-19-data
  - analyzes the data and computes the following extra data fields for each state, county and day.
    - CPM, DPM per day per state, per county (Case / Death Per Million)
    - Zero Day date (number of days since first death for each entry)
    - Mortality rate per entry (deaths / cases per day,state,county)
    - Case and death growth rates (change in cases and deaths per day,state,county)
    - Growth decay (change in growth per day)
  - After data has been analyzed the program:
    - creates simplified "Level2" json data structures for all state and all county data (states-level2.json, counties-level2.json)
    - creates state.json "Level2" file for each state with all county info inside it
    - generates currently 6 plots for each state
    - creates HTML page with county data for each state
    - creates main page for USA
    - generates entire country plots(PENDING)


"""


 
#UI
COLORS=['b','g','y','o','r']

# END GLOBAL VARS
#################################################################################################

import glob
from PIL import Image, ImageFont, ImageDraw
import json
import numpy as np
from pathlib import Path
import os
import matplotlib
#matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from scipy.optimize import curve_fit
from datetime import datetime, timedelta
import cv2

import sys


#################################################################################################
# GLOBAL VARS
dir_path = os.path.dirname(os.path.realpath(__file__))
if('/var/www/projects/' in dir_path):
   from conf_vince import *   
else:
   from conf import *


# UPDATE THIS NUMBER WHEN THE JS or CSS ARE CACHED
# AND RE-RENERATE THE TEMPLATE
CUR_VERSION = '1.28.4'


# Used for the dropdow above the animated maps on the state page
ALL_OPTIONS = ['Cases','Deaths','Cases per Million','Deaths per Million']
ALL_OPTIONS_CODE = ['cases','deaths','cpm','dpm']
DEFAULT_OPTION = 2 # Index in the arrays above
  

STATE_DAY_URL = "http://covidtracking.com/api/states/daily.csv"


def make_svg_legends():
   fp = open("templates/h-legend.svg")
   temp =""
   for line in fp:
      temp += line

   ranks = {}
   ranks['cases'] = ((1,10),(10,25),(25,50),(50,100),(100,150),(150,200),(200,250),(250,300),(300,400),(400,500),(500,999999))
   ranks['deaths'] = ((1,2),(2,3),(3,4),(4,5),(5,10),(10,20),(30,40),(40,50),(50,100),(100,200),(300,999999))
   ranks['cpm'] = ((1,10),(10,25),(25,50),(50,100),(100,150),(150,200),(200,250),(250,300),(300,400),(400,500),(500,999999))
   ranks['dpm'] = ((1,2),(2,3),(3,4),(4,5),(5,10),(10,25),(25,50),(50,100),(100,200),(200,300),(300,999999))
   ranks['mortality'] = ((0,1),(1,2),(2,3),(3,4),(4,5),(6,7),(7,8),(8,9),(9,10),(10,15),(15,100))
   ranks['cg_med'] = ((0,5),(5,10),(10,15),(15,20),(20,25),(25,30),(30,35),(35,40),(40,50),(50,75),(75,100))
   ranks['dg_med'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
   ranks['new_cases'] = ((0,5),(5,10),(10,20),(20,30),(30,40),(40,50),(50,100),(100,200),(200,500),(500,1000),(1000,99999))
   ranks['new_deaths'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
 
   for field in ranks:
      svg = temp
      print(field)
      c = 0 
      print("LEN:", len(ranks[field]))
      for low,high in ranks[field] :
         print(field, low, high)
         if c < 10:
            text = str(low) + " - " + str(high)
         else:
            text = str(low) + " + " 
         tag = "{DAT_" + str(c) + "}"
         print("TAG:", tag)
         svg= svg.replace(tag, text) 
         c += 1
      of = "templates/legends/h-legend-" + field + ".svg";
      out = open(of, "w")
      out.write(svg)
      print(svg)


def update_data_sources():
  # US CITIES DB
  #https://simplemaps.com/static/data/us-cities/1.6/basic/simplemaps_uscities_basicv1.6.zip
  if cfe(ORG_PATH +"/data/", 1) != 1:
     os.makedirs(ORG_PATH + "/data")
  print("updating NYT COVID-19 git hub data repo. ")
  if cfe(ORG_PATH +"/covid-19-data/", 1) == 0:
     # NYT REPO IS NOT INSTALLED, CLONE IT NOW. 
     os.system("git clone https://github.com/nytimes/covid-19-data.git")
  os.system("cd "+ ORG_PATH + "/covid-19-data/; git pull")
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
   print("3) Generate state plots.")
   print("4) Generate state pages.")
   print("5) Generate main page.")
   print("6) Generate all counties page.")
   print("7) Publish Site To PUB Folder.")
   print("8) Quit.")

   cmd = input("What function do you want to run: ")
   if cmd == "1":
      print ("Updating data sources.")
      update_data_sources()
   if cmd == "2":
      print ("Making Level 2 Data.")
      make_all_level2_data()
   if cmd == "3":
      this_state = input("Enter state code or ALL to do all states.").upper()
      show = input("Show plot as you go? Press enter for NO or 1 for yes.")
      if show == "1":
         show = 1 
      else:
         show = 0
      
      print ("Making plots for .", this_state)
      make_all_plots(this_state,show)
   if cmd == "4":
      this_state = input("Enter state code or ALL to do all states.").upper()
      if this_state == "":
         this_state = "ALL"
      make_state_pages(this_state)
   if cmd == "5":
      make_main_page()
   if cmd == "6":
      make_all_county_page()
   if cmd == "7":
      publish_site()

def make_all_county_page():

   fp = open("./templates/all-counties.html", "r")
   template = ""
   for line in fp:
      template += line

   cl2 = load_json_file("json/covid-19-level2-counties.json")
   cl2.sort(key=sort_cpm,reverse=True)
   total_c = len(cl2)

   table_header = """
   <div id="table">
      <table id="states" class="tablesorter ">
            <thead>
               <tr>
                  <th>&nbsp;</th>
                  <th>State</th>
                  <th>County</th>
                  <th>Population</th>
                  <th>Cases</th>
                  <th>Deaths</th>
                  <th>Cases per m</th>
                  <th>Deaths per m</th>
                  <th>Growth Rate</th>
                  <th>Mortality Rate</th>
               </tr>
            </thead>
            <tbody  class="list-of-states" >
   """

   row_html = """
                  <tr data-state="{STATE_CODE}" id="{FIP}">
                     <td><span class="cl {COLOR}"></span></td>
                     <td>{STATE_CODE}</td>
                     <td>{COUNTY}</td>
                     <td>{COUNTY_POP}</td>
                     <td>{CASES}</td>
                     <td>{DEATHS}</td>
                     <td>{CPM}</td>
                     <td>{DPM}</td>
                     <td>{CGR}</td>
                     <td>{MORTALITY}</td>
                  </tr>
   """


   table_footer = """
            </tbody>
      </table>
   </div>
   """
   rows = ""
   cc = 0
   for dr in cl2:
      if True:
         if total_c > 0:
            rank_perc = cc / total_c
         else:
            rank_perc = 0
         if rank_perc < .2:
            color = COLORS[4]
         if .2 <= rank_perc < .4:
            color = COLORS[3]
         if .4 <= rank_perc < .6:
            color = COLORS[2]
         if .6 <= rank_perc < .8:
            color = COLORS[1]
         if .8 <= rank_perc <= 1:
            color = COLORS[0]

         row_html = """
                  <tr data-state="{:s}" id="{:s}">
                     <td><span class="cl {:s}"></span></td>
                     <td>{:s}</td>
                     <td>{:s}</td>
         """.format(dr['state'],dr['fips'],color,dr['county'],dr['state'])
         row_html += """
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:0.2f}</td>
                     <td>{:0.2f}</td>
                  </tr>
         """.format(int(dr['population']),int(dr['cases']),int(dr['deaths']),int(dr['cpm']),int(dr['dpm']),float(dr['cg_med']),float(dr['mortality']))


         #row = row_html
         #row = row.replace("{STATE_CODE}", dr['state'])
         #row = row.replace("{FIP}", dr['fips'])
         #row = row.replace("{COLOR}", color)
         #row = row.replace("{COUNTY}", dr['county'])
         #row = row.replace("{CASES}", str(dr['cases']))

         #row = row.replace("{COUNTY_POP}", str(dr['population']))
         #row = row.replace("{DEATHS}", str(dr['deaths']))
         #row = row.replace("{CPM}", str(dr['cpm']))
         #row = row.replace("{DPM}", str(dr['dpm']))
         #row = row.replace("{CGR}", str(dr['cg_med']))
         #row = row.replace("{DGR}", str(dr['dg_med']))
         #row = row.replace("{MORTALITY}", str(dr['mortality']))
         #row = row.replace("{LAST_UPDATE}", update)
         rows += row_html
         cc += 1

   template= template.replace("{LAST_UPDATE}",str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))

  

   html = table_header + rows + table_footer
   html = template.replace("{COUNTY_TABLE}", html)
   fp = open("all-counties.html", "w")
   fp.write(html)
   fp.close()


def publish_site():
   print("""
   Select publishing option:
      1) Publish just HTML 
      2) Publish just plot images 
      3) Publish ALL data - index.html, state pages, state plots
      4) Publish site resources css, js, flags etc 
      5) Publish flags 
   """)
   mode = input ("What do you want to publish?")

   # make out dirs if they don't already exist
   if cfe(PUB_DIR + "states/", 1) == 0:
      os.makedirs(PUB_DIR + "states/")
   if cfe(PUB_DIR + "plots/", 1) == 0:
      os.makedirs(PUB_DIR + "plots/")
   if cfe(PUB_DIR + "dist/", 1) == 0:
      os.makedirs(PUB_DIR + "dist/")
   if cfe(PUB_DIR + "dist/css", 1) == 0:
      os.makedirs(PUB_DIR + "dist/css")
   if cfe(PUB_DIR + "dist/js", 1) == 0:
      os.makedirs(PUB_DIR + "dist/js")
   if cfe(PUB_DIR + "flags/", 1) == 0:
      os.makedirs(PUB_DIR + "flags/")

   if mode == "1" or mode == 3:
      htmls = glob.glob("states/*.html")
      cmd = "cp index.html " + PUB_DIR + "index.html" 
      print(cmd)
      os.system(cmd)
      cmd = "cp all-counties.html " + PUB_DIR + "all-counties.html" 
      print(cmd)
      os.system(cmd)
      for html in htmls:
         h = html.split("/")[-1]
         cmd = "cp states/" + h + " " + PUB_DIR + "states/" 
         print(cmd)
         os.system(cmd)


   if mode == "2" or mode == 3:
      images = glob.glob("plots/*.png")
      for img in images:
         i = img.split("/")[-1]
         cmd = "cp plots/" + i + " " + PUB_DIR + "plots/" 
         print(cmd)
         os.system(cmd)

   if mode == "4" :
      cmd = "cp dist/css/m.css " + PUB_DIR + "dist/css/"
      print(cmd)
      os.system(cmd)
      cmd = "cp dist/js/jquery.tablesorter.min.js " + PUB_DIR + "dist/css/"
      print(cmd)
      os.system(cmd)

   if mode == "5":
      flags = glob.glob("flags/*.png")
      for flag in flags:
         f = flag.split("/")[-1]
         cmd = "cp flags/" + f + " " + PUB_DIR + "flags/" 
         print(cmd)
         os.system(cmd)
 

def merge_state_data():

   state_names, state_codes = load_state_names()
   asd = []
   acd = []
   acd_all = []
   if "VI" in state_names:
      del state_names["VI"]

   for st in state_names:
      sd = load_json_file(JSON_PATH + "/" + st + ".json") 
      asd.append(sd)

      cd = sd['county_stats']
      for county in cd:
         fips = cd[county]['fips']
         pop = cd[county]['population']
         last_stats = cd[county]['county_stats'][-1]
         last_stats['state'] = st
         last_stats['county'] = county
         last_stats['population'] = pop
         last_stats['fips'] = fips
         acd.append(last_stats)
         for cdr in cd[county]['county_stats']:
            day_stats = cdr
            day_stats['state'] = st 
            day_stats['county'] = county 
            day_stats['fips'] = fips
            acd_all.append(day_stats)
   save_json_file(JSON_PATH + "/" +  "covid-19-level2-states.json", asd)
   save_json_file(JSON_PATH + "/" +  "covid-19-level2-counties.json", acd)
   save_json_file(JSON_PATH + "/" +  "covid-19-level2-counties-all-days.json", acd_all)
   return(asd)

def state_table(data,us_map_template):
 
   table_header = """
   <table id="states" class="tablesorter ">
         <thead>
            <tr>
               <th>&nbsp;</th>
               <th>State</th>
               <th>Population</th>
               <th>Cases</th>
               <th>Deaths</th>
               <th>Cases per m</th>
               <th>Deaths per m</th>
               <th>Growth Rate</th>
               <th>Mortality Rate</th>
            </tr>
         </thead>
         <tbody class="list-of-states" >
   """
   table_row = """
            <tr data-state="{STATE_CODE}">
               <td><span class="cl {COLOR}"></span></td>
               <td>{STATE_NAME}</td>
               <td>{POPULATION}</td>
               <td>{CASES}</td>
               <td>{DEATHS}</td>
               <td>{CPM}</td>
               <td>{DPM}</td>
               <td>{CGR}</td>
               <td>{MORT}</td>
            </tr>
   """
   table_footer = """
         </tbody>
         <tfoot>
            <tr>
               <td><b>TOTAL</b></td>
               <td>&nbsp;</td>
               <td>{TOT_POP}</td>
               <td>{TOT_CASES}</td>
               <td>{TOT_DEATHS}</td>
               <td>{TOT_CPM}</td>
               <td>{TOT_DPM}</td>
               <td> </td>
               <td> </td>
            </tr>
         </tfoot>
       </table>
   """
   rows = ""

   data_sorted = sorted(data, key=lambda x: x[7], reverse=True)
   rk = 0

   total_pop = 0;
   total_cases = 0;
   total_deaths = 0;
   total_cpm = 0;
   total_dpm = 0;

   for dr in data_sorted:

      #state_rank_list.append( (data['state_code'], data['state_name'], data['state_population'], data['cases'],data['deaths'],data['new_cases'], data['new_deaths'], data['cpm'], data['dpm'], data['cg_med'], data['dg_med'], data['mortality'],color_of_state ))
      (state_code, state_name, population, last_cases, last_deaths, last_ci, last_di, last_cpm, last_dpm, last_cg, last_dg, last_mort) = dr 
 
      if rk <= 10:
         color_of_state = COLORS[4]
      if 10 < rk <= 20:
         color_of_state = COLORS[3]
      if 20 < rk <= 30:
         color_of_state = COLORS[2]
      if 30 < rk <= 40:
         color_of_state = COLORS[1]
      if 40 < rk <= 55:
         color_of_state = COLORS[0]

      us_map_template = us_map_template.replace("{"+state_code+"_color_class}", color_of_state)  

      total_pop      += int(dr[2]*1000000)
      total_cases    += int(dr[3])
      total_deaths   += int(dr[4]) 
 
      row_html = """
         <tr data-state="{:s}">
            <td><span class="cl {:s}"></span></td>
            <td>{:s}</td>
      """.format(state_code,color_of_state,state_name)
      row_html += """
            <td>{:d}</td>
            <td>{:d}</td>
            <td>{:d}</td>
            <td>{:d}</td>
            <td>{:d}</td>
            <td>{:0.2f}%</td>
            <td>{:0.2f}%</td>
         </tr>
      """.format(int(dr[2]*1000000),int(dr[3]),int(dr[4]),int(dr[7]),int(dr[8]),float(dr[9]),float(dr[11]))
 
      rows += row_html
      rk += 1

   table_footer = table_footer.replace('{TOT_POP}','{:,d}'.format((int(total_pop))))
   table_footer = table_footer.replace('{TOT_CASES}','{:,d}'.format((int(total_cases))))
   table_footer = table_footer.replace('{TOT_DEATHS}','{:,d}'.format((int(total_deaths))))


   # Compute Total Cases per millions
   total_cpm = int(total_cases)/(int(total_pop)/100000)
   # Compute Total Deaths per millions
   total_dpm = int(total_deaths)/(int(total_pop)/100000)
 
   table_footer = table_footer.replace('{TOT_CPM}','{:0.2f}'.format((float(total_cpm))))
   table_footer = table_footer.replace('{TOT_DPM}','{:0.2f}'.format((float(total_dpm))))

   table_html = table_header + rows + table_footer


   return(table_html,us_map_template) 
  
  
def make_main_page():
   asd = merge_state_data()

   # Load svg map
   with open(PATH_TO_US_SVG_MAP, 'r') as file:  
      us_map_template = file.read()
 
   rk = 0 
   state_rank_list = []
   
   for adata in asd:
      data = adata['summary_info']
      state_code = data['state_code']
      si = data
      state_rank_list.append( (data['state_code'], data['state_name'], data['state_population'], data['cases'],data['deaths'],data['new_cases'], data['new_deaths'], data['cpm'], data['dpm'], data['cg_med'], data['dg_med'], data['mortality']))
      rk += 1


   state_rank_list.sort(key=sort_cpm,reverse=True)
   rk = 0
   for data in state_rank_list:
      (state_code, state_name, state_population, cases, deaths, new_cases, new_deaths, cpm, dpm, cg_med, dg_med, mortality ) = data
      print(rk, state_code)


   state_table_html,us_map_template = state_table(state_rank_list, us_map_template)

   # make main page
   fp = open("./templates/main.html", "r")
   temp = ""
   for line in fp:
      temp += line
   temp = temp.replace("{STATE_TABLE}", state_table_html)
   temp = temp.replace("{US_MAP}", us_map_template)
   temp = temp.replace("{LAST_UPDATE}",  datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
 
   
   # Important here we add the title that corresponds to the default sorting of the table 
   # and the default coloring of the map
   temp  = temp.replace('{MAP_TITLE}','Cases per Million')
 
   # VERSIONING
   temp= temp.replace("{VERSION}",str(CUR_VERSION))

   out = open("./index.html", "w+")
   out.write(temp)
   out.close()
   out = open("./main.html", "w+")
   out.write(temp)
   out.close()

def make_state_map(sjs):
   state_code = sjs['summary_info']['state_code']
   latest = []
   rows = ""
   cd = []

   with open(PATH_TO_STATE_SVG_MAP + state_code + ".svg", 'r') as file:  
      state_map_template = file.read()

   for county in sjs['county_stats']:
      dr = sjs['county_stats'][county]['county_stats'][-1]
      dr['county'] = county
      dr['fips'] = sjs['county_stats'][county]['fips']
      cd.append(dr)

   cd.sort(key=sort_cpm,reverse=True)
   scd = cd
   total_c = len(scd)
   cc = 1

   for dr in scd:
      county = dr['county']
      fips = dr['fips']
      #for dr in sjs['county_stats'][county]['county_stats']:
      if True:
         if total_c > 0:
            rank_perc = cc / total_c
         else:
            rank_perc = 0
         if rank_perc < .2:
            color = COLORS[4]
         if .2 <= rank_perc < .4:
            color = COLORS[3]
         if .4 <= rank_perc < .6:
            color = COLORS[2]
         if .6 <= rank_perc < .8:
            color = COLORS[1]
         if .8 <= rank_perc <= 1:
            color = COLORS[0]

         state_map_template = state_map_template.replace('id="FIPS_'+fips+'"','id="FIPS_'+fips+'" class="'+color+'"')
         cc += 1

   out = open("test.svg", "w")
   out.write(state_map_template)
   out.close()
   return(state_map_template)

def make_county_table(sjs):
   tool_tips_html = ""   
   state_code = sjs['summary_info']['state_code']

   # We  create the State SVG map per counties here
   with open(PATH_TO_STATE_SVG_MAP + state_code + ".svg", 'r') as file:  
      state_map_template = file.read()

   table_header = """
   <div id="table">
      <table id="states" class="tablesorter ">
            <thead>
               <tr>
                  <th>&nbsp;</th>
                  <th>County</th>
                  <th>Population</th>
                  <th>Cases</th>
                  <th>Deaths</th>
                  <th>Cases per m</th>
                  <th>Deaths per m</th>
                  <th>Growth Rate</th>
                  <th>Mortality Rate</th>
               </tr>
            </thead>
            <tbody  class="list-of-states" >
   """

   oldrow_html = """
                  <tr data-state="{STATE_CODE}" id="{FIP}">
                     <td><span class="cl {COLOR}"></span></td>
                     <td>{COUNTY}</td>
                     <td>{COUNTY_POP}</td>
                     <td>{CASES}</td>
                     <td>{DEATHS}</td>
                     <td>{CPM}</td>
                     <td>{DPM}</td>
                     <td>{CGR}</td>
                     <td>{MORTALITY}</td>
                  </tr>
   """
   row_html = """
                  <tr data-state="{:s}" id="{:s}">
                     <td><span class="cl {:s}"></span></td>
                     <td>{:s}</td>
                     <td>{:0,0f}</td>
                     <td>{:0,0f}</td>
                     <td>{:0,0f}</td>
                     <td>{:0,0f}</td>
                     <td>{:0,.0f}}</td>
                     <td>{0:.2f}%</td>
                     <td>{0:.2f}%</td>
                  </tr>
   """


   table_footer = """
            </tbody>
      </table>
   </div>
   """

#'{0:.2f}'.format(pi)

   latest = []
   rows = ""
   cd = []

   for county in sjs['county_stats']:
      dr = sjs['county_stats'][county]['county_stats'][-1]
      dr['county'] = county
      dr['fips'] = sjs['county_stats'][county]['fips']
      cd.append(dr)
      tool_tips_html += "<div id=\"det_" + dr['fips'] + "\" class=\"dets\">"
      tool_tips_html += make_county_tool_tip(sjs['county_stats'][county])
      tool_tips_html += "</div>\n "
   
   cd.sort(key=sort_cpm,reverse=True)
   scd = cd
   total_c = len(scd)
   cc = 1
   
   for dr in scd:
      county = dr['county']
      fips = dr['fips']
      #for dr in sjs['county_stats'][county]['county_stats']:
      if True:
         if total_c > 0:
            rank_perc = cc / total_c
         else:
            rank_perc = 0
         if rank_perc < .2:
            color = COLORS[4]
         if .2 <= rank_perc < .4:
            color = COLORS[3]
         if .4 <= rank_perc < .6:
            color = COLORS[2]
         if .6 <= rank_perc < .8:
            color = COLORS[1]
         if .8 <= rank_perc <= 1:
            color = COLORS[0]

         if county not in sjs['county_pop']:
            cpop = 0
         else:
            cpop = sjs['county_pop'][county]

         row_html = """
                  <tr data-state="{:s}" id="{:s}">
                     <td><span class="cl {:s}"></span></td>
                     <td>{:s}</td>
         """.format(state_code,fips,color,dr['county'])
                     # Use this for commas in field <td>{:,d}</td>
         row_html += """
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:d}</td>
                     <td>{:0.2f}</td>
                     <td>{:0.2f}</td>
                  </tr> 
         """.format(int(cpop),int(dr['cases']),int(dr['deaths']),int(dr['cpm']),int(dr['dpm']),float(dr['cg_med']),float(dr['mortality']))
                     #<td>{0:.2f}</td>
                     #<td>{0:.2f}</td>
         #print(int(dr['cases']),dr['deaths'],dr['cpm'],dr['dpm'],dr['cg_med'],dr['dg_med'],dr['mortality'])
         #print(row_html)
         rows += row_html

         #frow = row.format(state_code,fips,color,dr['county'],dr['cases'],dr['deaths'],dr['cpm'],dr['dpm'],dr['cg_med'],dr['dg_med'],dr['mortality'])
         #row = row.replace("{STATE_CODE}", state_code)
         #row = row.replace("{FIP}", fips)
         #row = row.replace("{COLOR}", color)
         #row = row.replace("{COUNTY}", dr['county'])
         #row = row.replace("{CASES}", str(dr['cases']))

         # We update the related county in the SVG map here
         state_map_template = state_map_template.replace('id="FIPS_'+fips+'"','id="FIPS_'+fips+'" class="'+color+'"')
         cc += 1 
         if False:  
            if county in sjs['county_pop']:
               row = row.replace("{COUNTY_POP}", str(sjs['county_pop'][county]))
            else:
               row = row.replace("{COUNTY_POP}", str(0))
            row = row.replace("{DEATHS}", str(dr['deaths']))
            row = row.replace("{CPM}", str(dr['cpm']))
            row = row.replace("{DPM}", str(dr['dpm']))
            row = row.replace("{CGR}", str(dr['cg_med']))
            row = row.replace("{DGR}", str(dr['dg_med']))
            row = row.replace("{MORTALITY}", str(dr['mortality']))
            #row = row.replace("{LAST_UPDATE}", update)
            rows += row
            cc += 1 

   table = table_header + rows + table_footer
   return table, state_map_template, tool_tips_html


# Transform 20200506 to 2020-05-06
def string_to_date(s) :
   return s[:4]+'-'+s[4:6]+'-'+s[6:]

def make_county_tool_tip(data):
   #{'day': '2020-04-04', 'zero_day': 14, 'cases': 640, 'deaths': 9, 'cpm': 658, 'dpm': 9, 'new_cases': 74, 'new_deaths': 0, 'mortality': 1.41, 'case_growth': 11.56, 'death_growth': 0.0, 'cg_avg': 22.56, 'dg_avg': 8.67, 'cg_med': 18.07, 'dg_med': 0.0, 'cg_med_decay': -0.18, 'dg_med_decay': 0.0}


   sd = data['county_stats'].sort(key=sort_date,reverse=False)

   #for dd in data['county_stats']:
   #   print(dd) 

   tool_tip = """
      County Details<BR>
   """


   return(tool_tip)


# ADD ALL THE SVG IMAGES FOR A GIVE PLAYER
def add_svg_images(code,_type,_type_string,state, state_name):
   
   # We add all the svgs for CPM
   all_svg = sorted(glob.glob( ANIM_PATH + "frames/" + state + "/" + state + "-" + _type + "*" + "svg"))
   all_svg_code = ""
   max_date = None
 
   for i,svg in enumerate(all_svg):
      # Get date from the path
      svg_date = svg[-12:].replace('.svg','')

      #print(svg_date)
  
      # Load svg map
      with open(svg, 'r') as f:  
         svg_code = f.read()  

      # We can add svg_date inside anim_svg for debug purpose
      if(i==len(all_svg)-1):
         all_svg_code += "<div id='"+_type+"_"+ svg_date+"' class='anim_svg'>"+svg_code+"</div>"
      else:
         all_svg_code += "<div id='"+_type+"_"+ svg_date+"' class='anim_svg' style='display:none'>"+svg_code+"</div>"

      max_date = svg_date

   # Show only the default one

   buttons_holder= "<div class='cont_svg'><a class='btn-anim btn-fastbackward'><span></span></a><a class='btn-anim btn-backward'><span></span></a><a class='btn-anim btn-play m'><span></span></a><a class='btn-anim btn-forward'><span></span></a><a class='btn-anim btn-fastforward'><span></span></a></div>";

   if(_type==ALL_OPTIONS_CODE[DEFAULT_OPTION]):
      all_svg_code = "<div class='image_player' data-rel='"+_type+"'>" +  buttons_holder  + all_svg_code + '</div>'
   else:
      all_svg_code = "<div class='image_player' data-rel='"+_type+"' style='display:none'>"+ buttons_holder + all_svg_code + '</div>'

   return code  + all_svg_code, max_date

 

# CREATE SELECT FOR SVG ANIM OPTIONS
def create_svg_anim_select():
   select = "<select class='select-css' id='anim_selector'>"
   for i,code in enumerate(ALL_OPTIONS_CODE):
      if(code == ALL_OPTIONS_CODE[DEFAULT_OPTION]):
         select += "<option value='"+code+"'  selected>"+ALL_OPTIONS[i]+"</option>"
      else:
         select += "<option value='"+code+"' >"+ALL_OPTIONS[i]+"</option>"         
   return select + "</select>"

 
 


def make_state_page(this_state):
   if this_state == "VI":
      return()
   plot_script = make_state_plots(this_state)



   js_vals = [ 'cpm_vals', 'dpm_vals', 'cases_vals', 'deaths_vals', 'cg_med_vals', 'dg_med_vals', 'mortality_vals', 'new_cases_vals', 'new_deaths_vals'] 
   if cfe("./json/" + this_state + ".json") == 0:
      return()
   sjs = load_json_file("./json/" + this_state + ".json")
 
   county_table, state_svg_map, tool_tips_html = make_county_table(sjs)
   state_map = make_state_map(sjs) 
   
   fp = open("./templates/state.html", "r")
   template = ""
   for line in fp:
      template += line

   for js_field in js_vals:
      if 'js_vals' not in sjs:
         print("JS_VALS MISSING FROM STATE PAGE. MUST RUN PREV FIRST. ./cvsvg.py " + this_state + " cpm prev_data"  )
         exit()
      else:
         if js_field in sjs['js_vals']:
            js_ar = sjs['js_vals'][js_field]
         else:
            js_ar = []
      js_tag = js_field.upper() 
      template = template.replace("{" + js_tag + "}", str(js_ar))

   template = template.replace("{PLOT_SCRIPT}", plot_script)
   template = template.replace("{COUNTY_TOOL_TIP_DIVS}", tool_tips_html)
   template = template.replace("{STATE_NAME}", sjs['summary_info']['state_name'])
   template = template.replace("{STATE_CODE}", sjs['summary_info']['state_code'])
   template = template.replace("{STATE_CODE_L}", sjs['summary_info']['state_code'].lower())

   template = template.replace("{POPULATION}", str('{:,d}'.format(int(sjs['summary_info']['state_population'] * 1000000))))
   
   template = template.replace("{CASES}", str('{:,d}'.format(sjs['summary_info']['cases'])))
   template = template.replace("{DEATHS}", str('{:,d}'.format(sjs['summary_info']['deaths'])))
   template = template.replace("{CPM}", str('{:,d}'.format(int(sjs['summary_info']['cpm']))))
   template = template.replace("{DPM}", str('{:,d}'.format(int(sjs['summary_info']['dpm']))))
   template = template.replace("{CASE_INCREASE}", str('{:,d}'.format(sjs['summary_info']['new_cases'])))
   template = template.replace("{DEATH_INCREASE}", str('{:,d}'.format(sjs['summary_info']['new_deaths'])))
   template = template.replace("{CASE_GROWTH}", str(round(sjs['summary_info']['cg_last'],2))+"%")
   template = template.replace("{DEATH_GROWTH}", str(round(sjs['summary_info']['dg_last'],2))+"%")
   template = template.replace("{MORTALITY}", str(round(sjs['summary_info']['mortality'],2))+"%")
   template = template.replace("{TESTS}", str('{:,d}'.format(sjs['summary_info']['tests'])))
   template = template.replace("{TPM}", str('{:,d}'.format(int(sjs['summary_info']['tpm']))))
   if sjs['summary_info']['hospital_now'] == "":
      sjs['summary_info']['hospital_now'] = 0
      template = template.replace("{HOSP_NOW}", str(int(sjs['summary_info']['hospital_now'])))
   else:
      template = template.replace("{HOSP_NOW}", str(int(sjs['summary_info']['hospital_now'])))

   if sjs['summary_info']['icu_now'] == "":
      sjs['summary_info']['icu_now'] = 0
      template = template.replace("{ICU_NOW}", "No data.")
   else:
      template = template.replace("{ICU_NOW}", str(int(sjs['summary_info']['icu_now'])))
   if sjs['summary_info']['vent_now'] == "":
      sjs['summary_info']['vent_now'] = 0
      template = template.replace("{VENT_NOW}", "No data.")
   else:
      template = template.replace("{VENT_NOW}", str(int(sjs['summary_info']['vent_now'])))

   if sjs['summary_info']['recovered'] == "":
      template = template.replace("{RECOVERED}", "No data.")
   else:
      template = template.replace("{RECOVERED}", str(int(sjs['summary_info']['recovered'])))



   template = template.replace("{STATE_LAST_UPDATE}", string_to_date(str(sjs['summary_info']['state_data_last_updated'])))
   template = template.replace("{COUNTY_LAST_UPDATE}", string_to_date(str(sjs['summary_info']['county_data_last_updated'])))
   template = template.replace("{PAGE_LAST_UPDATE}", str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
   template = template.replace("{LAST_UPDATE}",  datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
   template = template.replace("{COUNTY_TABLE}", county_table)

   # NO NEED FOR THAT ANYMORE
   #template = template.replace("{SVG_STATE_COUNTIES}", state_svg_map)


   # Add select for Anim
   template = template.replace("{ANIM_VIEW_SELECT}", create_svg_anim_select())
  
   # Add All images for SVG aims
   all_svg_images_for_template = ""
   r_max_date = ""
   for i,opt in enumerate(ALL_OPTIONS):
      all_svg_images_for_template, max_date = add_svg_images(all_svg_images_for_template,ALL_OPTIONS_CODE[i], ALL_OPTIONS[i], sjs['summary_info']['state_code'], sjs['summary_info']['state_name'])

      # If we are at the default options, we get the max date
      if(i==DEFAULT_OPTION):
         r_max_date = max_date

   # Max Date  
   template = template.replace("{INIT_ANIM_DATE}", string_to_date(r_max_date))
   
   # Default Anim View
   template = template.replace("{DEFAULT_ANIM_VIEW}",ALL_OPTIONS_CODE[DEFAULT_OPTION])

   # Default type in title
   template = template.replace("{CUR_TYPE}",ALL_OPTIONS[DEFAULT_OPTION])   

   template = template.replace("{ALL_SVG_ANIM}", all_svg_images_for_template)

   # VERSIONING
   template= template.replace("{VERSION}",str(CUR_VERSION))

 
   # Compress (a bit) the SVG...
   #template = template.replace("\n", "")
  

   if cfe(OUT_PATH + "/",1) == 0:
      os.makedirs(OUT_PATH + "/")

   outfp = open(OUT_PATH + "/" + this_state + ".html", "w+")
   print("Saved states/" + this_state + ".html")
   outfp.write(template)
   outfp.close()


def make_state_pages(this_state):
   if this_state != "ALL":
      make_state_page(this_state)
   else:
      print("Make all state pages.")
      state_names, state_codes = load_state_names()
      for st in state_names:
         if st is not "" and st is not "VI":
            make_state_page(st)

def make_all_plots(this_state,show=0):
   if this_state != "ALL":
      make_state_plots(this_state,show)
   else:
      state_names, state_codes = load_state_names()
      for st in state_names:
         
         if st != "VI":
            print(st)
            make_state_plots(st,show)

def make_state_plots(this_state_code, show=0):
   sj = load_json_file("json/" + this_state_code + ".json")
   
   l2_state_data = []
   plot_data = {}
   plot_data['cases_deaths'] = {}
   plot_data['cases_deaths']['xs'] = [] 
   plot_data['cases_deaths']['ys1'] = [] 
   plot_data['cases_deaths']['ys2'] = [] 
   plot_data['cdpm'] = {}
   plot_data['cdpm']['xs'] = [] 
   plot_data['cdpm']['ys1'] = [] 
   plot_data['cdpm']['ys2'] = [] 
   plot_data['in'] = {}
   plot_data['in']['xs'] = [] 
   plot_data['in']['ys1'] = [] 
   plot_data['in']['ys2'] = [] 
   plot_data['ts'] = {}
   plot_data['ts']['xs'] = [] 
   plot_data['ts']['ys1'] = [] 
   plot_data['ts']['ys2'] = [] 
   plot_data['gr'] = {}
   plot_data['gr']['xs'] = [] 
   plot_data['gr']['ys1'] = [] 
   plot_data['gr']['ys2'] = [] 

   plot_data['mt'] = {}
   plot_data['mt']['xs'] = [] 
   plot_data['mt']['ys1'] = [] 
   plot_data['mt']['ys2'] = [] 

   plot_data['dk'] = {}
   plot_data['dk']['xs'] = [] 
   plot_data['dk']['ys1'] = [] 
   plot_data['dk']['ys2'] = [] 

   for sobj in sj['state_stats']:
      #l2_state_data.append((sj['summary_info']['state_code'],sj['summary_info']['state_population'],sobj['date'],sobj['zero_day'],sobj['cases'],sobj['deaths'],sobj['new_cases'],sobj['new_deaths'],sobj['cg_last'],sobj['dg_last'],sobj['cg_avg'],sobj['dg_avg'],sobj['cg_med'],sobj['dg_med'],sobj['cg_med_decay'],sobj['dg_med_decay'],sobj['mortality'],sobj['tests'],sobj['tpm']))
      plot_data['cases_deaths']['xs'].append(sobj['zero_day'])
      plot_data['cases_deaths']['ys1'].append(sobj['cases'])
      plot_data['cases_deaths']['ys2'].append(sobj['deaths'])

      plot_data['cdpm']['xs'].append(sobj['zero_day'])
      plot_data['cdpm']['ys1'].append(sobj['cpm'])
      plot_data['cdpm']['ys2'].append(sobj['dpm'])

      plot_data['in']['xs'].append(sobj['zero_day'])
      plot_data['in']['ys1'].append(sobj['new_cases'])
      plot_data['in']['ys2'].append(sobj['new_deaths'])

      plot_data['ts']['xs'].append(sobj['zero_day'])
      plot_data['ts']['ys1'].append(sobj['tests'])
      plot_data['ts']['ys2'].append(sobj['tpm'])

      plot_data['gr']['xs'].append(sobj['zero_day'])
      plot_data['gr']['ys1'].append(sobj['cg_med'])
      plot_data['gr']['ys2'].append(sobj['dg_med'])

      plot_data['mt']['xs'].append(sobj['zero_day'])
      plot_data['mt']['ys1'].append(sobj['mortality'])
      plot_data['mt']['ys2'].append(sobj['mortality'])

      plot_data['dk']['xs'].append(sobj['zero_day'])
      plot_data['dk']['ys1'].append(sobj['cg_med_decay'])
      plot_data['dk']['ys2'].append(sobj['dg_med_decay'])

   all_plots = "" 
   print("YO")
   all_plots += make_js_plot(this_state_code, plot_data['cases_deaths']['xs'], plot_data['cases_deaths']['ys1'], plot_data['cases_deaths']['ys2'], "CASES AND DEATHS", "Zero Day", "Cases", "Deaths", "cd", show)
   print("YO")
   all_plots += make_js_plot(this_state_code, plot_data['cdpm']['xs'], plot_data['cdpm']['ys1'], plot_data['cdpm']['ys2'], "CASES AND DEATHS PER MILLION", "Zero Day", "Cases Per Million", "Deaths Per Million", "pm", show)
   all_plots += make_js_plot(this_state_code, plot_data['in']['xs'], plot_data['in']['ys1'], plot_data['in']['ys2'], "CASES AND DEATHS INCREASE", "Zero Day", "Case Increase", "Death Increase", "in", show)
   all_plots +=  make_js_plot(this_state_code, plot_data['ts']['xs'], plot_data['ts']['ys1'], plot_data['ts']['ys2'], "TESTS AND TESTS PER MILLION", "Zero Day", "Tests ", "Test PM", "ts", show)

   all_plots += make_js_plot(this_state_code, plot_data['gr']['xs'], plot_data['gr']['ys1'], plot_data['gr']['ys2'], "CASE AND DEATH MEDIAN GROWTH", "Zero Day", "Case Growth Percentage", "Death Growth Percentage", "gr",show)
   all_plots += make_js_plot(this_state_code, plot_data['mt']['xs'], plot_data['mt']['ys1'], plot_data['mt']['ys2'], "MORTALITY", "Zero Day", "Mortality", "Mortality", "mt", show)
   all_plots += make_js_plot(this_state_code, plot_data['dk']['xs'], plot_data['dk']['ys1'], plot_data['dk']['ys2'], "CASE AND DEATH GROWTH DECAY", "Zero Day", "Case Growth Decay", "Death Growth Decay", "dk",show)

   return(all_plots)
      
def make_js_plot(state, bin_days, bin_sums, bin_sums2,plot_title,xa_label,ya_label,ya2_label,plot_id,show=0):
 
   div_name = "plot_" + plot_id


   # makecurv
   try:
      popt,pcov = curve_fit(curve_func,bin_days,bin_sums)
      func_data = curve_func(np.array(bin_days), *popt)
      fit1 = []
      for ff in func_data:
         if ff < .1:
            ff = 0
         fit1.append(ff)
   except:
      print("can't make curve")
      fit1 = None 


   plot_html = """


   var trace1 = {
     x: """ + str(bin_days) + """,
     y: """ + str(bin_sums) + """, 
     name: '""" + ya_label + """',
     type: 'line'
   };

   var trace2 = {
     x: """ + str(bin_days) + """,
     y: """ + str(bin_sums2) + """, 
     yaxis: 'y2',
     name: '""" + ya2_label + """',
     type: 'line'
   };

   """

   if fit1 is not None:
      plot_html += """
   var trace3 = {
     x: """ + str(bin_days) + """,
     y: """ + str(fit1) + """, 
     name: '""" + 'fit' + """',
     type: 'line'
   };
   var data = [trace1, trace2, trace3];
   """
   else: 
      plot_html += """
         var data = [trace1, trace2 ];
      """

   plot_html += """


   var layout = {
     barmode: 'group',
     title: '""" + plot_title + """',
     yaxis: {title: '""" + ya_label + """'},
     yaxis2: {
       title: '""" + ya2_label + """',
       titlefont: {color: 'rgb(148, 103, 189)'},
       tickfont: {color: 'rgb(148, 103, 189)'},
       overlaying: 'y',
       side: 'right'
     },
     legend: {
        x: 0,
        y: 1 
     }

   };


   Plotly.newPlot('""" + div_name + """', data, layout);


   """

   out = open("test.html", "w")
   out.write(plot_html)
   out.close()
   return(plot_html)

def make_plot(state, bin_days, bin_sums, bin_sums2,plot_title,xa_label,ya_label,ya2_label,plot_type,show=0):
   fig, ax1 = plt.subplots()
   label1 = ya_label
   label2 = ya2_label
   print("PLOT:", state, plot_title, show)
   print(bin_days)
   print(bin_sums)
   print(bin_sums2)
   print("make_plot")
   width = .35
   x = np.arange(len(bin_days))
   print("BIN DAYS:", bin_days)
   print("X:", x)

   if plot_type == 'ts':
      label1 = "Tests"
   else:
      label1 = "Cases"

   # BAR STYLE PLOT
   #if plot_type == "in" or plot_type == 'cd' or plot_type == 'pm' or plot_type == 'ts':
   if plot_type == "bar":
      print(bin_days)   
      ax1.bar(x - width/2,bin_sums,width,label=label1)
      ax1.set_xticks(x)
      #ax1.set_xticklabels(bin_days)

      try:
      #if True:
         temp = []
         for b in bin_sums:
            if b <= 0: 
               b = 1
            temp.append(b)
         temp_days = np.arange(len(bin_days))
         popt,pcov = curve_fit(curve_func,bin_days,temp)
         func_data = curve_func(np.array(bin_days), *popt)
   
         temp = []
         for fff in func_data:
            if fff < 0:
               fff = 0
            temp.append(fff)
         func_data = temp 
         ax1.plot(func_data, label='fit')
      except:
         print("Couldn't fit data curve for ax1")

   # LINE STYLE PLOT
   else:
      ax1.plot(bin_days,bin_sums, label=label1)
      try:
         popt,pcov = curve_fit(curve_func,bin_days,bin_sums, maxfev=10000 )
         func_data = curve_func(np.array(bin_days), *popt)
   
         temp = []
         for fff in func_data:
            if fff < 0:
               fff = 0
            temp.append(fff)
         func_data = temp 
         ax1.plot(bin_days,func_data, label='fit')
      except:
         print("failed to fit curve for ax1")

   ax1.set(xlabel=xa_label,ylabel=ya_label,title=plot_title)
   #ax1.grid()

   # AXIS 2

   line_color = 'tab:red'
   # BAR STYLE AX2
   #if plot_type != 'in' and plot_type != 'cd' and plot_type != 'pm' and plot_type != 'ts':
   if plot_type != 'bar':
      ax2 = ax1.twinx()
      ax2.plot(bin_days, bin_sums2 , color=line_color, label=label2)
      ax2.set_ylabel(ya2_label)
   else: 
      # LINE STYLE AX2
      ax2 = ax1.twinx()
      line_color = 'tab:red'
      if plot_type == 'ts':
         label2 = 'Tests PPM'
      else:
         label2 = 'Deaths'
      ax2.bar(x + width/2,bin_sums2,width,label=label2, color=line_color)
      ax2.set_ylabel(ya2_label)
      #ax2.bar(bin_days, bin_sums2, color=line_color)
      try:
      #if True:
         popt,pcov = curve_fit(curve_func,bin_days,bin_sums2, maxfev=10000 )
         func_data = curve_func(np.array(bin_days), *popt)

         temp = []
         for fff in func_data:
            if fff < 0:
               fff = 0
            temp.append(fff)
         func_data = temp
         #ax2.plot(func_data, label='fit', color='tab:red')
         ax2.plot(func_data, label='fit', color='tab:red')
      except:
         print("Couldn't fit data curve for ax2")



   ax1.legend(loc='upper left')
   ax2.legend(loc='lower left')
   if cfe("./plots/", 1) == 0:
      os.makedirs("./plots/")
   plot_file = "plots/" + state + "-" + plot_type + ".png"
   #plt.show()
   plt.savefig(plot_file)
   print("SAVED:", plot_file, show)
   #if show == "1":

def curve_func(x, a, b, c):
   return a * np.exp(-(x-b)**2/(2*c**2))

def plot_level2(level2_data, plot_type='cd', plot_title = "", xa_label = "", ya_label="", ya2_label = ""):
   fig, ax1 = plt.subplots()
   #plt.plot(bin_days,bin_events, bin_avgs, bin_sums)
   bin_days = []
   bin_sums = []
   bin_sums2 = []



   # find first death date
   first_death_date = None
   dc = 0
   for day in level2_data:
      (this_state,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm) = day
      if deaths > 0 and first_death_date is None:
         first_death_date = dc
      dc += 1

   dc = 0
   if first_death_date is None:
      first_death_date = len(level2_data)

   for day in level2_data:
      (this_state,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm) = day
      sdc = dc - first_death_date
      bin_days.append(sdc)

      if plot_type == 'ts':
         bin_sums.append(tests)
         bin_sums2.append(tpm)

      if plot_type == 'cd':
         bin_sums.append(cases)
         bin_sums2.append(deaths)
      elif plot_type == 'pm':
         bin_sums.append(cpm)
         bin_sums2.append(dpm)
      elif plot_type == 'in':
         if case_increase == '':
            case_increase = 0
         if death_increase == '':
            death_increase = 0
         if case_increase < 0:
            case_increase = 0
         if death_increase < 0:
            death_increase = 0
         bin_sums.append(case_increase)
         bin_sums2.append(death_increase)
      elif plot_type == 'gr':
         bin_sums.append(case_growth)
         bin_sums2.append(death_growth)
      elif plot_type == 'mt':
         bin_sums.append(mortality)
         bin_sums2.append(mortality)
      dc += 1


   width = .35
   x = np.arange(len(bin_days))



   if plot_type == "in" or plot_type == 'cd' or plot_type == 'pm' or plot_type == 'ts':
      ax1.bar(x - width/2,bin_sums,width,label=label1)
      ax1.set_xticks(x)
      ax1.set_xticklabels(bin_days)

      try:
      #if True:
         temp = []
         for b in bin_sums:
            if b <= 0: 
               b = 1
            temp.append(b)
         temp_days = np.arange(len(bin_days))
         popt,pcov = curve_fit(curve_func,bin_days,temp)
         func_data = func(np.array(bin_days), *popt)
   
         temp = []
         for fff in func_data:
            if fff < 0:
               fff = 0
            temp.append(fff)
         func_data = temp 
         ax1.plot(func_data, label='fit')
      except:
         print("Couldn't fit data curve")




   else:
      ax1.plot(bin_days,bin_sums)
      try:
         popt,pcov = curve_fit(curve_func,bin_days,bin_sums, maxfev=10000 )
         func_data = func(np.array(bin_days), *popt)
   
         temp = []
         for fff in func_data:
            if fff < 0:
               fff = 0
            temp.append(fff)
         func_data = temp 
         ax1.plot(bin_days,func_data, label='fit')
      except:
         print("failed to fit curve for ax2")

   ax1.set(xlabel=xa_label,ylabel=ya_label,title=plot_title)
   #ax1.grid()
   line_color = 'tab:red'
   if plot_type != 'in' and plot_type != 'cd' and plot_type != 'pm' and plot_type != 'ts':
      ax2 = ax1.twinx()
      ax2.plot(bin_days, bin_sums2 , color=line_color)
      ax2.set_ylabel(ya2_label)
   else: 
      ax2 = ax1.twinx()
      line_color = 'tab:red'
      if plot_type == 'ts':
         label2 = 'Tests PPM'
      else:
         label2 = 'Deaths'
      ax2.bar(x + width/2,bin_sums2,width,label=label2, color=line_color)
      ax2.set_ylabel(ya2_label)
      #ax2.bar(bin_days, bin_sums2, color=line_color)
      try:
         popt,pcov = curve_fit(func,bin_days,bin_sums2, maxfev=10000 )
         func_data = func(np.array(bin_days), *popt)

         temp = []
         for fff in func_data:
            if fff < 0:
               fff = 0
            temp.append(fff)
         func_data = temp
         #ax2.plot(func_data, label='fit', color='tab:red')
         ax22.plot(bin_days,func_data, label='fit')
      except:
         print("Couldn't fit data curve")



   ax1.legend(loc='upper left')
   ax2.legend(loc='lower left')

   plot_file = "plots/" + state + "-" + plot_type + ".png"
   plt.savefig(plot_file)
   print("SAVED:", plot_file)
   #plt.show()


def make_all_level2_data():
   state_data,state_pop = load_state_data()
   print(state_data)
   state_names, state_codes = load_state_names()
   county_pops = load_county_pop(state_codes)
   acdata = load_county_data()

   for state_code in state_names:
      print("STATE DATA:", state_data)
      #exit()
      if state_code != "VI":
         make_level2_data(state_code, state_data, state_pop,state_names,county_pops,acdata)
   merge_state_data()

def make_level2_data(this_state_code, state_data, state_pop,state_names,county_pops,acdata):
   cj = {}
   if cfe("json/USAd.json") == 1:
      all_usa_data = load_json_file("json/USAd.json")
   else:
      all_usa_data = {}
   all_usa_data_ar = []

   county_pop = county_pops[this_state_code]
   if this_state_code in acdata:
      cdata = acdata[this_state_code]
   else:
      cdata =[]

   level2_data = analyze_data_for_state(this_state_code, state_data,state_pop)
   #(this_state,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm)

   level2_data = add_enhanced_growth_stats("MD", level2_data)
   #(state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med) 

   cja,last_c_date = enhance_cdata(this_state_code, cdata, cj)
   if this_state_code in cja:
      cj = cja[this_state_code]
   else:
      cj = []


   # Create state stats json object
   state_stats = []
   for data in level2_data:
      stat_obj = {}
      (state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay,hospital_now,icu_now,vent_now,recovered) = data 
      if case_increase < 0:
         case_increase = 0
      if death_increase < 0:
         death_increase = 0
      if new_cases < 0:
         new_cases = 0
      if new_deaths < 0:
         new_deaths = 0
      if date not in all_usa_data:
         all_usa_data[date] = {
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
         "dg_med_decay" : dg_med_decay,
         "mortality" : mortality,
         "hospital_now" : int(hospital_now),
         "icu_now" : int(icu_now),
         "vent_now" : int(vent_now),
         "recovered" : int(recovered)
         }
      else:
         all_usa_data[date]['cases'] += cases
         all_usa_data[date]['deaths'] += deaths
         all_usa_data[date]['new_cases'] += new_cases
         all_usa_data[date]['new_deaths'] += new_deaths
         all_usa_data[date]['tests'] += tests
         all_usa_data[date]['tpm'] += tpm
         all_usa_data[date]['cpm'] += cpm
         all_usa_data[date]['cg_last'] += case_growth 
         all_usa_data[date]['dg_last'] += death_growth 
         all_usa_data[date]['cg_med'] += cg_med 
         all_usa_data[date]['dg_med'] += dg_med 
         all_usa_data[date]['mortality'] += mortality
         all_usa_data[date]['hospital_now'] += int(hospital_now)
         all_usa_data[date]['icu_now'] += int(icu_now)
         all_usa_data[date]['vent_now'] += int(vent_now)
         all_usa_data[date]['recovered'] += int(recovered)

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
         "dg_med_decay" : dg_med_decay,
         "mortality" : mortality,
         "hospital_now" : hospital_now,
         "icu_now" : icu_now,
         "vent_now" : vent_now,
         "recovered" :recovered 
      }
      state_stats.append(stat_obj)
   sorted_state_stats = state_stats.sort(key=sort_date,reverse=False)
   #all_usa_data = all_usa_data.sort(key=sort_date,reverse=False)

   # Create final state json object:
   state_obj = {}
   state_obj['summary_info'] = {}
   state_obj['summary_info']['state_code'] = state_code
   state_obj['summary_info']['state_name'] = state_names[state_code]
   state_obj['summary_info']['state_population'] = state_pop[state_code]
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
   state_obj['summary_info']['mortality'] = mortality
   state_obj['summary_info']['hospital_now'] = hospital_now
   state_obj['summary_info']['icu_now'] = icu_now
   state_obj['summary_info']['vent_now'] = vent_now
   state_obj['summary_info']['recovered'] = recovered 
   state_obj['summary_info']['state_data_last_updated'] = level2_data[-1][2] 
   if last_c_date is not None:
      state_obj['summary_info']['county_data_last_updated'] = last_c_date.replace("-", "")
   else:
      state_obj['summary_info']['county_data_last_updated'] = "NA"

   state_obj['county_pop'] = county_pop
   state_obj['state_stats'] = state_stats
   state_obj['county_stats'] = cj
   #state_obj['cdata'] = cdata 
   if cfe("./json", 1) == 0:
      os.makedirs("./json")
   save_json_file("./json/" + state_code + ".json", state_obj)

   for key in all_usa_data:
      all_usa_data_ar.append(all_usa_data[key])

   fd = {}
   fd['day_stats'] = all_usa_data_ar

   #all_usa_sorted = all_usa_data_ar.sort(key=sort_date,reverse=False)
   save_json_file("json/USAd.json", all_usa_data)
   save_json_file("./json/USA" + ".json", fd)

   save_json_file("./json/USA" + ".json", all_usa_data)
   print("Saved: ./json/" + state_code + ".json")


def enhance_county(this_state_code, this_county, data, cj):
   last_day = None
   if this_state_code not in cj:
      cj[this_state_code] = {}
   if this_county not in cj[this_state_code]:
      cj[this_state_code][this_county] = {}
  
   first_death_day = None 

   dc = 0
   for d in data['cd_data']:
      (day,cases,deaths,pm_cases,pm_deaths,mortality) = d
      if first_death_day == None and int(deaths) > 0:
         first_death_day = dc
      dc += 1
   if first_death_day is None:
      first_death_day = 0 

   # ADD ZERO DAY
   dc = 0
   zd = []
   for d in data['cd_data']:
      (day,cases,deaths,pm_cases,pm_deaths,mortality) = d
      zero_day = dc - first_death_day
      zd.append( (day,zero_day,int(cases),int(deaths),int(pm_cases),int(pm_deaths),round(mortality,2)) )
      dc += 1

   # ADD GROWTH
   cgr_last = []
   dgr_last = []
   gr = [] 
   last_cases = 0 
   last_deaths = 0 
   day = None
   for zz in zd:
      (day,zero_day,cases,deaths,pm_cases,pm_deaths,mortality) = zz
      new_cases = cases - last_cases
      new_deaths = deaths - last_deaths
      if int(cases) > 0:
         case_growth = (1 - (int(last_cases) / int(cases))) * 100
         case_growth = round(case_growth,2)
      else: 
         case_growth = 0
      if deaths != 0:
         death_growth = (1 - (last_deaths / deaths)) * 100
         death_growth = round(death_growth,2)
      else:
         death_growth = 0
      if case_growth > 0:
         cgr_last.append(case_growth) 
         dgr_last.append(death_growth) 
      if len(cgr_last) > 3:
         cgr_avg = np.mean(cgr_last)
         cgr_med = np.median(cgr_last)
      else:
          cgr_avg = 0
          cgr_med = 0
      if len(dgr_last) > 3:
         dgr_avg = np.mean(dgr_last)
         dgr_med = np.median(dgr_last)
      else:
         dgr_avg = 0
         dgr_med = 0
      gr.append((day,zero_day,cases,deaths,pm_cases,pm_deaths,new_cases,new_deaths,mortality,round(case_growth,2),round(death_growth,2),round(cgr_avg,2),round(dgr_avg,2),round(cgr_med,2),round(dgr_med,2)))
      last_cases = cases
      last_deaths = deaths

   # Add cgr/dgr growth decay
   decay = []
   last_cg_med = 0
   last_dg_med = 0
   for zz in gr:
      (day,zero_day,cases,deaths,pm_cases,pm_deaths,new_cases,new_deaths,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med) = zz

      if cases > 0:
         cg_med_decay = round(cg_med - last_cg_med,2)
      else:
         cg_med_decay = 0
      if deaths > 0:
         dg_med_decay = round(dg_med - last_dg_med,2)
      else:
         dg_med_decay = 0
      
      decay.append((day,zero_day,cases,deaths,pm_cases,pm_deaths,new_cases,new_deaths,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay))
      last_cg_med = cg_med
      last_dg_med = dg_med


   # Make final data object
   cd_objs = []
   for ggg in decay:
      cd_obj = {}
      cd_obj['day'] = day
      cd_obj['zero_day'] = zero_day
      cd_obj['cases'] = cases
      cd_obj['deaths'] = deaths
      cd_obj['cpm'] = pm_cases
      cd_obj['dpm'] = pm_deaths
      cd_obj['new_cases'] = new_cases
      cd_obj['new_deaths'] = new_deaths
      cd_obj['mortality'] = mortality
      cd_obj['case_growth'] = case_growth
      cd_obj['death_growth'] = death_growth
      cd_obj['cg_avg'] = cg_avg
      cd_obj['dg_avg'] = dg_avg
      cd_obj['cg_med'] = cg_med
      cd_obj['dg_med'] = dg_med
      cd_obj['cg_med_decay'] = cg_med_decay
      cd_obj['dg_med_decay'] = dg_med_decay
      (day,zero_day,cases,deaths,pm_cases,pm_deaths,new_cases,new_deaths,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay) = ggg
      cd_objs.append(cd_obj)
      last_day = day

   sorted_cd_objs = cd_objs.sort(key=sort_date,reverse=False)

   return(ggg,cd_objs,last_day)

def sort_date(json):
   return(int(json['zero_day']))

def sort_cpm(json):
   try:
      return(int(json['cpm']))
   except:
      return(0)
 
def enhance_cdata(this_state_code, cdata,cj):
   # add growth vars, zero day, decay 
   last_date = None

   for key in cdata:
      cd_data, cd_objs,last_date = enhance_county(this_state_code, key,cdata[key],cj)
      cj[this_state_code][key]['county_stats'] = cd_objs 
      cj[this_state_code][key]['fips'] = cdata[key]['fips']
      cj[this_state_code][key]['population'] = cdata[key]['population']
 
   return(cj,last_date)

def add_enhanced_growth_stats(state_code, l2s):
   extra = []
   final = []
   case_grs = []
   death_grs = []
   # add avg growth and median growth to l2 data
   first_death_day = None
   dc = 0
   for data in l2s:
      (state_code,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm,hospital_now,icu_now,vent_now,recovered) = data
      pop = round(pop,2)
      if first_death_day is None and deaths > 0:
         first_death_day = dc
         first_death_date = date

      if len(case_grs) > 3:
         cg_avg = round(np.mean(case_grs[-3:]),2)
         cg_med = round(np.median(case_grs[-3:]),2)
      else:
         cg_avg = case_growth
         cg_med = case_growth

      if len(death_grs) > 3:
         dg_avg = round(np.mean(death_grs[-3:]),2)
         dg_med = round(np.median(death_grs[-3:]),2)
      else:
         dg_avg = death_growth 
         dg_med = death_growth 

      extra.append((state_code,pop,date,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,hospital_now,icu_now,vent_now,recovered) )
      if cases > 0:
         case_grs.append(case_growth)
      if deaths > 0:
         death_grs.append(death_growth)
      dc = dc + 1


   # add median growth decay to l2 data 

   last_cg_med = 0
   last_dg_med = 0
   dc = 0
   if first_death_day is None:
      first_death_day = 0
   for data in extra:
      (state_code,pop,date,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,hospital_now,icu_now,vent_now,recovered) = data
    
      if cases > 0:
         cg_med_decay = round(cg_med - last_cg_med,2)
      else:
         cg_med_decay = 0
      
      if deaths > 0:
         dg_med_decay = round(dg_med - last_dg_med,2) 
      else:
         dg_med_decay = 0
      zero_day = dc - first_death_day
      final.append((state_code,pop,date,zero_day,cases,deaths,new_cases,new_deaths,tests,tpm,cpm,dpm,case_increase,death_increase,mortality,case_growth,death_growth,cg_avg,dg_avg,cg_med,dg_med,cg_med_decay,dg_med_decay,hospital_now,icu_now,vent_now,recovered) )
      last_cg_med = cg_med 
      last_dg_med = dg_med
      dc += 1

   #for data in final:
   #   print(data)
 
   return(final)

def analyze_data_for_state(this_state,state_data,state_pop):
   last_cases = 0
   last_deaths = 0

   level2_data = []

   temp = sorted(state_data[this_state], key=lambda x: x[0], reverse=False)

   last_cases = 0
   last_deaths = 0
   last_cpm = 0
   last_dpm = 0
   case_growth = 0
   death_growth = 0


   for data in temp:
      #date, cases, deaths, case_increase, death_increase,tests = data
      print("TEMP:", data)
      (date,cases,deaths,case_increase,death_increase,tests,hospital_now,icu_now,vent_now,recovered) = data
      new_cases = cases - last_cases
      new_deaths = deaths - last_deaths
      #if this_state == "DE":
      #   print("NEW CASES:", date, cases, last_cases, new_cases)
      if int(last_cases) < 0:
         last_cases = 0
         new_cases = 0
      if int(last_deaths) < 0:
         last_deaths = 0
         new_deaths = 0
      if int(death_increase) < 0:
         death_increase = 0
      if int(case_increase) < 0:
         case_increase = 0

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
      level2_data.append((this_state,pop,date,cases,deaths,new_cases,new_deaths,cpm,dpm,case_increase,death_increase,case_growth,death_growth,mortality,tests,tpm,hospital_now,icu_now,vent_now,recovered))
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



   fp = open("./data/state-pop.txt", "r")
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
      #print(len(fields))
#date,state,positive,negative,pending,hospitalizedCurrently,hospitalizedCumulative,inIcuCurrently,inIcuCumulative,onVentilatorCurrently,onVentilatorCumulative,recovered,hash,dateChecked,death,hospitalized,total,totalTestResults,posNeg,fips,deathIncrease,hospitalizedIncrease,negativeIncrease,positiveIncrease,totalTestResultsIncrease
      if len(fields) == 25 and lc > 0:
         #print(fields[14], fields[15])
         date = fields[0]
         state = fields[1]
         
         cases = fields[2]
         deaths = fields[14]
         icu_now = fields[7]
         vent_now = fields[9]
         hospital_now= fields[5]
         recovered = fields[11]
         tests = fields[17]
         death_increase = fields[20]
         case_increase = fields[22]

         if cases == "":
            cases = 0
         if deaths == "":
            deaths = 0
         if icu_now == "":
            icu_now = 0
         if vent_now == "":
            vent_now = 0
         if hospital_now == "":
            hospital_now = 0
         if recovered == "":
            recovered = 0
         if tests == "":
            tests = 0
         if death_increase == "":
            death_increase = 0
         if case_increase == "":
            case_increase = 0
         if int(case_increase) < 0:
            case_increase = 0
         if int(death_increase) < 0:
            death_increase = 0

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
            if "," in str(cases):
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
         state_data[state].append([date,cases,deaths,case_increase,death_increase,tests,hospital_now,icu_now,vent_now,recovered])
      lc += 1

   #for st in state_data:
   #   print("LATEST STATE DATA: ", st, state_data[st][0])
      #for day in state_data[st]:
      #   print("LATEST STATE DATA: ", st, day)

   return(state_data, state_pop)

def load_us_cities():
#"city","city_ascii","state_id","state_name","county_fips","county_name","county_fips_all","county_name_all","lat","lng","population","density","source","military" ,"incorporated","timezone","ranking","zips","id"
   fp = open("uscities.csv", "r")
   for line in fp:
      data = data.replace("\"", "")
      data = line.split(",")
      print(data)
      


def load_county_pop(state_codes):
   fp = open("./data/county-pop.txt", "r")
   county_pop = {}
   for line in fp:
      line = line.replace("\n", "")
      
      data = line.split("\t")
      state = data[0]
      if state in state_codes:
         state_code = state_codes[state]
         count = data[1]
         pop = data[2]
         pop = pop.replace(",", "")
         if state_code not in county_pop:
            county_pop[state_code] = {}
         county_pop[state_code][count] = int(pop)
      #else: 
      #   print("BAD:", state)


   return(county_pop)


def load_county_data():
  state_names, state_codes = load_state_names()
  state_pop = load_state_pop()
  county_pop = load_county_pop(state_codes)
  # ['2020-03-30', 'Washakie', 'Wyoming', '56043', '1', '0']
  cj = {}
  cfile = "covid-19-data/us-counties.csv"
  fp = open(cfile, "r")
  for line in fp:
     line = line.replace("\n", "")
     day, county, state_name, fips, cases, deaths = line.split(",")
     if state_name == 'state' or county == "county":
        continue
     if "Puerto" in state_name or "Islands" in state_name or "Guam" in state_name or "District" in state_name:
        continue
     else:
        state_code = state_codes[state_name]
     if state_code not in cj:
        cj[state_code] = {}


     if county not in cj[state_code]:
        cj[state_code][county] = {}
        cj[state_code][county]['state_code'] = state_code
        cj[state_code][county]['state_name'] = state_name
        cj[state_code][county]['county'] = county
        cj[state_code][county]['fips'] = fips
        cj[state_code][county]['cd_data'] = []


     if county in county_pop[state_code]:
        cpop = county_pop[state_code][county]
     else:
        cpop = 0

     cj[state_code][county]['population'] = cpop
     if cpop != 0:
        pm_cases = int(cases) / (cpop / 1000000)
        pm_deaths = int(deaths) / (cpop / 1000000)
     else:
        #print("CPOP PROBLEM!", state_code, county )
        pm_cases = 0
        pm_deaths = 0
        if county != 'Unknown': 
           print("MISSING COUNTY:", county)
           fp = open("err_log.txt", "a")
           fp.write("COUNTY MISSING," + state_code + "," + county)

     if pm_cases > 0 and pm_deaths > 0:
        mortality = round((pm_deaths / pm_cases) * 100,2)
     else:
        mortality = 0
     #cj[state_code][county]['cd_data'].append([day,cases,deaths,pm_cases,pm_deaths,mortality])
     # need to add zero day, growth and decay but not here?
     cj[state_code][county]['cd_data'].append([day,cases,deaths,pm_cases,pm_deaths,mortality])
  #print("SAVED: json/county-level2.json")
  save_json_file("./json/county-level2.json", cj)
  return(cj)


def load_state_names():
   fp = open("./data/state-names.txt", "r")
   state_names = {}
   state_codes = {}
   for line in fp:
      line = line.replace("\n", "")
      name,st = line.split(",")
      state_names[st] = name
      state_codes[name] = st 
   return(state_names, state_codes)

def load_state_pop():
   fp = open("data/state-pop.txt", "r")
   state_pop = {}
   for line in fp:
      line = line.replace("\n", "")
      state, pop = line.split("\t")
      pop = pop.replace(",", "")
      state_pop[state] = int(pop) / 1000000
   fp.close()
   return(state_pop)

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
   #make_svg_legends() 
   main_menu()
