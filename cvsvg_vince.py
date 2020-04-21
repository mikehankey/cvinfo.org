#!/usr/bin/python3 

# cvinfo.org 
# Batch script for making colored state and county images based on covid-level2 data
# 
from covid import cfe, load_json_file, save_json_file, load_state_names, ALL_OPTIONS, ALL_OPTIONS_CODE, string_to_date

 
import time
import os
import numpy as np
import xml.dom.minidom
import sys
import seaborn as sns
from cairosvg import svg2png
from PIL import Image, ImageFont, ImageDraw
import glob
import cv2

from cvsvg import preview

 

 
#################################################################################################
# GLOBAL VARS
dir_path = os.path.dirname(os.path.realpath(__file__))
if('/var/www/projects/' in dir_path):
   from conf_vince import *   
else:
   from conf import *

def load_state_fips():
   #fips,county_name,state_abbr,state_name,long_name,sumlev,region,division,state,county,crosswalk,region_name,division_name^M
   #1001,Autauga County,AL,Alabama,Autauga County AL,50,3,6,1,1,3-6-1-1,South,East South Central^M
   fp = open("data/county_fips_master.csv", "r", encoding = "ISO-8859-1")
   state_fips = {}
   for line in fp:
      data = line[0:100].split(",")
      fips = data[0]
      state = data[2]
      if state not in state_fips:
         state_fips[state] = []
      state_fips[state].append(fips)
   return(state_fips)

def check_vals_files():
   cl2 = load_json_file("json/covid-19-level2-states.json")
   flat_stats = []
   for state_obj in cl2:
      state_code = state_obj['summary_info']['state_code']
      js = load_json_file("json/" + state_code + ".json")
      len_dates = len(js['js_vals']['dates'])
      dates = js['js_vals']['dates']
      fields = ['cases', 'deaths','cpm','dpm','cg_med', 'dg_med','mortality', 'new_cases', 'new_deaths']
      for ff in fields:
         wild = "anim/frames/" + state_code + "/" + state_code + "-" + ff + "*.svg" 
         gfiles = glob.glob(wild)
         print(state_code, len_dates, len(gfiles))
         for gfile in gfiles:
            el = gfile.split("-")
            fd = el[2]
            fd = fd.replace(".svg", "")
            if fd not in dates:
               print(fd, "NOT FOUND!")
               cmd = "rm " + gfile
               print(cmd)
               os.system(cmd)
        

def make_fb_prev_images():
   #outfile = outfile.replace("frames", "png")
   #svg2png(bytestring=svg_code,write_to=outfile, parent_width=ow*1.5,parent_height=oh*1.5)
   js = load_json_file("json/covid-19-level2-states.json")
   for data in js:
      state_code = data['summary_info']['state_code']
      #print("frames/" + state_code + "/" + state_code + "-" + "cpm*.svg")
      files = sorted(glob.glob("anim/frames/" + state_code + "/" + state_code + "-" + "cpm*.svg"))
      best_file = files[-1]
      #print("BEST", best_file)
      # use to delete last file if data is missing.
      print("rm " + best_file)

def make_movie_from_frames(state, field):
   if field != "ALL":
      wild = "anim/marked/" + state + "/" + state + "-" + field 
   else:
      wild = "anim/marked/" + state + "/" + state 

   print("WILD:", wild)
   files = sorted(glob.glob(wild))
   frames = []
   for file in files:
      print(file)
   #   frame = cv2.imread(file)
   #   frames.append(frame)
   outdir = "anim/mov/"
   if cfe(outdir,1) == 0:
      os.makedirs(outdir)
   outfile = outdir + state + "-" + field + ".mp4"

   cmd = """/usr/bin/ffmpeg -y -framerate 3 -pattern_type glob -i '""" + wild + """*.png' \
        -c:v libx264 -r 25 -pix_fmt yuv420p """ + outfile
   print(cmd)
   os.system(cmd)

def make_movie(wild, outfile):

   print("WILD:", wild)
   files = sorted(glob.glob(wild))
   frames = []
   for file in files:
      print(file)
   #   frame = cv2.imread(file)
   #   frames.append(frame)
   outdir = "anim/mov/"
   if cfe(outdir,1) == 0:
      os.makedirs(outdir)

   cmd = """/usr/bin/ffmpeg -y -framerate 3 -pattern_type glob -i '""" + wild + """*.png' \
        -c:v libx264 -r 25 -pix_fmt yuv420p """ + outfile
   print(cmd)
   os.system(cmd)



# Build the PNGs used for the videos
# FOR THE ENTIRE USA **********************
# PUT BACK THE BEGINNING OF preview() from csvsvg.py 
# IF YOU WANT THE SAME AT THE STATE LEVEL


def make_transition(last_img_file, dur=25):
   trans_files = []
   for i in range(0,dur):
      tfile = last_img_file.replace(".png", "-trans" + str(i) + ".png")
      cmd = "cp " + last_img_file + " " + tfile
      trans_files.append(tfile)
      print(cmd)
      os.system (cmd)
   return(trans_files)

def add_trans_text(trans_files, trans_text):
   print(trans_text)

def make_title_clip(title_text, dur=25):
   print(trans_text)

def all_movie(): 
   # FPS settings / considerations num seconds * FPS for video
   fps = 3
   title_dur = 1 * fps
   end_seq_dir = 1 * fps
   trans_text_dir = 1 * fps


   field_desc = {
      'new_cases' : "New Cases ",
      'new_deaths' : "New Deaths ",
      'cases' : "Total Cases",
      'deaths' : "Total Deaths",
      'cpm' : "Cases Per Million",
      'dpm' : "Deaths Per Million",
      'cg_med' : "Case Growth ",
      'dg_med' : "Death Growth ",
      'mortality' : "Mortality Percent",
      'recovered' : "Recovered",
      'hospital_now' : "Hospitalized",
      'icu_now' : "In ICU",
      'vent_now' : "On Ventilator"
   }

   for field in field_desc:
      mark_wild = "anim/marked/USA/USA-" + field + "-*.png" 
      files = glob.glob(mark_wild)
      # Add ending 'pause' frames at the end of each field clip sequence 
      print(field, mark_wild)
      last_file = files[-1]
      trans_files = make_transition(last_file, end_seq_dir)
      print("TRANS:", trans_files)

   # Make opening and closing title and credits clips.


