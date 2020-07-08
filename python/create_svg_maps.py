import json
import glob
from utils import *

def make_svg_state_map(state_code):
 
   # Open State Json Data file
   tmp_json    = open(zip_file,  'r')
   data        = json.load(tmp_json)
   tmp_json.close()
   pop = data['sum']['pop']

   # We need all the counties json files of the state
   all_counties = glob.glob(US_STATES_DATA_PATH + os.sep + state_code + os.sep + "*.json")

   # We combine all the counties data for the cases



   # # We need the SVG template of the corresponding state
   # svg_template = open(SVG_TEMPLATES + state_code + '.svg',"r")
   # svg_code = ""
   



   # # REAL SVG with classes
   # fname = open(fname_tmplate, "r")
   # svg_code = ""
   # for line in fname:

   #    if "FIPS_" in line:
   #       for fips,rgb,cssClass in data:
           
   #          #if "fill" not in line: 
   #          line = line.replace("id=\"FIPS_" + fips + "\"", "id=\"FIPS_" + fips + "\" class=\"cl_" + str(cssClass) + "\"")
   #    svg_code += line
   # fname.close()

   # # We save it
   # outsvg = outfile.replace(".png", ".svg")
   # out = open(outsvg, "w")
   # out.write(svg_code)

 
   # # SVG FOR PNG
   # fp = open(fname_tmplate, "r")
   # svg_code = ""
   # lc = 0
   # for line in fp:
   #    if "FIPS_" in line:
   #       for fips,rgb,cssClass in data: 
   #          color = str(int(rgb[0]*255)) + "," + str(int(rgb[1]*255)) + "," + str(int(rgb[2]*255)) + "," + str(1)
   #          line = line.replace("id=\"FIPS_" + fips + "\"", "id=\"FIPS_" + fips + "\" fill=\"rgba(" + color + ") \" stroke=\"#C0C0C0\" stroke-width=\".1\"")
           
   #    svg_code += line

   # fp.close()