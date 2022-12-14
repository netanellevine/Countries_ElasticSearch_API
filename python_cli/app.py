import argparse
import requests
import json
import sys

ENDPOINT = 'http://api'
PORT = 3000
DATABASE = 'countries'
HEADERS = {"Content-Type": "application/json"}

params = sys.argv

# my location -  lon: 35.212 lat: 31.803



def print_allUSAGE():
    print("USAGE: python3 app.py populate   ->  Use to populate the databse")
    print("OR:    python3 app.py clear      ->  Use to remove all the documents from the database")
    print("OR:    python3 app.py count      ->  Use to get the amount of countries in the DB")
    print("OR:    python3 app.py get <longitude> <latitude>   ->  Use to get a country from a point")
    print("OR:    python3 app.py get <country_name>           ->  Use to get a country from a name")
    print("OR:    python3 app.py delete <country_name>        ->  Use to delete a country")
    print("OR:    python3 app.py add -n <country_name> -s <type_of_shape> -c <list_of_coordinates   ->  Use to add a new country \nFor example python3 app.py add -n Mobileye -s LineString -c [[35.221, 31.803],[35.01, 31.2]]\n\n")
    


def print_respone(res):
    print(json.dumps(res.json(), indent=4))



def populateDB():
    if len(params) == 2:
        url = f'{ENDPOINT}:{PORT}/{DATABASE}/data/start'
        response = requests.get(url, timeout=10)
        print_respone(response)
    else:
      print("Too much arguments!\n USAGE: python3 app.py populate \n\n")  



def clearDB():
    if len(params) == 2:
        url = f'{ENDPOINT}:{PORT}/{DATABASE}/data/clear'
        response = requests.get(url, timeout=10)
        print_respone(response)
    else:
      print("Too much arguments!\n USAGE: python3 app.py clear \n\n")  



def getCountry():
    if len(params) == 3:  # get by country name

        if params[2] is None or len(params[2]) < 3 or not params[2].replace(" ", "").isalpha():
                print("ERROR with get country!")
                print("USAGE: python3 app.py get <country_name>\nOR:    python3 app.py get <longitude> <latitude>\n\n")
                return

        url = f'{ENDPOINT}:{PORT}/{DATABASE}/search/name?text={params[2]}'
        response = requests.get(url, timeout=10)
        print_respone(response)

    elif len(params) == 4:  # get by coordinates
        # todo: add verification maybe
        coordinates = f'{{"coordinates":{{"lon":{float(params[2])},"lat":{float(params[3])}}}}}'
        url = f'{ENDPOINT}:{PORT}/{DATABASE}/search/point?text={coordinates}'
        response = requests.get(url, timeout=10)
        print_respone(response)
    
    else:
        print("USAGE: python3 app.py get <country_name>\nOR:    python3 app.py get <longitude> <latitude>\n\n")

    

def addCountry():
    name = shape = coords = last =''

    # Extract the args to their matching names
    for i in range(len(params[1:])):
        if last == '-n':
            name = params[i]
        elif last == '-s':
            shape = params[i]
        elif last == '-c':
            coords = "".join(params[i:])
            break
        last = params[i]

    coordinates = []
    coords = coords[1:-1]
    ind = 0
    # Parse the coordinates to a list of floats
    while ind < len(coords):
        curr = coords[ind]
        if curr == '[':
            curr = ''
            temp = coords[ind + 1] 
            while temp != ']':
                curr += temp
                ind += 1
                temp = coords[ind + 1] 
            res = [float(idx) for idx in curr.split(',')]
            coordinates.append(res)
        ind += 1

    body = {
        "_index": DATABASE,
        "_type": "_doc",
        "name": name.lower(),
        "geometry":
        {
            "type": shape.capitalize(),
            "coordinates": coordinates
        }
    }
    
    url = f'{ENDPOINT}:{PORT}/{DATABASE}/insert/single/data'
    response = requests.post(url, json=body, timeout=10)
    print_respone(response)



def deleteCountry():
    if len(params) == 3:
        body = json.dumps({"name": params[2]})
        url = f'{ENDPOINT}:{PORT}/{DATABASE}/delete/data'
        response = requests.delete(url, data=body, headers=HEADERS, timeout=10)
        print_respone(response)
    else:
      print("ERROR with delete country!\nUSAGE: python3 app.py delete  <country_name>\n\n")  



def countCountries():
    if len(params) == 2:
        url = f'{ENDPOINT}:{PORT}/{DATABASE}/count'
        response = requests.get(url, timeout=10)
        print_respone(response)
    else:
        print("Too much arguments!\n USAGE: python3 app.py count \n\n")  



def main():

    if len(params) < 2:
        print("You must specify your request!")
        print_allUSAGE()
        exit(1)
    try:
        match params[1].lower():
            case '--help':
                print_allUSAGE()
                return
            case 'populate':
                populateDB()
                return

            case 'clear':
                clearDB()
                return

            case 'add':
                addCountry()
                return

            case 'get':
                getCountry()
                return

            case 'delete':
                deleteCountry()
                return
            
            case 'count':
                countCountries()
                return

            case default:
                print("An error occured!")
                print_allUSAGE()
                return
    except:
        print(ConnectionError)
        print("Connection refused!")
        print("Wait for the connection to be ready!")


if __name__ == "__main__":
    main()

