//蒙版
var canvas_bak = document.getElementById("box");

var winHeight = window.screen.height - window.innerHeight;
var vowidth = window.screen.width;
var topwinHeightDraw = window.screen.height - window.innerHeight + 30; // 计算title top 头部
var numse = window.screen.height;

// 计算title top 头部 连接断开，是否准备重连？
if (numse <= 70) {
	var voheight = window.screen.height - winHeight - 34 - 20
} else {
	var voheight = window.screen.height - topwinHeightDraw - 20
}

// 画笔大小
var resolving = 1; // 1: 竖屏；2：横屏；

var url = window.location.href;
url = url.split('/');

var parameters = GetRequest();
var form = {};

form.clientType = parameters["clientType"];
form.cardIp = parameters["cardIp"];
form.port = parameters["port"];
form.sn = parameters["sn"];
form.username = parameters["username"];
form.userCardId = parameters["userCardId"];
form.ip = parameters["ip"];
form.domainName = parameters["domainName"];
var isWSS = true;
var cUrl = isWSS ? "wss://" + form.domainName + "?cardIp=" + form.ip : "ws://" + form.domainName + "?cardIp=" + form.ip;
// var cUrl = "ws://192.168.199.46:9101?token=test0123456789";

var wsss,errorTime = 0;
doConnect();
function throttle(fn, delay) {
	var flag = true;
	errorTime += delay;
	return () => {
		if (!flag) return;
		flag = false;
		timer = setTimeout(() => {
		fn();
		flag = true;
		}, delay);
	};
}

function doConnect() {
	wsss = new WebSocket(cUrl);
	wsss.binaryType = 'arraybuffer';

	wsss.onopen = function () {
		var pings = {
			"event": "getScreenStatus"
		}
		wsss.send(JSON.stringify(pings));
		var bitRate = {
			"data": {
				"bitRate": 1243000
			},
			"event": "bitRate"
		}
		wsss.send(JSON.stringify(bitRate))
	};
	wsss.onclose = function (evt) {
		wsss.close();
		throttle(doConnect,100);
		if(errorTime > 1000){
			wx.miniProgram.switchTab({
				url: '/pages/home/home'
			})
		}
	};
	wsss.onerror = function (evt) {
		console.log(evt);
		wsss.close();
		throttle(doConnect,100);
		if(errorTime > 1000){
			wx.miniProgram.switchTab({
				url: '/pages/home/home'
			})
		}
	};
}

$('body').on("click", function () {
	draw_graph('pencil');
})
//剪切板
$(".upload").on("click", function () {
	var texts = $(this).attr("data-text")
	if (texts == "uploads") {
		$(".mainbox").css({
			"display": "block"
		})
		$(".sbox").css({
			"display": "none"
		})
	}
})

//home 控制home
$(".botmat1img").on("click", function () {
	var codes = $(this).attr("data-text")
	if (codes == "home") {
		wsss.send(ExexuteKeyBoard(3), form.sn);
	} else if (codes == "return") {
		wsss.send(ExexuteKeyBoard(4), form.sn);
	} else if (codes == "gengduo") {
		wsss.send(ExexuteKeyBoard(187), form.sn);
	}

})
//高清控制
$(".PictureQuality").on("click", function () {
	$(this).addClass("avit").siblings().removeClass('avit')
	var id = $(this).attr("data-id")
	var bitRate = {
		"data": {
			"bitRate": id
		},
		"event": "bitRate"
	}
	wsss.send(JSON.stringify(bitRate))
})

