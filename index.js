var express=require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('five-in-line'));
var userNum=0;//用来记录在线用户人数
var role=true;//用来分配下棋的身份
var onlineUser={}; //用来存储在线人数及socket的id
io.on('connection', function(socket){
  socket.on('login',function(obj){
    onlineUser[socket.id]=obj;
    //谁来的跟谁分配权限  下黑旗，白旗还是观战
    userNum++;
    if(userNum==1){
        onlineUser[socket.id]=Object.assign(obj,{role:true}); 
    }else if(userNum==2){
        onlineUser[socket.id]=Object.assign(obj,{role:false});
    }else if(userNum>2){
        onlineUser[socket.id]=obj;
    }

    io.to(socket.id).emit('role', onlineUser[socket.id]);//将身份信息（下黑旗还是白旗）传过去
    io.emit('online', onlineUser);//将在线人员名单带过去
    console.log(obj.userName,'is loginning');    
  })
  socket.on('disconnect', function(){
    console.log(socket.id,'disconnected');
    if(onlineUser.hasOwnProperty(socket.id)){//disconnect的时候，将它从onlineUser里删掉
      delete onlineUser[socket.id];
    }
    io.emit('online',onlineUser);//用来同步数据在线人数
    userNum--;
  });
  socket.on('chat message', function(msg){
    // 参数为下到什么坐标和目前是黑方or白方
    console.log(msg.player?'黑方':'白方','落子在: ' + msg.place);
    io.emit('chat message', msg);
  });
  socket.on('reset', function(msg){
    //参数为目前黑旗or白旗
    console.log('清除重来');
    io.emit('reset',msg);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});