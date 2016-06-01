var c, cxt, talkBox, score_player, score_computer, scoreBoard;
var boarderWidth, borderHeight, unitWidth, unitHeight;   //邊界的長寬，與單位的長寬
var mapArray, blockArray;   
//mapArray:存放地圖所有資訊（0:可通過、1:角色A、2:角色B（程式控制）、8:目標、9:障礙）
//blockArray:存放正在生成的同列障礙（0：可通過、1：不可過）
var imgMountain, imgMain, imgComputer, imgGoal;
var playerExist;//判斷玩家使否已經選擇放置地點
var touchGridNum;//玩家點擊要放置的位置
var gameOver;
var goalBlock;
var currentImgMainX, currentImgMainY, lastKeyCode_player;  //lastKeyCode:使用者最近一次按下的方向鍵
var currentImgComputerX, currentImgComputerY, goalDirection, lastKeyCode_computer;//goalDirection:判斷目標相對於電腦的左側還右側，0表左側、1表右側
var currentGoalX, currentGoalY;
var btnUp, btnLeft, btnDown, btnRight;
var timmer; 
var difficultControl, difficultLevel, scoreLevel;

window.onload=function(){
    c=document.getElementById("myCanvas");
    cxt=c.getContext("2d");
    talkBox=document.getElementById("talkBox");
    scoreBoard=document.getElementById("scoreBoard");
	btnUp=document.getElementById("btnUp");
	btnLeft=document.getElementById("btnLeft");
	btnDown=document.getElementById("btnDown");
	btnRight=document.getElementById("btnRight");
	difficultControl=document.getElementById("difficultControl");

    borderWidth=document.getElementById("myCanvas").width;
    borderHeight=document.getElementById("myCanvas").height;
    //佈局為10*10的格子
    unitWidth=borderWidth/10;   
    unitHeight=borderHeight/10;
    playerExist=false;
    gameOver=false;
    currentImgMainX=0;
    currentImgMainY=0;
    score_player=0;
    score_computer=0;
	difficultLevel=400;
	scoreLevel=5;
    
    imgMountain=new Image();
    imgMountain.src="Images/material.png";
    imgMain=new Image();
    imgMain.src="Images/BallMan_green.png";
    imgComputer=new Image();
    imgComputer.src="Images/BallMan_red.png";
    imgGoal=new Image();
    imgGoal.src="Images/Hi_iamPutting.png";
    gameDescription();
    initGameValue();
    initView();
    //暫時拿來印個目標

    c.onmousedown=mapOnClick;   //讓玩家點擊初始位置
    window.onkeydown=toKeyCode; //設定鍵盤移動事件
	btnUp.onclick=function(){
		if(gameOver){
			alert("遊戲已結束，想再次挑戰請點擊重新開始");	
			return;
		}
		
		if(playerExist){
        	move(38);
    	}else{
        	talkBox.innerHTML="請先放置角色！"
    	}};
	btnLeft.onclick=function(){
		if(gameOver){
			alert("遊戲已結束，想再次挑戰請點擊重新開始");	
			return;
		}
		
		if(playerExist){
        	move(37);
    	}else{
        	talkBox.innerHTML="請先放置角色！"
    	}};
	btnDown.onclick=function(){
		if(gameOver){
			alert("遊戲已結束，想再次挑戰請點擊重新開始");	
			return;
		}
		
		if(playerExist){
        	move(40);
    	}else{
        	talkBox.innerHTML="請先放置角色！"
    	}};
	btnRight.onclick=function(){
		if(gameOver){
			alert("遊戲已結束，想再次挑戰請點擊重新開始");	
			return;
		}
		
		if(playerExist){
        	move(39);
    	}else{
        	talkBox.innerHTML="請先放置角色！"
    	}};
}

function initGameValue(){
    mapArray=Array(100);
    blockArray=Array(10);
    for(var i=0; i<mapArray.length; i++){
        mapArray[i]=0;
    }
}

