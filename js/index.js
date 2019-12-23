new Vue({
  el: '#chat',
  data: {
    userList: null,
    current:{username:"冯佳丽"},
    group: false,
    isgroup: false,
    isChat: false,
    mask: false,
    showchat: true,
    showgroup: false,
    userid: window.localStorage.getItem('uid'),
    fakefriendlist:[
      {
        username:"冯佳丽",
        endmessage:"hello",
        introduction:"ffffffff"
      },
      {
        username:"付映迪",
        endmessage:"123",
        introduction:"ffffffff"
      },
      {
        username:"赵双",
        endmessage:"123",
        introduction:"zzzzzzzz"
      },
    ]
  },
  created(){
    this.loaduser();
  },
  filters: {
    filterImg:(img)=>{
      return img.replace('/images', 'img');
    }
  },
  methods: {
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
      var index = this.userList.indexOf(item);
      this.userList.splice(index, 1);
    },
    loaduser(){
      console.log("load fake user list");
      userList = this.fakefriendlist;
      // this.$http.post(config.server+'loaduser',{},{emulateJSON:true}).then(function(res){
      //   this.userList = res.body.result;
      // },function(res){
      //   console.log(res.status);
      // });
    },
    toggleSession(item){
      this.current = item;
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
    }
  }
});
