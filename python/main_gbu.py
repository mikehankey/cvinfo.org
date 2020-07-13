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
   print("4) Create Main GBU Page and All States Graphics")  
   print("5) Create Other Main GBU Page (showing Case Fatality, Hospi, Tests, Deaths)")
   print("6) Create All States GBU Pages")  
   print("7) Create Hotspots & Alerts")
   print("8) Create Json files to get access to the daily data from the state/counties maps")
   print("9) Do it all")  
   
   if(len(sys.argv)>1):
      cmd = int(sys.argv[1])
   else:
      cmd = input("Run: ")
      cmd = int(cmd) 

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
      print("CREATING MAIN GBU PAGES AND ALL STATES GRAPHICS")
      states_ranked_by_cases = rank_states('cases')
      generate_gbu_graphs_and_main_page(states_ranked_by_cases)
      print("\n>>>TASK DONE \n\n") 

   elif cmd==5:
      print("CREATING ALL OTHER MAIN GBU PAGES (showing Case Fatality, Hospi, Tests, Deaths)")
      states_ranked_by_cases = rank_states('cases') 
      create_gbu_main_page('hospi',states_ranked_by_cases)
      create_gbu_main_page('test',states_ranked_by_cases)
      create_gbu_main_page('death',states_ranked_by_cases)
      create_gbu_main_page('case_fatality',states_ranked_by_cases)
      
      print("\n>>>TASK DONE \n\n") 
   elif cmd==6:
      print("CREATING ALL STATES GBU PAGE")
      print("Warning: the Main Gbu Page needs to be created first in order to have updated version of the state summary graphs")
      #print("**************************DEBUG MODE *************************")
      #generate_gbu_graphs_and_state_page("CA",rank_counties("CA"))
      #sys.exit()
      for st in US_STATES:
         g = rank_counties(st)
         generate_gbu_graphs_and_state_page(st,g)
      print("\n>>>TASK DONE \n\n") 


   elif cmd==7:
      print("CREATING HOTSPOTS & ALERTS PAGE")
      hotspots,alerts = get_hotspots_and_alerts()
      create_hotspot_page(hotspots)
      create_alert_page(alerts)
      print("\n>>>TASK DONE \n\n") 

   
   elif cmd==8:
      print("CREATE JSON FILES TO ACCESS DAILY DETAILS FROM THE STATE MAPS")
      for st in US_STATES:
         create_daily_county_state_data(st)
         print(st + " done.")
      print("\n>>>TASK DONE \n\n") 

   elif cmd==9:
      print("CREATE ALL GBU PAGES & ALERTS & HOTSPOTS & JSON FILES & MORE!")
       
      update_data_sources()
      create_states_data('') 
      create_county_state_data('')
      
      states_ranked_by_cases = rank_states('cases')
      generate_gbu_graphs_and_main_page(states_ranked_by_cases)
      create_gbu_main_page('hospi',states_ranked_by_cases)
      create_gbu_main_page('test',states_ranked_by_cases)
      create_gbu_main_page('death',states_ranked_by_cases)
      create_gbu_main_page('case_fatality',states_ranked_by_cases)

      for st in US_STATES:
         g = rank_counties(st)
         generate_gbu_graphs_and_state_page(st,g)
         #create_daily_county_state_data(st)

      hotspots,alerts = get_hotspots_and_alerts()
      create_hotspot_page(hotspots)
      create_alert_page(alerts)
     
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