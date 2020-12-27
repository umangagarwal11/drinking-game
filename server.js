const express = require("express");
const {v4 : uuidv4} = require('uuid');

const app = express();

const server = require("http").Server(app);

const io = require('socket.io')(server);

const {ExpressPeerServer} = require ('peer');
const peerServer = ExpressPeerServer(server, {
  debug:true
});

app.use(express.static('public'));

app.set('view engine','ejs');
app.use(express.urlencoded({extended: false}));

app.use("/play/peerjs", peerServer)

app.get("/", (req,res) => {
  res.render("index");
});

app.get("/play", (req,res) => {
  res.redirect(`/play/${uuidv4()}`);
});

app.get("/play/:room", (req,res) => {
  res.render("room", { roomId: req.params.room });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
  });
});

server.listen(process.env.PORT || 5000);
