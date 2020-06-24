import json
import sys
import glob
import os
import numpy as np
import random
from utils import *
from generate_graphs import *


def generate_gbu_graphs_and_state_page(state,groups): 
   
   # Open Template
   f_template =  open(GBU_STATE_TEMPLATE,  'r')
   template = f_template.read() 
   f_template.close()

   # Random Number for non-cached images
   rand = str(random.randint(1,100000001))
   
   for group in groups:

      if(group == 'ugly'):
         color = "r"
      elif(group == 'bad'):
         color = "o"
      elif(group == 'low_cases'):
         color = "b"
      else:
         color = "g"
      
      domEl = "" 
  
      for county in sorted(groups[group]):
 
         # Get county name
         county_name = os.path.basename(county).replace('.json','')

         # Generate the Image
         # print("Create Graph for " + county_name)
         generate_graph_with_avg(state, 'cases', color, PATH_TO_STATES_FOLDER + os.sep + state + os.sep + 'counties', county)
  
         # Get the DOM Element
         domEl += create_county_DOM_el(state,county_name,rand)

      # Add to the template 
      if(domEl==""):
         # We hide the box
         template = template.replace('{'+group.upper()+'_SHOW}','hidden')
      else:
         template = template.replace('{'+group.upper()+'_SHOW}','')
         template = template.replace('{'+group.upper()+'}',domEl)

    
   # Add meta
   template = template.replace('{STATE_FULL}',US_STATES[state])
   template = template.replace('{STATE}',state) 

   # Flag
   template = template.replace('{STATE_l}',state.lower())  

   # We open the related state .json for additional info
   state_json_file = open('../corona-calc/states/'+state+'/'+state+'.json','r')
   state_data = json.load(state_json_file)
   state_json_file.close()

   # Update template with basics
   template = template.replace('{LAST_UPDATE}',       str(state_data['sum']['last_update']))
   template = template.replace('{POPULATION}',        display_us_format(state_data['sum']['pop'],0))
   template = template.replace('{TOTAL_DEATHS}',      display_us_format(state_data['sum']['cur_total_deaths'], 0)) 
   template = template.replace('{TOTAL_CASES}',       display_us_format(state_data['sum']['cur_total_cases'], 0)) 
   template = template.replace('{TOTAL_TESTS}',       display_us_format(state_data['sum']['cur_total_tests'], 0))
   if(float(state_data['sum']['cur_total_tests']) !=0):
      template = template.replace('{TOTAL_POS_TESTS}',   display_us_format(float(float(state_data['sum']['cur_total_cases'])  / float(state_data['sum']['cur_total_tests'])*100), 2)    + '% ')
   else:
      template = template.replace('{TOTAL_POS_TESTS}',  'n/a')

   # Get Latest Day data
   last_data = state_data['stats'][len(state_data['stats'])-1] 
   for d in last_data: 
      template = template.replace('{LAST_DAY_DEATHS}', display_us_format(state_data['stats'][len(state_data['stats'])-1][d]['deaths'], 0)) 
      template = template.replace('{LAST_DAY_CASES}' , display_us_format(state_data['stats'][len(state_data['stats'])-1][d]['cases'], 0)) 
      template = template.replace('{LAST_POS_TESTS}' , display_us_format(state_data['stats'][len(state_data['stats'])-1][d]['test_pos_p'], 2)  + '% ') 
  
   # PPM Values
   template = template.replace('{PPM_DEATHS}', display_us_format(state_data['sum']['cur_total_deaths']/state_data['sum']['pop']*1000000, 2)) 
   template = template.replace('{PPM_CASES}',  display_us_format(state_data['sum']['cur_total_cases']/state_data['sum']['pop']*1000000, 2)) 
  
   # Add Graphs to page (warning the graphs are created while creating the state page as we need the color associated to the state :( )
   all_sum_graphs = create_graph_DOM_el('.' + os.sep + state + os.sep + state + '.png',state,'New Cases per Day',rand, True)
   all_sum_graphs+= create_graph_DOM_el('.' + os.sep + state + os.sep + 'test.png',state,'New Tests per Day',rand, True)
   all_sum_graphs+= create_graph_DOM_el('.' + os.sep + state + os.sep + 'test_pos_p.png',state,"% of positive Tests",rand, True)
   template = template.replace('{ALL_SUM_TOP_GRAPHS}', all_sum_graphs)

   all_sum_graphs = create_graph_DOM_el('.' + os.sep + state + os.sep + 'act_hosp.png',state,'Active Hospitalizations',rand, True)
   all_sum_graphs += create_graph_DOM_el('.' + os.sep + state + os.sep + 'deaths.png',state,'New Deaths per Day',rand, True)
   template = template.replace('{ALL_SUM_SEC_GRAPHS}', all_sum_graphs)
   

   # Large Graph
   all_large_graphs =   create_large_graph_DOM_el('.' + os.sep + state + os.sep + state + '_lg.png',state,'New Cases per Day',rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'test_lg.png',state,'New Tests per Day',rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'test_pos_p_lg.png',state,"% of positive Tests",rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'deaths_lg.png',state,"New Deaths per Day",rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'act_hosp_lg.png',state,"Active Hospitalizations",rand)
   template = template.replace('{LARGE_TOP_GRAPHS}', all_large_graphs)

   # Specific for MD: county selector
   if(state=="MD"):
      # Get the list of counties for which we have zip data
      all_MD_counties = glob.glob(PATH_TO_STATES_FOLDER + os.sep + 'MD' + os.sep + "counties"  + os.sep  + "*" + os.sep)

      # Create the select 
      md_counties_select = "<select id='md_county_selector' disabled><option value='ALL'>All counties</option>"
 
      for county in sorted(all_MD_counties):
         # Get Name of the county from path
         count_name = os.path.basename(os.path.dirname(county))
         md_counties_select+= "<option val='"+count_name+"'>"+count_name+"</option>"
      
      md_counties_select += "</select>"
      template = template.replace('{MD_COUNTY_SELECT}', md_counties_select)

      template = template.replace('{INSTRUCTION}',"<p>Click county graph to see zip codes graphs for that county</p>")
      template = template.replace('{MD_BUTTONS}',' <div id="MD_button"><a href="./MD/alerts.html" class="btn ">Zip Area Alerts</a><a href="./MD/most_active.html" class="btn">Most Active Zip Areas</a></div>')
 
   else:
      template = template.replace('{MD_COUNTY_SELECT}', '')
      template = template.replace('{INSTRUCTION}',"")
      template = template.replace('{MD_BUTTONS}',"")
 
   # Save Template as main state page
   main_gbu_page = open('../corona-calc/states/'+state+'/index.html','w+')
   main_gbu_page.write(template)
   main_gbu_page.close()

   print("State gbu page (../corona-calc/states/"+state+"/index.html) created")



