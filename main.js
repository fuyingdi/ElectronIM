// var addon = require('./build/Release/raptorq');
// const buf = Buffer.from("223");
// console.log(buf);
// var res = addon.encode(buf);
// console.log(res)
// console.log(addon.decode(res));
const stun = require('stun');
const axios = require('axios');
const { exec } = require('child_process');
const { execFile, execFileSync } = require('child_process');
const { app, BrowserWindow } = require('electron')
const electron = require('electron');
const dgram = require('dgram')
const fs = require('fs')
// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win
const server = dgram.createSocket('udp4');
server.bind(20008+Math.floor(Math.random(0, 100)*100))


function encode(){
  execFile("./a.out", ["encode"], (err, stdout, stderr) => {
    if(err) {
      console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);})
};
function createWindow () {
  // execFile("./a.out", [], (err, stdout, stderr) => {
  //   if(err) {
  //       console.log(err);
  //       return;
  //   }
  //   console.log(`stdout: ${stdout}`);
// });
  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({
    width: 800
    ,height: 500
    ,frame: false
    ,transparent: true,
    webPreferences: {
     nodeIntegration: true
  }
  });
  mainWindow.loadFile('login.html')
  mainWindow.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null
  })


  // stun.request('stun.l.google.com:19302', (err, res) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     const { address } = res.getXorAddress();
  //     const { port } = res.getXorAddress();
  //     console.log(address, port );
  //   }
  // });
  // axios.get('/api/addrs/')
  // .then(function (response) {
  //   console.log(response);
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
}
electron.ipcMain.on('openChat', (event, arg)=> {
    var username = arg;
    chatWindow = new BrowserWindow({
      width: 800
      ,height: 500
      ,frame: false
      ,transparent: true,
      webPreferences: {
       nodeIntegration: true
      } 
    });
    chatWindow.loadFile('index.html');
    mainWindow.close();
    mainWindow = null;
    chatWindow.show();
    chatWindow.webContents.send('post-username', arg);
      chatWindow.openDevTools();

  });
electron.ipcMain.on("close-main", (event, arg)=> {
    chatWindow.close();
    chatWindow = null;
  });
electron.ipcMain.on("min-main", (event, arg)=> {
    chatWindow.minimize();
  });
electron.ipcMain.on('close-login', (event, arg)=> {
    mainWindow.close();
    mainWindow = null;
  });
electron.ipcMain.on('addfriend',(event, arg)=>
{
     child = new BrowserWindow({
      parent: chatWindow, 
      modle: true, 
      show: true,
      width: 500,
      height: 300,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true
      }
    });
    child.loadFile('addfriend.html');
    child.webContents.send('ausername', arg);
    // child.webContents.openDevTools();
});
electron.ipcMain.on("close-add", (event, arg)=> {
    child.close();
    child = null;
    chatWindow.show()
  });

electron.ipcMain.on("encode", (event, arg)=>{
  //TODO:params
  execFile("./a.out", [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
})
electron.ipcMain.on("decode", (event, arg)=>{
    //TODO:params
    execFile("./a.out", [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
})
electron.ipcMain.on("send-files",(event,arg)=>{

  var to_info = {};
  var length=0;
  exec("cp "+arg+" ./tmp_data");
  fs.readFile("./tmp_data", (err, bytesread)=>{length = bytesread.length})
  encode()
  var f={};
  fs.readFile("./encoded_data", (err, bytesread)=>{f = bytesread})
  axios
  .get("http://118.24.15.77:5000/api/addr/" + arg.to_name)
  .then(res=>{
    to_info = res;
    console.log(res)
  })
  var data = {from:arg.self, to:arg.to_name, type:"file", size:length}
  axios
  .post(this.domain+"/api/messages/"+arg.to,data)
  .then(res=>{})
  .catch(error=>{console.log(error)})
  setTimeout(()=>{
  for(let i = 0; i < 270; ++i)
  {
    let tmpBuffer = f.slice(i*65502, (i+1)*65502-1)
    // server.send()
    server.send(tmpBuffer, to_info.port, to_info.adderss)
  }
}, 2000)
})

electron.ipcMain.on("rec-files", (event, arg)=>{
  res = Buffer.from("")
  server.on('message', (msg,rinfo)=>{
    res.concat(res, msg)
  })
  f = fs.writeFile('encoded_data', res)
  decode(arg);
})
//发送自己的ip和端口
electron.ipcMain.on("username",(event, arg)=>{
  var data={};
  stun.request('stun.l.google.com:19302',[server], (err, res) => {
    if (err) {
      console.error(err);
    } else {
      const { address } = res.getXorAddress();
      const { port } = res.getXorAddress();
      console.log(address, port );
      data = {port:port, ip: address};
      console.log(data)
    }
  });
  axios.post('http://118.24.15.77:5000/api/addrs/'+arg, data)
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
})
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)
// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

