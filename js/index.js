<<<<<<< HEAD
var vm=new Vue({
=======
//const raptorq = require("../build/Release/raptorq");
new Vue({
>>>>>>> dev
  el: '#chat',
  data: {
    group: false,
    isgroup: true,
    isChat: true,
    showchat: true,
    showgroup: false,
    userid: window.localStorage.getItem('username'),
    allfriendlist:[
    ],
    currentchat:{username:""},
    chatlist:[
    ],
    messageList:[],
    allmessagelist:{},
    domain:"http://118.24.15.77:5000",
    sendContent:"",
    sendtype:"text",
    isde:false
  },
  created(){
    // console.log(this.userid)
    this.loaduser();
    this.checkIfMessage();
  },
  mounted()
  {
    setInterval(() => {
      this.checkIfMessage();
    }, 500);
    this.scrollToBottom();
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
      let a={username:this.userid,logout:true};
      axios
        .post(this.domain+'/api/users/login/',a)
        .then(function(response){
          console.log(response)
        })
        .catch(function(error)
        {
          console.log(error);
        })
      // ipcRenderer.send('close-main');
    },
    closeMin(){
      ipcRenderer.send('min-main');
    },
    closeMax(){
      ipcRenderer.send('max-main');
    },
    addfriend(){
      // let ag={userid:this.userid,searchfriendname:this.searchfriendname}
      ipcRenderer.send('addfriend');
    },
    showChat(){
      this.isde=false;
      this.group = false;
      this.showchat = true;
      this.showgroup = false;
    },
    showGroup(){
      this.isde=false;
      this.group = true;
      this.showchat = false;
      this.showgroup = true;
    },
    deleteUser(item){
      this.isChat=true;
      this.currentchat.username="";
      this.messageList=[];
      delete this.allmessagelist[item.username];
      var index = this.chatlist.indexOf(item);
      this.chatlist.splice(index, 1);
    },
    loaduser(){
      var that = this;
      axios
      .get(this.domain+"/api/users/action/login")
      .then(function(response){
        var usr=response.data;
        for(var i in usr){
          if(usr[i]!=that.userid){
            let ul={username:usr[i]};
            that.allfriendlist.push(ul)
          }
        }
      })
      .catch(error=>{console.log(error)});
    },
    checkIfMessage(){
      var that = this;
      axios
        .get(this.domain+'/api/messages/new/'+this.userid)
        .then(function(response){
          if(response.data.new==true)
          {
            // console.log("yesyesyes");
            that.getMessage();
          }
          else{
            // console.log("nonono");
          }
        })
        .catch(function(error)
        {
          console.log(error);
        })
    },
    getMessage(){
      var that = this;
      axios
      .get(this.domain+'/api/messages/'+this.userid)
      .then(function(response){
        for(var i=0;i<response.data.messages.length;i++)
        {
          var a = JSON.parse(response.data.messages[i]);
          console.log(a);
          if(that.currentchat.username!=a.from)
          { 
            //判断chatlist有无该用户
            var index = (that.chatlist||[]).findIndex((chat) => chat.username === a.from);
            if(index==-1){
              let nc={username:a.from,unreadmessage:1}
              that.chatlist.push(nc);
              let m=[];
              m.push({type:a.type,content:a.content,self:false})
              let r={username:a.from,messagehistory:m}
              that.allmessagelist[a.from]=r
            }
            else{
              let mh=that.allmessagelist[a.from]['messagehistory'];
              mh.push({type:a.type,content:a.content,self:false})
              let ar={username:a.from,messagehistory:mh}
              that.allmessagelist[a.from]=ar
              that.chatlist[index]['unreadmessage']=that.chatlist[index]['unreadmessage']+1;
            }
          }
          else{
            that.messageList.push(
              {
                type:a.type,
                content:a.content,
                self:false,
              })
            that.scrollToBottom();
          }
        }
        console.log(response.data);
      })
      .catch()
    },
    sendMessage(){
      if(this.sendContent==""){
       console.log('no content')
      }
      else{
        var that = this;
        let data = {
          to:this.currentchat.username,
          type:this.sendtype,
          content:this.sendContent,
          from:this.userid,
        }
        this.messageList.push({
          type:this.sendtype,
          content:data.content,
          self:true,
        })
        this.scrollToBottom();
        this.sendContent = "";
        this.sendtype = "text"
        axios
        .post(this.domain+"/api/messages/"+this.currentchat.username,data)
        .then(res=>{})
        .catch(error=>{console.log(error)})
<<<<<<< HEAD
      }
    },
    scrollToBottom: function () {
      this.$nextTick(() => {
        var container = this.$el.querySelector("#message");
        container.scrollTop = container.scrollHeight;
      })
    },
    openchatwindow(chatusername,item){
      this.sendtype='text'
      this.sendContent=""
      var index = (this.chatlist||[]).findIndex((chat) => chat.username === item.username);
      this.chatlist[index]['unreadmessage']=0
      this.isChat=false;
      var arr = {username:this.currentchat.username,messagehistory:this.messageList};
      this.allmessagelist[this.currentchat.username]=arr;
      this.currentchat.username=chatusername;
      if(this.allmessagelist[this.currentchat.username]==null){
        this.messageList=[];
      }
      else{
        this.messageList=this.allmessagelist[this.currentchat.username].messagehistory;
      }
      this.scrollToBottom();
    },
    uploadFiles(e){ 
      this.sendtype="image";  
      var that=this
      const fileObj = document.getElementById("id").files[0];  
      let msgForm = new FormData(); // 创建FormData
      msgForm.append('file',fileObj);  // 向FormData中添加文件对象
      axios.post(this.domain+"/api/sobj", msgForm, {  // axios请求
        headers: { 'Content-Type': 'multipart/form-data' }  // 切记，一定要修改请求头。
       })
       .then(function(response){
          that.sendContent='http://118.24.15.77:5000'+response.data.url;
      })
        .catch(error=>{console.log(error)});
    },
    uploadFile(e){ 
      this.sendtype="audio";  
      var that=this
      const fileObj = document.getElementById("ids").files[0];  
      let msgForm = new FormData(); // 创建FormData
      msgForm.append('file',fileObj);  // 向FormData中添加文件对象
      axios.post(this.domain+"/api/sobj", msgForm, {  // axios请求
        headers: { 'Content-Type': 'multipart/form-data' }  // 切记，一定要修改请求头。
       })
       .then(function(response){
          that.sendContent='http://118.24.15.77:5000'+response.data.url;
          console.log(that.sendContent)
      })
        .catch(error=>{console.log(error)});
    },
    addchat(item){
      var arr= this.chatlist.filter(function(items){
        return items.username == item.username
      })
      if (arr.length==0) {
        let newchat={username:item.username,unreadmessage:0};
        this.chatlist.push(newchat);
        this.openchatwindow(item.username,newchat)
      }
      else{
        this.openchatwindow(item.username,arr[0]);
      }
      this.group=false;
      this.showchat=true;
      this.showgroup=false
    },
    deleteFri(item){
      var index = this.allfriendlist.indexOf(item);
      this.allfriendlist.splice(index, 1);
      if(this.currentchat.username==item.username)
      {
        this.isChat=true;
        this.currentchat.username="";
        this.messageList=[];
        delete this.allmessagelist[item.username];
        var index = (this.chatlist||[]).findIndex((chat) => chat.username === item.username);
        this.chatlist.splice(index, 1);
      }else{
        delete this.allmessagelist[item.username];
        var index = (this.chatlist||[]).findIndex((chat) => chat.username === item.username);
        if (index!=-1) {
          this.chatlist.splice(index, 1);
        }
        //向后端发删除请求
        this.isde=true;
      }
    },
    upload(){
=======
    },
    sendImage(){
>>>>>>> dev

    }
  }
});
