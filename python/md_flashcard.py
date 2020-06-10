import os
from update_MD_data_src import *
from create_json_MD_data_files import *

def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update data MD source")   
   print("2) Create JSON files per ZIP code")   
   cmd = input("Run: ")

   try:
      cmd = int(cmd) 
   except ValueError:
      print("\n>>>Unrecognized command \n\n") 
      main_menu()

   if cmd == 1:
      print ("UPDATING DATA.")
      update_MD_data_sources()
      print("\n>>>TASK DONE \n\n") 
   elif cmd == 2:
      print ("CREATING JSON FILES.")
      create_json_MD_data_files()
      print("\n>>>TASK DONE \n\n") 

   main_menu()

if __name__ == "__main__":
   os.system("clear")
   main_menu()