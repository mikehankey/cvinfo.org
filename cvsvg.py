#!/usr/bin/python3 

# cvinfo.org 
# Batch script for making colored state and county images based on covid-level2 data
# 
from covid import cfe, load_json_file
from conf import *

import time
import os
import numpy as np
import xml.dom.minidom
import sys
import seaborn as sns
from cairosvg import svg2png
from PIL import Image, ImageFont, ImageDraw
import glob

def main_menu():
   state_code = sys.argv[1]  
   field = sys.argv[2]  
   make_seq(state_code, field)
   #make_seq_all()
   exit()
   #make_map("MD", "20200401", "cases", "1")
   #make_map("MD", "20200402", "cases", "1")
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

def find_max_county_val(state_code, field,sj):
   vals = []
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

def make_seq_all():
   js = load_json_file("json/covid-19-level2-states.json")
   for data in js:
      state_code = data['summary_info']['state_code']
      print("./cvsvg.py " + state_code + " " + "cpm")
      #make_seq(state_code, "cpm")

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
   files = []
   dates = []
   all_vals = []
   ts = len(stats)
   cc = 0
   for ss in stats:
      print(state_code, ss['date'])
      if cc < ts - 1:
         outfile, all_val = make_map(state_code, ss['date'], field, "1", max_val)
         files.append(outfile)
         dates.append(ss['date'])
         if field == 'cpm':
            cpm = ss['cpm']
            all_val = cpm
         all_vals.append(all_val)
         cc += 1

   base_file = state_code + "-" + field
   make_gif(files,dates,all_vals,state_code,field,base_file,palette)

def make_cpm_legend(palette, state_code,field,height=480):
   if field == 'cpm':
      rank_perc,cpm_ranks = get_cpm_rank(100)
   if field == 'mortality':
      rank_perc,cpm_ranks = get_mortality_rank(100)
   img = Image.new('RGB', (200,height), (0, 0, 0))
   block_size = int(height / 13) 
   img_d = ImageDraw.Draw(img)   
   fnt = ImageFont.truetype('Pillow/Tests/fonts/FreeMono.ttf', 15)
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
      #print("CCPM:", cpm_val)
      if cpm_val[1] >= 9999:
         val1 = str(int(cpm_val[0]))
         val2 = "+"
         img_d.text((100,y1+7), val1 + val2 , font=fnt, fill=(255,255,255))
      else:
         val1 = str(int(cpm_val[0]))
         val2 = str(int(cpm_val[1]))
         img_d.text((100,y1+7), val1 + "-" + val2 , font=fnt, fill=(255,255,255))
    
      #print(x1,y2,x2,y2)
      shape = [(x1,y1), (x2,y2)]
      img_d.rectangle(shape, fill=(r,g,b), outline="black")
      cc += 1
   #img.show() 
   img.save(ANIM_PATH + "frames/legend-" + field + ".png", "PNG")
   return(ANIM_PATH + "frames/legend-" + field + ".png")   

def make_legend(state_code,field,palette,max_val):
   print("LEGEND.",state_code,field)
   if field == 'cpm' or field == 'mortality':
 
      leg = make_cpm_legend(palette,state_code,field) 
      print("GLEGEND.",state_code,field, leg)
      return() 

   img = Image.new('RGB', (200,460), (255, 255, 255))
   img_d = ImageDraw.Draw(img)   
   fnt = ImageFont.truetype('Pillow/Tests/fonts/FreeMono.ttf', 20)
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
    
      #print(x1,y2,x2,y2)
      shape = [(x1,y1), (x2,y2)]
      img_d.rectangle(shape, fill=(r,g,b), outline="black")
      cc += 1


   #img_d.text((20,20), "Legend " + field.upper() , font=fnt, fill=(0,0,0,255))
   #img_d.text((100,65), str(max_val) , font=fnt, fill=(0,0,0,255))

   #img.show() 
   img.save(ANIM_PATH + "frames/legend-" + state_code + "-" + field + ".png", "PNG")

def get_mortality_rank(val):
   rank = 0
   mort_ranks = ((0,1),(1,2),(2,3),(3,4),(4,5),(6,7),(7,8),(8,9),(9,10),(10,15),(15,100))
   if val < 1:
      rank = 0
   if 1 <= val < 2:
      rank = 1
   if 2 <= val < 3:
      rank = 2
   if 3 <= val < 4:
      rank = 3
   if 4 <= val < 5:
      rank = 4
   if 6 <= val < 7:
      rank = 5
   if 8 <= val < 9:
      rank = 6
   if 9 <= val < 10:
      rank = 7
   if 10 <= val < 15:
      rank = 8
   if 15 <= val < 20:
      rank = 9
   if val >= 20:
      rank = 10
   return(rank,mort_ranks)


