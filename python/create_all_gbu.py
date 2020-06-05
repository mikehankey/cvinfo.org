from create_json_data_files import *
from update_data_src import * 
from create_main_gbu_page import *
 
 
def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update data source")  
   print("2) Clean all data")  
   print("3) Create Main GBU Page")  
   
   cmd = input("Run: ")
   cmd = int(cmd) 

   if cmd == 1:
      print ("UPDATING DATA.")
      update_data_sources()
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 2:
      print ("CLEANING DATA.")
      create_states_data('')
      create_county_state_data()
      print("\n>>>TASK DONE \n\n") 
   elif cmd==3:
      print("CREATING MAIN GBU PAGE")
      generate_gbu_graphs_and_main_page(rank_states())
      print("\n>>>TASK DONE \n\n") 
   elif cmd== 0:
      print("Exit.")
      sys.exit(0) 
   else:
      print("\n*>>>ERROR: Command Not Found \n\n")
      
   main_menu()

if __name__ == "__main__":
   os.system("clear")
   main_menu()