function initView(){
    //畫出障礙
    imgMountain.onload=function(){
        putAllBlock();
    }
    imgComputer.onload=function(){
        var computer_block=Math.floor(Math.random()*100);
        //讓電腦不會出現在以下地點：目標物上、障礙物上與偶數行ㄋ
        while(mapArray[computer_block]==8 || mapArray[computer_block]==9 ||computer_block%2==0){
            computer_block=Math.floor(Math.random()*100);  
        }
        mapArray[computer_block]=2;
        
        currentImgComputerX=computer_block%10;
        currentImgComputerY=Math.floor(computer_block/10);
        cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);
    }
}

function makeBlock(){
    var open1, open2; //亂數產生同一行所要開的口是第幾列
    do{
        open1=Math.floor(Math.random()*10);
        open2=Math.floor(Math.random()*10);
    }while(open1==open2);
    for(var i=0; i<blockArray.length; i++){
        if(i!=open1 && i!=open2){
            blockArray[i]=9;
        }else{
            blockArray[i]=0;
        }
    }
}

function putAllBlock(){
    var counter=0;
    
    for(var i=0; i<10; i+=2){
        makeBlock();
        for(var j=0; j<10; j++){
            mapArray[(j*10+i)] = blockArray[j];
        }
    }
	//如果玩家跟電腦在偶數行，則讓至少一個破口出現在其當前位置
	var tempBlock;
	if(currentImgComputerX%2==0){
		tempBlock=currentImgComputerY*10+currentImgComputerX;
		mapArray[tempBlock]=0;
	}
	if(currentImgMainX%2==0){
		tempBlock=(currentImgMainY/unitHeight)*10 + currentImgMainX/unitWidth;
		mapArray[tempBlock]=0;
	}
    drawBlock();
}

function drawBlock(){
    for(var i=0; i<mapArray.length; i++){
        if(mapArray[i]==9){
            var columnNumber = i%10;
            var rowNumber = Math.floor(i/10);
            cxt.drawImage(imgMountain, 0, 192, 32, 32, columnNumber*unitWidth, rowNumber*unitHeight, unitWidth, unitHeight);
        }
    }
}

function mapOnClick(event){
    if(gameOver){
		alert("遊戲已結束，想再次挑戰請點擊重新開始");	
		return;
	}
	
	if(!playerExist){
        touchGridNum=Math.floor(event.offsetX/unitWidth) + Math.floor((event.offsetY/unitHeight))*10;
        if(mapArray[touchGridNum]==0){
			difficultControl.disabled="disabled";
			scoreControl.disabled="disabled";
            cxt.drawImage(imgMain, 90, 90, 310, 362, (touchGridNum%10)*unitWidth, Math.floor(touchGridNum/10)*unitHeight, unitWidth, unitHeight);  
            talkBox.innerHTML="";
            playerExist=true;
            
            currentImgMainX=unitWidth*(touchGridNum%10);
            currentImgMainY=unitHeight*(Math.floor(touchGridNum/10))
            lastKeyCode_player=40;    //預設角色一開始為面對使用者
            
            makeGoal();
			timmer=setInterval(computerMove,difficultLevel);
        }else{
            talkBox.innerHTML="BallMan不能站在石頭上...";
        }
    }else{
        talkBox.innerHTML="不能重複放置角色";
    }
 //   console.log((currentImgMainX/unitWidth)%10);
}