def build_marked(state_code, field, data_only=0):
   
   mark_dir = "anim/marked/" + state_code 

   field_desc = {
      'new_cases' : "New Cases ",
      'new_deaths' : "New Deaths ",
      'cases' : "Total Cases",
      'deaths' : "Total Deaths",
      'cpm' : "Cases Per Million",
      'dpm' : "Deaths Per Million",
      'cg_med' : "Case Growth ",
      'dg_med' : "Death Growth ",
      'mortality' : "Mortality Percent",
      'recovered' : "Recovered",
      'hospital_now' : "Hospitalized",
      'icu_now' : "In ICU",
      'vent_now' : "On Ventilator"
   }

   dates = []
   vals = []
   state_names, state_codes = load_state_names()
   if state_code != 'USA':
      state_name = state_names[state_code]
   else:
      state_name = "USA"
   js = load_json_file("json/" + state_code + ".json")
   print("JS VALS:", js['js_vals'])
   dates = js['js_vals']['dates']
   vals = js['js_vals'][field]
   js_vals = js['js_vals']
   palette = sns.color_palette("Reds", n_colors=11)
   sns.palplot(palette)
   frame_wild = "anim/png/" + state_code + "/" + state_code + "*-" + field + "*.png"
   files = glob.glob(frame_wild)
 
   if len(files) == 0:
      print("NO FILES FOUND!:", frame_wild)
      exit()
   
   # Do we have the legend for this field? 
   path_to_legends = "anim/legends/" + field + "-for-video.png"

   if(cfe(path_to_legends)!=1):
      print("LEGEND FOR " + field + " doesnt exist. Run Make LEgend with covid.py")
      sys.exit(0)
 
   # We get the related legend
   limg = Image.open(path_to_legends, 'r')
   limg_w, limg_h = limg.size 
   
   cc = 0

   # Load the graphs
   graph_dir = "anim/graphs/USA/*" + field + "*.png"  
   graphs = sorted(glob.glob(graph_dir))

   org_title = "COVID-19 STATS"
   sources = "cvinfo.org"
   started = 0 
   # We marked all the frames

   #truncate js_vals for some fields.
   #if field == 'recovered' or field == 'hospital_now' or field == 'icu_now' or field == 'vent_now' or field == 'deaths' or field == 'dpm':
   if True:
      plen = len(files)
      jvals = js_vals[field][-plen:]
      jdates = js_vals['dates'][-plen:]
      js_vals[field] = jvals
      js_vals['dates'][:-plen] = jdates
      print("VALS:", jvals)
      print("DATES:", jdates)


   for file in sorted(files):
      print("DATA:", file, field, started, js_vals[field][cc])
      if started == 1 or js_vals[field][cc] > 0:  
         #load graph image for this frame
         gimg = cv2.imread(graphs[cc])
         gimg = cv2.resize(gimg, (int(365),int(365)))
         gcimg = cv2.cvtColor(gimg, cv2.COLOR_BGR2RGB)
         gimg_pil = Image.fromarray(gcimg)

         #cv2.imshow('pepe', gimg)
         #cv2.waitKey(30)
         # ADD THE LEGENGS
         org_frame = Image.open(file, 'r')  
         org_w, org_h = org_frame.size
         offset = (86,977)
         org_frame.paste(limg, offset)
  
         started = 1 

         if cc < len(dates):
            title = org_title +  " "  + state_name  + " - " + field_desc[field].upper()
         else: 
            title = "missing data for " + str(cc)
         
         # UPDATE THE MAIN TEXT
         draw = ImageDraw.Draw(org_frame)
         font = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 38)
         draw.text((20, 20),title,(255,255,255),font=font)

         # Add footer
         font_small = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 18)
         draw.text((1500,1000), sources , font=font_small, fill=(255,255,255))

         # UPDATE SOURCES
         

         # ADD RECTANGLE WITH DATE
         rect = Image.new('RGB', (385, 55), (33,33,33,1))
         draw = ImageDraw.Draw(rect)
         font = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 34)
         text = string_to_date(dates[cc])
         text_w, text_h = draw.textsize(text,font)  
         draw.text(((385 - text_w) / 2,  7), text, font=font) 
         offset = (1485,25)
         org_frame.paste(rect, offset)
 
         # TOP RECTANGLE
         # ADD RECTANGLE TOTAL OF DEATHS
         rect = Image.new('RGB', (385, 385), (33,33,33,1))
         draw = ImageDraw.Draw(rect)
         font = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 24)

         c = 0
         for ff in field_desc :
            text = field_desc[ff]
            text_w, text_h = draw.textsize(text,font)  
            spacer = (c * 35 ) + 10
            print("SPACER:", spacer)
            draw.text((10,  spacer), text, font=font) 

            if "cases" in ff or "deaths" in ff or "pm" in ff or "recovered" in ff:
               text = "{0:,d}".format(int(js_vals[ff][cc]))
            else:
               text = "{0:,.2f}".format(round(js_vals[ff][cc],2))

            if "mortality" in ff or "med" in ff:
               text += "%" 

            text_w, text_h = draw.textsize(text,font)  
            if "recovered" in ff:
               draw.text((250,  spacer), text, font=font,fill=(5,206,12,255))
            else:
               draw.text((250,  spacer), text, font=font,fill=(206,5,12,255))


            c += 1





         font = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 28)
         # TOP VAL
         #text = "{:,d}".format(js_vals['deaths'][cc])
         #text_w, text_h = draw.textsize(text,font)  
         #draw.text((300 , 68), text, font=font, fill=(206,5,12,255))







         offset = (1485,95)
         org_frame.paste(rect, offset)


         # ADD RECTANGLE  WITH NEW CASES
         rect = Image.new('RGB', (385, 385), (33,33,33,1))
         draw = ImageDraw.Draw(rect)
         font = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 28)

         text = field_desc[field] 

         text_w, text_h = draw.textsize(text,font)  
         draw.text(((385 - text_w) / 2,  12), text, font=font) 

         font = ImageFont.truetype("./dist/font/Lato-Bold.ttf", 34)
         text = "{:,d}".format(js_vals['deaths'][cc])
         text_w, text_h = draw.textsize(text,font)  
         draw.text(((385 - text_w) / 2,  48), text, font=font,fill=(255,255,164,255))
         offset = (1485,500)
         org_frame.paste(rect, offset)
         org_frame.paste(gimg_pil, (offset[0]+10, offset[1]+10))


         mark_file = mark_dir + "/" + state_code + "-" + field + "-" + str(dates[cc]) + ".png"
         if cfe(mark_dir + "/" + state_code, 1) == 0:
            os.makedirs(mark_dir + "/" + state_code)
         org_frame.save(mark_file)
         print(state_code + "-" + field + "-" + str(dates[cc]) + ".png - SAVED")
      cc+=1 
       



