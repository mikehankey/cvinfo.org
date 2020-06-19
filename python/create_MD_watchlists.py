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

            if(b1 > date(2020, 4, 12)):

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
 
      if(len(all_y_avg)>0):
         all_last_avg7.append({ 
            "avg_last7" :  all_y_avg[len(all_y_avg)-1],
            "zip_file"  :  zip_file
         })
 

 

   most_active = sorted(all_last_avg7, key=itemgetter('avg_last7')) 
   most_active = most_active[:30] 
 
   # Transform the dict of most active into a list of path
   all_most_active = []
   for m in most_active:
      all_most_active.append(m['zip_file'])
  
   # We rank all the zips  
   tmp_alerts = rank_zips(all_zip_json_file)
   alerts = tmp_alerts['ugly'] + tmp_alerts['bad']
 
   return alerts, all_most_active

 
# Input: list of zip (json file paths)
# Return: list of dict usable to create the html pages
def get_info_for_zip_areas(list_to):
   all_zips = []

   for json_file in list_to:
 
      # Get county name from full path (it's the last folder) 
      county_name = os.path.basename(os.path.dirname(json_file))   
      county_name = county_name.title().replace("'S","'s")

      # Read the file to get a bit more info
      tmp_json = open(json_file,"r")
      tmp_data = json.load(tmp_json)
      tmp_json.close()
 
      total_case = 0
      # Get total cases
      for day in tmp_data['stats']:
         for d in day:
            total_case += day[d]['cases']

      all_zips.append({
         'zip':tmp_data['info']['zip'],
         'city':tmp_data['info']['zip_name'].replace('Md','MD'),
         'county':county_name,
         'total_case':total_case
      })

   
   # We rank the the zip area by total of cases
   return  sorted(all_zips, key=itemgetter('total_case'), reverse=True) 


def create_MD_watchlists_pages():
   
   alerts, most_active = create_MD_watchlists()

   # Random Number for non-cached images
   rand = str(random.randint(1,100000001))

   # We open the ALERTS template
   f_template =  open(MD_ALERTS_TEMPLATE,  'r')
   alert_template = f_template.read() 
   f_template.close()

   # We open the MOST ACTIVE template
   f_template =  open(MD_MOST_ACTIVE_TEMPLATE,  'r')
   most_active_template = f_template.read() 
   f_template.close()

   all_alerts        =  get_info_for_zip_areas(alerts)
   all_most_active   =  get_info_for_zip_areas(most_active)
     
   # We open the MOST ACTIVE template
   f_template =  open(MD_ALERTS_TEMPLATE,  'r')
   most_active = f_template.read() 
   f_template.close()
   
   alerts_html = ''
   for alert in all_alerts:
      alerts_html+= create_MD_zip_DOM_el(alert['zip'],alert['city'],alert['county'],alert['total_case'],rand)

   alert_template = alert_template.replace('{WHISHLIST}',alerts_html)
   
   # Save the MD alerts page
   county_page = open(PATH_TO_STATES_FOLDER + os.sep + "MD" + os.sep +  "alert.html",'w+')
   county_page.write(alert_template)
   county_page.close()  


   most_active_html= ''
   for most_active in all_most_active:
      most_active_html+= create_MD_zip_DOM_el(most_active['zip'],most_active['city'],most_active['county'],most_active['total_case'],rand)

   most_active_template = most_active_template.replace('{WHISHLIST}',most_active_html)
    

   # Save the MD most active page
   county_page = open(PATH_TO_STATES_FOLDER + os.sep + "MD" + os.sep + "most_active.html",'w+')
   county_page.write(most_active_template)
   county_page.close()    


# Create Graph HTML Element with image (the graph, dumbass)
def create_MD_zip_DOM_el(_zip,city_name,county_name,total_case,rand): 
   return '<div class="graph_g"><h3 class="nmb">Zip: '+str(_zip)+'<br>'+  city_name +'</h3><p>Total Cases:'+display_us_format(total_case,0)+'</p><img  src="./counties/' + county_name + os.sep + str(_zip)+'.png?v='+rand+'" width="345" alt="'+str(_zip)+'"/></div>' 




if __name__ == "__main__":
   create_MD_watchlists_pages()