Read a file from the path set in env file, this app can be used to read log files from server wihout server access.

Security - 
 API key enabled 
 Only Get requests 
 Path set in env file, it only read from the path that is set in env 

ENV Variables -
```
  ABSOLUTE_PATH=C:\Users\EverdreamSoft\Downloads\
  API_AUTH_ENABLED=true
  API_KEY=your_secret_api_key
  PORT=3000
```

Request -
```
This will read last 10 lines of file named prod.logs from the "ABSOLUTE_PATH"
http://localhost:3000/?file=prod.logs&n=10
```

```
This will download the file named prod.logs
http://localhost:3000/?file=prod.logs
```