def preview_data(state_code):
   fields = ['cases', 'deaths','cpm','dpm','cg_med', 'dg_med','mortality', 'new_cases', 'new_deaths']
   print("PREVIEW DATA")

   # DELETE JS_VALS THAT PREVIOUSLY EXISTED


   js = load_json_file("json/covid-19-level2-states.json")



   # reset all js_vals for all states
   if state_code == 'ALL':
      for data in js:
         state_code = data['summary_info']['state_code']
         ttt = load_json_file("json/" + state_code + ".json")
         if "js_vals" in ttt:
            del ttt['js_vals']
            ttt['js_vals'] = {}
         save_json_file("json/" + state_code + ".json", ttt)
   else:
      # reset all js_vals for this state
      ttt = load_json_file("json/" + state_code + ".json")
      if "js_vals" in ttt:
         del ttt['js_vals']
         ttt['js_vals'] = {}
      save_json_file("json/" + state_code + ".json", ttt)
      if state_code == 'ALL':
         for data in js:
            state_code = data['summary_info']['state_code']
            for ff in fields:
               preview(state_code,ff,1)
      else:
         for ff in fields:
            preview(state_code,ff,1)



def main_menu():
   state_code = sys.argv[1]  
   field = sys.argv[2]  
   fields = ['cases', 'deaths','cpm','dpm','cg_med', 'dg_med','mortality', 'new_cases', 'new_deaths', 'recovered', 'hospital_now', 'icu_now', 'ventilator_now']

   

   if state_code == 'preview':
      cmd = 'preview'
      state_code = sys.argv[2] 
      field = sys.argv[3] 
      if field != "ALL":
         preview(state_code, field)
      else:
         for field in fields:
            preview(state_code, field)

      exit()


   if state_code == 'prev_data':
      cmd = state_code
      state_code = sys.argv[2]  
      if state_code != "ALL":
         preview_data(state_code)
      else:
         js = load_json_file("json/covid-19-level2-states.json")
         for data in js:
            state_code = data['summary_info']['state_code']
            preview_data(state_code)
 
      exit()


   if state_code == "USA":
 
      if field != "ALL":
       
         make_usa_map_seq(field )
      else:
         for field in fields:
            cmd = "./cvsvg_vince.py USA " + field + " &"
            print(cmd)
            os.system(cmd)
            #make_usa_map_seq(field)
  
   elif state_code == "ALL": 

      make_seq_all(field)
      check_vals_files()
   
   else:
      if field != 'ALL':
         make_seq(state_code, field)
      else:
         fields = ['cases', 'deaths','cpm','dpm','cg_med', 'dg_med','mortality', 'new_cases', 'new_deaths']
         for ff in fields:
            make_seq(state_code, ff)
   
   exit()
  




   print("""
      cvsvg.py -- interface for making map images with covid data

      Select Option:
      1) Make Map For State

   """)
   cmd = input("Select Function : ")

   if cmd == "1":
      state_code = input("Select State Code (for example NY) : ")
      
      print(""" Select Rank Scale: 
        1) Colors Relative to State Rank 
        2) Colors Relative to National Rank : 
      """)
      scale_rank = input("Select Rank Scale: ")

      print("""
      Select Color Coding Data Scheme :
         1) CASES -- pallet scalled to cases 
         2) DEATHS -- pallet scalled to deaths 
         3) CPM -- pallet scalled to CPM 
         4) DPM -- pallet scalled to DPM 
         5) GROWTH -- pallet scalled to DPM 
         6) MORTALITY -- pallet scalled to DPM 

      """)
      data_scheme = input("Select Color Coding Data Scheme ) : ")

   print("You choose : ")
   print("State : ", state_code)
   print("Scale Rank: ", scale_rank)
   print("Data Scheme: ", data_scheme)


def get_county_field_val_for_day(data,day,field):
   for d in data:
      if day == d['date']:
         val = d[field]
         print("VAL FIND:", day, val)

def make_usa_vals_from_county():
   flat_stats = []
   cl2 = load_json_file("json/covid-19-level2-counties-all-days.json")
   all_usa_data = {}
   days = {}
   for data in cl2:
      days[data['day'].replace("-", "")] = 1
      data['date'] = data['day'].replace("-", "")
      flat_stats.append(data)

   sorted_days = []
   for day in days:
      sorted_days.append(day)
   sorted_days = sorted(sorted_days)

   usa_day = {}
   for s in flat_stats:
      date = s['date']
      cases = s['cases']
      deaths = s['deaths']
      new_cases = s['new_cases']
      new_deaths = s['new_deaths']
      if date not in usa_day:
         usa_day[date] = {}
         usa_day[date]['cases'] = cases
         usa_day[date]['deaths'] = deaths
         usa_day[date]['new_cases'] = new_cases
         usa_day[date]['new_deaths'] = new_deaths
         usa_day[date]['recovered'] = 0
         usa_day[date]['hospital_now'] = 0
         usa_day[date]['icu_now'] = 0
         usa_day[date]['vent_now'] = 0
      else:
         usa_day[date]['cases'] += cases
         usa_day[date]['deaths'] += deaths
         usa_day[date]['new_cases'] += new_cases
         usa_day[date]['new_deaths'] += new_deaths


   ## ADD IN VALUES FROM STATES FILE (That are not present in county data sets)
   cl2 = load_json_file("json/covid-19-level2-states.json")
   state_flat_stats = []
   for state_obj in cl2:
      stats = state_obj['state_stats']
      for stat in stats:
         state_flat_stats.append(stat)

   for s in state_flat_stats:
      date = s['date']
      recovered = int(s['recovered'])
      hospital_now = int(s['hospital_now'])
      icu_now = int(s['icu_now'])
      vent_now = int(s['vent_now'])

      if date in usa_day:
         usa_day[date]['recovered'] += recovered
         usa_day[date]['hospital_now'] += hospital_now
         usa_day[date]['icu_now'] += icu_now 
         usa_day[date]['vent_now'] += vent_now 
      else:
         print("DATE NOT IN usa_day!", date)




   case_grs = []
   death_grs = []
   last_cases = 0
   last_deaths = 0
   dc = 0
   for date in sorted_days:
      usa_day[date]['cpm'] = round(usa_day[date]['cases'] / 327.2, 2)
      usa_day[date]['dpm'] = round(usa_day[date]['deaths'] / 327.2, 2)
      usa_day[date]['mortality'] = round((usa_day[date]['deaths'] / usa_day[date]['cases']) * 100, 2)
      cases = usa_day[date]['cases']
      deaths = usa_day[date]['deaths']

      if int(cases) > 0:
         print("GROWTH:", last_cases , "/", cases)
         case_growth = (1 - (int(last_cases) / int(cases))) * 100
      else:
         case_growth = 0
      if int(deaths) > 0:
         death_growth = (1 - (int(last_deaths) / int(deaths))) * 100
      else:
         death_growth = 0


      if len(case_grs) > 3:
         cg_avg = round(np.mean(case_grs[-3:]),2)
         cg_med = round(np.median(case_grs[-3:]),2)
      else:
         cg_avg = case_growth
         cg_med = case_growth

      if len(death_grs) > 3:
         dg_avg = round(np.mean(death_grs[-3:]),2)
         dg_med = round(np.median(death_grs[-3:]),2)
      else:
         dg_avg = death_growth
         dg_med = death_growth

      # growth fields
      usa_day[date]['case_growth'] =  case_growth
      usa_day[date]['death_growth'] =  death_growth
      usa_day[date]['cg_med'] = cg_med
      usa_day[date]['dg_med'] =  dg_med
      usa_day[date]['cg_avg'] = cg_avg
      usa_day[date]['dg_avg'] =  dg_avg
      usa_day[date]['date'] =  date



      if cases > 0:
         case_grs.append(case_growth)
      if deaths > 0:
         death_grs.append(death_growth)
      last_cases = int(cases)
      last_deaths = int(deaths)
      dc = dc + 1


   js_vals = {
      'dates' : [],
      'cpm' : [],
      'dpm' : [],
      'cases' : [],
      'deaths' : [],
      'new_cases' : [],
      'new_deaths' : [],
      'case_growth' : [],
      'death_growth' : [],
      'cg_med' : [],
      'dg_med' : [],
      'mortality' : [],
      'new_deaths' : [],
      'new_cases' : [],
      'recovered' : [],
      'hospital_now' : [],
      'icu_now' : [],
      'vent_now' : []
   }
   flat_usa = []
   for day in sorted_days:
      print("DAY:", day)
      dd = usa_day[day]
      flat_usa.append(dd)
      print(day, usa_day[day])
      js_vals['dates'].append(day)
      js_vals['cases'].append(dd['cases'])
      js_vals['deaths'].append(dd['deaths'])
      js_vals['new_cases'].append(dd['new_cases'])
      js_vals['new_deaths'].append(dd['new_deaths'])
      js_vals['cpm'].append(dd['cpm'])
      js_vals['dpm'].append(dd['dpm'])
      js_vals['case_growth'].append(dd['case_growth'])
      js_vals['death_growth'].append(dd['death_growth'])
      js_vals['cg_med'].append(dd['cg_med'])
      js_vals['dg_med'].append(dd['dg_med'])
      js_vals['mortality'].append(dd['mortality'])
      js_vals['recovered'].append(dd['recovered'])
      js_vals['hospital_now'].append(dd['hospital_now'])
      js_vals['vent_now'].append(dd['vent_now'])
      js_vals['icu_now'].append(dd['icu_now'])
      print("JSON DATES:", js_vals['dates'])

   print(4)
   usa_json = load_json_file("json/USA.json")
   usa_json['day_stats'] = flat_usa 
   usa_json['js_vals'] = js_vals
   save_json_file("json/USA.json", usa_json)



