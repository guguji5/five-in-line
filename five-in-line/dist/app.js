var wrap = document.getElementById('wrap');
var login = document.getElementsByClassName('login')[0];
var value = login.getElementsByTagName('input')[0];
var socket;
value.focus();
value.onkeydown = function (e) {
    e = e || event;
    if (e.keyCode === 13 && this.value) {
        login.style.display = 'none';
        wrap.style.display = 'block';
        socket = io();
        socket.emit('login', { 'userName': this.value });
        ReactDOM.render(React.createElement(Board, null), document.getElementById('wrap'));
    }
};
//刷新按钮
function Reset(props) {
    return React.createElement(
        'button',
        { onClick: () => props.onClick(), className: 'reset' },
        '\u91CD\u65B0\u5F00\u5C40'
    );
}
function Unit(props) {
    return React.createElement('div', { className: props.style, onClick: () => props.onClick() });
}
//在线人数
function OnlinePlayer(props) {
    var arr = [];
    for (var key in props.online) {
        arr.push(props.online[key]);
    }
    return React.createElement(
        'div',
        { className: 'online' },
        arr.map(function (value, index) {

            if (value.hasOwnProperty('role') && value.role) {
                return React.createElement(
                    'div',
                    { key: index, className: 'clearfix' },
                    React.createElement(Unit, { style: 'unit unit-b' }),
                    React.createElement(
                        'div',
                        { className: 'fl' },
                        value.userName
                    )
                );
            } else if (value.hasOwnProperty('role') && !value.role) {
                return React.createElement(
                    'div',
                    { key: index, className: 'clearfix' },
                    React.createElement(Unit, { style: 'unit unit-w' }),
                    React.createElement(
                        'div',
                        { className: 'fl' },
                        value.userName
                    )
                );
            } else {
                return React.createElement(
                    'p',
                    { key: index },
                    value.userName,
                    ' \uFF1A\u5728\u89C2\u6218'
                );
            }
        })
    );
}
//玩家切换
function Turn(props) {
    var result;
    if (props.turn) {
        result = React.createElement(
            'div',
            { className: 'turn' },
            React.createElement(
                'strong',
                null,
                'BLACK'
            )
        );
    } else {
        result = React.createElement(
            'div',
            { className: 'turn' },
            React.createElement(
                'strong',
                null,
                'WHITE'
            )
        );
    }
    return result;
}
//主棋盘
class Board extends React.Component {
    constructor() {
        super();
        this.state = {
            'styleArr': Array(225).fill('unit'),
            isBlacksTurn: true,
            point: -1,
            urBlack: null,
            online: {}
        };
    }
    componentWillMount() {
        var that = this;
        socket.on('role', function (msg) {
            if (msg.hasOwnProperty('role') && msg.role) {
                that.setState({ urBlack: true });
                console.log('你是黑旗');
            } else if (msg.hasOwnProperty('role') && !msg.role) {
                that.setState({ urBlack: false });
                console.log('你是bai旗');
            } else {
                console.log('人满了，不好意思');
            }
        });
        socket.on('online', function (user) {
            that.setState({ online: user });
        });
    }
    componentDidMount() {
        var that = this;
        socket.on('chat message', function (msg) {
            //更新视图
            var styleArray = that.state.styleArr.slice();
            styleArray[msg.place] = that.state.isBlacksTurn ? 'unit unit-b' : 'unit unit-w';
            that.setState({
                'styleArr': styleArray,
                isBlacksTurn: !that.state.isBlacksTurn,
                point: msg.place
            });
        });
        socket.on('reset', function (msg) {
            console.log('reset');
            var styleArray = that.state.styleArr.slice();
            styleArray.fill('unit');
            that.setState({
                'styleArr': styleArray,
                point: -1
            });
            ReactDOM.render(React.createElement('div', null), document.getElementById('gameover'));
            if (msg.turn) {
                alert("it's black's turn");
            } else {
                alert("it's white's turn");
            }
        });
    }
    handle(n) {

        //刚落子的加个css3特效
        //
        //
        //
        var num = 0;
        for (var i in this.state.online) {
            num++;
        }
        if (num < 2) {
            alert('请等待partner');
            return;
        }
        //判断该谁落子
        if (this.state.isBlacksTurn == this.state.urBlack) {
            if (this.state.styleArr[n] != 'unit') {
                //如果落子的地方有子了，就骂他
                alert('那有棋子了，你傻叉啊');
                return;
            }
            socket.emit('chat message', { 'place': n, 'player': this.state.isBlacksTurn });
        } else {
            alert('不该你走呢亲');
        }
    }
    reset() {
        socket.emit('reset', { "turn": this.state.isBlacksTurn });
    }
    componentDidUpdate() {
        // 更新的时候触发
        if (calculateWinner(this.state.styleArr, this.state.point)) {
            if (this.state.isBlacksTurn != this.state.urBlack && this.state.urBlack != null) {
                ReactDOM.render(React.createElement('img', { src: 'img/victory.png', className: 'victory' }), document.getElementById('gameover'));
            } else {
                ReactDOM.render(React.createElement('img', { src: 'img/defeat.png', className: 'victory' }), document.getElementById('gameover'));
            }
        }
    }
    render() {

        var board = [];
        for (var r = 0; r < 15; r++) {
            for (var i = 0; i < 15; i++) {
                board[r * 15 + i] = React.createElement(Unit, { key: [r, i], style: this.state.styleArr[r * 15 + i], onClick: () => this.handle(r * 15 + i) });
            }
        }
        return React.createElement(
            'div',
            null,
            React.createElement(OnlinePlayer, { online: this.state.online }),
            board,
            React.createElement(Turn, { turn: this.state.isBlacksTurn }),
            React.createElement(Reset, { onClick: () => this.reset() }),
            React.createElement('div', { id: 'gameover' })
        );
    }
}

