const express = require('express');
const app = express();
const PORT = 8000;
app.listen(PORT, function () {
    console.log("Server is working");
})


let bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))

// app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

const cors = require('cors');
app.use(
    cors({
        origin: '*'
    })
)
let mysql = require("mysql2/promise");
let bcrypt = require("bcrypt");
const SALTROUNDS = 5;
let jwt = require("jsonwebtoken");
const SECRET = "BATMAN";
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
app.use(cookieParser());

app.use(fileUpload({
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    // abortOnLimit: true, // agr file size limit s zyada to yhi se response=error seedha .catch me jayga route tk pohchega hi niii because its middleware.
    createParentPath: true
}))

let connection, query, arr, outputFromDB,payload;


app.get("/upload",function(request,response){
    response.render("upload.ejs");
})

app.post('/upload',async function (request, response) {
    try {
        console.log("request.files = ",request.files);
        if(request.files){
            const uploadingFileOnServer = request.files.foo;
            if(uploadingFileOnServer.truncated === false){
                uploadingFileOnServer.mv(__dirname + '/uploads/' + uploadingFileOnServer.name, function (error) {
                    if (error) {
                        console.log("mv error = ", error);
                        return response.status(500).send("Server error during file save.");
                    }
                    console.log("file uploaded on server");
                })

                // acquiring userid of  currentLoggedInUser  
                payload = jwt.verify(request.cookies.token,SECRET);
                console.log("payload = ",payload);

                // Saving uploadedfile into database, documents-table(2nd)
                connection = await dbConnection();
                query = `insert into documents(filename,uploaderid) values(?,?)`;
                arr = [uploadingFileOnServer.name , payload.userid]
                await dbQuery(connection,query,arr);
                response.status(200).send({
                    message : "uploaded into database Successfully",
                    downloadUrl : "http://localhost:8000/download?fileName=" +   uploadingFileOnServer.name
                })
            } else {
                throw "ERROR!!! File size exceeded than given limit"    
            }    
        } else{
            throw "ERROR!!! The request cannot be fulfilled because client(frontend) didnt gave input to server(backend)"
        }
    } catch (error) {
        console.log("error in /upload = ",error);
        response.status(400).send(error)
    }
})
app.get("/download",function(request,response){
    console.log("request.query = ",request.query);    
    console.log("request.query.fileName = ",request.query.fileName);    
    response.download(__dirname + "/uploads/" + request.query.fileName);
})

app.get("/signup", function (request, response) {
    response.render("signup.ejs");
})
app.post("/signup", async function (request, response) {
    try {
        console.log("request.body = ", request.body);
        connection = await dbConnection();
        if (request.body.firstname && request.body.lastname && request.body.age && request.body.email && request.body.password) {
            query = `select * from users where email = ?`;
            arr = [request.body.email];
            outputFromDB = await dbQuery(connection, query, arr);
            if (outputFromDB[0].length === 0) {
                query = `insert into users(firstname,lastname,age,email,password) values(?,?,?,?,?)`;
                arr = [
                    request.body.firstname,
                    request.body.lastname,
                    request.body.age,
                    request.body.email,
                    bcrypt.hashSync(request.body.password, SALTROUNDS)
                ]
                await dbQuery(connection, query, arr);
                response.send({
                    message: "User added"
                })
            } else {
                throw {
                    message: "User already exist!! Try different email."
                }
            }
        } else {
            throw {
                message: "Kindly fill in all the credentials listed above."
            }
        }
    } catch (error) {
        response.status(500).send(error);
    }
})

app.get("/login", function (request, response) {
    response.render("login.ejs");
})
app.post("/login", async function (request, response) {
    try {
        console.log("request.body = ", request.body)
        connection = await dbConnection();
        console.log("Connection successfull /login");
        if (request.body.email && request.body.password) {
            query = `select * from users where email = ?`;
            arr = [request.body.email];
            outputFromDB = await dbQuery(connection, query, arr);
            if (outputFromDB[0].length !== 0) {
                if (bcrypt.compareSync(request.body.password, outputFromDB[0][0].password)) {
                    response.cookie("token", jwt.sign({ userid: outputFromDB[0][0].userid }, SECRET));
                    response.send({
                        message: "Login Successfull"
                    });
                } else {
                    throw {
                        message: "invalid password"
                    }
                }
            } else {
                throw {
                    message: "Authentication Failed!!! This user doesn't exist in our database"
                }
            }
        } else {
            throw {
                message: "Kindly fill in all the credentials listed above."
            }
        }

    } catch (error) {
        response.status(500).send(error);
    }
})

app.get("/home", async function (request, response) {
        console.log("request.cookies /home = ",request.cookies);
    if (request.cookies.token) {
        payload = jwt.verify(request.cookies.token, SECRET);
        console.log("payload = ",payload);
        connection = await dbConnection();

        // getting  the Name of currentLoggedInUser just for greeting purpose
        query = `select * from users where userid = ?`;
        arr = [payload.userid];
        outputFromDB = await dbQuery(connection,query,arr);
        console.log("outputFromDB[0] = ",outputFromDB[0]);

        // getting all the uploaded files on server&&database by currentLoggedInUser 
        query = `select * from documents where uploaderid = ?`;
        let currentLoggedInUserUploads = await dbQuery(connection,query,arr);
        console.log("currentLoggedInUserUploads[0] on server&&database = ",currentLoggedInUserUploads[0]);
        response.render("home.ejs", {
            isLoggedIn: outputFromDB[0][0].firstname,
            arr : currentLoggedInUserUploads[0]
        })
    } else {
        response.render("home.ejs", {
            isLoggedIn: ""
        })
    }
})

