console.log('hjj')
const express=require('express')
const app=express()
const http=require('http').Server(app)
const io =require('socket.io')(http)
const port=3000
app.set('views','./views')
app.set('view engine','ejs')
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))
var user={}
// app.get('/',(req,res)=>{
//     res.sendFile('G:/node/socketchat/public/chat.html')
    // })
    const rooms={name:{}}
    app.get('/',(req,res)=>{
        res.render('index',{rooms:rooms})
    })
    app.get('/:room',(req,res)=>{
       if(rooms[req.params.room]==null){
        return res.redirect('/')
       }
        res.render('room',{roomName:req.params.room})
        io.emit('roomcreated',req.params.room)// i am change that code today
   })
   app.post('/room',(req,res)=>{
    if(rooms[req.body.room]!=null){
        res.render('/')
    }
    rooms[req.body.room]={user:{}}
    res.redirect(req.body.room)
  
})
var user={}
io.on('connection',socket=>{
    // socket.broadcast.emit('user','new user connected')
    socket.on('username', (room, name) => {
        socket.join(room);
        rooms[room].user[socket.id] = name;
        const targetRoom = io.sockets.adapter.rooms.get(room);
        console.log('target',targetRoom)
        if (targetRoom) {
            io.to(room).emit('sent-username', name);
        } else {
            console.error(`Room ${room} not found.`);
        }
    });

    
    socket.on('inputmsg', (room, data) => {
        console.log('usermsg', room, data);
        const targetRoom = io.sockets.adapter.rooms.get(room);
        if (targetRoom) {
            socket.to(room).emit('sentmsg', { message: data, name: rooms[room].user[socket.id] });
            console.log('usemsg', user);
        } else {
            console.error(`Room ${room} not found.`);
        }
    });
    
      // any one client leave the application diconnect event emit 
        socket.on('disconnect', () => {
            getuserrooms(socket).forEach(room => {
                io.to(room).emit('userDisconnect', rooms[room].user[socket.id]);
                delete rooms[room].user[socket.id];
            });
        });
        
       
    })

    
    function getuserrooms(socket) {
        return Object.entries(rooms).reduce((names, [name, room]) => {
            if (room && room.user &&room.user[socket.id] != null) {
                names.push(name);
            }
            return names;
        }, []);
    }
    


http.listen(port,()=>{
    console.log(`app is runing in port ${port}`)
 })