def make_usa_vals_from_state():

   cl2 = load_json_file("json/covid-19-level2-states.json")
   flat_stats = []
   for state_obj in cl2:
      stats = state_obj['state_stats']
      for stat in stats:
         
         flat_stats.append(stat)

   usa_day = {}

   for s in flat_stats:
      print(s)
      date = s['date']
      cases = s['cases']
      deaths = s['deaths']
      new_cases = s['new_cases']
      new_deaths = s['new_deaths']
      if date not in usa_day: 
         usa_day[date] = {}
         usa_day[date]['cases'] = cases
         usa_day[date]['deaths'] = deaths
         usa_day[date]['new_cases'] = new_cases
         usa_day[date]['new_deaths'] = new_deaths
      else:
         usa_day[date]['cases'] += cases
         usa_day[date]['deaths'] += deaths
         usa_day[date]['new_cases'] += new_cases 
         usa_day[date]['new_deaths'] += new_deaths

   days = []
   for dd in usa_day:
      days.append(dd)
   days = sorted(days)

   case_grs = []
   death_grs = []
   last_cases = 0
   last_deaths = 0
   dc = 0
   for date in days:
      usa_day[date]['cpm'] = round(usa_day[date]['cases'] / 327.2, 2)
      usa_day[date]['dpm'] = round(usa_day[date]['deaths'] / 327.2, 2)
      usa_day[date]['mortality'] = round((usa_day[date]['deaths'] / usa_day[date]['cases']) * 100, 2)
      cases = usa_day[date]['cases']
      deaths = usa_day[date]['deaths']

      if int(cases) > 0:
         print("GROWTH:", last_cases , "/", cases)
         case_growth = (1 - (int(last_cases) / int(cases))) * 100
      else: 
         case_growth = 0
      if int(deaths) > 0:
         death_growth = (1 - (int(last_deaths) / int(deaths))) * 100
      else:
         death_growth = 0


      if len(case_grs) > 3:
         cg_avg = round(np.mean(case_grs[-3:]),2)
         cg_med = round(np.median(case_grs[-3:]),2)
      else:
         cg_avg = case_growth
         cg_med = case_growth

      if len(death_grs) > 3:
         dg_avg = round(np.mean(death_grs[-3:]),2)
         dg_med = round(np.median(death_grs[-3:]),2)
      else:
         dg_avg = death_growth
         dg_med = death_growth

      # growth fields
      usa_day[date]['case_growth'] =  case_growth
      usa_day[date]['death_growth'] =  death_growth
      usa_day[date]['cg_med'] = cg_med 
      usa_day[date]['dg_med'] =  dg_med 
      usa_day[date]['cg_avg'] = cg_avg
      usa_day[date]['dg_avg'] =  dg_avg
      usa_day[date]['date'] =  date



      if cases > 0:
         case_grs.append(case_growth)
      if deaths > 0:
         death_grs.append(death_growth)
      last_cases = int(cases)
      last_deaths = int(deaths)
      dc = dc + 1


   js_vals = {
      'dates' : [],
      'cpm' : [],
      'dpm' : [],
      'cases' : [],
      'deaths' : [],
      'new_cases' : [],
      'new_deaths' : [],
      'case_growth' : [],
      'death_growth' : [],
      'cg_med' : [],
      'dg_med' : [],
      'mortality' : [],
      'new_deaths' : [],
      'new_cases' : [] 
   }

   for day in days:
      dd = usa_day[day]
      print(day, usa_day[day])
      js_vals['dates'].append(dd['date'])
      js_vals['cases'].append(dd['cases'])
      js_vals['deaths'].append(dd['deaths'])
      js_vals['new_cases'].append(dd['new_cases'])
      js_vals['new_deaths'].append(dd['new_deaths'])
      js_vals['cpm'].append(dd['cpm'])
      js_vals['dpm'].append(dd['dpm'])
      js_vals['case_growth'].append(dd['case_growth'])
      js_vals['death_growth'].append(dd['death_growth'])
      js_vals['cg_med'].append(dd['cg_med'])
      js_vals['dg_med'].append(dd['dg_med'])
      js_vals['mortality'].append(dd['mortality'])

   usa_json = load_json_file("json/USA.json")
   usa_json['day_stats'] = usa_day
   usa_json['js_vals'] = js_vals 
   save_json_file("json/USA-state.json", usa_json)

