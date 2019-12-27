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
// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win
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
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null
  })
  stun.request('stun.l.google.com:19302', (err, res) => {
    if (err) {
      console.error(err);
    } else {
      const { address } = res.getXorAddress();
      const { port } = res.getXorAddress();
      console.log(address, port );
    }
  });
  axios.get('/api/addrs/')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}

electron.ipcMain.on("close-main", (event, arg)=> {
    mainWindow.close();
    mainWindow = null;
  });
electron.ipcMain.on("min-main", (event, arg)=> {
    mainWindow.minimize();
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

//发送自己的ip和端口
electron.ipcMain.on("username",(event, arg)=>{
  var data={};
  stun.request('stun.l.google.com:19302', (err, res) => {
    if (err) {
      console.error(err);
    } else {
      const { address } = res.getXorAddress();
      const { port } = res.getXorAddress();
      console.log(address, port );
      data = {port:port, ip: address};
    }
  });
  axios.post('http://118.24.15.77:5000/api/addrs/'+arg.username, data)
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


// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。