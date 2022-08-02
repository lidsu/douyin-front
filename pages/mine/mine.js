// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe:"true",
    isFollow: false,
  },

  onLoad: function (params) {
    var me=this;
    var user =app.userInfo;
    
    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/user/query?userId='+user.id,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log(res.data)
        wx.hideLoading();
        if (res.data.status == 200) {
          var userInfo = res.data.data;
          var faceUrl="../resource/images/noneface.png"
          if(userInfo.faceImage!=null&&userInfo.faceImage!=''&&userInfo.faceImage!=undefined){
             faceUrl=serverUrl+userInfo.faceImage;
          }
       
          me.setData({
            faceUrl: faceUrl,
            nickname: userInfo.nickname,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
          })
        } 
      }
    })
  },

  logout:function(){
    var user =app.userInfo;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    });
    // 调用后端
    wx.request({
      url: serverUrl + '/logout?userId='+user.id,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data)
        wx.hideLoading();
        if (res.data.status == 200) {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
            app.userInfo=null
            wx.navigateTo({
              url: '../userLogin/login',
            })
           }
      }
    })
  },
  changeFace:function(){
    var me = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['alumn'],
      success:function(res){
         var tempFilePaths = res.tempFiles;
         console.log(tempFilePaths[0].tempFilePath);
         wx.showLoading({
          title: '上传中...',
        });
         var serverUrl=app.serverUrl;
         console.log("app.userInfo.id"+app.userInfo.id);
            wx.uploadFile({
              url: serverUrl+'/user/uploadFace?userId='+app.userInfo.id, //仅为示例，非真实的接口地址
              filePath: tempFilePaths[0].tempFilePath,
              name: 'file',
              formData: {
                'user': 'test'
              },
              header:{
                'content-type': 'application/json' // 默认值
              },
              success (res){
                var data =  JSON.parse(res.data)
                console.log("data"+data);
                wx.hideLoading()
                //do something
                if(data.status==200){
                  wx.showToast({
                    title: '上传成功',
                    icon: 'success',
                    duration: 2000
                  });

                  var imageUrl = data.data;
                  me.setData({
                    faceUrl:  serverUrl+imageUrl
                  })
                }else if(data.status==500){
                  wx.showToast({
                    title: data.msg,
                    duration: 2000
                  });
                }
          }
        })
      }
    })
  },
  uploadVideo:function(){
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album','camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        console.log(res)
        var duration= res.tempFiles[0].duration 
        var tmpheight=res.tempFiles[0].height
        var tmpwidth=res.tempFiles[0].width
        var tmpVideoUrl=res.tempFiles[0].tempFilePath
        var tmpCoverUrl=res.tempFiles[0].thumbTempFilePath
        if(duration>11){
          wx.showToast({
            title: '视频时长不能超过10s~~',
            icon: "none",
            duration: 2500
          })
        }else if(duration<1){
          wx.showToast({
            title: '视频时长太短~请上传超过1s的视频~~',
            icon: "none",
            duration: 2500
          })
        }else{
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration='+duration
            +'&tmpheight='+tmpheight
            +"&tmpwidth="+tmpwidth
            +"&tmpVideoUrl="+tmpVideoUrl
            +"&tmpCoverUrl="+tmpCoverUrl
          })
        }
      }
      
    })
  }
})