# Rank counties for a given state
def rank_counties(st):
   
   print("Ranking  "  + US_STATES[st] + "'s counties")

   groups = {'good': [], 'bad': [], 'ugly': [], 'low_cases': []} 
    
   # Glob the related directory 
   all_countries_json_file = glob.glob(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + "counties"  + os.sep  + "*.json")
 
   for county in all_countries_json_file:  

      # Open related json file under covid-19-intl-data
      tmp_json    = open(county,  'r')
      county_data = json.load(tmp_json)
      max_val = 0 
      last_val_perc = 0
      tmp_avg_cases = []
      tmp_cases = []

      # Get county name from path
      county_name = os.path.basename(county).replace('.json','')
 
      for day in reversed(list(county_data)):  
         for date in reversed(list(day)): 
               
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
         groups['low_cases'].append(county_name) 
      elif last_val_perc >= .8 and avg > 5:
         groups['ugly'].append(county_name) 
      elif .4 < last_val_perc < .8 and avg > 5:
         groups['bad'].append(county_name) 
      else:
         groups['good'].append(county_name) 
 
   return groups


# Create County HTML Element with image
def create_county_DOM_el(st,ct,rand) :
   if(st == 'MD'):
      link =  '<div class="graph_g"><h3 class="nmb">'+ct+', ' + st +'</h3><a href="./'+ st + '/counties'+os.sep + ct + '/"><img  src="./'+ st + '/counties'+os.sep+ct+'.png?v='+rand+'" width="345" alt="'+ct+'"/></a></div>' 
      return link
   else:
      return '<div class="graph_g"><h3 class="nmb">'+ct+', ' + st +'</h3><img  src="./'+ st + '/counties'+os.sep+ct+'.png?v='+rand+'" width="345" alt="'+ct+'"/></div>' 

# Create Graph HTML Element with image (the graph, dumbass)
def create_graph_DOM_el(_file,st,title,rand,hide_mobile=False) :
   cl = "graph_g"
   if(hide_mobile is True):
      cl += " hidemob"
   return '<div class="'+cl+'"><h3 class="nmb">'+  title +'</h3><img  src="'+ _file +'?v='+rand+'" width="345" alt="'+title+'"/></div>' 

# Create Large Graph HTML Element with image
def create_large_graph_DOM_el(_file,st,title,rand) :
   return '<div class="graph_lg"><h3 class="nmb">'+  title +'</h3><img  src="'+ _file +'?v='+rand+'"  alt="'+title+'"/></div>' 



if __name__ == "__main__":
   generate_gbu_graphs_and_state_page("MD",rank_counties("MD"))
