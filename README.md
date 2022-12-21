# Countries_ElasticSearch_API


# Overview 
In this project, I created a Rest-API in node.js, Command Line Interface in python and used ElasticSearch as the database.  
I've created 5 docker containers (elasticsearch, node, python, kibana, logstash) that are interacting within the docker-network.
The database contains 178 countries as a geojson files and the API allows to perform regular CRUD operations and GET country from a given coordinate.  
 [link to the original DB](https://github.com/glynnbird/countriesgeojson)

___
# How to use

Let's begin with cloning the repository.

```
git clone https://github.com/netanellevine/countries_ElasticSearch_API && cd countries_ElasticSearch_API
```

Then you need to download and build the docker images:
```
docker-compose up --build
```
After running this command you will start seeing the procces of building the docker containers  
and connecting to the Elastic Search database.  
After you see the lines:  
```
Server ready on port 3000.  
Started to listen...
```
It means that now the dockers are connected within their inner network and we can start.

### There are 3 ways you can interact with the database:
1) **Python CLI** - Command Line Interface
2) **Web browser/Postman** to the database
3) **Kibana** - Easy and user friendly way to interact with the database
_____
## Web browser
In order to use this option you can go to your default web browser or download **Postman** extension.  

The domain is: ```http://localhost:3000``` .  
The index name is: ```countries``` .  
Now you can choose which requests you want to perform.   
To **POPULATE** the database with the countries:
```
http://localhost:3000/countries/data/start
```  

To **CLEAR** the database from the countries:
 ```
 http://localhost:3000/countries/data/clear
 ```  

To **COUNT** the amount of countries in the database:
```
http://localhost:3000/countries/count
```  

For **GET** requests you need to add ```/search``` after the port number and then to choose between  
```/point``` or ```/name``` and add the desired query as text for example:
```
http://localhost:3000/countries/search/name?text=israel
``` 
to search by a given name.  
```
http://localhost:3000/countries/search/point?text={"coordinates":{"lon":12.9,"lat":-4.78}}
``` 
to search by a given coordinates.  

The **DELETE** and **POST** requests can't be done with the web browser because those requests should have body, so for   
those operations you must use the Postman extension.
Type the same url as mentioned above.   
In the **HEADER** section put as the key ```Content-Type``` and the value ```application/json```.  
Now let's move to the body.   
For **DELETE** requests the body should look like this format for example:
```
{
"name": "angola"
}
```
For **POST** requests the body should look like this format for example:
```
{
	"_index": "countries",
	"_type": "_doc",
	"name": "countryName",
	"geometry":
	{
		"type": "LineString",
		"coordinates": [[35.221, 31.803],[35.01, 31.2]]
	}
}
```
After clicking **send** you would see the response whether it was **sucesss** or **failed**  




_____
## Python CLI
In order to use this option you need to have a python installed in your PC.  
Now you need to open a new terminal window, in the cuurent terminal window click:  
```
ctrl+shift+t  -> dont forget to hold down the ctrl and shfit keys until you press the t button   
```

In the new terminal type:
```
docker exec -it python-cli bash
```
You will immediately see that now your path looks different this is because you are now working inside the ```python_cli``` terminal.   
To start you need to choose one of the following commands:   

->  Use to get the correct usage and syntax for this API
```
python3 app.py --help
```
->  Use to **POPULATE** the databse
```
python3 app.py populate 
```
->  Use to **CLEAR** all the documents from the database
```
python3 app.py clear      
```
->  Use to **COUNT** the amount of countries in the DB
```
python3 app.py count
```
->  Use to **GET** a country from a point
```
python3 app.py get <longitude> <latitude>
```
 ->  Use to **GET** a country from a name
```
python3 app.py get <country_name>
```
->  Use to **DELETE** a country
```
python3 app.py delete <country_name>
```
->  Use to **POST** a new country 
```
python3 app.py add -n <country_name> -s <type_of_shape> -c <list_of_coordinates 
```
For example python3 app.py add -n myCountry -s LineString -c [[35.221, 31.803],[35.01, 31.2]]

___
