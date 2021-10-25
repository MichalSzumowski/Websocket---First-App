const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();
const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000');
}); 

app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.use((req, res) => {
  res.status(404).send('404 not found...');
});

const messages = [];
const users = [];

const io = socket(server);

io.on('connection', (socket) => {
  socket.on('login', (login) => {
    users.push({ login, id: socket.id });
    socket.broadcast.emit('newUser', {
      author: 'Chat Bot',
      content: `${login} has joined the conversation!`,
    });
  });

  socket.on('message', (message) => {
    messages.push(message);
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    const leavingUser = users.find((user) => user.id == socket.id);
    const userIndex = users.indexOf(leavingUser);
    if (leavingUser) {
      socket.broadcast.emit('userLeft', {
        author: 'Chat Bot',
        content: `${leavingUser ? leavingUser.login : 'user'
          } has left the conversation!`,
      });
      users.splice(userIndex, 1);
    }
  });
});

