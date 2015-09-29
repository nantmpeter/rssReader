const PLACEHOLDER_IMAGE = "assets/img/img-loading.gif";
const LOADING_IMAGE = '<img src="assets/img/loading.gif">';
// document.addEventListener("deviceready", function(){
// 	navigator.splashscreen.show();
// }, false);
(function(exports){

})(window);

// window.addEventListener('DOMContentLoaded',function(){
	$(function(){
	document.addEventListener("backbutton", function(){goback();}, false);                       
	var xhr = new XMLHttpRequest();
	chrome.storage.local.get("default_url",function(value){
		default_url = value["default_url"];
		if(default_url == undefined){
			default_url = "feed%2Fhttp%3A%2F%2Fzhihurss.miantiao.me%2Fdailyrss";
			chrome.storage.local.set({"default_url":default_url});
		}
		var pagesize = 15;
		xhr.open('GET',"http://feedly.com/v3/streams/contents?streamId="+default_url+'&count='+pagesize,true);
		xhr.responseType = 'json';
		$(".loading").show();
		// $("#content").html(LOADING_IMAGE);
		xhr.onload = function(e) {
			homelist(this.response.items)
		}
		xhr.send();
	});
 

	var list = document.getElementById('content');
  	list.addEventListener('click',function(e){
  		read();
  	});

	$(".home").click(function(){
		index();
	});

	$(".menu").click(function(){
		chrome.storage.local.get("feeds",function(value){
			var html = '<ul class="am-list">';
			for(var i in value.feeds) {
				var item = value.feeds[i];
				html += "<li class='feed' feed='"+item.url+"'>"+item.title+"</li>";
			}
			html += '</ul>';
			$(".feeds").html(html);
		});
		$('.page').hide();
		$('#menu').show();
	});

	$(".search").click(function(){
        // chrome.storage.local.set({"back":""});
		$("#search").show();
		$('#article').hide();
		$('#content').hide();
		$("#keyword")[0].focus();
	});

	$(".search-btn").click(function(){
		var keyword = $("#keyword").val();
		$(".loading").show();
		// $("#search-content").html(LOADING_IMAGE);
		$.get("http://feedly.com/v3/search/feeds",{"query":keyword,"count":20},function(data){
			var list = '<ul class="am-list">';
			// console.log(data);
			for (var i in data.results) {
				var item = data.results[i];
				// loadImage(img,url, function(blob_uri, requested_uri,img) {
				list += "<li class='feed' feed='"+item.feedId+"'><img />"+item.title+"</li>";
				        // });
			}
			list += "</ul>";
			$(".loading").hide();	
			$("#search-content").html(list);
		});
	});

	$(document).on("click",".feed",function(){
		// $("#search-content").html(LOADING_IMAGE);
		$(".loading").show();
		var title = $(this).text(),
			url = $(this).attr("feed");
		chrome.storage.local.set({"default_url":$(this).attr("feed")});
		chrome.storage.local.get("feeds",function(value){
			if($.isArray(value.feeds)) {
				var array = value.feeds;
			}else{
				var array = new Array();
			}
			var feed = new Object();
			feed.title = title;
			feed.url = url;
			array.push(feed);
			var tmp = {},
				result = [];
			for (var i = array.length - 1; i >= 0; i--) {
				if(array.length - i > 10)
					break;
				if(!tmp[array[i].url]){
					tmp[array[i].url] = true;
					result.push(array[i]);
				}
			};
			// var feeds = {[title:'"+title+"',url:'"+url+"']};
			// console.log(array，result);
			chrome.storage.local.set({"feeds":result});
		});
		$.get("http://feedly.com/v3/streams/contents",{"streamId":($(this).attr("feed"))},function(data){
				homelist(data.items);
				index();
		});
		// console.log($(this).attr("feed"));
	});

});

function urlencode (str) {  
    str = (str + '').toString();   

    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').  
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');  
} 

var loadImage = function(img,uri, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function() {
    callback(window.URL.createObjectURL(xhr.response), uri,img);
  }
  xhr.open('GET', uri, true);
  xhr.send();
}

function homelist(item){
			// var item = res.response.items,
			content = '',
            obj= {};

		for (var j = 0; j < item.length;j++) {
            var des = "";
            // try {
            //     des = $(item[j].summary.content).text();
            // } catch (err) {
            // }
            des = item[j].summary.content;
            // console.log(key,des);
            var key = "item"+j;
			obj[key] = "<h1>"+item[j].title+"</h1>"+des;
            des = des.replace(/<\/?[^>]*>/g,'').substr(0,50)+'...';
            // des = des.length > 40 ? des.substring(0,40) + ".." : "";
            // des = des.replace(/<strong>/, '').replace(/<\/strong>/, '');
            content += '<li name="item" no="'+j+'" class="table-view-cell media" data-reactid=".0.1.0.0"><a data-reactid=".0.1.0.0.0"><span data-reactid=".0.1.0.0.0.0">'+item[j].title+'</span><p data-reactid=".0.1.0.0.0.1"></p><small data-reactid=".0.1.0.0.0.2"><span data-reactid=".0.1.0.0.0.2.0">[</span><span data-reactid=".0.1.0.0.0.2.1">'+item[j].origin.title+'</span><span data-reactid=".0.1.0.0.0.2.2">]</span></small><p data-reactid=".0.1.0.0.0.3" style="font-size:14px;line-height: 18px;">'+des+'</p></a></li>';
        }

        chrome.storage.local.set(obj);

        var box = document.getElementById('content');
		$(".loading").hide();
        box.innerHTML=content;
		var article = document.getElementById('article-content');

		// console.log(document.getElementById('content'));
		item = document.getElementsByName("item");
		for (var i = item.length - 1; i >= 0; i--) {
			item[i].addEventListener('click',function(e){
				var no = this.getAttribute("no"),
				key = 'item'+no;
				chrome.storage.local.get(key,function(value){

					article.innerHTML = value[key];
					var imgs = article.querySelectorAll('img'),img;
					for (var j = imgs.length - 1; j >= 0; j--) {				
						img = imgs[j];
						url = imgs[j].src;
				        img.src = PLACEHOLDER_IMAGE;
						loadImage(img,url, function(blob_uri, requested_uri,img) {
				          img.src = blob_uri;
				        });
					};
				});
			});
		};
}

function goback(){
	chrome.storage.local.get("back",function(value){
		$('#article-content').html("");
		index();
		
		// if(value == "") {
		// 	index();
		// }else{
		// 	$(".page").hide();
		// 	$(value).show();
		// }
	});
}


function index(){
		$('#article-content').html("");
		$('.page').hide();
		$(".loading").hide();
		$('#content').show(200);
}

function read(){         $('.page').hide();
$('#article').show(); }
