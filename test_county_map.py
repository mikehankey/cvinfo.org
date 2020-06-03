from urllib.request import urlopen
import json 



with urlopen('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json') as response:
    counties = json.load(response)

print("COUNTIES OPEN")

import pandas as pd
df = pd.read_csv("./covid-19-intl-data/US/ranks/2020-05-24_tcpm.csv",
                   dtype={"fips": str})

print("DATA READ")

import plotly.express as px 
import plotly.io as pio

pio.orca.config.executable = '/home/vagrant/anaconda3/bin/python'
pio.orca.config.use_xvfb = False

fig = px.choropleth(df, geojson=counties, locations='fips', color='tcpm',
                         color_continuous_scale = 'Reds',   
                        labels={'ncpm':'Total Case Per Million'},
   )


fig.update_geos(fitbounds="locations", visible=False)         
fig.update_layout(
   title_text = 'Total Case Per Million - 2020-05-24',
   margin={"r":0,"t":0,"l":0,"b":0})
fig.write_html("test.html")