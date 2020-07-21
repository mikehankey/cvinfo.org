import os
import glob
import json
import sys
import random

from operator import itemgetter
from utils import *
from generate_graphs import * 




# Rank counties for a given state
def rank_zips(all_zips):
     
   groups = {'good': [], 'bad': [], 'ugly': [], 'low_cases': [], 'no_data':[]} 
  
   for zip_file in all_zips:  

      # Open related json file under covid-19-intl-data
      tmp_json    = open(zip_file,  'r')
      zip_data = json.load(tmp_json)
      max_val = 0 
      last_val_perc = 0
      tmp_avg_cases = []
      tmp_cases = []

      # Get zip name from path
      zip_name = os.path.basename(zip_file).replace('.json','')

      # 1st day of MD data is fucked up and has to be muted 
      # funky date system is not removing the first day for MD properly, 
      # thus throwing off the max date so that the grouping fails
      if(zip_data['stats']):
         
         # set row counter to find first row
         dc = 0
         for day in  list(zip_data['stats']):  
            for date in  list(day): 

               # zero out 1st day in record set
               if dc == 0:
                  day[date]['cases'] = 0 
               # increment row counter
               dc += 1

               tmp_cases.append(float(day[date]['cases']))  
               
               if len(tmp_cases) < 7:
                  avg = int(np.mean(tmp_cases))
               else: 
                  avg = int(np.mean(tmp_cases[-7:]))

               tmp_avg_cases.append(avg)
   
               if avg > max_val:
                  max_val = avg
         
         if(max_val!=0):
            last_val_perc = avg / max_val 
         else:
            max_val = 0 

         max_val = np.max(tmp_avg_cases) 

         if max_val <= 1 or len(tmp_avg_cases)<1:
            groups['low_cases'].append(zip_file) 
         elif last_val_perc >= .8 and avg > 1:
            groups['ugly'].append(zip_file) 
         elif .4 < last_val_perc < .8 and avg > 1:
            groups['bad'].append(zip_file) 
         else:
            groups['good'].append(zip_file) 
      else:
         groups['no_data'].append(zip_file) 
    
   return groups


def create_MD_zip_graphs_and_pages():
   
   # Initial Directory 
   county_folder = PATH_TO_STATES_FOLDER + os.sep + "MD" + os.sep + "counties" + os.sep 

   # All counties directories
   all_counties_dir = glob.glob(county_folder + '*' + os.sep)

   # Random Number for non-cached images
   rand = str(random.randint(1,100000001))

   for county in all_counties_dir:

      print("COUNTY " + county)
 
      # Get All the zips .json file from the current county directory
      zips_files_for_cur_county = glob.glob(county + '*.json')

       # We rank all the zips (to know the color of the graph)
      county_groups = rank_zips(zips_files_for_cur_county)
 
      # Open related template 
      f_template =  open(MD_ZIPS_TEMPLATE,  'r')
      template = f_template.read() 
      f_template.close()

      # Get county name from full path (it's the last folder) 
      county_name = os.path.basename(os.path.normpath(county))

      county_full = county_name.title().replace("'S","'s")
      template = template.replace('{COUNTY_FULL}',county_full)
      template = template.replace('{COUNTY_FULL}',county_full)
 
      all_rows= []
      allDomEl = []

      allDomPerGroup = {'good':[],'bad':[],'ugly':[],'low_cases':[]}
 
      for group in county_groups:
 
         for zip_file in county_groups[group]: 
            
            # We open the relate JSON file
            with open(zip_file, mode='r') as json_file:
               zip_content = json.load(json_file)
 
            folder = os.path.dirname(os.path.abspath(zip_file)) + os.sep
            name   = os.path.basename(zip_file).replace('.json','')
          
            # We generate the graph
            if(group=='good'): 
               generate_MD_zip_graph_with_avg(zip_content,name,folder,'g')
            elif(group=='bad'):
               generate_MD_zip_graph_with_avg(zip_content,name,folder,'o')
            elif(group=='ugly'):
               generate_MD_zip_graph_with_avg(zip_content,name,folder,'r')
            elif(group=='low_cases'):
               generate_MD_zip_graph_with_avg(zip_content,name,folder,'b')
            # WARNING: WE DON'T DO ANYTHING FOR THE ZIPS FOR WHICH WE DON'T HAVE DATA

            # Compute total case
            if(group!='no_data'):

               # Compute the total cases
               total_cases = 0 
               for day in zip_content['stats']:
                  for d in day: 
                     total_cases += int(day[d]['cases'])
 
               allDomPerGroup[group].append({
                  'html'         : create_zip_DOM_el(zip_content['info']['zip'],zip_content['info']['zip_name'].replace(', Md',', MD'),county_name,total_cases,rand),
                  'total_cases'  : total_cases
               })
  
         # We sort allDomEl by total cases
         if(group!='no_data'):
            allDomEl = sorted(allDomPerGroup[group], key=itemgetter('total_cases'), reverse=True) 
 
         # Add to the template 
         if(len(allDomEl)==0):
            # We hide the box
            template = template.replace('{'+group.upper()+'_SHOW}','hidden')
         else:
            allHtml = ''
            for html in allDomEl:
               allHtml += html['html']
               
            template = template.replace('{'+group.upper()+'_SHOW}','')
            template = template.replace('{'+group.upper()+'}',allHtml)


      # Get the list of counties for which we have zip data
      all_MD_counties = glob.glob(PATH_TO_STATES_FOLDER + os.sep + 'MD' + os.sep + "counties"  + os.sep  + "*" + os.sep)

      # Create the select 
      md_counties_select = "<select id='md_county_selector' disabled><option value='ALL'>All counties</option>"

      for c in sorted(all_MD_counties):
         # Get Name of the county from path
         count_name = os.path.basename(os.path.dirname(c))
         md_counties_select+= "<option val='"+count_name+"'>"+count_name+"</option>"
      
      md_counties_select += "</select>"
      template = template.replace('{MD_COUNTY_SELECT}', md_counties_select)
      template = template.replace('{MD_BUTTONS}',' <div id="MD_button"><a href="./MD/alerts.html" class="btn ">Zip Area Alerts</a><a href="./MD/most_active.html" class="btn">Most Active Zip Areas</a></div>')
 

      # Save Template  
      county_page = open(county + os.sep + "index.html",'w+')
      county_page.write(template)
      county_page.close()  
      print(county_name  + " > done") 
            
# Create Graph HTML Element with image (the graph, dumbass)
def create_zip_DOM_el(_zip,city_name,county_name,total_case,rand): 
   return '<div class="graph_g"><h3 class="nmb">Zip: '+str(_zip)+'<br>'+  city_name +'</h3><p>Total Cases:'+display_us_format(total_case,0)+'</p><img  src="./MD/counties/' + county_name + os.sep + str(_zip)+'.png?v='+rand+'"  alt="'+str(_zip)+'"/></div>' 


if __name__ == "__main__":
   create_MD_zip_graphs_and_pages()
