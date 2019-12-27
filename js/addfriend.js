new Vue({
  el: '#add',
  data: {
    searchfriendname: "",
    ausername:'',
    isfinish:0,
    isok:0,
    userlist:[{username:'test'}],
    domain:"http://118.24.15.77:5000"
  },
  created(){
    // this.checkIfMessage();
  },
  mounted()
  {
    // setInterval(() => {
    //   this.checkIfMessage();
    // }, 500);
  },
  methods: {
    KeyUpEnter:function(){
      var that=this
      axios
        .post(this.domain+"/api/messages/",that.searchfriendname)
        .then(res=>{
          console.log(res)
        })
        .catch(error=>{console.log(error)})
      this.isfinish=1;
    },
    closeadd(){
      ipcRenderer.send('close-add');
    },
    additem(){
      var that=this;
      let data={username:this.ausername,searchfriendname:this.searchfriendname}
      axios
        .post(this.domain+"/api/messages/",data)
        .then(res=>{
          console.log(res)
           that.isfinish=0;
            that.isok=1;
        })
        .catch(error=>{console.log(error)})
    }
  }
});