function makeGoal(){
	switch(lastKeyCode_computer){
		case 37:
			cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
		case 38:
			cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
		case 39:
			cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
		case 40:
			cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
	}
	switch(lastKeyCode_player){
		case 37:
			cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
			break;
		case 38:
			cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
			break;
		case 39:
			cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
			break;
		case 40:
			cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
			break;
	}
    
	if(score_computer>=scoreLevel && !gameOver){
		gameOver=true
		talkBox.style.color="brown";
		talkBox.innerHTML="遊戲結束！ >>電腦獲勝（想再次挑戰，請點擊重新開始）";
		alert("電腦獲勝！");
		window.clearInterval(timmer);
		return;
	}else if(score_player>=scoreLevel && !gameOver){
		gameOver=true
		talkBox.style.color="forestgreen";
		talkBox.innerHTML="遊戲結束！ >>玩家獲勝";
		alert("玩家獲勝！");
		window.clearInterval(timmer);
		return;
	}
	
    var column_temp=(currentImgMainX/unitWidth)%10;
    var row_temp;
    //產生目標的行數
    if(column_temp<5){    
        column_temp=5+Math.floor(Math.random()*2)*2+Math.floor(Math.random()*2)*2;   //5+0或2+0或2>>5、7、9行
    }else if(column_temp>5){
        column_temp=5-Math.floor(Math.random()*2)*2-Math.floor(Math.random()*2)*2;   //5 - 0或2 - 0或2 >>5、3、1行
    }else{//column_temp == 5
        var shifting = (new Date()%2)//0：偏左、1：偏右
        if(shifting==0){
            column_temp=3-Math.floor(Math.random()*2)*2;   //3 - 0或2 >>3、1行
        }else{
            column_temp=7+Math.floor(Math.random()*2)*2;   //7 + 0或2 >>7、9行
        }
    }
    
    if(column_temp==currentImgComputerX){   //如果新目標的位置與電腦當前位置同行，則重新產生新目標位置
        makeGoal();
        return;
    }
    //產生目標的列數
    row_temp=Math.floor(Math.random()*10);
    currentGoalX=column_temp;
    currentGoalY=row_temp;
    
    cxt.drawImage(imgGoal, 60, 60, 405, 375, column_temp*unitWidth, row_temp*unitHeight, unitWidth, unitHeight); 
    mapArray[row_temp*10+column_temp]=8;
    goalBlock=row_temp*10+column_temp;
    if(currentImgComputerX>column_temp){
        goalDirection=1;    //目標物在電腦右側
    }else{
        goalDirection=0;    //目標物在電腦左側
    }
}