function calculateWinner(arr, num) {
    var target = arr[num];
    var line = 1;
    var upSide, leftUp, rightUp;
    upSide = leftUp = rightUp = Math.min(Math.floor(num / 15), 5);
    //横向判断先向左后向右
    var leftSide = Math.min(num % 15, 5);
    var rightSide = Math.min(14 - num % 15, 5);
    //console.log('rightSide',rightSide)
    for (var i = num - 1; i > num - leftSide - 1; i--) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    for (var i = num + 1; i <= num + rightSide; i++) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    if (line == 5) {
        return true;
    } else {
        line = 1;
    }
    //竖向判断 先上后下
    for (var i = num - 15; i >= num - upSide * 15; i = i - 15) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    var downSide = 15 - upSide;
    for (var i = num + 15; i <= num + downSide * 15; i = i + 15) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    if (line == 5) {
        return true;
    } else {
        line = 1;
    }
    //   斜向判断  酱紫/斜   先上后下

    rightUp = Math.min(rightUp, rightSide); //判断太靠右边了，就被右边界隔断
    for (var i = num - 14; i >= num - rightUp * 14; i = i - 14) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    var leftDown, rightDown;
    rightDown = leftDown = 14 - Math.floor(num / 15);
    leftDown = Math.min(leftDown, leftSide); //判断太靠左边了，就被左边界隔断
    for (var i = num + 14; i <= num + leftDown * 14; i = i + 14) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    if (line == 5) {
        return true;
    } else {
        line = 1;
    }
    //   斜向判断   酱紫\斜   先上后下
    rightUp = Math.min(rightUp, leftSide);
    for (var i = num - 16; i >= num - rightUp * 16; i = i - 16) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    rightDown = Math.min(rightDown, rightSide);
    for (var i = num + 16; i <= num + rightDown * 16; i = i + 16) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    if (line == 5) {
        return true;
    } else {
        line = 1;
    }

    return false;
}
//# sourceMappingURL=app.js.map
