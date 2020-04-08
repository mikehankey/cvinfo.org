#!/usr/bin/python3

import glob
import csv
from covid import load_json_file,save_json_file, load_state_names

def load_file(file):
   state_codes, state_names = load_state_names()
   bad_fields = [
     ['\ufeffProvince/State', 'Province_State'],
     ['Province/State', 'Province_State'],
     ['Country/Region', 'Country_Region'],
     ['Last Update', 'Last_Update']
   ]
   objects =  []
   fields = []
   good_fields = []
   rows = []
   with open(file, 'r') as csvfile:
      csvreader = csv.reader(csvfile) 
      fields = next(csvreader)
      for f in fields :
         for bf in bad_fields:
            if f == bf[0]:
               f = bf[1]
         good_fields.append(f)
      fields = good_fields

      #print(fields)
      for row in csvreader:
         country = None
         for cc in range(0,len(fields)):
            field = fields[cc] 
            val = row[cc] 
            if field == "Country_Region":
               country = val 
         if country is None:
            print(row )
            print(fields)
            exit()
    
         obj = {}
         for cc in range(0,len(fields)):
            field = fields[cc] 
            val = row[cc] 
            # fix the state and date inconsistencies
            if field == "\ufeffFIPS":
               field = "FIPS"


            if field == "Last_Update":
               orig_val = val
               update = val
               if "T" in val:
                  d,t = val.split("T")
                  update_date = d.replace("-", "")
                  update_time = t.replace(":", "")
                  update = update_date + update_time
                  val = update
               if "/" in update:
                  d,t = val.split(" ")
                  #print(d,t)
                  m,dd,y = d.split("/")
                  if len(y) == 2:
                     y = "20" + y
                  ttt = t.split(":")
                  m,s = ttt[:2]
                  update_date = y + m + dd
                  update_time = m + s + "00"
                  update = update_date + update_time
                  #print(val, update)
               if "/" in update:
                  update = update.replace("-", "")
                  update = update.replace(":", "")
                  update_date,update_time = update.split(" ")

                  update = update_date + update_time
               val = update
               val = val.replace("-", "")
               val = val.replace(" ", "")
               update = val

               if len(val) != 14:
                  print(field,val, " " , len(val))
                  print(orig_val)
                  exit()

            if field == "Province_State" :
               state = val 
               if state == "Virgin Islands, U.S.":
                  state = "Virgin Islands"
                  state_code = "VI"

               if "," in state and country == "US":
                  city,st = state.split(",")
                  st = st.replace(" ", "")
                  st = st.replace(".", "")
                  if len(st) > 2:

                     st = st.replace("(FromDiamondPrincess)", "")
                  if st == "Washington, D.C.":
                     state_code = "DC"
                     state_name = "Washington, D.C."
                  if state in state_names:
                     state_code = state_names[state]
                     st = state_code
                  if st in state_codes:
                     state_name = state_codes[st]
                     state_code = st
                  else:
                     print("PROB:", st , " not found.")
                     print(row)
                     exit()
               elif state in state_names:
                  state_code = state_names[state]
                  st = state_code
               else:
                  state_code = val

               val = state_code




            if val == "":
               val = 0
            obj[field] = val
         objects.append(obj)



   return(objects)      

def tally_jhu():
        #"Province_State": "Illinois",
        #"Country_Region": "US",
        #"Last_Update": "1/26/20 16:00",
        #"Confirmed": "1",
        #"Deaths": 0,
        #"Recovered": 0
   state_codes, state_names = load_state_names()
   jhu = load_json_file("JHU-USA.json")
   jhs = {} 
   for data in jhu:
      state = data['Province_State']
      state_code = data['Province_State']
      if "Admin2" in data:
         admin2 = data['Admin2']
      else:
         admin2 = ""
      if "Combined_Key" in data:
         combined_key = data['Combined_Key']
      else:
         combined_key = ""
      if "FIPS" in data:
         fips = data['FIPS']
      else:
         fips = ""

      update = data['Last_Update']
      confirmed = data['Confirmed']
      deaths = data['Deaths']
      recovered = data['Recovered']


      if state not in jhs:
         jhs[state_code] = {}
         jhs[state_code]['dates'] = []
         jhs[state_code]['confirmed'] = []
         jhs[state_code]['deaths'] = []
         jhs[state_code]['recovered'] = []
         jhs[state_code]['locality'] = []
         jhs[state_code]['combined_key'] = []
         jhs[state_code]['fips'] = []
      jhs[state_code]['dates'].append(update)
      jhs[state_code]['confirmed'].append(confirmed)
      jhs[state_code]['deaths'].append(deaths)
      jhs[state_code]['recovered'].append(recovered)
      jhs[state_code]['locality'].append(admin2)
      jhs[state_code]['combined_key'].append(combined_key)
      jhs[state_code]['fips'].append(fips)

   save_json_file("JHU-USA-tally.json", jhs)

def import_jhu():
   jhu = []

   jcs = {}

   files = glob.glob("COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/*.csv")
   for file in sorted(files):
      print(file)
      fn = file.split("/")[-1]
      fn = fn.replace(".csv", "")
      m,d,y = fn.split("-")     
      date = y + m + d
      date = int(date)
      datas= load_file(file)
      for data in datas:
         if data['Country_Region'] == "US":
            jhu.append(data)




   fields = ['dates', 'fips', 'lats', 'lons', 'confirmed', 'deaths', 'recovered', 'active', 'combined_key']
   print('country', 'province', 'dates', 'fips', 'lats', 'lons', 'confirmed', 'deaths', 'recovered', 'active', 'combined_key')
   save_json_file("JHU-USA.json", jhu)

def report(state_code = "MD"):
   jh = load_json_file("JHU-USA-tally.json")
   data = jh['MD']
   print("MD")
   print(data)
   for i in range(0,len(data['dates'])):
      print(data['dates'][i])

import_jhu()

tally_jhu()   

report()

