const apiList = {
  'SEARCH': '/mixApi/search',
  'LYRIC': '/mixApi/lyric',
  'ALBUM': '/mixApi/album',
  'BATCH_URL': '/mixApi/url/batch',
  'PLAYLIST': '/mixApi/playlist',
  'USER_PLAYLIST': '/mixApi/playlist/user',
  'DAILY_PLAYLIST': '/mixApi/playlist/daily',
  'RECOMMEND_PLAYLIST': '/mixApi/playlist/recommend',
  'SINGER_INFO': '/mixApi/singer',
  'SINGER_ALBUM': '/mixApi/singer/album',
  'SINGER_SIM': '/mixApi/singer/sim',
  'SINGER_SONG': '/mixApi/singer/song',
  'SONG_INFO': '/mixApi/song',
  'SONG_RECORD': '/mixApi/song/record',
  'SINGLE_URL': '/mixApi/url',
  'SONG_FIND': '/mixApi/song/find',
  'GET_HEART_MODE': '/mixApi/playlist/heart', // 心动模式
  'MV': '/mixApi/mv',
  'TOP_CATEGORY': '/mixApi/top/category',
  'TOP_SONGS': '/mixApi/top',

  '163_SEARCH': '/163Api/search',
  '163_LOGIN_PHONE': '/163Api/login/cellphone',
  '163_LOGOUT': '/163Api/logout',
  '163_LOGIN_EMAIL': '/163Api/login',
  'LOGIN_STATUS': '/163Api/login/status',
  'USER_LIST': '/163Api/user/playlist',
  'LIST_DETAIL': '/163Api/playlist/detail',
  'SONG_DETAIL': '/163Api/song/detail',
  'SONG_URL': '/163Api/song/url',
  'GET_LYRIC': '/163Api/lyric',
  'CAPTCH_SENT': '/163Api/captch/sent',
  'CAPTCH_VERIFY': '/163Api/captch/verify',
  'GET_USER_DETAIL': '/163Api/user/detail',
  'MUSIC_COMMENTS': '/163Api/comment/music',
  'GET_QQ_VKEY': '//u.y.qq.com/cgi-bin/musicu.fcg?callback=jQuery331015138042840240584_1544498679284&data=%7B%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%225339940689%22%2C%22songmid%22%3A%5B%220039MnYb0qxYhV%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%22%22%2C%22platform%22%3A%2220%22%7D%7D%7D&jsonpCallback=getQQMusicUrl&callback=getQQMusicUrl&_=1544498679292',
  'DAILY_RECOMMEND_SONGS': '/163Api/recommend/songs', // 日推
  'DAILY_RECOMMEND_LIST': '/163Api/recommend/resource', // 日推歌单
  'RECOMMEND_LIST': '/163Api/personalized', // 未登录用户的推荐歌单
  'LIKE_MUSIC': '/163Api/like', // 喜欢音乐
  'LIKE_COMMENT': '/163Api/comment/like', // 评论点赞
  'PLAYLIST_TRACKS': '/163Api/playlist/tracks', // 歌单的增减操作
  'GET_SINGER_DESC': '/163Api/artist/desc', // 获取歌手描述
  'GET_SINGER_SONGS': '/163Api/artists', // 获取歌手的热门歌曲
  'GET_SINGER_ALBUMS': '/163Api/artist/album', // 获取歌手的转接
  // 'GET_HEART_MODE': '/163Api/playmode/intelligence/list', // 心动模式
  'GET_ALBUM': '/163Api/album', // 获取专辑信息
  'COMMENT': '/163Api/comment', // 发送、删除 评论
  'SIMI_ARTIST': '/163Api/simi/artist', // 相似歌手
  'SCROBBLE': '/163Api/scrobble', // 听歌打卡
  'GET_USER_RECORD': '/163Api/user/record', // 获取听歌记录
  'GET_FOLLOWS': '/163Api/user/follows', // 获取关注列表
  'GET_FOLLOWEDS': '/163Api/user/followeds', // 获取粉丝列表
  'GET_DJ_CATE_LIST': '/163Api/dj/catelist', // 获取电台分类
  'GET_DJ_RECOMMEND': '/163Api/dj/recommend/type', // 根据分类获取推荐的电台
  'GET_DJ_DETAIL': '/163Api/dj/detail', // 获取电台的详细信息
  'GET_DJ_SONGS': 'api/dj/program', // 获取电台的歌单
  'GET_PERSON_FM': 'api/personal_fm', // 获取私人fm
  'GET_MV_INFO': 'api/mv/detail', // 获取 mv 信息
  'GET_SIMI_MV': 'api/simi/mv', // 获取相似 mv
  'SUBSCRIBE_PLAYLIST': 'api/playlist/subscribe', // 收藏/取消收藏 歌单

  'QQ_SEARCH': 'apiQ/search', // qq 音乐搜索
  'QQ_VKEY': 'apiQ/vkey', // qq音乐 vkey
  'QQ_LYRIC': 'apiQ/lyric', // qq音乐歌词
  'QQ_GET_COMMENT': 'apiQ/comment', // qq音乐获取评论
  'QQ_GET_URLS': 'apiQ/song/urls', // 获取 qq 音乐播放链接
  'QQ_SONG_FIND': 'apiQ/song/find', // 根据关键词去查找一首qq音乐中的歌
  'QQ_SONG_FINDS': 'apiQ/song/finds', // 批量的查找
  'QQ_SET_COOKIE': 'apiQ/user/setCookie', // 设置 cookie
  'QQ_USER_DETAIL': 'apiQ/user/detail', // 查询qq用户的歌单
  'QQ_LIST_DETAIL': 'apiQ/songlist', // qq 音乐歌单
  'QQ_SINGER_DESC': 'apiQ/singer/desc', // qq 歌手介绍
  'QQ_SINGER_SIM': 'apiQ/singer/sim', // qq 相似歌手
  'QQ_SINGER_SONGS': 'apiQ/singer/songs', // qq 歌手的热门歌曲
  'QQ_SINGER_ALBUMS': 'apiQ/singer/album', // qq 歌手的专辑
  'QQ_ALBUM': 'apiQ/album', // qq 专辑信息
  'QQ_ALBUM_SONGS': 'apiQ/album/songs', // qq 专辑歌曲
  'QQ_SONG_DETAIL': 'apiQ/song', // qq 歌曲详情
  'QQ_MV_INFO': 'apiQ/mv', // qq mv 信息,
  'QQ_MV_URL': 'apiQ/mv/url', // qq mv 播放链接
  'QQ_DOWN_URL': 'apiQ/song/url', // qq 下载歌曲链接
  'QQ_RECOMMEND_PLAYLIST': 'apiQ/recommend/playlist', // qq 推荐歌单
  'QQ_GET_COOKIE': 'apiQ/user/getCookie', // qq 获取cookie
  'QQ_SONG_LIST_MAP': 'apiQ/songlist/map', // qq 获取歌单歌曲id哈希表
  'QQ_USER_SONG_LIST': 'apiQ/user/songlist', // qq 获取用户的歌单
  'QQ_SONG_LIST_ADD': 'apiQ/songlist/add', // 添加歌曲到歌单
  'QQ_SONG_LIST_REMOVE': 'apiQ/songlist/remove', // 把歌曲移出歌单
  'QQ_COMMENT_LIKE': 'apiQ/comment/like', // qq 音乐评论点赞
  'QQ_COMMENT_DELETE': 'apiQ/comment/del', // qq 音乐删除评论
  'QQ_COMMENT_SEND': 'apiQ/comment/send', // qq 音乐发送评论
  'QQ_COLLECTED_SONGLIST': 'apiQ/user/collect/songlist', // qq 音乐用户收藏的歌单
  'QQ_COLLECT_SONGLIST': 'apiQ/songlist/collect', // qq 音乐收藏歌单操作

  'MIGU_SEARCH': 'apiM/search', // 咪咕 搜索
  'MIGU_URL_GET': 'apiM/song/url', // 咪咕 获取图片、播放链接
  'MIGU_LYRIC': 'apiM/lyric', // 咪咕 歌词
  'MIGU_SINGER_DESC': 'apiM/singer/desc', // 歌手详情
  'MIGU_SINGER_SONGS': 'apiM/singer/songs', // 根据歌手获取歌曲
  'MIGU_SINGER_ALBUMS': 'apiM/singer/albums', // 根据歌手获取专辑
  'MIGU_ALBUM': 'apiM/album', // 获取专辑信息
  'MIGU_SONG_INFO': 'apiM/song', // 咪咕 获取歌曲信息
  'MIGU_PLAYLIST': 'apiM/playlist', // 咪咕 歌单
  'MIGU_RECOMMEND_PLAYLIST': 'apiM/recommend/playlist', // 咪咕 推荐歌单

  'COMMON_GET_FEEDBACK': 'apiQ/feedback', // 获取反馈
  'COMMON_ADD_FEEDBACK': 'apiQ/feedback/add', // 增加反馈
  'COMMON_DELETE_FEEDBACK': 'apiQ/feedback/delete', // 删除反馈

  '163': '//music.jsososo.com/neapi/index.php',
  'QQ_SONG_INFO': '//u.y.qq.com/cgi-bin/musicu.fcg',
  'QQ_LIST': '//c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg',
  'QQ_USER_LIST_DETAIL': '//music.jsososo.com/163Api/getQQListDetail.php',
  'QQ_GET_LYRIC': '//music.jsososo.com/163Api/getQQLyricNew.php',
  'QQ_RADIO_INFO': '//u.y.qq.com/cgi-bin/musicu.fcg',
};

export default apiList;