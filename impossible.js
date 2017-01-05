
Array.prototype.clone = function(){
	var a=[],i;
	
	for(i=0;i<this.length;i++){
		a[i]=this[i].slice();
	}
	return a;
};

function Game(x1){
	var n;
	if(x1=='four'){
		n=4;
	}
	if(x1=='five'){
		n=5;
	}
	if(x1=='six'){
		n=6;
	}
	console.log(n);
	//Store the initial context in sthis
	var sthis=this;
	//2-D array to store '1' if it is filled,otherwise '0'
	this.map=[];
	//This is to check if initOnce is called for the first time
	this.initOnceDone=false;
	//Indicate the case of rejection
	this.reject=false;
	//Indicate if game is finished
	this.won=false;
	this.move=0;
	this.paused=false;
	
	//To declare canvas addEventListener,called only once.
	this.initOnce = function(){
		if(this.initOnceDone){
			return false;
		}
		
		this.canvas=document.getElementsByTagName("canvas")[0];
		this.canvas.addEventListener('click', function(e){
			sthis.onclick(sthis.canvas, e);
		});
		
		this.context=this.canvas.getContext('2d');
		this.initOnceDone=true;
	};
	
	//Initialize map and clear and the contents canvas and apply drawMask
	this.init = function(){
		this.map=[];
		this.paused = false;
        this.won = false;
        this.reject = false;
		this.move=0;
		this.initOnce();
		
		var i,j;
		for(i=0;i<=6;i++){
			this.map[i]=[];
			for(j=0;j<=6;j++){
				this.map[i][j]=0;
			}
		}
		document.body.style.backgroundImage="url('game.jpg')";
		this.clear();
		this.drawMask();
	};
	
	this.playerMove = function(){
		
		if(this.move%2==0){
			return 1;
		}
		return -1;
	};
	
	 this.printState = function (state) {
        var i, j, msg;
        msg = "\n";
        msg += "Move: " + this.move;
        msg += "\n";
        for (i = 6-n; i < 6; i++) {
            for (j = 6-n; j < 6; j++) {
                msg += " " + state[i][j];
            }
            msg += "\n";
        }
        console.log(msg);
    };
	
	this.action = function (column, callback) {
        if (this.paused || this.won) {
            return 0;
        }
        if (this.map[6-n][column] !== 0 || column < 6-n || column > 6) {
            return -1;
        }

        var done = false;
        var row = 6-n, i;
        for (i = 6-n; i < 5; i++) {
            if (this.map[i + 1][column] !== 0) {
                done = true;
                row = i;
                break;
            }
        }
        if (!done) {
            row = 5;
        }
        this.animate(column, this.playerMove(this.move), row, 0, function () {
            sthis.map[row][column] = sthis.playerMove(sthis.move);
            sthis.move++;
            sthis.draw();
            sthis.check();
            callback();
        });
        this.paused = true;
        return 1;
    };
	
	this.clear = function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	};
	
	this.win = function (player) {
        this.paused = true;
        this.won = true;
        this.reject = false;
        var msg = null;
        if (player > 0) {
            msg = "You Won";
        } else if (player < 0) {
            msg = "Compter Won";
        } else {
            msg = "It's a draw";
        }
        msg += " - Click to reset";
        this.context.save();
        this.context.font = '20pt sans-serif';
        this.context.fillStyle = "#f70202";
        this.context.fillText(msg, 200, 20);
        this.context.restore();
        console.info(msg);
    };
	
	this.check = function () {
        var i, j, k;
        var temp_r = 0, temp_b = 0, temp_br = 0, temp_tr = 0;
        for (i = 6-n; i < 6; i++) {
            for (j = 6-n; j < 6; j++) {
                temp_r = 0;
                temp_b = 0;
                temp_br = 0;
                temp_tr = 0;
                for (k = 0; k <= 3; k++) {
                    //from (i,j) to right
                    if (j + k < 6) {
                        temp_r += this.map[i][j + k];
                    }
                    //from (i,j) to bottom
                    if (i + k < 6) {
                        temp_b += this.map[i + k][j];
                    }

                    //from (i,j) to bottom-right
                    if (i + k < 6 && j + k < 6) {
                        temp_br += this.map[i + k][j + k];
                    }

                    //from (i,j) to top-right
                    if (i - k >= 6-n && j + k < 6) {
                        temp_tr += this.map[i - k][j + k];
                    }
                }
                if (Math.abs(temp_r) === 4) {
                    this.win(temp_r);
                } else if (Math.abs(temp_b) === 4) {
                    this.win(temp_b);
                } else if (Math.abs(temp_br) === 4) {
                    this.win(temp_br);
                } else if (Math.abs(temp_tr) === 4) {
                    this.win(temp_tr);
                }

            }
        }
        // check if draw
        if ((this.move === n*n) && (!this.won)) {
            this.win(0);
        }
    };
	
	this.drawCircle = function (x, y, r, fill, stroke) {
        this.context.save();
        this.context.fillStyle = fill;
        this.context.strokeStyle = stroke;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        //this.context.stroke();
        this.context.fill();
        this.context.restore();
    };
	
	this.draw = function () {
        var x, y;
        var fg_color;
        for (y = 6-n; y < 6; y++) {
            for (x = 6-n; x < 6; x++) {
                fg_color = "transparent";
                if (this.map[y][x] >= 1) {
                    fg_color = "#ff4136";
                } else if (this.map[y][x] <= -1) {
                    fg_color = "#0074d9";
                }
                this.drawCircle(75 * x + 100, 75 * y + 50, 25, fg_color, "black");
            }
        }
    };
	
	this.animate = function (column, move, to_row, cur_pos, callback) {
        var fg_color = "transparent";
        if (move >= 1) {
            fg_color = "#ff4136";
        } else if (move <= -1) {
            fg_color = "#0074d9";
        }
        if (to_row * 75 >= cur_pos) {
            this.clear();
            this.draw();
            this.drawCircle(75 * column + 100, cur_pos + 50, 25, fg_color, "black");
            this.drawMask();
            window.requestAnimationFrame(function () {
                sthis.animate(column, move, to_row, cur_pos + 25, callback);
            });
        } else {
            callback();
        }
    };
	
	//Draws the board of the game
	this.drawMask = function(){
		this.context.save();
        this.context.fillStyle = "#2fef46";
        this.context.beginPath();
        var x, y;
        for (y = 6-n; y < 6; y++) {
            for (x = 6-n; x < 6; x++) {
                this.context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
                this.context.rect(75 * x + 150, 75 * y, -100, 100);
            }
        }
        this.context.fill();
        this.context.restore();
	};
	
	this.fillMap = function(state,col,val){
		
		var temp=state.clone();
		
		var flag=false;
		
		if(state[6-n][col]!=0 || col<6-n || col>6){
			return -1;
		}
		var i,row;
		for(i=6-n;i<5;i++){
			if(state[i+1][col]!=0){
				flag=true;
				row=i;
				break;
			}
		}
		if(!flag){
			row=5;
		}
		temp[row][col]=val;
		return temp;
	};
	
	this.checkRegion = function(ordi,x,r){
		if((ordi[0]-x)*(ordi[0]-x)<=r*r){
			return true;
		}
		return false;
	};
	
	this.onclick = function(canvas,e){
		if(this.reject){
			return false;
		}
		
		if(this.won){
			this.init();
			return false;
		}
		
		var rect = canvas.getBoundingClientRect(),x = e.clientX-rect.left,y = e.clientY-rect.top;
		var j,valid;
		for(j=6-n;j<6;j++){
		  if(this.checkRegion([x,y],75*j+100,25)){
			
			this.paused = false;
                valid = this.action(j,function () {
                    sthis.ai(-1);
                });
                if (valid==1){
                    this.reject = true;
                }
                break;
		}
		}
	};
	
	this.ai = function(movevalue){
		
		var state= this.map.clone();
		
		function checkstate(state){
			var valwin=0,valchain=0;
			var i,j,k,ru,r,rd,d;
			for(i=6-n;i<6;i++){
				for(j=6-n;j<6;j++){
					ru=0,r=0,rd=0,d=0;
					for(k=0;k<=3;k++){
						//Right side
						if(j+k<6){
							r+=state[i][j+k];
						}
						//Bottom side
						if(i+k<6){
							d+=state[i+k][j];
						}
						//top right
						if(i-k>=6-n && j+k<6){
							ru+=state[i-k][j+k];
						}
						//bottom right
						if(i+k<6 && j+k<6){
							rd+=state[i+k][j+k];
						}
					}
					
					valchain+=(r*r*r+d*d*d+ru*ru*ru+rd*rd*rd);
					if(Math.abs(r)==4){
						valwin=r;
					}
					else if(Math.abs(d)==4){
						valwin=d;
					}
					else if(Math.abs(ru)==4){
						valwin=ru;
					}
					else if(Math.abs(rd)==4){
						valwin=rd;
					}
				}
			}
				return [valwin,valchain];
		}
		
		function value(state,depth,alpha,beta){
			//Check for the present functioning of the board
			var val=checkstate(state);
			//if depth is much high,return the value without further processing
			if(depth>=4){
				//sthis.printState(state);
				var retval=0;
				var winval=val[0];
				var chainval=val[1]*movevalue;
				retval=chainval;
				
				if(winval==4*movevalue){
					retval=999999;
				} 
				else if(winval==4*movevalue*-1){
					retval=999999*-1;
				}
				retval-=depth*depth;
				return [retval,-1];
			}
			
			var winval=val[0];
			if(winval==4*movevalue){
				return [999999-depth*depth,-1];
			} else if(winval==4*movevalue*-1){
				return [999999*-1-depth*depth,-1];
			}
			
			if(depth%2==0){
				return minfun(state,depth+1,alpha,beta);
			}
			return maxfun(state,depth+1,alpha,beta);
		}
		
		function choose(arr){
			return arr[Math.floor(Math.random(arr.length))];
		}
		
		function maxfun(state, depth, alpha, beta) {
            var v = -100000000007;
            var move = -1;
            var tempVal = null;
            var tempState = null;
            var moveQueue = [];
            var j;
            for (j = 6-n; j < 6; j++) {
                tempState = sthis.fillMap(state, j, movevalue);
                if (tempState !== -1) {

                    tempVal = value(tempState, depth, alpha, beta);
                    if (tempVal[0] > v) {
                        v = tempVal[0];
                        move = j;
                        moveQueue = [];
                        moveQueue.push(j);
                    } else if (tempVal[0] === v) {
                        moveQueue.push(j);
                    }
					
                    // alpha-beta pruning
                    if (v > beta) {
                        move = choose(moveQueue);
                        return [v, move];
                    }
                    alpha = Math.max(alpha, v);
                }
            }
            move = choose(moveQueue);

            return [v, move];
        }
        function minfun(state, depth, alpha, beta) {
            var v = 100000000007;
            var move = -1;
            var tempVal = null;
            var tempState = null;
            var moveQueue = [];
            var j;

            for (j = 6-n; j < 6; j++) {
                tempState = sthis.fillMap(state, j, movevalue * -1);
                if (tempState !== -1) {

                    tempVal = value(tempState, depth, alpha, beta);
                    if (tempVal[0] < v) {
                        v = tempVal[0];
                        move = j;
                        moveQueue = [];
                        moveQueue.push(j);
                    } else if (tempVal[0] === v) {
                        moveQueue.push(j);
                    }
					
                    if (v < alpha) {
                        move = choose(moveQueue);
                        return [v, move];
                    }
                    beta = Math.min(beta, v);
                }
            }
            move = choose(moveQueue);

            return [v, move];
        }
	
		var choice_val = maxfun(state, 0, -100000000007, 100000000007);
        choice = choice_val[1];
        var val = choice_val[0];
        this.paused = false;
        var done = this.action(choice, function () {
            sthis.reject = false;
        });

        while (done < 0) {
            choice = Math.floor(Math.random() * n + 6-n);
            done = this.action(choice, function () {
                sthis.reject = false;
            });
        }
	};
	this.init();
}
	
document.addEventListener('DOMContentLoaded', function (){
	
	var parameters = location.search.substring(1).split("&");
    var temp = parameters[0].split("=");
    var x1 = unescape(temp[1]);
	this.game = new Game(x1);
});