function computerMove(){
    var temp1st=-1; //由上往下數的第一個缺口
    var temp2nd=-1; //由上往下數的第二個缺口
    var closest;    //距離最近的缺口  

    cxt.clearRect(currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);
     //37:左, 38:上, 39:右 40:下
    if(currentImgComputerX==currentGoalX){  //電腦移動到與目標物同行時
        if(currentImgComputerY>currentGoalY){    //電腦在目標物下方
            currentImgComputerY--;
			lastKeyCode_computer=38;
        }else if(currentImgComputerY<currentGoalY){ //電腦在目標物上方
            currentImgComputerY++;
			lastKeyCode_computer=40;
        }
        //電腦吃到目標物
        if(currentImgComputerY==currentGoalY){
            cxt.clearRect(0, 0, 600, 600);
          
            score_computer++;
            scoreBoard.innerHTML="比數>> 玩家 "+score_player+"分 : 電腦 "+score_computer+"分";
            talkBox.style.color="brown";
			talkBox.innerHTML="電腦得分";     
            putAllBlock();
            mapArray[currentGoalY*10+currentGoalX]=0;
            makeGoal();
        }
		switch(lastKeyCode_player){
			case 37:
				cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
				break;
			case 38:
				cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
				break;
			case 39:
				cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
				break;
			case 40:
				cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
				break;
		}
        switch(lastKeyCode_computer){
			case 37:
				cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 38:
				cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 39:
				cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 40:
				cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
		}
        return;
    }
    
    if(goalDirection==1){   //目標物在電腦左側時
        //在偶數行（障礙物行），直接向左平移
        if(currentImgComputerX%2==0){ 
            currentImgComputerX--;
			lastKeyCode_computer=37;
			//如果目標物就再開口同一列的旁邊行
			if(currentGoalY==currentImgComputerY && currentGoalX==currentImgComputerX){
				cxt.clearRect(0, 0, 600, 600);
				switch(lastKeyCode_player){
					case 37:
						cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
					case 38:
						cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
					case 39:
						cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
					case 40:
						cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
				}
				score_computer++;
				scoreBoard.innerHTML="比數>> 玩家 "+score_player+"分 : 電腦 "+score_computer+"分";
				talkBox.style.color="brown";
				talkBox.innerHTML="電腦得分";     
				putAllBlock();
				mapArray[currentGoalY*10+currentGoalX]=0;
				makeGoal();
        
				switch(lastKeyCode_computer){
					case 37:
						cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
					case 38:
						cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
					case 39:
						cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
					case 40:
						cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
				}
				return;
			}
			switch(lastKeyCode_player){
				case 37:
					cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
				case 38:
					cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
				case 39:
					cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
				case 40:
					cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
            }
            cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);
            return;
        }
        
        //判斷左側缺口位置
        for(var i=0; i<10; i++){
            if(mapArray[i*10+currentImgComputerX-1]==0){
                if(temp1st==-1){
                    temp1st=i;
                }else{
                    temp2nd=i;
                }
            }
        }
        //判斷目前行所在的位置距離哪個破口比較近
        if(Math.min(Math.abs(currentImgComputerY-temp1st),Math.abs(currentImgComputerY-temp2nd))==Math.abs(currentImgComputerY-temp1st)){
            closest=temp1st;
        }else{
            closest=temp2nd;
        }
        
        if(currentImgComputerY>closest){    //電腦目前位置在最近的破口下方
            currentImgComputerY--;
			lastKeyCode_computer=38;
        }else if(currentImgComputerY<closest){  //電腦目前位置在最近的破口上方
            currentImgComputerY++;
			lastKeyCode_computer=40;
        }else{  //電腦在破口的同一位置的旁邊
            currentImgComputerX--;
			lastKeyCode_computer=37;
        } 
        
    }else{  //目標物在電腦右側時
        //在偶數行（障礙物行），直接向右平移
        if(currentImgComputerX%2==0){ 
            currentImgComputerX++;
			lastKeyCode_computer=39;
			//如果目標物就再開口同一列的旁邊行
			if(currentGoalY==currentImgComputerY && currentGoalX==currentImgComputerX){
				cxt.clearRect(0, 0, 600, 600);
				switch(lastKeyCode_player){
					case 37:
						cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
					case 38:
						cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
					case 39:
						cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
					case 40:
						cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
						break;
				}
				score_computer++;
				scoreBoard.innerHTML="比數>> 玩家 "+score_player+"分 : 電腦 "+score_computer+"分";
				talkBox.style.color="brown";
				talkBox.innerHTML="電腦得分";     
				putAllBlock();
				mapArray[currentGoalY*10+currentGoalX]=0;
				makeGoal();
        
				switch(lastKeyCode_computer){
					case 37:
						cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
					case 38:
						cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
					case 39:
						cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
					case 40:
						cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
						break;
				}
				return;
			}
			switch(lastKeyCode_player){
				case 37:
					cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
				case 38:
					cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
				case 39:
					cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
				case 40:
					cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
					break;
            }
            cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);
            return;
        }
        //判斷右側缺口位置
        for(var i=0; i<10; i++){
            if(mapArray[i*10+currentImgComputerX+1]==0){
                if(temp1st==-1){
                    temp1st=i;
                }else{
                    temp2nd=i;
                }
            }
        }   
        //判斷目前行所在的位置距離哪個破口比較近
        if(Math.min(Math.abs(currentImgComputerY-temp1st),Math.abs(currentImgComputerY-temp2nd))==Math.abs(currentImgComputerY-temp1st)){
            closest=temp1st;
        }else{
            closest=temp2nd;
        }
        
        if(currentImgComputerY>closest){    //電腦目前位置在最近的破口下方
            currentImgComputerY--;
			lastKeyCode_computer=38;
        }else if(currentImgComputerY<closest){  //電腦目前位置在最近的破口上方
            currentImgComputerY++;
			lastKeyCode_computer=40;
        }else{  //電腦在破口的同一位置的旁邊
            currentImgComputerX++;
			lastKeyCode_computer=39;
        }
    }
	switch(lastKeyCode_player){
		case 37:			
		   cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);			
		   break;		
	   case 38:	
		   cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);	
		   break;			
	   case 39:	
		   cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);	
		   break;			
	   case 40:	
		   cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);	
		   break;
				
   }
    switch(lastKeyCode_computer){
		case 37:
			cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
		case 38:
			cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
		case 39:
			cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
		case 40:
			cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
			break;
	}
}

