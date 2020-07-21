import os
from update_MD_data_src import *
from create_MD_json_data_files import *
from create_MD_zip_graphs import *
from create_MD_watchlists import *

def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update data MD source")   
   print("2) Create JSON files per ZIP code")   
   print("3) Create Graphs per ZIP code & County Pages")   
   print("4) Create MD Zip Watchlists Pages")   
   print("5) Do it all")     

   if(len(sys.argv)>1):
      cmd = sys.argv[1]
   else:
      cmd = input("Run: ") 
      
   try:
      cmd = int(cmd) 
   except ValueError:
      print("\n>>>Unrecognized command \n\n") 
      main_menu()

   if cmd == 1:
      print ("UPDATING MD ZIP DATA.")
      update_MD_data_sources()
      print("\n>>>TASK DONE \n\n") 
   elif cmd == 2:
      print ("CREATING MD JSON FILES.")
      create_json_MD_data_files()
      print("\n>>>TASK DONE \n\n") 
   elif cmd == 3:
      print ("CREATING MD ZIP GRAPHS & PAGES.")
      create_MD_zip_graphs_and_pages()
      print("\n>>>TASK DONE \n\n") 
   elif cmd == 4:
      print ("CREATING MD WATCHLISTS")
      create_MD_watchlists()
      print("\n>>>TASK DONE \n\n")
   elif cmd == 5:
      print ("UPDATING MD ZIP DATA.")
      update_MD_data_sources()
      print ("CREATING MD JSON FILES.")
      create_json_MD_data_files()
      print ("CREATING MD ZIP GRAPHS & PAGES.")
      create_MD_zip_graphs_and_pages()
      print ("CREATING MD WATCHLISTS")
      create_MD_watchlists()
      print("\n>>>TASK DONE \n\n") 

   main_menu()

if __name__ == "__main__":
   os.system("clear")
   main_menu()