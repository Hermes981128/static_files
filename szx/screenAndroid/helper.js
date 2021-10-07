//此文件实现将控制命令封装成协议，具体协议内容请看：
//链接：http://note.youdao.com/noteshare?id=dabda6c613adef7a416bd2625cd770a1

//bcc校验码计算
//arry: 要计算的数组
//返回计算协议中校验位的校验码
function calBcc(arry) {
	var bcc = 0;
	for (i = 0; i < arry.length; i++) {
		bcc ^= arry[i];
	}
	return bcc;
}

//数组打印，调试用
function PrintArry(data) {
	var str = "";

	for (i = 0; i < data.length; i++) {
		str = str + data[i].toString(16).padStart(2, '0');
	}

	str = str.toUpperCase();
	return str;
}

//sn:板卡sn号，stirng
//type：数据类型，数字
//jsonCmd: json命令
//返回值：生成一个Uint8Array，通过websocket发送给板卡
function makeFrame(sn, dataType, jsonCmd) {
	var index = 0;
	var dataLen = jsonCmd.length;
	var frameLen = dataLen + 26;
	var outPut = new Uint8Array(frameLen);
	outPut[index++] = 0x68;
	outPut[index++] = (dataLen & 0xff000000) >> 24;
	outPut[index++] = (dataLen & 0x00ff0000) >> 16;
	outPut[index++] = (dataLen & 0x0000ff00) >> 8;
	outPut[index++] = dataLen & 0x000000ff;
	outPut[index++] = 0;//类型为client

	// //sn号赋值，string转ascii
	// for (i = 0; i < sn.length; i++) {
	// 	outPut[index++] = sn[i].charCodeAt();
	// }

	outPut[index++] = dataType;//指定数据类型为json
	//json string转ascii
	for (i = 0; i < jsonCmd.length; i++) {
		outPut[index++] = jsonCmd[i].charCodeAt();
	}

	var bccBuffer = outPut.slice(1, frameLen - 3 + 1);//忽略协议头和协议尾
	outPut[index++] = calBcc(bccBuffer);
	outPut[index++] = 0x16;
	return outPut;
}
//触发键盘事件, code表示键盘值
function ExexuteKeyDown(code) {
	var jsonObj = { "data": { "keyCode": code, "event": "keyDown" } };
	var json = JSON.stringify(jsonObj);
	var sn = "RK3923C1201900139";
	return json;
}
//触发鼠标按下事件，x：x坐标， y：y坐标
function ExexuteMouseDown(x, y) {
	var jsonObj = { "data": { "action": 0, "count": 1, "pointerId": 0, "x": x, "y": y }, "event": "0" };
	var json = JSON.stringify(jsonObj);
	var sn = "RK3923C1201900139";
	return json;
}
//触发鼠标移动事件，x：x坐标， y：y坐标
function ExexuteMouseMove(x, y) {
	var jsonObj = { "data": { "action": 2, "count": 1, "pointerId": 0, "x": x, "y": y }, "event": "2" };
	var json = JSON.stringify(jsonObj);
	var sn = "RK3923C1201900139";
	return json;
}

function ExexuteKeyBoard(keycode) {
	var jsonObj = { "data": { "keyCode": keycode.toString() }, "event": "keyCode" };
	var json = JSON.stringify(jsonObj);
	var sn = "RK3923C1201900139";
	return json;
}

//触发鼠标抬起事件，x：x坐标， y：y坐标
function ExexuteMouseUp(x, y) {
	var jsonObj = { "data": { "action": 1, "count": 1, "pointerId": 0, "x": x, "y": y }, "event": "1" };
	var json = JSON.stringify(jsonObj);
	var sn = "RK3923C1201900139";
	return json;
}
//触发滑动事件
function ExexuteMove(data, sn) {
	return makeFrame(sn, 0, data);
}
function makeFrameExtend(sn, dataType, body) {
	var index = 0;
	var dataLen = body.length;
	var frameLen = dataLen + 26;
	var outPut = new Uint8Array(frameLen);
	outPut[index++] = 0x68;
	outPut[index++] = (dataLen & 0xff000000) >> 24;
	outPut[index++] = (dataLen & 0x00ff0000) >> 16;
	outPut[index++] = (dataLen & 0x0000ff00) >> 8;
	outPut[index++] = dataLen & 0x000000ff;
	outPut[index++] = 0; // 类型为client

	//sn号赋值，string转ascii
	for (i = 0; i < sn.length; i++) {
		outPut[index++] = sn[i].charCodeAt();
	}

	outPut[index++] = dataType; // 指定数据类型为json
	//json string转ascii
	for (i = 0; i < body.length; i++) {
		outPut[index++] = body[i];
	}

	var bccBuffer = outPut.slice(1, frameLen - 3 + 1);//忽略协议头和协议尾
	outPut[index++] = calBcc(bccBuffer);
	outPut[index++] = 0x16;
	return outPut;
}