def make_usa_vals_from_county_old():
   js_vals = {
      'dates' : [],
      'cpm' : [],
      'dpm' : [],
      'cases' : [],
      'deaths' : [],
      'cg_med' : [],
      'dg_med' : [],
      'mortality' : [],
      'new_deaths' : [],
      'new_cases' : [] 
   }


   cl2 = load_json_file("json/covid-19-level2-counties-all-days.json")
   all_usa_data = {}
   days = {}
   for data in cl2:
      days[data['day'].replace("-", "")] = 1

   #"zero_day" : zero_day,

   #for date in sorted(days):
   #   print(date)
   for data in cl2:
      date = data['day'].replace("-", "")
      if date not in all_usa_data:
         #print("DATA:", data)
         all_usa_data[date] = {
         "date" : data['day'],
         "cases" : data['cases'],
         "deaths" : data['deaths'],
         "new_cases" : data['new_cases'],
         "new_deaths" : data['new_deaths'],
         "tests" : 0,
         "tpm" : 0,
         "cpm" : 0,
         "dpm" : 0,
         "cg_last" : 0,
         "dg_last" : 0,
         "cg_avg" : 0,
         "dg_avg" : 0,
         "cg_med" : 0, 
         "dg_med" : 0,
         "cg_med_decay" : 0,
         "dg_med_decay" : 0,
         "mortality" : 0,
         "hospital_now" : 0,
         "icu_now" : 0,
         "vent_now" : 0,
         "recovered" : 0
         }
      else:
         all_usa_data[date]['cases'] += data['cases']
         all_usa_data[date]['deaths'] += data['deaths']
         all_usa_data[date]['new_cases'] += data['new_cases']
         all_usa_data[date]['new_deaths'] += data['new_deaths']

      js_vals['dates'].append(data['day'])
      js_vals['cases'].append(data['cases'])
      js_vals['deaths'].append(data['deaths'])
      js_vals['new_cases'].append(data['new_cases'])
      js_vals['new_deaths'].append(data['new_deaths'])
      js_vals['cpm'].append(data['cpm'])
      js_vals['dpm'].append(data['dpm'])
      js_vals['cg_med'].append(data['cg_med'])
      js_vals['dg_med'].append(data['dg_med'])
      if data['cases'] > 0:
         js_vals['mortality'].append(round(data['deaths']/data['cases'],2))

   for date in all_usa_data :
      data = all_usa_data[date]
      all_usa_data[date]['cpm'] = round(data['cases'] / 327,2)
      all_usa_data[date]['dpm'] = round(data['deaths'] / 327,2)
      all_usa_data[date]['mortality'] = round((data['deaths'] / data['cases']) * 100, 2)


   all_ar = []

   for date in sorted(days):
      if date in all_usa_data:
         print("Date", date)
         all_ar.append(all_usa_data[date])
      else:
         print("NO Date", date)

   all_usa = {
      "day_stats" : all_ar
   }
   all_usa['js_vals'] = js_vals
   save_json_file("json/USA.json", all_usa)

def make_usa_map_seq(field):
   cl2 = load_json_file("json/covid-19-level2-counties-all-days.json")

   state_data = load_json_file("json/covid-19-level2-states.json")
   #cl2 = load_json_file("json/covid-19-level2-states.json")
   state_flat_stats = []
   for state_obj in state_data:
      stats = state_obj['state_stats']
      for stat in stats:
         state_flat_stats.append(stat)



   days = {}
   for data in state_flat_stats:
      if field == 'recovered' or field == 'hospital_now' or field == 'icu_now' or field == 'vent_now':
         if int(data[field]) > 0:
            days[data['date'].replace("-", "")] = 1
      else:
         days[data['date'].replace("-", "")] = 1

   for day in sorted(days):
      
      print("Day: " + string_to_date(str(day)))
      
      if cfe("anim/frames/USA/", 1) == 0:
         os.makedirs("anim/frames/USA/")

      outfile = "anim/png/USA/USA-counties-" + field + "-" + day + ".png"
      
      if cfe(outfile) == 0:
         make_usa_map(field,day,cl2, state_flat_stats)
      else:
         print("Already exists: ", day)




def make_usa_map(field, date, cl2 = None, state_stats = None):
   
   # UPDATE:
   # TEMPLATE FOR VIDEOS

   # If this is a field that has 'state only' data, use the state map not the county one. (if state map template doesn't exist, then replace all counties color with state data not 1 county at a time.)
   # Also loop over state_stats to get vals and not county stats

   state_fips = load_state_fips()
   fp = open("templates/USA_Counties_with_FIPS_and_names_for_video.svg")


   map = ""
   for line in fp:
      map += line
   if cl2 is None: 
      cl2 = load_json_file("json/covid-19-level2-counties-all-days.json")
   if field == 'recovered':
      palette = sns.color_palette("Greens", n_colors=11)
   else:
      palette = sns.color_palette("Reds", n_colors=11)
   sns.palplot(palette)
   md = []
   vals = []

   # here if we are dealing with a state field (recovered, hospital_now, icu_now, vent_now), we must add ALL FIPs to the array for each state. 

   if field == 'recovered' or field == 'hospital_now' or field == 'icu_now' or field == 'vent_now':
      print ("Build ALL FIPS data from state and county ALL FIPS list. Not the county data.")
      for ss in state_stats:
         data = ss
         day = data['date'].replace("-", "")
         if day == date:
            state = data['state_code']
            for fips in state_fips[state]:

               if field in data:
                  val = data[field]
               else:
                  val = 0
               color_rank,ranks,rankCss = get_val_rank(val, field)
               color = palette[color_rank]
               add = 1

               if field == 'recovered' and data['recovered'] == 0:              
                  add = 0
               if field == 'hospital_now' and data['hospital_now'] == 0:              
                  add = 0
               if field == 'icu_now' and data['icu_now'] == 0:              
                  add = 0
               if field == 'vent_now' and data['vent_now'] == 0:              
                  add = 0
  
               if add == 1:
                  md.append((day,state,fips,fips,val,color_rank,color))
                  vals.append(val)

   else:
      print("Building data for ", field)
      for data in cl2:
         print(data)
         day = data['day'].replace("-", "")
         if day == date:
    
            state = data['state']
            county = data['county']
            fips = data['fips']
            if field in data:
               val = data[field]
            else:
               val = 0
            color_rank,ranks,rankCss = get_val_rank(val, field)
            color = palette[color_rank]
            md.append((day,state,county,fips,val,color_rank,color))
            vals.append(val)

   for mmm in md:
      (day,state,county,fips,val,color_rank,rgb) = mmm
      color = str(int(rgb[0]*255)) + "," + str(int(rgb[1]*255)) + "," + str(int(rgb[2]*255)) + "," + str(1)

      if float(val) > 0:
         map = map.replace("id=\"FIPS_" + fips + "\" fill=\"#ffffff\" stroke=\"#C0C0C0\"", "id=\"FIPS_" + fips + "\" fill=\"rgba(" + color + ") \" stroke=\"#C0C0C0\" ")
    


   if cfe("anim/png/USA", 1) == 0:
      os.makedirs("anim/png/USA")
   
   
   outfile = "anim/png/USA/USA-counties-" + field + "-" + day + ".png"
   #outsvg = outfile.replace(".png", ".svg")
   #out = open(outsvg, "w")
   #out.write(map)
   #out.close() 
     
   svg2png(bytestring=map,write_to=outfile)
   print(outfile + " created")
  

