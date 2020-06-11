import os
import glob
from utils import *


def create_MD_zip_graphs():
   
   # Initial Directory
   zip_folder = PATH_TO_STATES_FOLDER + os.sep + "MD" + os.sep + "zips" 

   # All zip files
   all_zip_files = glob.glob(zip_folder + os.sep + "*.json")

   #for zip_file in all_zip_files:
