# northwind-traders
Northwind Traders MS Access Template v1 semi-automatically migrated to the Web with the help of https://github.com/jam-py/jam-py.

Semi-automated means any Access database can be migrated to a modern SQLite3, and the Front End can be built automatically. Then, one can move to any supported database by automatically loading the data from SQLite3.

If migrating FROM Access Front End only, meaning the database is already MSSQL, all tables can be imported just like from SQLite3, and the Front End can be built automatically.

The Front End can be modified additionally with no-code as well, or with a minimum code for Buttons, Dashboards, Reports, etc.

When the Authentication is enabled for this App, use only “First Name” as Login name, with no password. This is due to using Access Employees migrated table, which has no passwords. The Login Form is defined in index.html, as well as all Front End elements.


More demo aplications on **PythonAnywhere**:

* SAP Theme Demo: https://jampyapp.pythonanywhere.com
* Personal Account Ledger from MS Access template: https://msaccess.pythonanywhere.com
* Northwind Traders from MS Access template: https://northwind.pythonanywhere.com
* The ERP POC Demo with Italian and English translations: https://sem.pythonanywhere.com
* Jam.py Assets/Parts Application (wip) https://jampy.pythonanywhere.com

How to run in *your* environment?
==================================

Download this repo or visit the Web site (on the above right), for the latest Export file.
Then, install Jam.py, start the Application:

```
python server.py
```
The App will run at: ``http://localhost:8080``

Import the downloaded file on ``http://localhost:8080/builder.html`` Application Builder interface.
Or, if downloaded this repo, just start the Application.

Enjoy
