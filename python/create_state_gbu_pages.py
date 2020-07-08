import json
import sys
import glob
import os
import numpy as np
import random
from utils import *
from generate_graphs import *

# For Map Animation
ALL_OPTIONS = ['Cases','Deaths','Cases per Million','Deaths per Million','New Deaths','New Cases','Mortality','Case Growth']
ALL_OPTIONS_CODE = ['cases','deaths','cpm','dpm','new_deaths','new_cases','mortality','cg_med']
DEFAULT_OPTION = 2 # Index in the arrays above 
# WARNING ONLY THE "DEFAULT_OPTION" is INCLUDED IN THE HTML PAGE
# THE OTHER SVG ANIMS WILL BE LOADED ON DEMAND VIA  AJAX CALL 

# ANIM SVG  
ORG_PATH = ".." + os.sep 
ANIM_PATH =  ORG_PATH + "anim" + os.sep 

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
   template = template.replace('{RAND_CSS}',str(rand)) 

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

   all_sum_graphs  = create_graph_DOM_el('.' + os.sep + state + os.sep + 'act_hosp.png',state,'Active Hospitalizations',rand, True)
   all_sum_graphs += create_graph_DOM_el('.' + os.sep + state + os.sep + 'deaths.png',state,'New Deaths per Day',rand, True)
   all_sum_graphs += create_graph_DOM_el('.' + os.sep + state + os.sep + 'mortality.png',state,'Case Fatality Rate',rand, True)
   template = template.replace('{ALL_SUM_SEC_GRAPHS}', all_sum_graphs)
    
   # Large Graph
   all_large_graphs =   create_large_graph_DOM_el('.' + os.sep + state + os.sep + state + '_lg.png',state,'New Cases per Day',rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'test_lg.png',state,'New Tests per Day',rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'test_pos_p_lg.png',state,"% of positive Tests",rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'act_hosp_lg.png',state,"Active Hospitalizations",rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'deaths_lg.png',state,"New Deaths per Day",rand)
   all_large_graphs +=  create_large_graph_DOM_el('.' + os.sep + state + os.sep + 'mortality_lg.png',state,"Case Fatality Rate",rand)
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

    
   # Map Animation
   # Add select for Anim
   #template = template.replace("{ANIM_VIEW_SELECT}", create_svg_anim_select())
   
   # Default type in title
   #template = template.replace("{CUR_TYPE}",ALL_OPTIONS[DEFAULT_OPTION]) 
  
   # Add All images for SVG aims 
   #svg_anim_for_template, max_date = add_svg_images("",ALL_OPTIONS_CODE[DEFAULT_OPTION], ALL_OPTIONS[DEFAULT_OPTION],state, US_STATES[state])
   #template = template.replace("{ALL_SVG_ANIM}", svg_anim_for_template)
   
   #template = template.replace("{LAST_UPDATE_MAP}",st_date_readable_st_date(max_date))
   #template = template.replace("{DEFAULT_ANIM_VIEW}",ALL_OPTIONS_CODE[DEFAULT_OPTION])

   # Save Template as main state page
   main_gbu_page = open('../corona-calc/states/'+state+'/index.html','w+')
   main_gbu_page.write(template)
   main_gbu_page.close()

   print("State gbu page (../corona-calc/states/"+state+"/index.html) created")



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

   buttons_holder= "<div class='cont_svg'><a class='btn-anim btn-fastbackward'><span></span></a><a class='btn-anim btn-backward'><span></span></a><a class='btn-anim btn-play m'><span></span></a><a class='btn-anim btn-forward'><span></span></a><a class='btn-anim btn-fastforward'><span></span></a></div>";

   # Insert the legend
   legend_file_name = ORG_PATH + '/anim/legends/'+_type+'.svg'
   legend_code = ''
   try: 
      with open(legend_file_name, 'r') as f:  
            legend_code = f.read()  
   except:
      print("LEGEND " + legend_file_name + " not found. Generate the legends first.")

   if(_type==ALL_OPTIONS_CODE[DEFAULT_OPTION]):
      all_svg_code = "<div class='image_player' data-rel='"+_type+"'>" +  buttons_holder  + all_svg_code + '<div class="legend">' + legend_code  + '</div></div>'
   else:
      all_svg_code = "<div class='image_player' data-rel='"+_type+"' style='display:none'>"+ buttons_holder + all_svg_code + '<div class="legend">' +legend_code + '</div></div>'

   return code  + all_svg_code, max_date


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
      
      county_stat = reversed(list(county_data['stats']))

      # Get county name from path
      county_name = os.path.basename(county).replace('.json','')

      for day in county_stat:  
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
   if(title == 'Case Fatality Rate'):
      p = '<p style="margin: 1rem 2rem;text-align: left;">The case fatality rate shown above represents total deaths divided by total cases to date. Technically, cases that have not completed should not be included since their outcomes are currently unknown. We have no effective way to do this with current data, so we show CFR through the current day. The true CFR will be slightly higher. States with recent increases in new cases, will naturally drive down the current CFR rate, until these cases come to term.'
   else: 
      p = ''
   return '<div class="'+cl+'"><h3 class="nmb">'+  title +'</h3><img  src="'+ _file +'?v='+rand+'" width="345" alt="'+title+'"/>'+p+'</div>' 

# Create Large Graph HTML Element with image
def create_large_graph_DOM_el(_file,st,title,rand) :
   if(title == 'Case Fatality Rate'):
      p = '<p style="margin: 1rem 2rem;text-align: left;">The case fatality rate shown above represents total deaths divided by total cases to date. Technically, cases that have not completed should not be included since their outcomes are currently unknown. We have no effective way to do this with current data, so we show CFR through the current day. The true CFR will be slightly higher. States with recent increases in new cases, will naturally drive down the current CFR rate, until these cases come to term.'
   else: 
      p = ''
   return '<div class="graph_lg"><h3 class="nmb">'+  title +'</h3><img  src="'+ _file +'?v='+rand+'"  alt="'+title+'"/>'+p+'</div>' 


# CREATE SELECT FOR SVG ANIM OPTIONS
def create_svg_anim_select():
   select = "<select id='anim_selector'>"
   for i,code in enumerate(ALL_OPTIONS_CODE):
      if(code == ALL_OPTIONS_CODE[DEFAULT_OPTION]):
         select += "<option value='"+code+"'  selected>"+ALL_OPTIONS[i]+"</option>"
      else:
         select += "<option value='"+code+"' >"+ALL_OPTIONS[i]+"</option>"         
   return select + "</select>"


if __name__ == "__main__":
   generate_gbu_graphs_and_state_page("MD",rank_counties("MD"))
