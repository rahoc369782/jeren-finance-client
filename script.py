import requests as req
from datetime import datetime

# parsing function for the external data
def fetch_parsing_mf(url):
    # Send a GET request to the URL

    response = req.get(url,timeout=10)

    if response.status_code == 200:
        
        content = response.content.decode('utf-8')

        # Split the content into lines
        lines = content.splitlines()

        # Filter out blank lines
        lines_collect = [line for line in lines if line.strip()]

        # Join the list into a single string with newline characters
        data = "\n".join(lines_collect)

        # get specific mutual fund data
        mutual_funds = ["INF740K01OK1","INF179K01XO5","INF179KC1BT3","INF109KC1LJ8","INF769K01DM9","INF204K01XD4","INF204K01J91","INF966L01598","INF109K01Z48","INF966L01663","INF200K01UH9","INF204K01I92","INF209KB1O82","INF174V01507","INF966L01648","INF966L01705","INF247L01999","INF174KA1HV3","INF247L01445","INF109KA1UA0","INF966L01911"]
       
        # mutual funds itretle
        for mf in mutual_funds:
            data = ([line for line in lines_collect if mf in line])
            

            # # Split the string by commas
            if isinstance(data, list):
              split_data = data[0].split(';')
            else:
              split_data = []  # Default case, if data is neither a string nor a list
           
            # Represent the date
            date_string = split_data[len(split_data)-1]
            
            date_object =  datetime.strptime(date_string, '%d-%b-%Y').date()
            exact_required_data = {
                "date": date_object.strftime("%Y/%m/%d"),
                "INF": split_data[1],
                "NAV": split_data[len(split_data)-2]
            }
            writting_file_data(exact_required_data)
         
    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")

def writting_file_data(value):
    # writing file path
    file_path = "test.db"

    # represend file writting data at single line
    data_write = f'P {value["date"]} "{value['INF']}" {value['NAV']}'
   
    # write each data on a file 
    with open(file_path,"a") as file:
        file.write(data_write + "\n")
  
    return;


# URL for all mutual fund data
url = 'https://www.amfiindia.com/spages/NAVAll.txt';

# call main function
fetch_parsing_mf(url);

