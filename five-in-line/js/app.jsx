var wrap=document.getElementById('wrap');
var login=document.getElementsByClassName('login')[0];
var value=login.getElementsByTagName('input')[0];
var socket;
value.focus();
value.onkeydown = function(e){
e = e || event;
if (e.keyCode === 13 && this.value) {
    login.style.display='none';
    wrap.style.display='block';
    socket=io();
    socket.emit('login',{'userName':this.value});
    ReactDOM.render(<Board />,
    document.getElementById('wrap'))
}
}
//刷新按钮
function Reset(props){
   return(
      <button onClick={() => props.onClick()} className='reset'>
         重新开局
      </button>
   )
}
function Unit(props){
   return(
      <div className={props.style} onClick={() => props.onClick()}></div>
   )
}
//在线人数
function OnlinePlayer(props){
  let arr=[];
  for(let key in props.online){
     arr.push(props.online[key]);
  }
   return(
         <div className='online'> 
              {arr.map(function(value,index){
                  
                    if(value.hasOwnProperty('role') && value.role){
                         return <div key={index} className='clearfix'>
                                    
                                    <Unit style='unit unit-b' />
                                    <div className='fl'>{value.userName}</div>
                                </div>
                    }else if(value.hasOwnProperty('role') && !value.role){
                         return  <div key={index} className='clearfix'>
                                    
                                    <Unit style='unit unit-w' />
                                    <div className='fl'>{value.userName}</div>
                                </div>
                    }else{
                         return  <p key={index}>{value.userName} ：在观战</p>
                    }
              })
           }
        </div>
    )
}
//玩家切换
function Turn(props){
    var result;
    if(props.turn){
        result=<div className='turn'><strong>BLACK</strong></div>
    }else{
        result=<div className='turn'><strong>WHITE</strong></div>
    }
    return(
       result
    )
}
//主棋盘
class Board extends React.Component{
  constructor() {
    super();
    this.state = {
      'styleArr': Array(225).fill('unit'),
      isBlacksTurn:true,
      point:-1,
      urBlack:null,
      online:{}
    };
  }
  componentWillMount() {
    var that = this;
    socket.on('role', function(msg){
        if(msg.hasOwnProperty('role') && msg.role){
             that.setState({urBlack: true,})
             console.log('你是黑旗')
        }else if(msg.hasOwnProperty('role') && !msg.role){
            that.setState({urBlack: false,})
            console.log('你是bai旗')
        }else{
             console.log('人满了，不好意思')
        }
    })
     socket.on('online', function(user){
         that.setState({online: user,});
    })
  }
  componentDidMount() {
    var that = this;
     socket.on('chat message', function(msg){
      //更新视图
      const styleArray = that.state.styleArr.slice();
      styleArray[msg.place] = that.state.isBlacksTurn ? 'unit unit-b' : 'unit unit-w';
      that.setState({
        'styleArr':styleArray,
         isBlacksTurn: !that.state.isBlacksTurn,
         point:msg.place,
         })
    });
    socket.on('reset',function(msg){
        console.log('reset')
        const styleArray = that.state.styleArr.slice();
        styleArray.fill('unit')
        that.setState({
          'styleArr':styleArray,
           point:-1,
           });
        ReactDOM.render(<div></div>,document.getElementById('gameover'));
        if(msg.turn){
          alert("it's black's turn")
        }else{
          alert("it's white's turn")
        }
    })
  }
  handle(n){

      //刚落子的加个css3特效
      //
      //
      //
      let num=0;
      for(let i in this.state.online){
            num++;
      }
      if(num<2){
        alert('请等待partner')
        return 
      }
      //判断该谁落子
      if(this.state.isBlacksTurn==this.state.urBlack){
          if(this.state.styleArr[n]!='unit'){//如果落子的地方有子了，就骂他
            alert('那有棋子了，你傻叉啊');
            return;
        }
        socket.emit('chat message',{'place':n,'player':this.state.isBlacksTurn})
      }else{
          alert('不该你走呢亲')
      }
      
  }
  reset(){
     socket.emit('reset',{"turn":this.state.isBlacksTurn})  
  }
  componentDidUpdate(){
  // 更新的时候触发
       if(calculateWinner(this.state.styleArr,this.state.point)){
            if(this.state.isBlacksTurn!=this.state.urBlack&&this.state.urBlack!=null){
                   ReactDOM.render(<img src='img/victory.png' className='victory' />,
                   document.getElementById('gameover'));
            }else{
                   ReactDOM.render(<img src='img/defeat.png' className='victory' />,
                    document.getElementById('gameover'));
            }
           

      }
  }
  render(){

      let board=[];
      for(let r=0;r<15;r++){
        for(let i=0;i<15;i++){
          board[r*15+i]=<Unit key={[r,i]} style={this.state.styleArr[r*15+i]} onClick={() => this.handle(r*15+i)}/>
        }
      }
      return(
        <div>
          <OnlinePlayer online={this.state.online} />
          {board}
          <Turn turn={this.state.isBlacksTurn}/>
          <Reset onClick={() => this.reset()} />
          <div id='gameover'></div>
        </div>              
      )
    }
}

function calculateWinner(arr,num) {
    var target=arr[num];
    var line=1;
    var upSide,leftUp,rightUp;    
    upSide=leftUp=rightUp=Math.min(Math.floor(num/15),5);
    //横向判断先向左后向右
    var leftSide=Math.min(num%15,5);
    var rightSide=Math.min(14-num%15,5);
    //console.log('rightSide',rightSide)
    for(let i=num-1;i>num-leftSide-1;i--){
        if(arr[i]==target){
            line++;
        }else{
           break;
        }
    }
    for(let i=num+1;i<=num+rightSide;i++){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }
    }
    if(line==5){
        return true;
    }else{
        line=1;
    }
    //竖向判断 先上后下
    for(let i=num-15;i>=num-upSide*15;i=i-15){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }
    }
    var downSide=15-upSide
    for(let i=num+15;i<=num+downSide*15;i=i+15){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }
    }
    if(line==5){
       return true;
    }else{
        line=1;
    }
    //   斜向判断  酱紫/斜   先上后下
    
    rightUp=Math.min(rightUp,rightSide)//判断太靠右边了，就被右边界隔断
    for(let i=num-14;i>=num-rightUp*14;i=i-14){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }
    }
    var leftDown,rightDown;
    rightDown=leftDown=14-Math.floor(num/15);
    leftDown=Math.min(leftDown,leftSide);//判断太靠左边了，就被左边界隔断
    for(let i=num+14;i<=num+leftDown*14;i=i+14){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }
    }
    if(line==5){
       return true;
    }else{
        line=1;
    }
    //   斜向判断   酱紫\斜   先上后下
    rightUp=Math.min(rightUp,leftSide)
    for(let i=num-16;i>=num-rightUp*16;i=i-16){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }    
    }
    rightDown=Math.min(rightDown,rightSide)
    for(let i=num+16;i<=num+rightDown*16;i=i+16){
        if(arr[i]==target){
            line++;
        }else{
            break;
        }
    }
    if(line==5){
       return true;
    }else{
        line=1;
    }

    return false;
}