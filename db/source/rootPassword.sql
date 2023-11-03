ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'xsql';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'xsql';
FLUSH PRIVILEGES;
