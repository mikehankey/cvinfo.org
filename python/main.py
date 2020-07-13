from main_gbu import *
from md_flashcard import *



if __name__ == "__main__":
   os.system("clear")
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

   # MD Specifics
   update_MD_data_sources()
   create_json_MD_data_files()
   create_MD_zip_graphs_and_pages()
   create_MD_watchlists()
   print("\n>>>TASK DONE \n\n") 