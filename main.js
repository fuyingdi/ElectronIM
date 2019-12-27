const { app, BrowserWindow } = require('electron')
const electron = require('electron');
// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow () {
  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({
    width: 360
    ,height: 300
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
