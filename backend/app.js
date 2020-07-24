require('./config/config');
require('./models/db');
require('./config/passportConfig');

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const passport = require('passport');

const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const rtsIndex = require('./routes/index.router');
const {
    isRealString
} = require('./utils/isRealString');
const {
    Users
} = require('./utils/users');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(passport.initialize());
app.use('/api', rtsIndex);
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");


const {
    generateMessage,
    generateLocationMessage
} = require('./utils/message');

const publicPath = path.join(__dirname, './public');
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
app.use(express.static(publicPath));

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// middleware
app.use(passport.initialize());

// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    } else {
        console.log(err);
    }
});

app.use(express.static(__dirname + "/views"));

io.on('connection', (socket) => {
    console.log("A new user just connected");

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room are required');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', `Welocome to ${params.room}!`));

        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"));

        callback();
    })

    socket.on('createMessage', (message, callback) => {
        var datagram = new User();
        datagram.message = message.text;
        e
        datagram.save()
        console.log(datagram, "dil ka dariya bah hi gaya")

        let user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {

            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback('This is the server:');
    })

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.lat, coords.lng))
        }
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))
        }
    });
});

// start server
const port = process.env.PORT
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})