function toKeyCode(event){
    event.preventDefault();//避免掉網頁原始預設的行為
    if(playerExist){
        var keyCode=event.keyCode;
        move(keyCode);
    }else{
        talkBox.innerHTML="請先放置角色！"
    }
}

function move(keyCode){
    var targetImgX, targetImgY, targetBlock;
    
    lastKeyCode_player=keyCode;
    
    //如果還沒到達終點才執行
    if(!gameOver){
		//清掉主角，在新的位置重劃
        cxt.clearRect(currentImgMainX, currentImgMainY, unitWidth, unitHeight);
		//避免玩家跟電腦重疊後，電腦會被擦去一個時間格的瞬間
		switch(lastKeyCode_computer){
			case 37:
				cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 38:
				cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 39:
				cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 40:
				cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
		}
        //37:左, 38:上, 39:右 40:下
        switch(keyCode){
            case 37:
                targetImgX=currentImgMainX-unitWidth;
                targetImgY=currentImgMainY;
                if(targetImgX<=9*unitWidth && targetImgX>=0){
                    targetBlock=targetImgX/unitWidth+(targetImgY/unitHeight)*10;
                }else{
                    targetBlock=-1;
                }
				
                if(targetBlock==-1 || mapArray[targetBlock]==8 || mapArray[targetBlock]==9){
                    //判斷無法移動的原因
                    judgeResult(targetBlock, 37);
                }else{
                    currentImgMainX-=unitWidth;
                }
                cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;

            case 38:
                targetImgX=currentImgMainX;
                targetImgY=currentImgMainY-unitHeight;
                if(targetImgY<=9*unitHeight && targetImgY>=0){
                    targetBlock=targetImgX/unitWidth+(targetImgY/unitHeight)*10;
                }else{
                    targetBlock=-1;
                }

                if(targetBlock==-1 || mapArray[targetBlock]==8 || mapArray[targetBlock]==9){
                    //判斷無法移動的原因
                    judgeResult(targetBlock, 38);
                }else{
                    currentImgMainY-=unitHeight;           
                }
                cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;

            case 39:
                targetImgX=currentImgMainX+unitWidth;
                targetImgY=currentImgMainY;
                if(targetImgX<=9*unitWidth && targetImgX>=0){
                    targetBlock=targetImgX/unitWidth+(targetImgY/unitHeight)*10;
                }else{
                    targetBlock=-1;
                }
				
                if(targetBlock==-1 || mapArray[targetBlock]==8 || mapArray[targetBlock]==9){
                    //判斷無法移動的原因
                    judgeResult(targetBlock, 39);
                }else{
                    currentImgMainX+=unitWidth;
                }
                cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;

            case 40:
                targetImgX=currentImgMainX;
                targetImgY=currentImgMainY+unitHeight;
                if(targetImgY<=9*unitHeight && targetImgY>=0){
                    targetBlock=targetImgX/unitWidth+(targetImgY/unitHeight)*10;
                }else{
                    targetBlock=-1;
                }

                
                if(targetBlock==-1 || mapArray[targetBlock]==8 || mapArray[targetBlock]==9){
                    //判斷無法移動的原因
                    judgeResult(targetBlock, 40);
                }else{
                    currentImgMainY+=unitHeight;           
                }
                cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;
        }
    }
}