app.get("/allUsersInModal",async function(request,response){
    connection = await dbConnection();
    query = `select * from users`;
    arr = [];
    let allUsers = await dbQuery(connection,query,arr);
    console.log("getting each&every user from database(from users table) = ",allUsers[0]);
    response.send(allUsers[0]);
})

app.delete("/deletefile",async function(request,response){
    try {
        console.log("request.body.docid : ",request.body.docid);
        let connection = await dbConnection();
        let query = `delete from documents where docid = ?`  ;``
        let arr = [request.body.docid];
        await dbQuery(connection,query,arr)
        response.status(200).send("file deleted ");
    } catch (error) {
        console.log("error");
        response.status(500).send(error);
    }
})

app.post("/sendfile",async function(request,response){
    try {
        console.log("/sendfile request.body = ",request.body);
        payload = jwt.verify(request.cookies.token,SECRET);
        console.log("/sendfile payload =",payload);
        connection = await dbConnection();
        query = `insert into sendfile(sendfileid,senderid,receiverid) values(?,?,?)`;
        arr = [request.body.sendfileid , payload.userid , request.body.receiverUserId];
        await dbQuery(connection,query,arr);
        response.status(200).send("done");
    } catch (error) {
        response.status(500).send(error);
    }
})

app.get("/filesSent", async function(request,response){
    if(request.cookies.token){
        //getting files'id from sendfile Table(3rd) which are shared by currentLoggedInUser to other users.
        console.log("/filesSent request.cookies = ",request.cookies);
        payload = jwt.verify(request.cookies.token,SECRET);
        connection = await dbConnection();
        query = `select sendfileid from sendfile where senderid = ?`;
        arr =  [payload.userid];
        let fileid = await dbQuery(connection,query,arr);
        console.log("id of files sent by currentLoggedInUser = ",fileid[0]);
                                    
        //getting files'names from documentsTable(2nd) which are shared by currentLoggedInUser to other users.
        query = `select filename
                from documents
                inner join sendfile 
                on documents.docid = sendfile.sendfileid
                where sendfile.senderid = ? `
        arr = [payload.userid];
        let filenames = await dbQuery(connection,query,arr);
        console.log("name of files sent by currentLoggedInUser",filenames[0]);


        //getting receivers'names from Users Table(1st) which are shared by currentLoggedInUser to other users.
        query = `select firstname
                from users
                inner join sendfile
                on users.userid = sendfile.receiverid
                where sendfile.senderid = ?`
        arr = [payload.userid];
        let receivernames = await dbQuery(connection,query,arr);
        console.log("name of receiver people sent by currentLoggedInUser",receivernames[0]);

        response.render("filesSent.ejs",{
            arr_fileid : fileid[0],
            arr_filenames : filenames[0],
            arr_receivernames : receivernames[0]
        });
    } else{
        response.redirect("http://localhost:8000/home");
    }
})

app.get("/filesReceived",async function(request,response){
    if(request.cookies.token){
        try {
            connection = await dbConnection();
            //getting files'id from sendfile Table(3rd) which are shared to me(currentLoggedInUser) by other users.
            query = `select sendfileid from sendfile where receiverid = ?`
            arr = [payload.userid];
            let fileid = await dbQuery(connection,query,arr);
            console.log(`getting all the fileid sent to me by other users = `,fileid[0]);

            //getting file's name from documents Table(2nd) which are shared to me(currentLoggedInUser) by other users.
            query = `select filename
                     from documents
                     inner join sendfile
                     on documents.docid = sendfile.sendfileid
                     where receiverid = ?
                    `
            // arr = [payload.userid];
            let filenames = await dbQuery(connection,query,arr);
            console.log("getting all the filenamess sent to me by other users = ",filenames[0]);

            //getting sender'names from Users Table(1st) which are shared to me(currentLoggedInUser) by other users.
            query = `select firstname
                    from users
                    inner join sendfile
                    on users.userid = sendfile.senderid
                    where receiverid = ?
                    `
            // arr = [payload.userid];
            let sendernames = await dbQuery(connection,query,arr);
            console.log("name of sender people sent to me(currentLoggedInUser)",sendernames[0]);
            
            response.render("filesReceived.ejs",{
                arr_fileid : fileid[0],
                arr_filenames : filenames[0],
                arr_sendername : sendernames[0]
            })
        } catch (error) {
            response.status(500).send(error);
        }
    } else{
        response.redirect("http://localhost:8000/home");
    }

})

app.post("/logout", function (request, response) {
    console.log("request.cookies before = ",request.cookies);
    response.clearCookie('token') // key ka naam strings me daalo
    console.log("request.cookies after = ",request.cookies);
    // How clearCookie works
    // response.setHeader('Set-Cookie','token=5000;Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    response.send({
        message: "Logout successful",
    });
})

async function dbConnection() {
    try {
        return await mysql.createConnection({
            host: "127.0.0.1",
            port: 3306,
            user: "root",
            password: "Ch4riz@rd",
            database: "filesharingproject"
        })
    } catch (error) {
        throw error
    }
}
async function dbQuery(connection, query, arr) {
    try {
        return await connection.query(query, arr);
    } catch (error) {
        throw error
    }
}