def find_max_county_val(state_code, field,sj):
   vals = []
   xxx = []
   cs = sj['county_stats']
   for county in cs:
      cd = cs[county]['county_stats']
      for xxx in cd:
         if xxx[field] != 0:
            vals.append(xxx[field])   
         else:
            vals.append(0)
   if len(xxx) == 0:
      vals = [0,0,0,0,0]
   return(max(vals))

def make_seq_all(field):
   js = load_json_file("json/covid-19-level2-states.json")
   for data in js:
      state_code = data['summary_info']['state_code']
      cmd = "./cvsvg_vince.py " + state_code + " " + "ALL"
      print(cmd)
      os.system(cmd)
      #preview(state_code, field)
      #make_seq(state_code, field)

def make_seq(state_code, field):
   data = load_json_file("json/" + state_code + ".json")
   counties = data['county_pop']
   max_val = find_max_county_val(state_code,field,data)
   if field == "mortality":
      max_val = 10
   if field == "cases":
      max_val = max_val * .3 
      if max_val > 100:
         max_val = 100
   if field == "cpm":
      max_val = max_val * .1 
   palette = sns.color_palette("Reds", n_colors=11)
   sns.palplot(palette)

   legend = make_legend(state_code,field,palette,max_val)

   stats = data['state_stats']
   cstats = data['county_stats']
   cdays = {}
   for county in cstats:
      for row in cstats[county]['county_stats']:

         day = row['day'].replace("-", "")
         cdays[day] = 1


   files = []
   dates = []
   all_vals = []
   ts = len(stats)
   cc = 0
   for ss in stats:
      cases = ss['cases']
      print(ss['date'], ss['cases'])
      if int(cases) > 0 and ss['date'] in cdays:
         ANIM_DIR = ANIM_PATH + "/frames/" + state_code + "/"
         ss_date = ss['date'].replace("-", "")
         outfile = ANIM_DIR + state_code + "-" + field + "-" + ss_date + ".png"
    
         svgout = ANIM_DIR + state_code + "-" + field + "-" + ss_date + ".svg"
         print(outfile)
         if cfe(svgout) == 0 :
            print("MAKE :", state_code, ss['date'])
            outfile, all_val = make_map(state_code, ss_date, field, "1", max_val) 
         else:
            print("ALREADY MADE :", state_code, ss['date'])

      else:
         print("SKIP FRAME NO CASES DATA", ss, ss['date'], cdays)
      cc += 1

   return(outfile)

def load_covid_state_map_data(state_code, rpt_date = None):
   #rpt_date = "20200401"
   sd = load_json_file("json/" + state_code + ".json")
   state_code = sd['summary_info']['state_code']
   state_name = sd['summary_info']['state_name']
   state_population = sd['summary_info']['state_population']
   state_stats = sd['state_stats']
   cs = sd['county_stats']
   cd = []
   cstats = {}
   stats = {}
   for county in cs:
      ccs = cs[county]['county_stats']
      if rpt_date is None:
         cstats = ccs[-1]
      else:
         for cdata in cs[county]['county_stats']: 
            fips = cs[county]['fips']
            if cdata['day'].replace("-", "") == rpt_date:
               cdata['fips'] = fips
               cdata['county'] = county
               cstats = cdata
      cd.append((cstats))

   if rpt_date is None:

         outfile, all_val = make_map(state_code, ss['date'], field, "1", max_val)
         files.append(outfile)
         dates.append(ss['date'])
         if field == 'cpm':
            cpm = ss['cpm']
            all_val = cpm
         all_vals.append(all_val)
         cc += 1

   base_file = state_code + "-" + field
   #make_gif(files,dates,all_vals,state_code,field,base_file,palette)

def make_cpm_legend(palette, state_code,field,height=480):
   rank_perc,cpm_ranks,rankCss = get_val_rank(100,field)
   img = Image.new('RGB', (200,height), (0, 0, 0))
   block_size = int(height / 13) 
   img_d = ImageDraw.Draw(img)   
   fnt = ImageFont.truetype(ORG_PATH + '/dist/font/FreeMono.ttf', 15)
   tp = len(palette) - 1
   cc = 0
   #img_d.text((50,10), "CASES PER M", font=fnt, fill=(255,255,255))
   for i in range(0,len(palette)):
      rgb = palette[tp-i]
      cpm_val = cpm_ranks[tp-i]
      r = int(rgb[0] * 255)
      g = int(rgb[1] * 255)
      b = int(rgb[2] * 255)
      x1 = 50 
      y1 = (cc * block_size) + 30
      x2 = x1 + block_size
      y2 = y1 + block_size 
      if cpm_val[1] >= 9999:
         val1 = str(int(cpm_val[0]))
         val2 = "+"
         img_d.text((100,y1+7), val1 + val2 , font=fnt, fill=(255,255,255))
      else:
         val1 = str(int(cpm_val[0]))
         val2 = str(int(cpm_val[1]))
         img_d.text((100,y1+7), val1 + "-" + val2 , font=fnt, fill=(255,255,255))
    
      shape = [(x1,y1), (x2,y2)]
      img_d.rectangle(shape, fill=(r,g,b), outline="black")
      cc += 1
   #img.show() 
   LEG_PATH = ANIM_PATH + "legends/"
   if cfe(LEG_PATH, 1) == 0:
      os.makedirs(LEG_PATH)
   img.save(LEG_PATH + "legend-" + state_code + "-" + field + ".png", "PNG")
   return(ANIM_PATH + "frames/legend-" + field + ".png")   

