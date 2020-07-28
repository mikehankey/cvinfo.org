import json, sys, math
import glob
import numpy as np

from PIL import Image
from utils import *
from cairosvg import svg2png

# Create legend based on all_data
# so the legend is adapative to the data of the end (and not the beginning)
def create_legend(all_data,_type,number_of_county):
   
   max_d = max(all_data)
   min_d = np.nonzero(np.array(all_data))[0][0]
 
   # HTML for legend
   html_legend = '<div class="legend" style="display:none" id="leg_'+_type+'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+ str(len(MAP_COLORS)*50) +' 40">'
 
   if(_type != 'cases'):

      # WE REMOVE THE 10 HIGHEST VALUES (ZIPF LAW EFFECT)
      tmp_all_data = sorted(all_data,reverse=True)
      
      if(len(tmp_all_data)>number_of_county):
         tmp_all_data = tmp_all_data[number_of_county:]
         max_d = max(tmp_all_data)
   
      # We'll have len(MAP_COLORS) partitions
      steps  =  int(math.ceil(((max_d-min_d)/len(MAP_COLORS)) / 10.0)) * 10
      
      if(steps<=len(MAP_COLORS)):
         steps = int(max_d/len(MAP_COLORS))
      
      if(steps<=0):
         steps = 1

      # Create the related intervals
      all_intervals = []
      start = int(1) #min(all_data)

      for i in range(len(MAP_COLORS)):
         all_intervals.append((start,start+steps))  
         html_legend +="<rect class='cl_" + str(i) + "' x='" + str(i*50) + "' width='50' height='15'><title>" + str(start) + " - ...</title></rect>" 
         html_legend +="<text class='l' x='" + str(i*50+2) + "' y='25' width='50'>" + str(start) +  " - ...</text>" 
         start += steps  
   else:
       
      all_intervals = [(0,10),(10,20),(20,30),(40,50),(50,100)]

      # We'll have len(MAP_COLORS) partitions
      steps  =  int(math.ceil(((max_d-101)/len(MAP_COLORS)) / 10.0)) * 10
  

      if(steps<=len(MAP_COLORS)):
         steps = int(max_d/len(MAP_COLORS))
      
      if(steps<=0):
         steps = 1

      start = int(1) #min(all_data)

      counter = 0
      for interval in all_intervals: 
         st = interval[0]
         html_legend +="<rect class='cl_" + str(counter) + "' x='" + str(counter*50) + "' width='50' height='15'><title>" + str(st) + " - ...</title></rect>" 
         html_legend +="<text class='l' x='" + str(counter*50+2) + "' y='25' width='50'>" + str(st) +  " - ...</text>" 
         counter += 1


      start = int(100)
      for i in range(len(MAP_COLORS)-5):
         all_intervals.append((start,start+steps))  
         html_legend +="<rect class='cl_" + str(counter) + "' x='" + str(counter*50) + "' width='50' height='15'><title>" + str(start) + " - ...</title></rect>" 
         html_legend +="<text class='l' x='" + str(counter*50+2) + "' y='25' width='50'>" + str(start) +  " - ...</text>" 
         start += steps  
         counter += 1
 

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

   # For the max (only float values)
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
   legend   = create_legend(_all,_type,len(county_file)) 
 
   all_dates = []
   all_css_colors = []
   for color in MAP_COLORS:
      all_css_colors.append([])
    
   # Now we need to know for each day the color of each FIPS
   for d in all_counties_per_day:
      current_date = d   
      all_dates.append(d)
    
      for fips in all_counties_per_day[d]:
         for f in fips:
            current_fips = f 
            color = get_color_based_on_rank_and_value(fips[f][_type],legend['intervals'],legend['max'])
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

            t = int(len(color)/8)
            
            if(t==0):
               t = 1
            
            chunks_of_list = chunks(color,t)

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
   return legend['html_legend'], css, str(min_date), str(max_date)



