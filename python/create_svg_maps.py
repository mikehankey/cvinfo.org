import json, sys, math
import glob
import numpy as np
from utils import *


# Create legend based on all_data
# so the legend is adapative to the data of the end (and not the beginning)
def create_legend(all_data,_type):
   max_d = max(all_data)
   min_d = np.nonzero(np.array(all_data))[0][0]
 
   #print('IN CREATED LEGEND ')
   #print("MAX_D " , str(max_d))

   #print("MIN_D " , str( min_d))

   # We'll have len(MAP_COLORS) partitions
   steps  =  int(math.ceil((max_d/len(MAP_COLORS)) / 10.0)) * 10
   
   if(steps<=len(MAP_COLORS)):
      steps = 1

   #print("STEP ", str(steps))
   
   # HTML for legend
   html_legend = '<div class="legend" style="display:none" id="leg_'+_type+'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 552 74.3">'

   # Create the related intervals
   all_intervals = []
   start = 0 
   for i in range(len(MAP_COLORS)):
      all_intervals.append((start,start+steps)) 

      html_legend +="<rect class='cl_" + str(i) + "' x='" + str(i*50) + "' width='50' height='25'><title>" + str(start) + " - " + str(start+steps) + "</title></rect>" 
      html_legend +="<text class='l' x='" + str(i*50+2) + "' y='40' width='50'>" + str(start) + " - " + str(start+steps) + "</text>" 
      #print("START ", str(start))
      start += steps 
      #print("END ", str(start))

   html_legend += "</svg></div>"

   return {"html_legend": html_legend, "intervals": all_intervals, "max": start-steps}

  

def get_color_based_on_rank_and_value(value,rank,_max):
 
   # We need to get the right color based on the right legend['intervals']
   counter_color = 0 
   
   for low,high in rank: 
      if(value>=low and value<high):
         return  counter_color
      counter_color+=1
    
   if(value>_max):
      return len(MAP_COLORS)-1
   else:
      return 0


# Split a list (used for css rules - see function below)
def chunks(lst, n): 
   toReturn = []
   for i in range(0, len(lst), n):
       toReturn.append(lst[i:i + n])
   return toReturn

# Get the css colors on each day for the given type
def make_svg_state_map_css(state_code, _type):
 
   # Open State Json Data file
   tmp_json    = open(PATH_TO_STATES_FOLDER + os.sep + state_code + os.sep + state_code + '.json',  'r')
   data        = json.load(tmp_json)
   tmp_json.close()
   pop = data['sum']['pop']  # for case per 100,000

   # We need all the counties json files of the state
   all_counties = glob.glob(PATH_TO_STATES_FOLDER + os.sep + state_code + os.sep + "counties" + os.sep + "*.json")
  
   # We combine all the counties data per day
   all_counties_per_day = {}

   # For the max
   _all  = []
     
   for county_file in all_counties:

      # We read the file
      county_file_content =  open(county_file, mode='r')
      json_content = json.load(county_file_content)
      county_file_content.close()

      cur_fips = json_content['sum']['fips']
      cur_pop  = json_content['sum']['pop']

      for d in json_content['stats']:
         for day in d:
            
            if day not in all_counties_per_day:
               all_counties_per_day[day] = []
             
            if cur_fips not in all_counties_per_day[day]:
               all_counties_per_day[day].append(
                  {cur_fips:{
                     _type     : d[day][_type]
                  }})

            _all.append(float( d[day][_type])) 
   
   # Get legends & ranks for the coloring
   legend   = create_legend(_all,_type) 

  
   
   all_dates = []
   all_css_colors = []
   for color in MAP_COLORS:
      all_css_colors.append([])
   
   # Now we need to know for each day the color of each FIPS
   for d in all_counties_per_day:
      current_date = d  
      #print("CURRENT DATE ", d)
      all_dates.append(d)
    
      for fips in all_counties_per_day[d]:
         for f in fips:
            current_fips = f
            #print("CURRENT FIPS ", current_fips)
            color = get_color_based_on_rank_and_value(fips[f][_type],legend['intervals'],legend['max'])
            #css+=   ".map_" + d.replace('-','') + " #FIPS_" +  current_fips + " { fill:" + MAP_COLORS[color] + "; }\n"
            all_css_colors[color].append(".map_" + d.replace('-','') + " #FIPS_" +  current_fips)

   css = ''
  
   # Create the code of the css for all the dates
   for index,color in enumerate(all_css_colors):

      if(index>0):
         if(len(color)>0):
            css +=  ', '.join(color)
            css += " { fill: " + MAP_COLORS[index] + " } "
      else:
         # The maj of the rules are for index 0
         # to avoir any css limtation
         # I split the rule into 8
         if(len(color)>0):

            chunks_of_list = chunks(color,int(len(color)/8))

            for chunk in chunks_of_list:
               css +=  ', '.join(chunk)
               css += " { fill: " + MAP_COLORS[index] + " } "
 

 
  


   # We save the css file where it belongs
   maps_dir = PATH_TO_STATES_FOLDER + os.sep + state_code + os.sep + 'maps' 
   if not os.path.exists(maps_dir):
      os.makedirs(maps_dir)

   maps_file_cases = open(maps_dir  + os.sep + _type + ".css",'w+')
   maps_file_cases.write(css.replace("\n", " "))    
   maps_file_cases.close()
   
   print(maps_dir  + os.sep + _type + ".css created")

   max_date = max(all_dates)
   min_date = min(all_dates) 

   #print("MAX DATE :" + max_date)
   #print("MIN DATE :" + min_date)

   # We return the css here for the default type 
   # so we can include the css directly while creating the initial page
   return legend['html_legend'],   css, str(min_date), str(max_date)

 
if __name__ == "__main__":
   make_svg_state_map_css("GA","deaths") 