//画图形
var draw_graph = function (graphType, obj) {
	//把蒙版放于画板上面
	$("#container").css("z-index", 30);
	$("#dedit").css("z-index", 20);
	var canDraw = false;
	//鼠标按下获取 开始xy开始画图
	var touchstart = function (e) {
		$('.control-right-img').attr({
			"data-id": "2"
		})
		$(".leftmains").css({
			"right": "-4rem"
		})
		var touchfor = e.originalEvent.targetTouches; //for 的手指数组

		//是否横屏
		if (resolving == 0) {
			var ping;
			for (var i = 0; i < touchfor.length; i++) {
				var cawidthXs = touchfor[i].pageY * (1280 / voheight)
				var caheightYs = 720 - touchfor[i].pageX * (720 / vowidth)
				ping = {
					"data": {
						"action": 0,
						"count": touchfor.length,
						"pointerId": i,
						"x": cawidthXs.toFixed(2),
						"y": caheightYs.toFixed(2)
					},
					"event": "0"
				}
			}
			wsss.send(JSON.stringify(ping))
		} else {
			var ping;
			for (var i = 0; i < touchfor.length; i++) {
				var cawidthXs = touchfor[i].pageX * (720 / vowidth)
				var caheightYs = touchfor[i].pageY * (1280 / voheight)
				ping = {
					"data": {
						"action": 0,
						"count": touchfor.length,
						"pointerId": i,
						"x": cawidthXs.toFixed(2),
						"y": caheightYs.toFixed(2)
					},
					"event": "0"
				}

			}
			wsss.send(JSON.stringify(ping));
		}
		canDraw = true;
	};

	//鼠标离开 把蒙版canvas的图片生成到canvas中
	var touchend = function (e) {
		var touchfor = e.originalEvent.changedTouches; //for 的手指数组
		//是否横屏 morePortionUp
		if (resolving == 0) {
			var ping;
			for (var i = 0; i < touchfor.length; i++) {
				var cawidthXs = touchfor[i].pageY * (1280 / voheight);
				var caheightYs = 720 - touchfor[i].pageX * (720 / vowidth);
				ping = {
					"data": {
						"action": 1,
						"count": touchfor.length,
						"pointerId": i,
						"x": cawidthXs.toFixed(2),
						"y": caheightYs.toFixed(2)
					},
					"event": "1"
				}
			}
			wsss.send(JSON.stringify(ping));
		} else {
			var ping;
			for (var i = 0; i < touchfor.length; i++) {
				var cawidthXs = touchfor[i].pageX * (720 / vowidth);
				var caheightYs = touchfor[i].pageY * (1280 / voheight);
				ping = {
					"data": {
						"action": 1,
						"count": touchfor.length,
						"pointerId": i,
						"x": cawidthXs.toFixed(2),
						"y": caheightYs.toFixed(2)
					},
					"event": "1"
				}
			}
			wsss.send(JSON.stringify(ping))
		}
		canDraw = false;
	};

	//清空层 云手机超出屏幕的开关
	var clearContext = function () {
		canDraw = false;
	}

	// 鼠标移动
	var touchmove = function (e) {
		e = e || window.event;
		var touchfor = e.originalEvent.targetTouches; //for 的手指数组
		var ping;
		//是否横屏  morePortionMove
		if (resolving == 0) {
			for (var i = 0; i < touchfor.length; i++) {
				var cawidthXs = touchfor[i].pageY * (1280 / voheight)
				var caheightYs = 720 - touchfor[i].pageX * (720 / vowidth)
				ping = {
					"data": {
						"action": 2,
						"count": touchfor.length,
						"pointerId": i,
						"x": cawidthXs.toFixed(2),
						"y": caheightYs.toFixed(2)
					},
					"event": "2"
				}

			}
			wsss.send(JSON.stringify(ping))
		} else {
			var ping;
			for (var i = 0; i < touchfor.length; i++) {
				var cawidthXs = touchfor[i].pageX * (720 / vowidth);
				var caheightYs = touchfor[i].pageY * (1280 / voheight);
				ping = {
					"data": {
						"action": 2,
						"count": touchfor.length,
						"pointerId": i,
						"x": cawidthXs.toFixed(2),
						"y": caheightYs.toFixed(2)
					},
					"event": "2"
				}
			}
			wsss.send(JSON.stringify(ping));
		};
	};

	//鼠标离开区域以外 除了涂鸦 都清空
	var mouseout = function () {
		if (graphType != 'handwriting') {
			clearContext();
		}
	}

	$(canvas_bak).unbind();
	$(canvas_bak).bind('touchstart', touchstart);
	$(canvas_bak).bind('touchmove', touchmove);
	$(canvas_bak).bind('touchend', touchend);
	$(canvas_bak).bind('mouseout', mouseout);
}

// 获取url中"?"符后的字串
function GetRequest() {
	var url = location.search;
	var obj = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for (var i = 0; i < strs.length; i++) {
			obj[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
		}
	}
	return obj;
}