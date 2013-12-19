echo "---------------clear the Current table"
mysql -u "harrygao" -ptopview1 "promotion" < clearCurrent.sql
echo "---------------insert new data"
mysql -u "harrygao" -ptopview1 "promotion" < ../scraper/insert.sql
mysql -u "harrygao" -ptopview1 "promotion" < updateTime.sql
echo "---------------stop searchd"
sudo /usr/local/sphinx/bin/searchd --stop
sleep 3
echo "---------------re-index"
sudo /usr/local/sphinx/bin/indexer --all
sleep 5
echo "---------------starting server"
sudo /usr/local/sphinx/bin/searchd
~                                      