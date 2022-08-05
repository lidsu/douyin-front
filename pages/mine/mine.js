// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe:"true",
    isFollow: false,
    
    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true
  },

  onLoad: function (params) {
    // console.log(params)
    var me=this;
    var publisherId=params.publisherId;
   // var user =app.userInfo;
   var user = app.getGlobalUserInfo();
   var userId=user.id;
    if(publisherId!=null&&publisherId!=''&&publisherId!=undefined){
      userId=publisherId;
      me.setData({
        isMe:false,
        publisherId: publisherId
      })
    }


    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/user/query?userId='+userId+"&fanId="+user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function (res) {
        console.log(res.data)
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
            isFollow: userInfo.follow
          })
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
  },

  followMe: function (e) {
    var me = this;

    var user = app.getGlobalUserInfo();
    var userId =user.id;
    var publisherId = me.data.publisherId;
    console.log(me)
    var followType = e.currentTarget.dataset.followtype;

    // 1：关注 0：取消关注
    var url = '';
    if (followType == '1') {
      url = '/user/beyourfans?userId=' + publisherId + '&fanId=' + userId;
    } else {
      url = '/user/dontbeyourfans?userId=' + publisherId + '&fanId=' + userId;
    }
    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function () {
        wx.hideLoading();
        if (followType == '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          })
        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          })
        }
      }
    })
  },


  logout:function(){
    // var user =app.userInfo;
    var user = app.getGlobalUserInfo();
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
            // app.userInfo=null
            wx.removeStorageSync('userInfo')
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
         var userInfo = app.getGlobalUserInfo();
         console.log("app.userInfo.id"+userInfo.id);
            wx.uploadFile({
              url: serverUrl+'/user/uploadFace?userId='+userInfo.id, //仅为示例，非真实的接口地址
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
  },
  

  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyVideoList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyLikesList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1)
  },
})
