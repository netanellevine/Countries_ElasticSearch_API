# Countries_ElasticSearch_API

___
## How to use

Let's begin with cloning the repository.

```
git clone https://github.com/netanellevine/countries_ElasticSearch_API && cd countries_ElasticSearch_API
```

Then we would like to download and build the docker images:
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

Now we need to open a new terminal window, in the cuurent terminal window click:  
```
ctrl+shift+t  -> dont forget to hold down the ctrl and shfit keys until you press the t button   
```

In the new terminal type:
```
docker exec -it python-cli bash
```
You will immediately see that now your path looks different this is because you are now working inside the ```python_cli``` terminal.   
To start you need to choose one of the following commands:
```
python3 app.py 
```
and choose one of the following:   
->  Use to get the correct usage and syntax for this API
```
python3 app.py --help
```
->  Use to populate the databse
```
python3 app.py populate 
```
->  Use to remove all the documents from the database
```
python3 app.py clear      
```
->  Use to get the amount of countries in the DB
```
python3 app.py count
```
->  Use to get a country from a point
```
python3 app.py get <longitude> <latitude>
```
 ->  Use to get a country from a name
```
python3 app.py get <country_name>
```
->  Use to delete a country
```
python3 app.py delete <country_name>
```
->  Use to add a new country 
```
python3 app.py add -n <country_name> -s <type_of_shape> -c <list_of_coordinates 
```
For example python3 app.py add -n myCountry -s LineString -c [[35.221, 31.803],[35.01, 31.2]]

___
