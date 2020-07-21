import glob
import os, sys
import numpy as np
import random
from create_json_data_files import *
from update_data_src import * 
from create_main_gbu_page import *
from create_state_gbu_pages import *
from create_MD_zip_graphs import rank_zips 
from operator import itemgetter 



# Return the 7day avg cases for the given json_file content
def get_7day_avg_data_for_MD(data):
 
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

   total_case = 0

   for d in data['stats']:
      for day in d:
 
         total_case += float(d[day][_type])

         # Warning - it looks like in Maryland, they put a lot of cases on the first day in the stats
         # so we ignore the data in the graphs to have something legible
         d_day = day.split('-')
         b1 = date(int(d_day[0]), int(d_day[1]), int(d_day[2]))

         if(b1 > date(2020, 4, 12)): 

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
 
   return all_x_avg,all_y_avg,total_case

# Create MD Watchlists
def create_MD_watchlists():

   most_active = []     # top 30 sorted by last 7 day avg value
   alerts   = []        # improving or losing
   
   all_last_avg7 = []

   # Glob all MD zip code area 
   all_zip_json_file = glob.glob(PATH_TO_STATES_FOLDER + os.sep + 'MD' + os.sep + "counties"  + os.sep  + "**" + os.sep +  "*.json")
    
   for zip_file in all_zip_json_file:
      
      # We read the file
      tmp_json    = open(zip_file,  'r')
      data = json.load(tmp_json)

      all_x_avg, all_y_avg, total_case = get_7day_avg_data_for_MD(data) 
  
      if(len(all_y_avg)>0):
 
          # Get county name from full path (it's the last folder) 
         county_name = os.path.basename(os.path.dirname(zip_file))   
         county_name = county_name.title().replace("'S","'s")

         all_last_avg7.append({ 
            "avg_last7" :     all_y_avg[len(all_y_avg)-1],
            "zip_file"  :     zip_file,
            "zip"       :     data['info']['zip'],
            "city"      :     data['info']['zip_name'],
            "total_cases":    total_case,
            "county"     :    county_name
         })
  
   # The most active are the first 30 zip area codes ranks by avg_last7
   most_active = sorted(all_last_avg7, key=itemgetter('avg_last7'), reverse=True) 
   most_active = most_active[:30] 
   create_most_active_page(most_active)
   
   # The "alerts" are the ugly & bad zip areas rank by avg_last7
   tmp_alerts = rank_zips(all_zip_json_file)    
   create_most_alert_page(tmp_alerts['ugly'] + tmp_alerts['bad'])
   


# Creat Alerts Page
def create_most_alert_page(all_alerts_json_files): 
   alerts = []
   all_last_avg7=[]

   # Random Number for non-cached images
   rand = str(random.randint(1,100000001))

    # We open the ALERTS template
   f_template =  open(MD_ALERTS_TEMPLATE,  'r')
   alerts_template = f_template.read() 
   f_template.close()

   # Create County Select
   MD_select = get_MD_select()

   for zip_file in all_alerts_json_files:
       # We read the file
      tmp_json    = open(zip_file,  'r')
      data = json.load(tmp_json)

      all_x_avg, all_y_avg, total_case = get_7day_avg_data_for_MD(data) 

      if(len(all_y_avg)>0):
 
          # Get county name from full path (it's the last folder) 
         county_name = os.path.basename(os.path.dirname(zip_file))   
         county_name = county_name.title().replace("'S","'s")

         all_last_avg7.append({ 
            "avg_last7" :     all_y_avg[len(all_y_avg)-1],
            "zip_file"  :     zip_file,
            "zip"       :     data['info']['zip'],
            "city"      :     data['info']['zip_name'],
            "total_cases":    total_case,
            "county"     :    county_name
         })
      
   # Rank  by avg_last7
   alerts = sorted(all_last_avg7, key=itemgetter('avg_last7'), reverse=True) 

   # Create All DOM Elements
   alert_html= ''
   for alert in alerts:
      alert_html+= create_MD_zip_DOM_el(alert['zip'],alert['city'],alert['county'],alert['total_cases'],rand,alert['avg_last7'])

   alerts_template = alerts_template.replace('{WHISHLIST}',alert_html)
   alerts_template = alerts_template.replace('{MD_COUNTY_SELECT}',MD_select)  
   alerts_template = alerts_template.replace('{RAND_CSS}',str(rand)) 

   # Save the MD most active page
   alert_page = open(PATH_TO_STATES_FOLDER + os.sep + "MD" + os.sep + "alerts.html",'w+')
   alert_page.write(alerts_template)
   alert_page.close() 

   print("Alerts created")


# Create Most Active Page
def create_most_active_page(all_most_active):
   # Random Number for non-cached images
   rand = str(random.randint(1,100000001))

   # We open the MOST ACTIVE template
   f_template =  open(MD_MOST_ACTIVE_TEMPLATE,  'r')
   most_active_template = f_template.read() 
   f_template.close()
   
   # Create County Select
   MD_select = get_MD_select()

   # Create All DOM Elements
   most_active_html= ''
   for most_active in all_most_active:
      most_active_html+= create_MD_zip_DOM_el(most_active['zip'],most_active['city'],most_active['county'],most_active['total_cases'],rand,most_active['avg_last7'])

   most_active_template = most_active_template.replace('{WHISHLIST}',most_active_html)
   most_active_template = most_active_template.replace('{MD_COUNTY_SELECT}',MD_select)  
   most_active_template = most_active_template.replace('{RAND_CSS}',str(rand))

   # Save the MD most active page
   most_active__page = open(PATH_TO_STATES_FOLDER + os.sep + "MD" + os.sep + "most_active.html",'w+')
   most_active__page.write(most_active_template)
   most_active__page.close() 

   print("Most active created")



def get_MD_select():
   # Get the list of counties for which we have zip data
   all_MD_counties = glob.glob(PATH_TO_STATES_FOLDER + os.sep + 'MD' + os.sep + "counties"  + os.sep  + "*" + os.sep)

   # Create the select 
   md_counties_select = "<select id='md_county_selector' disabled><option value='ALL'>All counties</option>"

   for c in sorted(all_MD_counties):
      # Get Name of the county from path
      count_name = os.path.basename(os.path.dirname(c))
      md_counties_select+= "<option val='"+count_name+"'>"+count_name+"</option>"
   
   md_counties_select += "</select>" 

   return md_counties_select





# Create Graph HTML Element with image (the graph, dumbass)
def create_MD_zip_DOM_el(_zip,city_name,county_name,total_case,rand,last_7day):  
   return '<div class="graph_g"><h3 class="nmb">Zip: '+str(_zip)+'<br>'+  city_name +'</h3><p style="margin-top:0"><small>Total Cases: '+display_us_format(total_case,0)+' - Last 7-Day avg cases: '+display_us_format(last_7day,0)+'</small></p><img  src="./MD/counties/' + county_name + os.sep + str(_zip)+'.png?v='+rand+'"  alt="'+str(_zip)+'"/></div>' 




if __name__ == "__main__":
   create_MD_watchlists()