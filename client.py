import pymongo
con = pymongo.Connection(host='127.0.0.1', port=3002)
con.database_names()