def get_cpm_rank(val):
   rank = 0
   cpm_ranks = ((1,10),(10,25),(25,50),(50,100),(100,150),(150,200),(200,250),(250,300),(300,400),(400,500),(500,999999))
   if val < 10:
      rank = 0
   if 10 <= val < 25:
      rank = 1 
   if 25 <= val < 50:
      rank = 2 
   if 50 <= val < 100:
      rank = 3 
   if 100 <= val < 150:
      rank = 4
   if 150 <= val < 200:
      rank = 5
   if 200 <= val < 250:
      rank = 6
   if 250 <= val < 300:
      rank = 7
   if 300 <= val < 400:
      rank = 8
   if 400 <= val < 500:
      rank = 9 
   if val >= 500:
      rank = 10 
   return(rank,cpm_ranks)

def make_map(state_code,rpt_date,field,scale,max_val):
   info = load_covid_state_map_data(state_code,rpt_date)
   #print("INFO:", info['state_name'])
   #print("INFO CS:", info['county_stats'])
   all_val = 0   
   map_data = [] 
   vals = [] 
   for cdata in info['county_stats']:
      #print("C:", cdata)
      #fips = info['county_stats'][county]['fips']
      if "fips" in cdata:
         fips = cdata['fips']
         val = cdata[field]
         print(field,val)
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
      rank_perc = int((val / max_val) * 10)
      if field == 'cpm':
         rank_perc,cpm_ranks = get_cpm_rank(val)
         color = palette[rank_perc]
      elif field == 'mortality':
         rank_perc,cpm_ranks = get_mortality_rank(val)
         print("MORT RANK:", rank_perc, val)
         color = palette[rank_perc]

      else:
         if rank_perc < len(palette):
            color = palette[rank_perc]
         else:
            color = palette[10]
      if val == 0:
         color = palette[0]
      if fips not in unqx:
         md.append((fips, color) )
         unqx[fips] = 1
      cc += 1
      all_val += val

   if field == "mortality" or field == "cg_avg":
      if cc > 0:
         all_val = round((all_val / cc),2)
      else:
         all_val = 0

   ANIM_DIR = ANIM_PATH + "/frames/"
   outfile = ANIM_DIR + state_code + "-" + field + "-" + rpt_date + ".png"
   
   #print("md:", md)

   make_svg_map(state_code,md,outfile)
   return(outfile,all_val)

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
            #print(cdata['day'], rpt_date)
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
   #print(state_code, state_name,state_population)
   #print(stats)
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
   #   print(cmd)
   #time.sleep(1)

   imf = Image.open(files[0])
   iw,ih = imf.size

   
   make_cpm_legend(palette, state_code,field,height=ih)

   leg_file = ANIM_PATH + "frames/legend-" + field + ".png"
   fnt = ImageFont.truetype('Pillow/Tests/fonts/FreeMono.ttf', 15)
  
   print(leg_file)
   leg = Image.open(leg_file)
   lw,lh = leg.size

   rw = iw / lw 
   rh = ih / lh
   nw = int(lw * rh)
   nh = int(lh * rh)
   leg = leg.resize((nw,nh))
   print("LEG SIZE:", lw,lh, iw,ih,rw,rh,nw,nh)

   cw = lw + iw + 10
   ch = ih

   images = []
   fc = 0
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
      
      draw.text((10,ih-20), dates[fc], font=fnt, fill=(255,255,255))
      draw.text((cw-100,ih-20), "cvinfo.org " , font=fnt, fill=(255,255,255))

      #print("IMAGE:", new_im.size[0],new_im.size[1],file)
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
      print(cmd)

   time.sleep(1)

   cmd = "convert -delay 35 -loop 0 anim/marked/* " + outfile
   print(cmd)
   os.system(cmd)

   time.sleep(1) 
   cmd = "rm anim/marked/*.png"
   os.system(cmd)


def make_svg_map(state_code,data,outfile):

   fname = "templates/states/" + state_code + ".svg"

   fp = open(fname, "r")


   svg_code = ""
   lc = 0
   for line in fp:

      if "FIPS_" in line:
         for fips,rgb in data:
            print(fips,data)
            color = str(int(rgb[0]*255)) + "," + str(int(rgb[1]*255)) + "," + str(int(rgb[2]*255)) + "," + str(1)
            #if "fill" not in line: 
            line = line.replace("id=\"FIPS_" + fips + "\"", "id=\"FIPS_" + fips + "\" fill=\"rgba(" + color + ") \" stroke=\"#C0C0C0\" stroke-width=\".1\"")
      svg_code += line

   fp.close()
   outsvg = outfile.replace(".png", ".svg")
   out = open(outsvg, "w")
   out.write(svg_code)
   out.close()
   #print(outsvg)
   svg2png(bytestring=svg_code,write_to=outfile)




if __name__ == "__main__":
    # execute only if run as a script
    main_menu()
