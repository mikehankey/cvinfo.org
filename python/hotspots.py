import glob
import os
import numpy as np
import random
from create_json_data_files import *
from update_data_src import * 
from create_main_gbu_page import *
from create_state_gbu_pages import * 


def get_hotspots_and_alerts():

   hotspots = []     # more than 100 new COVID-19 cases per day
   alerts   = []     # 7-day avergae for new cases has spiked compared to 7 days ago


   for st in US_STATES:
   
      # Get all the county json files 
      all_countries_json_file = glob.glob(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + "counties"  + os.sep  + "*.json")

      print(st + "'s counties' data")

      for county_json_file in all_countries_json_file:

         # We read the file
         tmp_json    = open(county_json_file,  'r')
         county_data = json.load(tmp_json)

         # Get county name from path
         county_name = os.path.basename(county_json_file).replace('.json','')
         #print(county_name + ", " + st)
 
         all_y = []
         all_y_avg = [] 

         tempValForAvg = []
         tempValFormax_day = []
  
         # We get the avg cases 
         # Get the DATA
         max_day = 7
         for d in reversed(county_data['stats']):
         
            for day in d: 
               all_y.append(d[day]['cases']) 
            
               # We compute the Averages
               tempValForAvg.append(float(d[day]['cases']))

               if(len(tempValForAvg) <  max_day):
                  tempValFormax_day = tempValForAvg 
               else:
                  tempValFormax_day = tempValForAvg[len(tempValForAvg)-max_day:len(tempValForAvg)] 
      
               # We have strings...
               tempValFormax_day = [float(i) for i in tempValFormax_day]
 
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
                  "state":    st,
                  "county":   county_name,
                  "delta7":   round(perc7,2), 
                  "delta14":  round(perc14,2),
                  "last_n_c": all_y[len(all_y)-1]  # Real last new cases
               })
               
            if (perc7 > 1.25 or perc14 > 1.25) and cur_new_cases >= 10 and perc7 > 1:
               alerts.append({
                  "state":    st,
                  "county":   county_name,
                  "delta7":   round(perc7,2), 
                  "delta14":  round(perc14,2),
                  "last_n_c": all_y[len(all_y)-1] # Real last new cases
               }) 

   return hotspots,alerts

def create_hotspot_page(hotspots):
   print("Creating Hotspot page")

   hotspots = sorted(hotspots, key=lambda k: k['last_n_c'], reverse=True)

   # Open Template
   f_template =  open(HOTSPOTS_TEMPLATE,  'r')
   template = f_template.read() 
   f_template.close()

   # Random Number for non-cached css
   rand = random.randint(1,100000001)
   template = template.replace('{RAND_CSS}',str(rand)) 


   # How many hotspots 
   template = template.replace('{HOW_MANY_HOTSPOT}', str(len(hotspots)))

   # Add Graphs to page (warning the graphs are created while creating the state page as we need the color associated to the state :( )
   all_hotspot_graphs = ''
   
   for county in hotspots:
      all_hotspot_graphs +=  create_hotspotgraph_DOM_el(county['last_n_c'], '.' + os.sep + county['state']  + os.sep + 'counties' + os.sep + county['county']  + '.png', county['county']  + ', ' + county['state'], county['delta7'],county['delta14'], county['county'], county['state'])
 
   # Add all graphs
   template = template.replace('{HOTSPOTS_GRAPHS}', all_hotspot_graphs)

   # Save Template as hotspots page
   hotspots_page = open('../corona-calc/states/hotspots.html','w+')
   hotspots_page.write(template)
   hotspots_page.close()


def create_alert_page(alerts):
   print("Creating Alert Pages")

   alerts = sorted(alerts, key=lambda k: k['last_n_c'], reverse=True)

   # Open Templates
   f_template =  open(ALERTS_TEMPLATE,  'r')
   template = f_template.read() 
   f_template.close()

   # Open Template Ranked by Delta 7
   f_template =  open(ALERTS_TEMPLATE_DELTA,  'r')
   template_delta = f_template.read() 
   f_template.close()

   # How many alerts 
   template = template.replace('{HOW_MANY_ALERT}', str(len(alerts)))
   template_delta = template_delta.replace('{HOW_MANY_ALERT}', str(len(alerts)))

   rand = random.randint(1,100000001)
   template = template.replace('{RAND_CSS}',str(rand)) 
   template_delta = template_delta.replace('{RAND_CSS}',str(rand))

   # Add Graphs to page (warning the graphs are created while creating the state page as we need the color associated to the state :( )
   all_alert_graphs = ''
   
   for county in alerts:
      all_alert_graphs +=  create_alertgraph_DOM_el(county['last_n_c'], '.' + os.sep + county['state']  + os.sep + 'counties' + os.sep + county['county']  + '.png', county['county']  + ', ' + county['state'], county['delta7'],county['delta14'], county['county'], county['state'])
 
   # Add all graphs
   template = template.replace('{ALERTS_GRAPHS}', all_alert_graphs)

   # We rank by Delta-7 
   alerts = sorted(alerts, key=lambda k: k['delta7'], reverse=True) 
   all_alert_graphs = ''
   for county in alerts:
      all_alert_graphs +=  create_alertgraph_DOM_el(county['last_n_c'], '.' + os.sep + county['state']  + os.sep + 'counties' + os.sep + county['county']  + '.png', county['county']  + ', ' + county['state'], county['delta7'],county['delta14'], county['county'], county['state'])
   
   # Add all graphs
   template_delta = template_delta.replace('{ALERTS_GRAPHS}', all_alert_graphs)


   # Save Template as alerts page
   alert_page = open('../corona-calc/states/alerts.html','w+')
   alert_page.write(template)
   alert_page.close()

   alert_page = open('../corona-calc/states/alerts-sc.html','w+')
   alert_page.write(template_delta)
   alert_page.close()

def create_hotspotgraph_DOM_el(last_cases,img,title,delta7,delta14,county,state):
   return '<div class="graph_g"><h3 class="nmb">'+title+'</h3><h4>&Delta;7-Day:'+ str(delta7) +' &Delta;14-Day:'+ str(delta14) +'<br><small>Last cases number '+ str(display_us_format(last_cases,0)) +'</small></h4><img  src="./'+ state + '/counties'+os.sep+county+'.png" width="345" alt="'+county+'"/></div>' 

def create_alertgraph_DOM_el(last_cases,img,title,delta7,delta14,county,state):
   return create_hotspotgraph_DOM_el(last_cases,img,title,delta7,delta14,county,state)

def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update data source")   
   print("2) Clean all counties data")  
   print("3) Create Hotspots & Alerts Page")   
    
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
      hotspots,alerts = get_hotspots_and_alerts()
      create_hotspot_page(hotspots)
      create_alert_page(alerts)
      print("\n>>>TASK DONE \n\n") 


if __name__ == "__main__":
   os.system("clear")
   main_menu()