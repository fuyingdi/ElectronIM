const ipcRenderer = require('electron').ipcRenderer;
var username = window.localStorage.getItem('username');
var current = window.localStorage.getItem('current')+'';
var converId = null;
(function () {
	var d = document,
		w = window;
	ipcRenderer.on('post-username',  function(event, message) {
		console.log('user:', message);
		this.userid=message
	});
	ipcRenderer.on('ausername',  function(event, message) {
		console.log('auser:', message);
		this.ausername=message
	});
})();