//根据报文识别屏幕方向, 0横屏，1竖屏
function CheckScreenDirection(data) {
	if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 1) {
		if (data[4] == 1 && data[5] == 1) {
			if (data[6] == 1) {
				screen = data[7];
				return screen;
			}
		}
	}
}

var emptyCount = 0;

function GetEmptyFrame() {
	var emptyFrame = new Uint8Array([0xFF, 0xF1, 0x50, 0x80, 0x12, 0x5F, 0xFC, 0x21, 0x1A, 0xC8, 0x01, 0x27, 0xFC, 0xC0, 0x00, 0x7E, 0x03, 0x10, 0x40, 0x63, 0x3D, 0x77, 0xE2, 0xB6, 0xE3, 0x6E, 0x00, 0x37, 0x56, 0x78, 0xEB, 0x70, 0xAB, 0xC5, 0x58, 0x08, 0x59, 0x76, 0xF0, 0x47, 0x3D, 0x23, 0x6C, 0xA6, 0x2B, 0x59, 0x4E, 0x9C, 0xE0, 0x23, 0x1C, 0x2D, 0x74, 0xCB, 0xE2, 0xFC, 0x77, 0x7D, 0x26, 0x13, 0xC3, 0x04, 0x40, 0x02, 0x60, 0xF6, 0x03, 0x20, 0x80, 0xC7, 0x9A, 0x11, 0x0E, 0x9B, 0xDA, 0xA0, 0x84, 0x00, 0x2A, 0x95, 0x4A, 0x1E, 0x74, 0xA5, 0x40, 0x2A, 0xCA, 0xA8, 0xCA, 0xF0, 0xF2, 0x1E, 0xA8, 0x77, 0x86, 0xA0, 0x62, 0x8C, 0xB8, 0x5F, 0xA6, 0x67, 0xBF, 0x0D, 0x27, 0x8B, 0xF9, 0x58, 0xBD, 0xE3, 0x2D, 0x0C, 0xBF, 0x48, 0x3C, 0xFD, 0x70, 0x78, 0x5E, 0xA9, 0x0B, 0x24, 0x9C, 0x13, 0x98, 0xA4, 0xA0, 0x6E, 0xCA, 0xAA, 0x7A, 0x88, 0xA5, 0x0C, 0x2E, 0x83, 0x59, 0x02, 0x24, 0x01, 0x41, 0x03, 0x92, 0x10, 0x40, 0x07])
	return emptyFrame;
}

//查询屏幕方向
function GetScreenState() {
	var sn = "RK3923C1201900139";
	var outPut = new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x02]);
	return makeFrameExtend(sn, 5, outPut);
}

//通道配置
function ConfigChannel(sn) {
	var outPut = new Uint8Array([0x07])
	return makeFrameExtend(sn, 6, outPut)
}

function OpenFileLog(sn) {
	var outPut = new Uint8Array([0x01]);
	return makeFrameExtend(sn, 7, outPut);
}

//I 帧请求报文生成
function RequestIFrame() {
	var sn = "RK3923C1201900139";
	var outPut = new Uint8Array([0x20]);
	return makeFrameExtend(sn, 6, outPut);
}

 //示例：
 //var sn = "RK3923C1201900139";
 //var json = "{\"data\":{\"keyCode\":24},\"type\":\"keyDown\"}";
// makeFrame(sn, 0, json);
//ExexuteKeyDown()
