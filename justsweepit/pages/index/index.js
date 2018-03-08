//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    defaultTdClass: 'untouched',
    mineList: [],
    minesLeft: 15,
    noMineBtn:{className:'untouched'},
    mineBtn:{className:'untouched'},
    flagBtn:{className:'untouched', status: 'off'},
    mineGame:"on",
    noMineGame:"off",
    eyeLeft: "eyeLeft",
    eyeRight: "eyeRight",
    eyeMiddle: "",
    startTime: 0,
    endTime: 0
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (e) {
    var theMines = makeMineField();//function都在下面
    this.setData({mineList:theMines});
    this.setData({mineGame: "on"});
    this.setData({ noMineGame: "off" });
    this.setData({ eyeLeft: "eyeLeft" });
    this.setData({ eyeRight: "eyeRight" });
    this.setData({ eyeMiddle: "" });
    this.setData({ minesLeft: 15 });
    this.setData({ flagBtn: {className: "untouched", status: "off" } });
    console.log(this.data.mineList)

    function makeMineField() {
      //生成指定范围，指定数量的随机数
      function toGetRandomNum(min, max, num) {
        var arr = [];
        var tempObj = {};
        var index = -1;
        function toGenerateNth() {
          if (arr.length < num) {
            index = parseInt(Math.random() * max, 10) + min;
            if (!tempObj[index]) {
              tempObj[index] = true;
              arr.push(index);
              toGenerateNth();
            } else {
              toGenerateNth();
            }
          }
        }
        toGenerateNth();
        return arr;
      }
      //弄个带地雷和数字属性的obj的矩阵
      function makeMatrix(a, b) { //a是row，b是col
        console.log("a = " + a + ", b = " + b)
        var matrix = [];
        for (var j = 0; j < a; j++) {
          var line = [];
          for (var i = 0; i < b; i++) {
            var obj = {
              "row": j,
              "col": i,
              "className": "untouched",
              "innerColor":"innerColor0",
              "mine": false,
              "num": -1,
              "flagStatus": "flagOff",
              "crossStatus": "crossOff"
            };
            line.push(obj);
          }
          matrix.push(line);
        }
        var nthMine = toGetRandomNum(0, a * b - 1, 15);
        console.log("nthMine = " + nthMine);
        for (var i = 0; i < nthMine.length; i++) {
          console.log(Math.floor(nthMine[i] / b) + ", " + (nthMine[i] % b));
        }
        for (var n = 0; n < nthMine.length; n++) {
          matrix[Math.floor(nthMine[n] / b)][nthMine[n] % b].mine = true;
        }
        return matrix;
      }

      function minesweeper(matrix) {
        //给雷区加上边界
        function toExpand(arr) {
          var line = [];
          var newArr = [];
          var obj = {
            "mine": false,
            "num": -1
          };
          for (var i = 0; i < arr[0].length + 2; i++) {
            line.push(obj);
          }
          newArr.push(line);
          for (var j = 0; j < arr.length; j++) {
            arr[j].unshift(obj);
            arr[j].push(obj);
            newArr.push(arr[j]);
          }
          newArr.push(line);
          return newArr;
        }
        //给每一个方格计算数字
        function toBlur(arr) {
          var sum = 0;
          for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
              if (arr[i][j].mine && !(i == 1 && j == 1)) { //9宫格正中间的不参与计算，第二个的index是1不是222！！！
                sum++;
              }
            }
          }
          arr[1][1].num = sum;
          return arr[1][1];
        }
        var expanded = toExpand(matrix); //加了边界的雷区
        var newMatrix = []; //用来存放标记了数字的雷区
        for (var i = 0; i < expanded.length - 2; i++) {
          var newLine = [];
          for (var j = 0; j < expanded[i].length - 2; j++) {
            var line = [];
            line.push(expanded[i].slice(j, j + 3)); //从第j个到第j+3前面的那个: j, j+1, j+2
            line.push(expanded[i + 1].slice(j, j + 3));
            line.push(expanded[i + 2].slice(j, j + 3));
            newLine.push(toBlur(line));
          }
          newMatrix.push(newLine);
        }
        return newMatrix;
      }

      var mineMatrix = makeMatrix(12, 9);
      var mineFieldMatrix = minesweeper(mineMatrix);
      return mineFieldMatrix;
    }
    // 

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  clearOrMark: function (e) {
    var that = this;
    var mineGameStatus = that.data.mineGame;
    var noMineGameStatus = that.data.noMineGame;
    var theMines = that.data.mineList;
    var flagStatus = that.data.flagBtn;
    var itemRow = e.target.dataset.row;
    var itemCol = e.target.dataset.col;
    if(mineGameStatus == "on"){
      if (theMines[itemRow][itemCol].className == "untouched") {
        if (flagStatus.className == "cleared") {
          //显示小旗或者隐藏小旗
          if (theMines[itemRow][itemCol].flagStatus == "flagOff"){
            theMines[itemRow][itemCol].flagStatus = "flagOn";
            var minesLeft = that.data.minesLeft;
            minesLeft--;
            that.setData({ minesLeft: minesLeft });
          }else{
            theMines[itemRow][itemCol].flagStatus = "flagOff";
            var minesLeft = that.data.minesLeft;
            minesLeft++;
            that.setData({ minesLeft: minesLeft });
          }
        } else {//没标小旗的
          if (theMines[itemRow][itemCol].flagStatus == "flagOff"){
            //翻开
            if (theMines[itemRow][itemCol].mine) {//踩到地雷了
              for (let i = 0; i < 12; i++) {
                for (let j = 0; j < 9; j++) {
                  if (theMines[i][j].mine) {//翻开所有有雷的方块
                    if (theMines[i][j].flagStatus != "flagOn") {//没标旗子的
                      theMines[i][j].className = "cleared";
                      theMines[i][j].innerColor = "innerColorBlack";
                      theMines[i][j].num = "☀";
                    }
                  } else {//无雷的
                    if (theMines[i][j].flagStatus == "flagOn") {//标了旗子的
                      theMines[i][j].crossStatus = "crossOn";
                      theMines[i][j].flagStatus = "flagOff";
                      theMines[i][j].innerColor = "innerColorBlack";
                      theMines[i][j].num = "☀";
                    }
                  }
                }
              }
              that.setData({ mineGame: "off" });
            } else {//没有雷
              theMines[itemRow][itemCol].className = "cleared";
              theMines[itemRow][itemCol].innerColor = "innerColor" + theMines[itemRow][itemCol].num;
              var minesRealLeft = 0;
              //遍历所有未翻开的方块
              for (let i = 0; i < 12; i++) {
                for (let j = 0; j < 9; j++) {
                  if (theMines[i][j].className == "untouched") {
                    minesRealLeft++;
                  }
                }
              }
              if (minesRealLeft == 15) {
                //所有地雷标上小旗
                for (let i = 0; i < 12; i++) {
                  for (let j = 0; j < 9; j++) {
                    if (theMines[i][j].className == "untouched") {
                      theMines[i][j].flagStatus = "on";
                    }
                  }
                }
                that.setData({ mineGame: "off" });
                that.setData({ eyeLeft: "eyeLeftBig" });
                that.setData({ eyeRight: "eyeRightBig" });
                that.setData({ eyeMiddle: "eyeMiddle" });
                that.setData({ minesLeft: 0 });
              } 
            }
          }
        }
      }//如果已翻开则不能恢复or翻开第二次
    }else if(noMineGameStatus == "on"){
      theMines[itemRow][itemCol].className = "cleared";
    }
    
    that.setData({mineList:theMines});
    console.log("that.data.mineList[" + itemRow + "][" + itemCol + "] = ");
    console.log(that.data.mineList[itemRow][itemCol]);
  },
  toClear: function (e) {
    var that = this;
    if (e.target.dataset.name == "noMine"){
      that.setData({noMineBtn:{className:"cleared"}});
    } else if (e.target.dataset.name == "newMine"){
      that.setData({mineBtn:{className:"cleared"}});
    }else{
      if(that.data.flagBtn.status == "off"){
        that.setData({ flagBtn: { className: "cleared", status: "off" } });
      }
    }
  },
  backToUntouched: function (e) {
    var that = this;
    if (e.target.dataset.name == "noMine") {
      that.setData({ noMineBtn: { className: "untouched" } });
    } else if (e.target.dataset.name == "newMine") {
      that.setData({ mineBtn: { className: "untouched" } });
    }
  },
  tapFlag: function(e){
    var that = this;
    console.log(this.data.flagBtn);
    if(that.data.noMineGame != "on"){
      // console.log(that.data.flagBtn.status);
      if (that.data.flagBtn.status == "off") {
        that.setData({ flagBtn: { className: "cleared", status: "on" } });
        console.log('case1');
      } else {
        that.setData({ flagBtn: { className: "untouched", status: "off" } });
        console.log('case2');
      }
    }
  },
  makeNoMineField: function (e) {
    var that = this;
    var theMines = that.data.mineList;
    for(let i = 0; i < 12; i++){
      for(let j = 0; j < 9; j++){
        theMines[i][j].className = "untouched";
        theMines[i][j].flagStatus = "flagOff";
        theMines[i][j].num = "";
        theMines[i][j].innerColor = "innerColor0";
        theMines[i][j].crossStatus = "crossOff";
      }
    }
    that.setData({ mineGame: "off" });
    that.setData({ flagBtn: {className: "untouched"} });
    that.setData({ noMineGame: "on" });
    that.setData({ minesLeft: 0 });
    that.setData({ mineList: theMines });
    that.setData({ eyeLeft: "eyeLeft" });
    that.setData({ eyeRight: "eyeRight" });
    that.setData({ eyeMiddle: "" });
  }
})
