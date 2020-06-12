import os
import glob
import json
import sys

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
  
      if(len(zip_data['stats'])>0):
         for day in  list(zip_data['stats']):  
            for date in  list(day): 
               
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

         if max_val <= 5:
            groups['low_cases'].append(zip_file) 
         elif last_val_perc >= .8 and avg > 5:
            groups['ugly'].append(zip_file) 
         elif .4 < last_val_perc < .8 and avg > 5:
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

   for county in all_counties_dir:
      
      # Get All the zips .json file from the current county directory
      zips_files_for_cur_county = glob.glob(county + '*.json')
       # We rank all the zips (to know the color of the graph)
      county_groups = rank_zips(zips_files_for_cur_county)
 
      # Open related template 
      f_template =  open(MD_ZIPS_TEMPLATE,  'r')
      template = f_template.read() 
      f_template.close()

      template = template.replace('{COUNTY_FULL}',os.path.basename(county))

      for group in county_groups:
 
         for zip_file in county_groups[group]: 
            
            # We open the relate JSON file
            with open(zip_file, mode='r') as json_file:
               zip_content = json.load(json_file)
 
            folder = os.path.dirname(os.path.abspath(zip_file)) + os.sep
            name = os.path.basename(zip_file).replace('.json','')
          
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
 
         
            # Add the info to the template
            print(zip_content['info']['zip_name'])
            print(zip_content['info']['zip'])

            # Last seven days record
            if(len(zip_content['stats'])>7):
               print(zip_content['stats'][:7])   # Last Seven

            # Previous seven days record
            if(len(zip_content['stats'])>14):
               print(zip_content['stats'][len(zip_content['stats'])-15:len(zip_content['stats'])-8])
      
        
          
            
     