def make_legend(state_code,field,palette,max_val):


   


   print("LEGEND.",state_code,field)
   if field == 'cpm' or field == 'mortality':
 
      leg = make_cpm_legend(palette,state_code,field) 
      print("GLEGEND.",state_code,field, leg)
      return() 

   img = Image.new('RGB', (200,460), (255, 255, 255))
   img_d = ImageDraw.Draw(img)    
   fnt = ImageFont.truetype(ORG_PATH + '/dist/font/FreeMono.ttf', 20)
   cc = 0
   tp = len(palette) - 1
   #for rgb in palette:
   step = max_val / len(palette)
   for i in range(0,len(palette)):
      rgb = palette[tp-i]
      r = int(rgb[0] * 255)
      g = int(rgb[1] * 255)
      b = int(rgb[2] * 255)


      x1 = 50 
      y1 = (cc * 40) + 10
      x2 = x1 + 40
      y2 = y1 + 40
      img_d.text((100,y1+10), str(round(max_val-(i*step),2)) , font=fnt, fill=(0,0,0,255))
    
      shape = [(x1,y1), (x2,y2)]
      img_d.rectangle(shape, fill=(r,g,b), outline="black")
      cc += 1


   #img_d.text((20,20), "Legend " + field.upper() , font=fnt, fill=(0,0,0,255))
   #img_d.text((100,65), str(max_val) , font=fnt, fill=(0,0,0,255))

   #img.show() 

   LEG_PATH = ANIM_PATH + "legends/"
   if cfe(LEG_PATH, 1) == 0:
      os.makedirs(LEG_PATH)

   img.save(LEG_PATH + "legend-" + state_code + "-" + field + ".png", "PNG")


