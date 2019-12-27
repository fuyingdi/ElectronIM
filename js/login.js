const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;
const links = document.querySelectorAll('a[href]')

new Vue({
  el: '#login',
  data: {
    username: null,
    password: null,
		signin: false,
    loginhint: "",
    domain:"http://118.24.15.77:5000",
  },
  created(){
    // this.openDevTools();
 
  },
  methods: {
  	openDevTools(){
  		let _this = this;
  		window.addEventListener('keydown', function(event){
			  if(event.ctrlKey && event.shiftKey){
			    ipcRenderer.send('openDevTools');
			  }
			  if (event.keyCode==13 && _this.username && _this.password) {
					_this.UserLogin();
				}
			});
  	},
  	closeLogin(){
  		ipcRenderer.send('close-login');
  	},
    UserLogin(){
      var that=this;
    	let obj = {
    		username: this.username,
    		password: this.password
    	}
      axios
      .post(this.domain+"/api/users/action/login",obj)
      .then(function(response){
        // console.log(response)
        // if(){
          that.signin=true;
          window.localStorage.setItem('username', that.username);
          ipcRenderer.send('openChat', that.username);
        // }
        // else{
        //   that.loginhint = '用户名/密码错误！';
        // }
      })
      .catch(error=>{that.loginhint = '用户名/密码错误！';});
    }
  }

});