function judgeResult(targetBlock,  direction){
    if(targetBlock==-1){
		talkBox.style.color="forestgreen";
        talkBox.innerHTML="撞到邊界了！"; 
    }else if(mapArray[targetBlock]==8){
    //    console.log(mapArray[targetBlock]);
        cxt.clearRect(0,0,600,600);
        putAllBlock();
        switch(direction){
            case 37:
                currentImgMainX-=unitWidth;
                cxt.drawImage(imgMain, 590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;
            case 38:
                currentImgMainY-=unitHeight;
                cxt.drawImage(imgMain, 1090, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;
            case 39:
                currentImgMainX+=unitWidth;
                cxt.drawImage(imgMain, 1590, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;
            case 40:
                currentImgMainY+=unitHeight;           
                cxt.drawImage(imgMain, 90, 90, 310, 362, currentImgMainX, currentImgMainY, unitWidth, unitHeight);
                break;
        }
		switch(lastKeyCode_computer){
			case 37:
				cxt.drawImage(imgComputer, 590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 38:
				cxt.drawImage(imgComputer, 1090, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 39:
				cxt.drawImage(imgComputer, 1590, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
			case 40:
				cxt.drawImage(imgComputer, 90, 90, 310, 362, currentImgComputerX*unitWidth, currentImgComputerY*unitHeight, unitWidth, unitHeight);	
				break;
		}
		score_player++;
        scoreBoard.innerHTML="比數>> 玩家"+score_player+" 分 : 電腦"+score_computer+" 分";
        talkBox.style.color="forestgreen";
		talkBox.innerHTML="玩家得分";  
		
		mapArray[targetBlock]=0;
		
		makeGoal();
    }else if(mapArray[targetBlock]==9){
		talkBox.style.color="forestgreen";
        talkBox.innerHTML="天啊！好大的石頭";  
    }
}

function setDifficult(){
	clearInterval(timmer);
	switch(difficultControl.value){
		case "1": 
			difficultLevel=400;
			if(playerExist){
				timmer=setInterval(computerMove, 400);
			}
			break;
		case "2": 
			difficultLevel=225;
			if(playerExist){
				timmer=setInterval(computerMove, 225);
			}
			break;
		case "3": 
			difficultLevel=100;
			if(playerExist){
				timmer=setInterval(computerMove, 100);
			}
			break;
	}
}

function setScore(){
	switch(scoreControl.value){
		case "1": 
			scoreLevel=5;
			break;
		case "2": 
			scoreLevel=7;
			break;
		case "3": 
			scoreLevel=10;
			break;
		case "4":
			scoreLevel=99999;
			break;
	}
}

function gameRestart(){
	difficultControl.disabled="";
	scoreControl.disabled="";
	difficultControl.value="1";
	scoreControl.value="1";
	difficultLevel=400;
	scoreLevel=5;
	score_computer=0;
	score_player=0
    scoreBoard.innerHTML="比數>> 玩家 "+score_player+"分 : 電腦 "+score_computer+"分";
    talkBox.style.color="forestgreen";
	talkBox.innerHTML="請選擇遊戲設定，並點擊地圖放置角色";     
	clearInterval(timmer);
	gameOver=false;
	playerExist=false;
	
	cxt.clearRect(0, 0, 600, 600);     
	imgComputer.src="Images/BallMan_red.png";
	imgMountain.src="Images/material.png";
	initView();
}

function gameDescription(){
	alert("--------------------------------------------------"+
		 "\n1.遊戲介紹：\n"+
		 "\n這是個BallMans要去爭奪神奇布丁的魔幻世界，\n"+
		 "\n在決定完遊戲設定後，點擊地圖上沒有石頭的位置，\n"+
		 "\n便會在該位置產生由你來控制的綠色BallMan，\n"+
		 "\n同時紅色BallMan也會開始出發尋找布丁，\n"+
		 "\n最後由獲得最多布丁的BallMan獲勝！\n"+
		 "\n（提醒：當布丁被吃掉後，會釋放魔力讓地圖改變，"+
		 "\n並且讓新的布丁出現在地圖上的其他位置...）\n"+
		 "--------------------------------------------------"+
		 "\n2.操作方式：\n"+
		 "\n電腦的控制方式為使用鍵盤的方向鍵，\n"+
		 "\n行動裝置的控制方式為點擊下方的方向圖示，\n"+
		 "\n在達到勝利條件分出勝負後，如還想再繼續進行遊玩，\n"+
		 "\n請按下地圖右上方的重新開始按鈕，即可開始新的遊戲。\n"+
		 "\n（提醒：一旦在開始遊戲後，便無法更動任何遊戲設定，"+
		 "\n如要更換設定，請按下重新開始鈕來開始新的一場遊戲）\n\n"+
		 "--------------------------------------------------"+
		 "\n說明到此為止，趕快開始搶奪布丁吧！");
}