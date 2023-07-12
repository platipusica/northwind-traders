# MS Access Northwind Traders Web Application
Northwind Traders MS Access Template v1, semi-automatically migrated to the Web with help of https://github.com/jam-py/jam-py.

Semi-automated means any Access database can be migrated first to a modern SQLite3, all tables can be imported and the Front End can be built automatically. 

If migrating **FROM** Access Front End only, meaning the database is already MSSQL, all tables can be imported and the Front End can be built automatically.

The Front End can be modified additionally with no-code as well, or with a minimum code for Buttons, Dashboards, Reports, etc. 

The same method is valid for **ANY** supported database. Hence, moving an desktop Application to the Web, which is using the supported database, is now almost completely automated.


More demo applications on **PythonAnywhere**:

* SAP Theme Demo: https://jampyapp.pythonanywhere.com
* Personal Account Ledger from MS Access template: https://msaccess.pythonanywhere.com
* Northwind Traders from MS Access template: https://northwind.pythonanywhere.com
* The ERP POC Demo with Italian and English translations: https://sem.pythonanywhere.com
* Jam.py Assets/Parts Application (wip) https://jampy.pythonanywhere.com

How to run in *your* environment?
==================================

Download this repo or visit the Web site (on the above right), for the latest Export file.
Then, install Jam.py, create new project and start the Application:

```
jam-project.py
python server.py
```
The App will run at: ``http://localhost:8080``

Import the downloaded Export file on ``http://localhost:8080/builder.html`` Application Builder interface.
Or, if downloaded this repo, just start the Application.

When the Authentication is enabled for this App, use only “First Name” as Login name, with no password. This is due to using Access Employees migrated table, which has no passwords. The Login Form is defined in index.html, as well as all Front End elements.


Enjoy