def get_val_rank(val,type='cpm'):
   if True:
      rank = 0
      rankcss= "n"
      ranks = {}
      ranks['cases'] = ((1,10),(10,25),(25,50),(50,100),(100,150),(150,200),(200,250),(250,300),(300,400),(400,500),(500,999999))
      ranks['deaths'] = ((1,2),(2,3),(3,4),(4,5),(5,10),(10,20),(30,40),(40,50),(50,100),(100,200),(300,999999))
      ranks['cpm'] = ((1,10),(10,25),(25,50),(50,100),(100,150),(150,200),(200,250),(250,300),(300,400),(400,500),(500,999999))
      ranks['dpm'] = ((1,2),(2,3),(3,4),(4,5),(5,10),(10,25),(25,50),(50,100),(100,200),(200,300),(300,999999))
      ranks['mortality'] = ((0,1),(1,2),(2,3),(3,4),(4,5),(6,7),(7,8),(8,9),(9,10),(10,15),(15,100))
      ranks['cg_med'] = ((0,5),(5,10),(10,15),(15,20),(20,25),(25,30),(30,35),(35,40),(40,50),(50,75),(75,100))
      ranks['dg_med'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
      ranks['new_cases'] = ((0,5),(5,10),(10,20),(20,30),(30,40),(40,50),(50,100),(100,200),(200,500),(500,1000),(1000,99999))
      ranks['new_deaths'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
      ranks['recovered'] = ((1,10),(10,25),(25,50),(50,100),(100,150),(150,200),(200,250),(250,300),(300,400),(400,500),(500,999999))
      ranks['hospital_now'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
      ranks['icu_now'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
      ranks['vent_now'] = ((0,2),(2,4),(4,6),(6,8),(8,10),(10,12),(12,14),(14,16),(16,18),(18,20),(20,100))
      rc = 0
      for i,r in enumerate(ranks[type]):
 
         if r[0] < float(val) <= r[1]:
            #print("RANK:", r[0], "<", val, "<=", r[1])
            rank = i
            rankcss= rc
         rc += 1

   return(rank,ranks[type],rankcss)

def make_map(state_code,rpt_date,field,scale,max_val):
 

   info = load_covid_state_map_data(state_code,rpt_date)
   print("INFO:", info)
   
   #for i in info['county_stats']:
   #   print("INFO:", i)

   all_val = 0   
   map_data = [] 
   vals = [] 
   for cdata in info['county_stats']:
      if "fips" in cdata:
         fips = cdata['fips']
         val = cdata[field]
         #print("MAP DATA:", fips,val)
         map_data.append((fips, val))
         vals.append(val)


   palette = sns.color_palette("Reds", n_colors=11)
   sns.palplot(palette)
   map_data = sorted(map_data, key=lambda x: x[1], reverse=False)
   tot = len(map_data)
   cc = 0
   md = []
   unqx = {}
   for fips,val in map_data:
      if max_val > 0:
         rank_perc,cpm_ranks,rank_css = get_val_rank(val,field)
      else:
         rank_perc = 0
         rank_css = 0
      
      # Not sure what this is for, but caused a 30 minute debug session.  
      # yep... I should really take care of what is color related... :)
      #color = rank_perc #palette[rank_perc]

      color = palette[rank_perc]
      colorCss = rank_css


      if val == 0:
         color = 1,1,1
         colorCss = "n"
 

      if fips not in unqx:
         md.append((fips, color, colorCss) )
         unqx[fips] = 1
      cc += 1
      all_val += val

   if field == "mortality" or field == "cg_avg":
      if cc > 0:
         all_val = round((all_val / cc),2)
      else:
         all_val = 0

   ANIM_DIR = ANIM_PATH + "/frames/" + state_code + "/"
   if cfe(ANIM_DIR, 1) == 0:
      os.makedirs(ANIM_DIR)
   outfile = ANIM_DIR + state_code + "-" + field + "-" + rpt_date + ".png"
   PNG_DIR = ANIM_DIR.replace("frames", "png")
   if cfe(PNG_DIR, 1) == 0:
      os.makedirs(PNG_DIR)

   make_svg_map(state_code,md,outfile)
   return(outfile,all_val)

def load_covid_state_map_data(state_code, rpt_date = None):

   #print("LOAD STATE MAP DATA:", state_code, rpt_date)

   sd = load_json_file("json/" + state_code + ".json")
   state_code = sd['summary_info']['state_code']
   state_name = sd['summary_info']['state_name']
   state_population = sd['summary_info']['state_population']
   state_stats = sd['state_stats']
   if state_code == 'NY':
      sd['county_stats']['New York City']['fips'] = "9999"


   cs = sd['county_stats']
   cd = []
   cstats = {}
   stats = {}
   for county in cs:
      ccs = cs[county]['county_stats']
      if rpt_date is None:
         cstats = ccs[-1]
      else:
         for cdata in cs[county]['county_stats']: 
            fips = cs[county]['fips']
            if cdata['day'].replace("-", "") == rpt_date:
               cdata['fips'] = fips
               cdata['county'] = county
               cstats = cdata
      cd.append((cstats))

   if rpt_date is None:
      stats = state_stats[-1]
   else:
      for stat in state_stats:
         if stat['date'] == rpt_date:
            stats = stat 
   info = {
      "state_code": state_code,
      "state_name": state_name,
      "state_population": state_population,
      "state_stats": stats,
      "county_stats": cd
   }
   return(info)

def make_gif(files, dates, all_vals,state_code,field,base_file,palette):

   # copy the last file 5 times for a end loop stop effect
   #last_file = files[-1]
   #last_file = last_file.replace("frames", "marked")
   #time.sleep(3)
   #for i in range(0,5):
   #   last_file_ex = last_file.replace(".png", "-" + str(i) + ".png")
   #   last_file_ex = last_file_ex.replace("frames", "marked")
   #   cmd = "cp " + last_file + " " + last_file_ex 
   #   os.system(cmd)
   #time.sleep(1)

   imf = Image.open(files[0])
   iw,ih = imf.size

   
   make_cpm_legend(palette, state_code,field,height=ih)

   leg_file = ANIM_PATH + "frames/legend-" + field + ".png"
   fnt = ImageFont.truetype(ORG_PATH + '/dist/font/FreeMono.ttf', 15)
   fnt_small = ImageFont.truetype(ORG_PATH + '/dist/font/FreeMono.ttf', 10)
  
   leg = Image.open(leg_file)
   lw,lh = leg.size

   rw = iw / lw 
   rh = ih / lh
   nw = int(lw * rh)
   nh = int(lh * rh)
   leg = leg.resize((nw,nh))

   cw = lw + iw + 10
   ch = ih

   images = []
   fc = 0

   print("FILES!", files)

   for file in files:
      im = Image.open(file)
      iw,ih = im.size
      dt_x = 10
      dt_y = ih - 15

      new_im = Image.new('RGB', (cw, ch))
      new_im.paste(leg,(0,0))
      new_im.paste(im,(nw,0))

      draw = ImageDraw.Draw(new_im)
      field_desc = field
      if field == 'mortality' :
         field_desc += " % "
      #draw.text((10,10), "COVID-19 " + field.upper() + " + dates[fc], font=fnt, fill=(255,255,255))
      draw.text((10,10), "COVID-19 " + field_desc.upper() + " " + str(all_vals[fc]), font=fnt, fill=(255,255,255))
      draw.text((100,100), "cvinfo.org " , font=fnt_small, fill=(100,255,255))
      
      draw.text((10,ih-20), dates[fc], font=fnt, fill=(255,255,255))
      draw.text((cw-100,ih-50), "cvinfo.org " , font=fnt, fill=(255,255,255))

      #new_im.show()
      images.append(new_im)
      new_file = file.replace("frames", "marked")
      new_im.save(new_file)
      fc += 1

   outfile = ANIM_PATH + "gifs/" + base_file + ".gif"

   # copy the last file 5 times for a end loop stop effect
   last_file = files[-1]
   last_file = last_file.replace("frames", "marked")
   time.sleep(3)
   for i in range(0,5):
      last_file_ex = last_file.replace(".png", "-" + str(i) + ".png")
      last_file_ex = last_file_ex.replace("frames", "marked")
      cmd = "cp " + last_file + " " + last_file_ex
      os.system(cmd)
      #print(cmd)

   time.sleep(1)

   cmd = "convert -delay 35 -loop 0 anim/marked/* " + outfile
   print(cmd)
   os.system(cmd)

   time.sleep(1) 
   cmd = "rm anim/marked/*.png"
   os.system(cmd)


def make_svg_map(state_code,data,outfile):
 
   used_counties = {}
   state_data = load_json_file("json/" + state_code + ".json")
   state_names, state_codes = load_state_names()
   state_name = state_names[state_code]
   counties = state_data['county_pop']
   #for c in counties:
   #   if c != state_name: 
   #      fips = state_data['county_stats'][c]['fips']
   #      used_counties[fips] = 0

 

   fname_tmplate = "templates/states/" + state_code + ".svg" 

   # REAL SVG with classes
   fname = open(fname_tmplate, "r")
   svg_code = ""
   for line in fname:

      if "FIPS_" in line:
         for fips,rgb,cssClass in data:
           
            #if "fill" not in line: 
            line = line.replace("id=\"FIPS_" + fips + "\"", "id=\"FIPS_" + fips + "\" class=\"cl_" + str(cssClass) + "\"")
      svg_code += line
   fname.close()

   # We save it
   outsvg = outfile.replace(".png", ".svg")
   out = open(outsvg, "w")
   out.write(svg_code)

 
   # SVG FOR PNG
   fp = open(fname_tmplate, "r")
   svg_code = ""
   lc = 0
   for line in fp:
      if "FIPS_" in line:
         for fips,rgb,cssClass in data: 
            color = str(int(rgb[0]*255)) + "," + str(int(rgb[1]*255)) + "," + str(int(rgb[2]*255)) + "," + str(1)
            line = line.replace("id=\"FIPS_" + fips + "\"", "id=\"FIPS_" + fips + "\" fill=\"rgba(" + color + ") \" stroke=\"#C0C0C0\" stroke-width=\".1\"")
           
      svg_code += line

   fp.close()
 
   # outsvg = outfile.replace(".png", ".svg")
   # ut = open(outsvg, "w")
   # out.write(svg_code)

   # out.close()
   ow = 555.22
   oh = 351.67
   # DON'T COMMENT THIS OUT AS IT IS NEEDED STILL FOR MAKING CUSTOM MOVIES/GIFS ANIMATIONS ETC

   outfile = outfile.replace("frames", "png")
   svg2png(bytestring=svg_code,write_to=outfile, parent_width=ow*1.5,parent_height=oh*1.5)




if __name__ == "__main__":
    # execute only if run as a script
    #make_fb_prev_images()
    fields = ['cases', 'deaths','cpm','dpm','cg_med', 'dg_med','mortality', 'new_cases', 'new_deaths', 'recovered']
    if sys.argv[1] == 'usa':
       # need to check_running in between these calls since they are multiprocessing and run in the BG
       # also add MP=1 to conf to enable & background calling. (for speed) 
       os.system("./cvsvg_vince.py USA ALL")
       os.system("./cvsvg_vince.py build_marked ALL")
       os.system("./graph.py ")
       os.system("./cvsvg_vince.py am")
       os.system("./cvsvg_vince.py mm ALL")
       os.system("./cat-videos.py ")
    if sys.argv[1] == 'mm':
       if sys.argv[2] == "ALL":
          for ff in fields:
             make_movie_from_frames("USA", ff)
       else:
             make_movie_from_frames("USA", sys.argv[2])

       exit()
    if sys.argv[1] == "am":
       all_movie()
       exit()
    if sys.argv[1] == "usavals":
       make_usa_vals_from_county()
    elif sys.argv[1] == "check":
       check_vals_files()
    # Build all usa marked map for a given field (sys.argv[2])
    elif sys.argv[1] == "build_marked": 
       if sys.argv[2] != "ALL":
          build_marked("USA",sys.argv[2])
       else:
          for ff in fields:
             cmd = "./cvsvg_vince.py build_marked " + ff + " &"
             print(cmd)
             os.system(cmd)
    else:
       main_menu()
