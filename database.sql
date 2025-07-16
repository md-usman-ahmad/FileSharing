create database filesharingproject;
use filesharingproject;
create table users(
	userid int primary key auto_increment,
    firstname varchar(100),
    lastname varchar(100),
    age int,
    email varchar(100),
    password varchar(100)
);
select * from users;
insert into users(firstname,lastname,age,email,password)
values
("usman","ahmad",20,"usman@gmail.com","usman"),
("wasiq","mahfuz",26,"wasiq@gmail.com","wasiq"),
("tabish","mahfuz",28,"tabish@gmail.com","tabish");
delete from users where userid in (1,2,3,4,5);

create table documents(
	docid int primary key auto_increment,
    filename varchar(100),
    uploaderid int,
    FOREIGN KEY (uploaderid) REFERENCES users(userid)
)auto_increment=200;
select * from documents;
insert into documents(filename,uploaderid)
values("image.jpg",1),("car.jpg",1);

select * from documents where filename = 'car.jpg'; 
delete from documents where docid in (100,101);

-- INNER JOIN
select userid,firstname,age,email,password,filename,uploaderid
from  users
inner join documents
on documents.uploaderid =  users.userid;

create table sendfile(
	sendfileid int,
    senderid int,
    receiverid int,
    FOREIGN KEY(sendfileid) REFERENCES documents(docid)
);
select * from sendfile;

select *
from documents
inner join sendfile
on documents.docid = sendfile.sendfileid
where receiverid = 2;

select filename
from documents
inner join sendfile 
on documents.docid = sendfile.sendfileid
where sendfile.senderid = 1;

select *
from users
inner join sendfile
on users.userid = sendfile.senderid
where receiverid = 2;

ALTER TABLE sendfile
ADD FOREIGN KEY (receiverid)
REFERENCES users(userid);


-- ye command poori table ke saare rows permanently delete kar deta hai — bina kisi WHERE clause ke. Ye DELETE FROM tasks; se bhi fast hota hai.
TRUNCATE TABLE users;
TRUNCATE TABLE documents;
TRUNCATE TABLE sendfile;
drop table users;
drop table documents;