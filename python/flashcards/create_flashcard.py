import sys, os, glob 
import numpy as np 
import cv2 

from flash_utils import *
from PIL import ImageFont, ImageDraw, Image

sys.path.append(os.path.join(os.path.dirname(sys.path[0]),''))
from utils import *
 
# Get the top X counties ranked by 7day-avg
def get_top_counties(st,_type,x_day_avg):
 
   all_counties_to_return = []

   # We read all the counties JSON
   # Get all the county json files 
   all_countries_json_file =  glob.glob(PATH_TO_STATES_FOLDER + os.sep + st + os.sep + "counties"  + os.sep  + "*.json")
   
   for county_json_file in all_countries_json_file:

         # Get county name from path
         county_name = os.path.basename(county_json_file).replace('.json','')
 
         # We read the file
         tmp_json    = open(county_json_file,  'r')
         county_data = json.load(tmp_json)

         # Get the AVG _type
         avg_x,avg_y,delta  = get_X_day_avg(x_day_avg,reversed(county_data['stats']),_type)
         
         # We only need the delta
         all_counties_to_return.append({'name':county_name,'delta':round(float(delta), 2),'avg':avg_y[len(avg_y)-1]})

   return all_counties_to_return

 
def create_flashcard(state,X_Day_avg,_type):

   if(_type=="cases"):

      # We get the State Level Data
      json_file  = open(PATH_TO_STATES_FOLDER + os.sep + state + os.sep + state + ".json")
      state_data = json.load(json_file)
      json_file.close()

      # Retrieve the missing info from the state_data
      max_date_with_data  = state_data['sum']['last_update']
      prev_data_with_data = state_data['stats'][len(state_data['stats'])-2]

      for tmp in prev_data_with_data:
         prev_date = tmp
         prev_data_with_data = prev_data_with_data[prev_date]

      # Compute increase of % of positive tests
      last_data_with_data = state_data['stats'][len(state_data['stats'])-1]
      for tmp in last_data_with_data:
         prev_date = tmp
         last_data_with_data = last_data_with_data[prev_date]

      cur_pos_test   = last_data_with_data['test_pos_p']
      increase_tests = last_data_with_data['test_pos_p']-prev_data_with_data['test_pos_p']

      # CASES PER MILLIONS
      cur_cpm      =   last_data_with_data['ncpm']
      increase_cpm =  last_data_with_data['ncpm']-prev_data_with_data['ncpm']
 
      # Get the counties ranked with 7day-avg
      counties = get_top_counties(state,_type,X_Day_avg)

      # We sort the counties by last avg 7days#delta
      #sorted_counties = sorted(counties, key = lambda i: i['delta'], reverse = True)
      sorted_counties = sorted(counties, key = lambda i: i['avg'], reverse = True)


      # Template
      template = FLASH_TEMPLATES_FOLDER + state + "_flash_cases.png" 
      template_img = cv2.imread(template, cv2.COLOR_RGBA2RGB) 

      step = 0

      # MAX GRAPH
      if(state=="MD"):
         max_graph = 14
         how_many_per_line = [4,4,6]

      # If we have too many graphs to display
      if(len(sorted_counties)>= max_graph):
         sorted_counties = sorted_counties[:max_graph]
  
      # Fonts 
      font_titles          = ImageFont.truetype(FONT_BOLD, 20)
      font_small_titles    = ImageFont.truetype(FONT_REG,14)
      font_big_numbers     = ImageFont.truetype(FONT_BOLD, 30)
      font_small_numbers   = ImageFont.truetype(FONT_REG,18)
      font_info            = font_small_numbers
      text_height = 30
 
      hor_margin  = 35
      vert_margin = 45
      x_start     = 20 
      y_start     = 110

      cur_col  = 0
      cur_row  = 0

      x = x_start
      y = y_start
  
 
      # We get all the png of the counties
      # the ones at the root for "cases"
      for county in sorted_counties:
         
         graph = PATH_TO_STATES_FOLDER + os.sep + state + os.sep + "counties"  + os.sep +  county['name']  + ".png"
           
         # We resize the images
         img      = cv2.imread(graph, cv2.COLOR_RGBA2RGB)
         resized  = cv2.resize(img, GRAPH_FLASH_1, interpolation = cv2.INTER_CUBIC )

         # We add it to the image
         template_img[y:y+resized.shape[0], x:x+resized.shape[1]] = resized

         # Add corresponding text to the template
         img_pil  = Image.fromarray(template_img)
         draw     = ImageDraw.Draw(img_pil)
         draw.text((x, y-text_height), county['name'] +', '+ state, font = font_titles, fill = (40,40,40,1))

         # Compute the width of the delta text
         delta_text = str(X_Day_avg) + "-Days " + chr(948) + ": " + str(county['delta']) # 948  = delta
         size = draw.textsize(delta_text,font_info)
         draw.text(
            (x+GRAPH_FLASH_1[0]-size[0], y-text_height + 2),  # +2 for the diff between the title & info font size
              delta_text,     
              font = font_info , 
              fill = (40,40,40,1))
         template_img = np.array(img_pil)

         cur_col +=1

         if(cur_col >= how_many_per_line[cur_row]):
            cur_row +=1
            cur_col = 0
            x = x_start
            y = GRAPH_FLASH_1[1]*cur_row + vert_margin*cur_row + y_start
         else:
            x = (GRAPH_FLASH_1[0]+hor_margin) * cur_col  + hor_margin 


      # We add the text info on the right side

      # TOTAL CASES
      total_cases = state_data['sum']['cur_total_cases'] 
      increase    = total_cases - prev_data_with_data['total_c']
      template_img = add_big_number(img_pil,draw,template_img,1300,112,"TOTAL CASES", total_cases, font_big_numbers,font_small_titles,font_small_numbers, increase)

      # TOTAL DEATHS
      total_deaths = state_data['sum']['cur_total_deaths'] 
      increase    = total_deaths - prev_data_with_data['total_d']
      template_img = add_big_number(img_pil,draw,template_img,1300,170,"TOTAL DEATHS", total_deaths, font_big_numbers,font_small_titles,font_small_numbers, increase)
      
      # TOTAL HOSPI
      total_hospi = state_data['sum']['cur_hosp'] 
      increase    = total_hospi - prev_data_with_data['act_hosp']
      template_img = add_big_number(img_pil,draw,template_img,1300,228,"HOSPITALIZATIONS", total_hospi, font_big_numbers,font_small_titles,font_small_numbers, increase)

      # TOTAL TESTS
      total_tests = state_data['sum']['cur_total_tests'] 
      increase    = total_tests - prev_data_with_data['total_t']
      template_img = add_big_number(img_pil,draw,template_img,1611,112,"TOTAL TESTS", total_tests, font_big_numbers,font_small_titles,font_small_numbers, increase)

      # % of POSITIVE TESTS
      template_img = add_big_number(img_pil,draw,template_img,1611,170,"% POSITIVE TEST", cur_pos_test, font_big_numbers,font_small_titles,font_small_numbers, increase_tests)

      # CASES PER MILLION
      template_img = add_big_number(img_pil,draw,template_img,1611,228,"CASE PER MILLION", cur_cpm, font_big_numbers,font_small_titles,font_small_numbers, increase_cpm)

      print("Test.png created")
      cv2.imwrite('test.png',template_img)



# Fill a white box on the right side
def add_big_number(img_pil,draw,template_img,x,y,title,number,font_big_numbers,font_small_titles,font_small_numbers, increase,per = False):

   # Title 
   draw.text((x,y),title, font = font_small_titles, fill = (40,40,40,1))
   text = display_us_format(number,0)

   if('%' in title): 
      text = text + "%"
  
   size = draw.textsize(text,font_big_numbers)    

   # Number
   y2 = y+14
   draw.text((x,y2),  text, font = font_big_numbers, fill = (25,25,215,1))
    
   if(increase>0):
       increase = "(+"+ display_us_format(increase,0) + "*)"
   else: 
       increase = "("+ display_us_format(increase,0) + "*)"

   y2+= 10
   draw.text((x+size[0]+4,y2),  increase, font = font_small_numbers, fill = (40,40,40,1))
   template_img = np.array(img_pil)

   return template_img
 

# Get SVG Template + Css and create the corresponding png
def create_state_map(state,_type, last_date):
  
   # Get Template
   svg_code = open(SVG_TEMPLATES + state + ".svg")
      
    



#print(get_top_counties("MD","cases",7)) 
create_flashcard('MD',7,'cases')
#create_state_map("MD","cases","2020-07-27")