# Create a map as a svg file (with legend and NO CSS)
# This function is used to create the flashcards
def make_static_svg_state_map(state_code,_type,date):
   
   # Open State Json Data file
   tmp_json    = open(PATH_TO_STATES_FOLDER + os.sep + state_code + os.sep + state_code + '.json',  'r')
   data        = json.load(tmp_json)
   tmp_json.close()
   pop = data['sum']['pop']  # for case per 100,000

   # We need all the counties json files of the state
   all_counties = glob.glob(PATH_TO_STATES_FOLDER + os.sep + state_code + os.sep + "counties" + os.sep + "*.json")
  
   # We combine all the counties data per day
   all_counties_per_day = {}

   # For the max (only float values)
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
            
            if(day == date):
               if day not in all_counties_per_day:
                  all_counties_per_day[day] = []
               
               if cur_fips not in all_counties_per_day[day]:
                  all_counties_per_day[day].append(
                     {cur_fips:{
                        _type     : d[day][_type]
                     }})

               _all.append(float( d[day][_type])) 
   
   # Get legends & ranks for the coloring 
   legend   = create_legend(_all,_type,len(county_file)) 

   all_dates = []
   all_css_colors = []
   for color in MAP_COLORS:
      all_css_colors.append([])
    
   # Now we need to know for each day the color of each FIPS
   for d in all_counties_per_day:
      current_date = d   
      all_dates.append(d)
    
      for fips in all_counties_per_day[d]:
         for f in fips:
            current_fips = f 
            color = get_color_based_on_rank_and_value(fips[f][_type],legend['intervals'],legend['max'])
            all_css_colors[color].append(" #FIPS_" +  current_fips)
   
   # Open the SVG template
   with open(SVG_TEMPLATES + state_code + '.svg',mode='r') as svg_map:
      svg_map_as_text = svg_map.read() 


   # Colors come from the css:  
   # .cl_0 { fill:#fee7dc;}
   # .cl_1 { fill:#fdd4c2;} ...
   the_colors = ['#fee7dc','#fdd4c2','#fcbaa0','#fc9f81','#fb8464','#fa6949','#f24a35','#e32f27','#ca171c','#b11117','#8f0912']
   color_counter = 0
   for colors in all_css_colors:
         for c in colors: 
            svg_map_as_text = svg_map_as_text.replace('id="'+c[2:]+'"',"fill='" +  the_colors[color_counter] + "'")
         color_counter+=1

   legend = legend['html_legend'].replace('<div class="legend" style="display:none" id="leg_'+_type+'">',"")
   legend = legend.replace('</div>','')

   # Replace the css classes by fills in the legend
   # class='cl_0' => fill='#fee7dc'
   for i,c in enumerate(the_colors):
      legend = legend.replace("class='cl_"+str(i)+"'","fill='"+c+"'")

   # The font
   legend = legend.replace("class='l'","font-family='Lato' font-size='9px' fill='#656565'")
    
   # We put the 2 files under 
   # SVG_FLASHCARD_OUT
   if not os.path.exists(SVG_FLASHCARD_OUT1):
      os.makedirs(SVG_FLASHCARD_OUT1)  
    
   # BUT IN PNG!
   svg2png(bytestring=svg_map_as_text,write_to=SVG_FLASHCARD_OUT1 + os.sep + state_code + "_map.png")
   svg2png(bytestring=legend,write_to=SVG_FLASHCARD_OUT1 + os.sep + state_code + "_leg.png")

   # AND WE NEED A WHITE BACKGROUND
   png_to_white_bg(SVG_FLASHCARD_OUT1 + os.sep + state_code + "_map.png")
   png_to_white_bg(SVG_FLASHCARD_OUT1 + os.sep + state_code + "_leg.png")

   return {'map': SVG_FLASHCARD_OUT1 + os.sep + state_code + "_map.png", 'legend': SVG_FLASHCARD_OUT1 + os.sep + state_code + "_leg.png" }


# Replace the transparent color of a png by white
def png_to_white_bg(_input_path):
   _input  = Image.open(_input_path)
   _output = Image.new("RGB",_input.size,"WHITE")
   _output.paste(_input,(0,0),_input)
   _output.save(_input_path)
 
if __name__ == "__main__":
   
   print(make_static_svg_state_map("MD","cases","2020-07-26"))
   #make_svg_state_map_css("TX","total_c") 
   #make_svg_state_map_css("TX","total_d") 
   #make_svg_state_map_css("TX","deaths") 

   # make_svg_state_map_css("DE","total_c") 
   # make_svg_state_map_css("DE","total_d") 
   # make_svg_state_map_css("DE","deaths") 
   # make_svg_state_map_css("DE","cases") 