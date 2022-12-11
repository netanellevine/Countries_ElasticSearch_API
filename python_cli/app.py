import time
import requests
import sys

IP = 'http://localhost'
PORT = 3000
DATABASE = 'countries'
params = sys.argv
getFromCoordinates = 'http://localhost:3000/countries/country?text={"coordinates":{"lon":12.9,"lat":-4.78}}'
getFromName = 'http://localhost:3000/countries/id?text=Israel'
populate = 'http://localhost:3000/countries/populate'
delete = 'http://localhost:3000/countries/delete?text=israel'

# print(len(sys.argv))
# print(str(sys.argv))
# print("The value of __name__ is:", repr(__name__))

# response = requests.get(second)
# print(response.json()['data']['values'][0]['country'])
# print(response.json()['data']['values'][0]['id'])
# print(response.json())

# getFromCoordinates = f'{BASE}/{DATABASE}/country?text={"coordinates":{"lon":12.9,"lat":-4.78}}'
# getFromName = 'http://localhost:3000/countries/id?text=Israel'

def populateDB():
    response = requests.get(f'{IP}:{PORT}/{DATABASE}/data/start')
    time.sleep(2)
    print(response.json())

def clearDB():
    response = requests.get(f'{IP}:{PORT}/{DATABASE}/data/clear')
    time.sleep(2)
    print(response.json())



def getCountry():
    if len(params) == 3:  # get by country name

        if params[2] is None or len(params[2]) < 3:
            print("Name is too short!")
            return
        
        request = f'{IP}:{PORT}/{DATABASE}/search/name?text={params[2]}' # todo: change to name
        response = requests.get(request)
        print(response.json())

    elif len(params) == 4:  # get by coordinates
        # todo: add verification maybe
        coordinates = f'{{"coordinates":{{"lon":{float(params[2])},"lat":{float(params[3])}}}}}'
        request = f'{IP}:{PORT}/{DATABASE}/search/point?text={coordinates}' # todo: change to coordinates
        response = requests.get(request)
        print(response.json())
    
    else:
        print("USAGE: python3 app.py get <country_name>\nOR:    python3 app.py get <longitude> <latitude>")

    


def addCountry():
    pass


def deleteCountry():
    pass


def main():

    if len(params) < 2:
        print("You must specify your request!")
        exit(1)
    
    match params[1].lower():
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

        case default:
            print("An error occured!")
            return


if __name__ == "__main__":
    main()

