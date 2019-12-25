new Vue({
  el: '#chat',
  data: {
    searchfriendname: "",
    group: false,
    isgroup: true,
    isChat: false,
    showchat: true,
    showgroup: false,
    userid: 'fjl',
    allfriendlist:null,
    currentchat:{username:"冯佳丽"},
    chatlist:[
      {
        username:"冯佳丽",
        endmessage:"hello"
      },
      {
        username:"付映迪",
        endmessage:"123"
      },
      {
        username:"赵双",
        endmessage:"123"
      },
    ],
    messageList:[
      {
        type:"",
        content:"111",
        self: true
      },
      {
        type:"",
        content:"222",
        self: false
      },
      {
        type:"",
        content:"33333333333333",
        self: false
      },
      {
        type:"",
        content:"111",
        self: true
      },
      {
        type:"",
        content:"222",
        self: false
      },
      {
        type:"",
        content:"33333333333333",
        self: false
      },
      {
        type:"",
        content:"111",
        self: true
      },
      {
        type:"",
        content:"222",
        self: false
      },
      {
        type:"",
        content:"33333333333333",
        self: false
      }
    ],
    allmessagelist:{},
    domain:"http://118.24.15.77:5000",
    sendContent:"",
    itemheight : 40,
    scrollheight : 200
  },
  created(){
    this.loaduser();
    this.checkIfMessage();
  },
  mounted()
  {
    setInterval(() => {
      this.checkIfMessage();
    }, 500);
    this.scrollToBottom();
    // 请求所有好友列表
    //前端：聊天好友列表
  },
  filters: {
    filterImg:(img)=>{
      return img.replace('/images', 'img');
    }
  },
  methods: {
    KeyUpEnter:function(){
      console.log(this.searchfriendname);
      this.searchfriendname = "";
    },
    KeyDownEnter:function(){
      this.sendMessage();
      this.sendContent = "";
    },
    closeWin(){
      console.log("aaa");
      ipcRenderer.send('close-main');
      console.log("bbb");
    },
    closeMin(){
      ipcRenderer.send('min-main');
    },
    closeMax(){
      ipcRenderer.send('max-main');
    },
    showChat(){
      this.group = false;
      this.showchat = true;
      this.showgroup = false;
    },
    showGroup(){
      this.group = true;
      this.showchat = false;
      this.showgroup = true;
    },
    delUser(item){
      var index = this.chatlist.indexOf(item);
      this.chatlist.splice(index, 1);
      // this.allmessagelist.delete(this.allmessagelist[item])
      // console.log(this.allmessagelist)
    },
    loaduser(){

      // this.$http.post(config.server+'loaduser',{},{emulateJSON:true}).then(function(res){
      //   this.userList = res.body.result;
      // },function(res){
      //   console.log(res.status);
      // });
    },
    toggleSession(item){
      this.currentchat = item;
      this.isChat = true;
      window.localStorage.setItem('current', item.userid);
    },
    handleFileChange(){
      let inputDOM = document.querySelector('.add-file');
      this.file = inputDOM.files[0];
      console.log('this.file', this.file);
      let formData = new FormData();
      formData.append('file',inputDOM.files[0]);
      // this.errText = '';
      // let size = Math.floor(this.file.size / 1024);
      this.$http.post(config.server+'upload',formData,{emulateJSON:true}).then(function(res){
        console.log('res.body.url', res.body.url);
        let html = '<img src="'+res.body.url+'" /><div></div>';
        document.getElementById("textarea").innerHTML+=html;  
      },function(res){
        console.log(res.status);
      });
    },
    addfriend(){
      ipcRenderer.send('add');
    },
    checkIfMessage(){
      var that = this;
      axios
        .get(this.domain+'/api/messages/new/'+this.userid)
        .then(function(response){
          if(response.data.new==true)
          {
            that.getMessage();
            that.scrollToBottom();
          }
          else{
            console.log("nonono");
          }
        })
        .catch(function(error)
        {
          console.log(error);
        })
    },
    getMessage(){
      axios
      .get(this.domain+'/api/messages/'+this.userid)
      .then(function(response){
        this.messageList = this.messageList.concat(response.data.reverse());
        console.log(response.data);
      })
      .catch()
    },
    sendMessage(){
      let data = {
        to:this.currentchat.username,
        type:"text",
        content:this.sendContent,
        from:this.userid,
      }
      this.messageList.push({
        type:"text",
        content:data.content,
        self:true,
      })
      this.scrollToBottom();
      this.sendContent = "";
      axios
        .post(this.domain+"/api/messages/"+this.currentchat.username,data)
        .then(res=>{console.log("res=>"+res)})
        .catch(error=>{console.log(error)})
    },
    scrollToBottom: function () {
      this.$nextTick(() => {
        var container = this.$el.querySelector("#message");
        container.scrollTop = container.scrollHeight;
      })
    },
    openchatwindow(chatusername){
      var arr = {"username":this.currentchat.username,"messagehistory":this.messageList};
      this.allmessagelist[this.currentchat.username]=arr;
      this.currentchat.username=chatusername;
      if(this.allmessagelist[this.currentchat.username]==null){
        this.messageList=[];
      }
      else{
        this.messageList=this.allmessagelist[this.currentchat.username].messagehistory;
        console.log(this.allmessagelist[this.currentchat.username].messagehistory)
      }
      this.scrollToBottom();
    }
  },
});
