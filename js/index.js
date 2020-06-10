$(function () {
    //如果是 Chrome 浏览器
    if (navigator.userAgent.indexOf("Chrome") > -1) {
        //去掉歌曲播放器的左边框
        document.querySelector(".music-player").style.borderLeft = "none";
    }
    //如果是IE的 Edge 浏览器
    if (navigator.userAgent.indexOf("Edge") > -1) {
        //去掉歌曲播放器的左边框
        document.querySelector(".music-player").style.borderLeft = "1px solid #ddd";
    }

    // axios发送请求时的拦截器
    // axios.interceptors.request.use(function (config) {
    //     //给所有的请求的请求头添加一个 mytoken 属性
    //     // config.headers.mytoken = '*';
    //     //一定要把config返回出去
    //     return config;
    // }, function (err) {
    //     console.log(err);
    // });
    // axios响应请求时的拦截器
    axios.interceptors.response.use(function (res) {
        //对返回的数据进行处理
        res = res.data; //只返回请求回来的数据
        return res;
    }, function (err) {
        //处理响应错误信息
        console.log(err);
    });


    var vm = new Vue({
        el: '#app',
        data: {
            //查询关键字
            query: '',
            //歌曲列表
            music: {
                list: [],
                comments: []
            },
            //是否显示遮罩层
            isShow: false,
            mvUrl: ''
        },
        //这是一个生命周期函数，当它被触发时就说明模板可以使用了
        mounted: function () {
            //获取默认显示的歌曲
            //因为axios.get是异步函数，所以使用箭头函数就不用再改变this的指向了
            if (this.query == '') this.query = document.querySelector('.search-input').placeholder;
            // axios.get('https://autumnfish.cn/search?keywords=' + this.query,
            //     { method: 'get' },
            //     { headers: { 'Access-Control-Allow-Origin': '*' } })
            //     .then((data) => {
            //         this.music.list = data.result.songs;
            //     }, (err) => {
            //         console.log(err);
            //     });
            axios.get('https://autumnfish.cn/search?keywords=' + this.query)
                .then((data) => {
                    this.music.list = data.result.songs;
                }, (err) => {
                    console.log(err);
                });
        },
        methods: {
            //搜索歌曲
            searchMusic: function () {
                if (this.query == '') this.query = document.querySelector('.search-input').placeholder;
                axios.get('https://autumnfish.cn/search?keywords=' + this.query)
                    .then((data) => {
                        this.music.list = data.result.songs;
                    }, (err) => {
                        console.log(err);
                    });
            },
            //播放歌曲
            playMusic: async function (musicId) {
                // var musicPlayer = document.getElementById('footer-player');
                var musicPlayer = $('#footer-player')[0];

                //获取歌曲地址
                await axios.get('https://autumnfish.cn/song/url?id=' + musicId)
                    .then((data) => {
                        musicPlayer.src = data.data[0].url;
                        // musicPlayer.load(); //重新加载音频
                        musicPlayer.play(); //播放
                    }, (err) => {
                        console.log(err);
                    });

                //获取歌曲封面
                await axios.get('https://autumnfish.cn/song/detail?ids=' + musicId)
                    .then((data) => {
                        $('.PlaySy').css('background-image', 'url(' + data.songs[0].al.picUrl + ')');
                    }, (err) => {
                        console.log(err);
                    });

                //获取歌曲评论
                await axios.get('https://autumnfish.cn/comment/hot?type=0&id=' + musicId)
                    .then((data) => {
                        this.music.comments = data.hotComments;
                    }, (err) => {
                        console.log(err);
                    });
            },
            //播放MV
            playerMV: async function (mvId, mvState) {
                var mvPlayer = $('#masked-player')[0];
                if (mvState == 'show') {
                    this.isShow = true;
                    //获取MV地址
                    await axios.get('https://autumnfish.cn/mv/url?id=' + mvId)
                        .then((data) => {
                            this.mvUrl = data.data.url;
                        }, (err) => {
                            console.log(err);
                        });
                    // mvPlayer.load();
                    // mvPlayer.play();
                } else if (mvState == 'hide') {
                    this.isShow = false;
                    mvPlayer.pause();
                }
            }
        }
    });


    //歌曲播放器
    var i = 0;//图片旋转度数
    var seii = {}//图片旋转定时器
    var fPlayer = $('#footer-player')[0];

    //播放按钮点击事件
    $(".Play").click(function () {
        if (fPlayer.paused) {
            fPlayer.play();
        } else {
            fPlayer.pause();
        }
    });

    //歌曲控件开始播放时触发
    fPlayer.onplay = function () {
        $(".Play").css({
            'width': '32px',
            'height': '32px',
            'background-image': 'url(images/play.png)'
        });

        clearInterval(seii);//先清除改定时器，再重新开启避免重复开启多个定时器
        seii = setInterval(function () {
            (i == 360) ? i = 0 : i++;
            $(".PlaySy").css('transform', 'translate(-50%, -50%) rotate(' + i + 'deg)');
            $(".PlayEy").css('transform', 'translate(-50%, -50%) rotate(' + i + 'deg)');
            $(".Btn").css('transform', 'rotate(' + i + 'deg)');
        }, 50);
    }

    //歌曲控件暂停时会触发，当播放完一首歌曲时也会触发
    fPlayer.onpause = function () {
        $(".Play").css({
            'width': '29px',
            'height': '36px',
            'background-image': 'url(images/pause.png)'
        });
        clearInterval(seii);
    }
    // end 歌曲播放器
});