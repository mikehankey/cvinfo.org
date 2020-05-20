#!/usr/bin/python3 
import os

DATA_PATH = "./covid-19-intl-data"


# Get Data from 
# https://github.com/owid/covid-19-data/blob/master/public/data/
def update_data_sources():
   
   if not os.path.exists(DATA_PATH):
      os.makedirs(DATA_PATH)

   print("Updating international COVID-19 gitHub data repo.")
   
   # New cases per Million
   os.system("wget https://github.com/owid/covid-19-data/blob/master/public/data/ecdc/new_cases_per_million.csv")

   # New deaths per Million
   os.system("wget https://github.com/owid/covid-19-data/blob/master/public/data/ecdc/new_deaths_per_million.csv")
   
   # Total cases per Million
   os.system("wget https://github.com/owid/covid-19-data/blob/master/public/data/ecdc/total_cases_per_million.csv")

   # Total deaths per Million
   os.system("wget https://github.com/owid/covid-19-data/blob/master/public/data/ecdc/total_deaths_per_million.csv")


def main_menu():
   print("Select Function")
   print("---------------")
   print("1) Update data sources.") 
  
   if cmd == "1": 
      update_data_sources()


if __name__ == "__main__":
   main_menu()