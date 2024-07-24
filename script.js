const socket=io('http:localhost:3000')

socket.on('user-info',data=>{
    console.log(data.id,data)
})