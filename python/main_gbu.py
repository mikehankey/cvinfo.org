import time
from create_json_data_files import *
from update_data_src import * 
from create_main_gbu_page import *
from create_state_gbu_pages import *
from hotspots import *
 
 
def main_menu():

   print("---------------")
   print("Select Function")
   print("---------------")
   print("0) Exit") 
   print("1) Update data source")  
   print("2) Clean all states data")  
   print("3) Clean all counties data")  
   print("4) Create Main GBU Page")  
   print("5) Create All States GBU Pages")  
   print("6) Create Hotspots & Alerts")
   print("7) Do it all")  
   
   cmd = input("Run: ")

   try:
      cmd = int(cmd) 
   except ValueError:
      print("\n>>>Unrecognized command \n\n") 
      main_menu()

   if cmd == 1:
      print ("UPDATING DATA.")
      update_data_sources()
      print("\n>>>TASK DONE \n\n") 

   elif cmd== 2:
      print ("CLEANING STATES DATA.")
      #print("**************************DEBUG MODE *************************")
      #create_states_data('CA') 
      create_states_data('') 
      print("\n>>>TASK DONE \n\n") 

   elif cmd== 3:
      print ("CLEANING COUNTIES DATA.") 
      create_county_state_data('')
      print("\n>>>TASK DONE \n\n") 
         
   elif cmd==4:
      print("CREATING MAIN GBU PAGE")
      generate_gbu_graphs_and_main_page(rank_states())
      print("\n>>>TASK DONE \n\n") 

   elif cmd==5:
      print("CREATING ALL STATES GBU PAGE")
      print("Warning: the Main Gbu Page needs to be created first in order to have updated version of the state summary graphs")
      #print("**************************DEBUG MODE *************************")
      #generate_gbu_graphs_and_state_page("CA",rank_counties("CA"))
      #sys.exit()
      for st in US_STATES:
         g = rank_counties(st)
         generate_gbu_graphs_and_state_page(st,g)
      print("\n>>>TASK DONE \n\n") 


   elif cmd==6:
      print("CREATING HOTSPOTS & ALERTS PAGE")
      hotspots,alerts = get_hotspots_and_alerts()
      create_hotspot_page(hotspots)
      create_alert_page(alerts)
      print("\n>>>TASK DONE \n\n") 

   elif cmd==7:
      print("CREATE ALL GBU PAGES & ALERTS & HOTSPOTS")
      start_time = time.time()
      update_data_sources()
      create_states_data('') 
      create_county_state_data('')
      generate_gbu_graphs_and_main_page(rank_states())
      for st in US_STATES:
         g = rank_counties(st)
         generate_gbu_graphs_and_state_page(st,g)
      hotspots,alerts = get_hotspots_and_alerts()
      create_hotspot_page(hotspots)
      create_alert_page(alerts)
      print("Execution time: %s seconds" % (time.time() - start_time))
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