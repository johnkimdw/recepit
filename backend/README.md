## To run the backend

1. Install dependencies: `pip install -r requirements.txt`
2. Make sure you are in the directory `backend`
3. Run the backend: `python3 -m app.run`

## To setup Oracle DB backend (if it is down)

1. SSH into you're VM
2. switch user to the oracle db (su oracle)
3. lsnrctl status
4. if not listening, do lsnrctl start and note the port
5. in the app.core.config, update port if it is different from 1539
6. check ip address of VM too if it has changed: curl icanhazip.com
7. if it is different, update it in app.core.config
8. if the ports are open but oracle isn't working, su oracle and login as sysdba: sqlplus / as sysdba
9. do: STARTUP <-- should work after this

Tip: if your .env file has the DATABASE_URL attribute, please remove it or comment it out.
