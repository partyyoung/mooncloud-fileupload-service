//下面的url是获取环境变量的，就是如果要复制图片的地址 需要exURL+加上这个图片的相对路径
var exURL = "";
//因为用了代理服务器，所以需要变量域名,如果项目要部署到后台 请修改domain这个值！主要是登录需要网站域名和接口域名一致
//var domain = "http://127.0.0.1:8020";
//var domain = "http://172.16.0.34:8020";
var domain = "";

//另外的一个域名
var domain2 = "";
$.ajax({
	type:"get",
	url:domain2+"/upload/oss/env",
	async:true,
	dataType:"JSON",
	success:function(data){
		if(data.success == true){
			data = data.body;
			exURL = data.fileHttpUrl;
		}else{
			console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
		}
		
	}
});

var fileNumAndMetarialsNum = 0; //用于全选的
var offClickNum = 0//这个也是用于全选的

//***很重要的两个函数模板
var directorys1;//新的data 是给每一个文件夹的点击事件用的
var files1;
var aa = directorys1;
var bb = files1;
var every_page_showNum = 100;
function buildFiles(arr,page_num){
	//让文件夹的ul的内容制空
	$('.cases_files').html("");
	var length;
	if(arr.length/(every_page_showNum*page_num) <= 1){
		length = arr.length;
	}else if(arr.length/(every_page_showNum*page_num) > 1 ){
		length = every_page_showNum*page_num;
	}
	for(var a=every_page_showNum*(page_num-1); a<length; a++){
		//console.log(arr[a]);
		var needRelativePath = "'"+arr[a].relativePath+"'"; //这个子文件夹的相对路径
		var needName = "'"+arr[a].name+"'"; //这个子文件夹的名字
		var needSize = arr[a].size;//这个子文件夹的大小
		var locked = arr[a].deletable //false代表锁住 true代表打开
		//console.log(locked);
		var display;
		if(locked){
			display = "none";
		}else{
			display = "block";
		}
		//双击事件传入3个值：名字 相对路径 大小
		var oLi2 = $('<li class="case_file"  onclick="Enter('+needRelativePath+','+needName+','+needSize+')"><div class="gray_box_wrap"><div class="select_box_off"></div><div class="select_box_on"><img src="images/sure_icon3.png"></div><div class="isLocked" style="display:'+display+'"><img class="locked_img" src="images/lock.png"></div><div class="gray_box"><img src="images/file_have.png" class="file_img"></div></div><p>'+arr[a].name+'</p></li>');		
		oLi2.appendTo($('.cases_files'));
	}
	//循环结束
//------------------这里都是选框的代码--------------------------------	
	//素材鼠标进入的时候 显示选择框和复制url和删除按钮
	$('.case_file').mouseenter(function(ev){
		//阻止事件冒泡
		ev.stopPropagation();
		$(this).find('.select_box_off').show();	
		$(this).find('.del_file').show();	
	})
	//素材鼠标移出的时候 隐藏选择框和复制url和删除按钮
	$('.case_file').mouseleave(function(ev){
		//阻止事件冒泡
		ev.stopPropagation();
		$(this).find('.select_box_off').hide();
		$(this).find('.del_file').hide();
	})

	//点击选框off的时候	
	$('.case_file .select_box_off').click(function(ev){		
		ev.stopPropagation();
		offClickNum++;
		$(this).hide();
		$(this).next().show();
		//要显示删除按钮所选按钮 这里全部选中的时候要变成$('.del_all').show()
		$('.del_part').show();
		$('.locked_chioce').show();
		$('.unlocked_chioce').show();
		if(fileNumAndMetarialsNum >= page_num*every_page_showNum){
			if(offClickNum == every_page_showNum){
				$('.del_part').hide();
				$('.del_all').show();
				$('.cube').addClass('blue');
				$('.cube img').show();
				flag = false;
			}
		}else if(fileNumAndMetarialsNum < page_num*every_page_showNum){
			if(offClickNum == fileNumAndMetarialsNum-(page_num-1)*every_page_showNum){
				$('.del_part').hide();
				$('.del_all').show();
				$('.cube').addClass('blue');
				$('.cube img').show();
				flag = false;
			}
		}
		
	})
	//点击选框on的时候
	$('.case_file .select_box_on').click(function(ev){		
		ev.stopPropagation();
		offClickNum--;
		$(this).hide();
		$(this).prev().show();
		if(fileNumAndMetarialsNum >= page_num*every_page_showNum){
			if(offClickNum < every_page_showNum){
				$('.del_part').show();
				$('.del_all').hide();
				$('.cube').removeClass('blue');
				$('.cube img').hide();
				flag = true;
				if(offClickNum == 0){
					$('.del_part').hide();
					$('.del_all').hide();
					$('.locked_chioce').hide();
					$('.unlocked_chioce').hide();
				}
			}
		}else if(fileNumAndMetarialsNum < page_num*every_page_showNum){
			if(offClickNum < fileNumAndMetarialsNum-(page_num-1)*every_page_showNum){
				$('.del_part').show();
				$('.del_all').hide();
				$('.cube').removeClass('blue');
				$('.cube img').hide();
				flag = true;
				if(offClickNum == 0){
					$('.del_part').hide();
					$('.del_all').hide();
					$('.locked_chioce').hide();
					$('.unlocked_chioce').hide();
				}
			}
		}
		
		
	})
//------------------这里都是选框的代码-----end---------------------------	
	
}

function buildMaterials(arr,page_num,filesLength){
	//第二个参数代表分页点击的页码,第三个参数代表前面遍历的文件夹的长度 因为是先文件夹 后素材的
	//让素材的ul的内容制空
	$('.materials').html("");
	//判断文件夹的个数
	var length;
	var start;
	var p = 1;
	if(filesLength/(every_page_showNum*page_num) < 1 ){
		if(filesLength > every_page_showNum*(page_num-1)){
			//说明这一页部分是文件夹 部分是素材(所以开始值肯定是0) 1.这一页素材都展示完了 2.素材还需要在下一页展示
			if(arr.length <= every_page_showNum-filesLength%every_page_showNum){
				//1.这一页素材都展示完了
				length = arr.length;
				start = 0;
			}else if(arr.length > every_page_showNum-filesLength%every_page_showNum){
				// 2.素材还需要在下一页展示
				length = every_page_showNum-filesLength%every_page_showNum;
				start = 0;
				//素材的第一页是总体页码的第p页
				p = page_num;
			}
			
		}else if(filesLength < every_page_showNum*(page_num-1)){
			$('.cases_files').html("");
			//说明这一次全部都是素材(开始值不是0) 1.这一页素材都展示完了 2.素材还需要在下一页展示
			//这里不是素材的第一页的展示 是第二 三...的展示，要判断这是素材的第m_p页 
			var M_p = page_num-p+1;
			if(arr.length <= M_p*every_page_showNum-filesLength%every_page_showNum){
				//1.这一页素材都展示完了
				length = arr.length;
				start = every_page_showNum*(M_p-1)-filesLength%every_page_showNum;
			}else if(arr.length > M_p*every_page_showNum-filesLength%every_page_showNum){
				// 2.素材还需要在下一页展示
				length = every_page_showNum*M_p-filesLength%every_page_showNum;
				start = every_page_showNum*(M_p-1)-filesLength%every_page_showNum;
			}
			
		}else if(filesLength == every_page_showNum*(page_num-1)){
			$('.cases_files').html("");
			//说明这一次全部都是素材(开始值是0)1.这一页素材都展示完了 2.素材还需要在下一页展示
			if(arr.length <= every_page_showNum){
				//1.这一页素材都展示完了
				length = arr.length;
				start = 0;
			}else if(arr.length > every_page_showNum){
				// 2.素材还需要在下一页展示
				length = every_page_showNum-filesLength%every_page_showNum;
				start = 0;
				//素材的第一页是总体页码的第p页
				p = page_num;
			}
		}
		
		//开始循环
		for(var i=start; i<length; i++){
			//得到素材的后缀名 判断素材的类型 分两种 图片 与非图片
			//这个素材的后缀名
			var material_suffix = arr[i].extension;//这个素材的后缀名
			//这个素材的大小
			var size = arr[i].size * 0.0001221;//这里的单位已经从bit转成kb了
			if(size > 0 && size < 1024){
				size = Math.ceil(size)+"KB";
			}else if(size >= 1024 && size < 1048576 ){
				size = Math.ceil(size*0.000976)+"MB";//从kb转到mb
			}else if(size >= 1048576 ){
				size = Math.ceil(size*0.000976*0.0009766)+"G";//从mb转到g,应该够用了
			}
			//这个素材的上传时间
			//var creationTime = arr[i].creationTime.substr(0,10); 
			var creationTime = arr[i].creationTime
			//素材是否锁住
			var locked = arr[i].deletable //false代表锁住 true代表打开
			//console.log(locked);
			var display;
			if(locked){
				display = "none";
			}else{
				display = "block";
			}
			if(material_suffix == "jpg" || material_suffix == "png" || material_suffix == "gif" || material_suffix == "jpeg"){
				//在每一个素材的li上绑定了一个遍历出来的下标i
				var oLi3 = $('<li class="material" data_subIndex="'+i+'" data_show="off" data_url="'+exURL+arr[i].relativePath+'"><div class="gray_box_wrap"><div class="select_box_off"></div><div class="select_box_on"><img src="images/sure_icon3.png"></div><div class="url_and_detail"><span class="copy_url" data-clipboard-text="'+exURL+arr[i].relativePath+'">复制url</span><span class="vertical_line"></span><span  class="see_detail" data_path="'+exURL+arr[i].relativePath+'" data_extension="'+material_suffix+'" data_size="'+size+'" data_time="'+creationTime+'" data_name="'+arr[i].name+'">详情</span></div><div class="isLocked" style="display:'+display+'"><img class="locked_img" src="images/lock.png"></div><div class="gray_box"><img src="'+exURL+arr[i].relativePath+'" class="material_img"></div></div><p>'+arr[i].name+'</p></li>')
			}else{
				var oLi3 = $('<li class="material" data_subIndex="'+i+'" data_show="off" data_url="'+exURL+arr[i].relativePath+'"><div class="gray_box_wrap"><div class="select_box_off"></div><div class="select_box_on"><img src="images/sure_icon3.png"></div><div class="url_and_detail"><span class="copy_url" data-clipboard-text="'+exURL+arr[i].relativePath+'">复制url</span><span class="vertical_line"></span><span class="see_detail" data_path="'+exURL+arr[i].relativePath+'" data_extension="'+material_suffix+'" data_size="'+size+'" data_time="'+creationTime+'" data_name="'+arr[i].name+'">详情</span></div><div class="isLocked" style="display:'+display+'"><img class="locked_img" src="images/lock.png"></div><div class="gray_box"><span class="file_type">'+material_suffix+'</span></div></div><p>'+arr[i].name+'</p></li>')
			}	
		oLi3.appendTo($('.materials'));
		}
			
	}else if(filesLength/(every_page_showNum*page_num) >= 1 ){
		//如果文件夹的长度大于等于1 证明点击的这一页都是文件夹 没有素材
		$('.materials').html("");
	}
	
	
//------------------这里都是选框的代码--------------------------------	
	//素材鼠标进入的时候 显示选择框和复制url和删除按钮
	$('.material').mouseenter(function(ev){
		//阻止事件冒泡
		ev.stopPropagation();
		$(this).find('.select_box_off').show();		
		$(this).find('.url_and_detail').show();
	})
	//素材鼠标移出的时候 隐藏选择框和复制url和删除按钮
	$('.material').mouseleave(function(ev){
		//阻止事件冒泡
		ev.stopPropagation();
		$(this).find('.select_box_off').hide();
		$(this).find('.url_and_detail').hide();
	})
//-------------------------------------------------------
	//当详情点击的时候
	$('.see_detail').click(function(ev){
		//阻止事件冒泡
		ev.stopPropagation();
		var path = $(this).attr('data_path');
		var extension = $(this).attr('data_extension');
		var size = $(this).attr('data_size');
		var time = $(this).attr('data_time');
		var name = $(this).attr('data_name');
		//console.log(path,extension,size,time);
		$('.detail_title').text(name)
		$('#iframe').attr('src',path);
		$('.detail_type').text(extension);
		$('.detail_size').text(size);
		$('.detail_time').text(time);		
		$('.big_detail').show();
		if(extension == "jpg" || extension == "png" || extension == "gif" || extension == "jpeg"){
			var img_width;
			var img_height;
			var img_url = path+'?'+Date.parse(new Date());
			var img = new Image();
			img.src = img_url;
			img.onload = function(){
				var img_width = img.width+"px";
				var img_height = img.height+"px";
				//console.log(img_width,img_height);
				$('#iframe').css({
					"width":img_width,
					"height":img_height
				})
				
			};
		}else{
			$('#iframe').css({
					"width":'50vw',
					"height":'53vh'
				})
		}
	})
	//关闭按钮点击的时候
	$('.detail_colse_btn').click(function(ev){
		//阻止事件冒泡
		ev.stopPropagation();
		$('.detail_title').text("")
		$('#iframe').attr('src','');
		$('#iframe').css({
					"width":'0',
					"height":'0'
				})
		$('.detail_type').text("");
		$('.detail_size').text("");
		$('.detail_time').text("");
		$('.big_detail').hide();
	})
	
//-------------------------------------------------------	
	//点击选框off的时候
	$('.material .select_box_off').click(function(ev){		
		ev.stopPropagation();	
		offClickNum++;
		$(this).hide();
		$(this).next().show();
		//要显示删除按钮所选按钮 这里全部选中的时候要变成$('.del_all').show()
		$('.del_part').show();
		$('.locked_chioce').show();
		$('.unlocked_chioce').show();
		if(fileNumAndMetarialsNum >= page_num*every_page_showNum){
			if(offClickNum == every_page_showNum){
				$('.del_part').hide();
				$('.del_all').show();
				$('.cube').addClass('blue');
				$('.cube img').show();
				flag = false;
			}
		}else if(fileNumAndMetarialsNum < page_num*every_page_showNum){
			if(offClickNum == fileNumAndMetarialsNum-(page_num-1)*every_page_showNum){
				$('.del_part').hide();
				$('.del_all').show();
				$('.cube').addClass('blue');
				$('.cube img').show();
				flag = false;
			}
		}
	})
	//点击选框on的时候
	$('.material .select_box_on').click(function(ev){		
		ev.stopPropagation();
		offClickNum--;
		$(this).hide();
		$(this).prev().show();
		if(fileNumAndMetarialsNum >= page_num*every_page_showNum){
			if(offClickNum < every_page_showNum){
				$('.del_part').show();
				$('.del_all').hide();
				$('.cube').removeClass('blue');
				$('.cube img').hide();
				flag = true;
				if(offClickNum == 0){
					$('.del_part').hide();
					$('.del_all').hide();
					$('.locked_chioce').hide();
					$('.unlocked_chioce').hide();
				}
			}
		}else if(fileNumAndMetarialsNum < page_num*every_page_showNum){
			if(offClickNum < fileNumAndMetarialsNum-(page_num-1)*every_page_showNum){
				$('.del_part').show();
				$('.del_all').hide();
				$('.cube').removeClass('blue');
				$('.cube img').hide();
				flag = true;
				if(offClickNum == 0){
					$('.del_part').hide();
					$('.del_all').hide();
					$('.locked_chioce').hide();
					$('.unlocked_chioce').hide();
				}
			}
		}
		
	})
//------------------这里都是选框的代码-----end---------------------------
	
}

//-------------------------------------------------------
	//当复制url点击的时候	
	var clipboard = new ClipboardJS('.copy_url');
	clipboard.on('success', function(e) {
        //console.log('复制成功');
        $('.success_tip .tip_p1').text('复制成功');
		$('.success_tip').show();
		setTimeout(function(){
			$('.success_tip').hide();
			$('.success_tip .tip_p1').text('');
		},1000)
    });
    clipboard.on('error', function(e) {
        $('.err_tip .tip_p1').text('复制失败');
		$('.err_tip .tip_p2').text('请联系管理员');
		$('.err_tip').show();
		setTimeout(function(){
			$('.err_tip').hide();
			$('.err_tip .tip_p1').text('');
			$('.err_tip .tip_p2').text('');
		},1000) 		
    });
	


//很重要的两个函数模板 end


//-------------------------------------------------------------------------------
//使用json数据 主要做了这些事情：70-216
//1.左边的目录导航展示

//4.左边目录导航 打开折叠按钮
//6.左边目录导航 所有项目的 打开折叠按钮

//5.左边目录导航 每一项的点击事件
//7.左边目录导航 点击所有项目的时候
//------------------------------------------------
//2.左边的新建文件夹中的选择存放目录的展示（树形菜单）
//3.main部分 第一次进入时 所有一级文件夹的展示

function getList(){
	$.ajax({
		type:"get",
		url:domain2+"/upload/oss/fs/ls?path=",
		//url:"http://172.16.1.78:12121/upload/oss/fs/ls?path=",//测试环境
		dataType:"JSON",
		success: function(data){
			if(data.success == true){
				data = data.body;
				//判断里面文件夹和素材两个数组的长度
				var directorys = data.directorys;//这个是文件夹
				var files = data.files;//这个是文件 (素材)
				if(directorys.length == 0 && files.length == 0){
					$('.catalog .none').show();//json数据无内容，左边的目录导航为空
					$('.catalog .have').hide();
					$('.main_file_none').hide();//这个永远hide
					$('.main_material_none_wrap').show();
					$('.main_list').hide();
				}else{
					$('.catalog .none').hide();
					$('.catalog .have').show();//json数据有内容，左边的目录导航出现
					$('.main_file_none').hide();
					$('.main_material_none_wrap').hide();
					$('.main_list').show();//json数据有内容，右边的主要内容出现，第一次显示的都是文件夹
					directorys1 = directorys;
					files1 = files;
				}
				$('.main_top_show1').show();//顶部的第一个提示出现，不管有没有数据都是显示第一个数据的
				$('.main_top_show2').hide();
				//1.左边的目录导航展示
				$('.all_catalog_list').html("");//先制空
				for(var i=0; i<directorys.length; i++){
					//目录的遍历,第一次进去的时候所有的文件夹的父级路径都是"";
					var oLi = $('<li onselectstart="return false" data_relativePath="'+directorys[i].relativePath
+'" data_size="'+directorys[i].size+'" data_parentPath=""><b>'+directorys[i].name+'</b></li>');

					oLi.appendTo($('.all_catalog_list'));
					//目录的遍历 end				
				}				
				//1.左边的目录导航展示，for循环结束
				
				//6.左边目录导航 所有项目的 打开折叠按钮
				$('.openfold').click(function(){
					if($(this).text() == "-"){
						$('.all_catalog_list').hide();
						$(this).text('+');
					}else{
						$('.all_catalog_list').show();
						$(this).text('-');		
					}
				})
				//6.左边目录导航 所有项目的 打开折叠按钮 end
				
				//5.左边目录导航 每一项的点击事件
				//点击时候做了2件事情 1.给main传值 2.改变颜色(先不改)
				$('.all_catalog_list li').click(function(event){
					//阻止事件冒泡
					event.stopPropagation();
					//先要给main改变值
					$('.main').attr('data_relativepath',$(this).attr('data_relativePath'));
					$('.main').attr('data_size',$(this).attr('data_size'));
					$('.main').attr('data_name',$(this).children('b').text());
					$('.main').attr('data_parentPath',$(this).attr('data_parentPath'));
					//3.改变main里面的内容
					enter();
									
				})
				//5.左边目录导航 每一项的点击事件  end
				
				//7.左边目录导航 点击所有项目的时候
				$('.all_catalog').click(function(){
									
					//main_list里面的内容改变
					buildFiles(directorys,1);
					buildMaterials(files,1,directorys.length);
					fileNumAndMetarialsNum = directorys.length + files.length;
					aa = directorys;
					bb = files;
					pagation(directorys.length,files.length);
					
					//传好值了之后 一些内容也要改变
					$('.main_top_show1').show();//顶部的第一个提示出现
					$('.main_top_show2').hide();
					//$('.rightNow_catalog_file').text('所有项目');//当前所在文件夹的名字
					//$('.bread_line').hide();
					//既然一级目录可以点击进入，那么一级目录里面肯定是有内容的
					$('.main_material_none_wrap').hide();
					$('.main_list').show();
					//排序的选项 变成默认
					$('.order_option').removeAttr('selected');
					$('.order_option').eq(0).attr('selected','selected');
				})
				//7.左边目录导航 点击所有项目的时候 end
			
//----------------------------------------------------------------------------------
				//3.main部分 第一次进入时 所有一级文件夹的展示
				//buildFiles(directorys);
				//buildMaterials(files);
				buildFiles(directorys,1);
				buildMaterials(files,1,directorys.length);
				fileNumAndMetarialsNum = directorys.length + files.length;
				aa = directorys;
				bb = files;
				pagation(directorys.length,files.length);
				//排序的选项 变成默认
				$('.order_option').removeAttr('selected');
				$('.order_option').eq(0).attr('selected','selected');
				
				//3.main部分 第一次进入时 所有一级文件夹的展示 end

			}else{
				console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
			}
						
		}
	});
}
getList();
//json数据使用完成
//----------------------------------------------------------------------

//然后封装一个函数 根据main的值来建立
function enter(orderby){
	offClickNum = 0;
	fileNumAndMetarialsNum = 0;
	$('.unlocked_chioce').hide();
	$('.locked_chioce').hide();
	orderby = orderby || "lastModifiedTime:desc;name:desc";
	if(orderby == "lastModifiedTime:desc;name:desc"){
		$('.order_option').removeAttr('selected');
		$('.order_option').eq(0).attr('selected','selected');
	}
	$('.del_part').hide();
	$('.del_all').hide();
	$('.cube').removeClass('blue');
	$('.cube img').hide();
	$('.main_list .select_box_on').hide();
	flag = true;

	
	var mainRelativePath = $('.main').attr("data_relativePath");
	var mainName = $('.main').attr("data_name");
	var mainSize = $('.main').attr("data_size");
	//console.log(mainRelativePath);
	var realPath = "";
	if(mainRelativePath != domain2+"/upload/oss/fs/ls?path="){		
		//$('.bread_line').show(); //返回上一级显示
		$('.main_top_show1').hide();
		$('.main_top_show2').show();//顶部的第二个提示出现
		//$('.rightNow_catalog_file').text(mainName);//当前所在文件夹的名字
		realPath = domain2+"/upload/oss/fs/ls?path="+mainRelativePath+"&orderby="+orderby;
	}else{
		//$('.bread_line').hide(); //返回上一级显示
		$('.main_top_show1').show();
		$('.main_top_show2').hide();//顶部的第二个提示出现
		//$('.rightNow_catalog_file').text('所有项目');//当前所在文件夹的名字
		realPath = domain2+"/upload/oss/fs/ls?path=&orderby="+orderby;
	}

	//1.有了realPath就可以拿到这个文件下的子文件夹和素材
	$.ajax({
		type:"get",
		url:realPath,
		async:true,
		dataType:"JSON",
		success:function(data){
			if(data.success == true){
				data = data.body;
				//console.log(data);
				//console.log(data.parentPath);//找到父级的路径
				$('.main').attr('data_parentPath',data.parentPath);
				var materials = data.files;
				var children = data.directorys;
				if(materials.length !=0 && children.length !=0){
					//进入文件夹之后 建立文件夹的ul里面的内容
					buildFiles(children,1);
					buildMaterials(materials,1,children.length);
					aa = children;
					bb = materials;
					pagation(children.length,materials.length);
					
					$('.main_list').show();
					$('.main_material_none_wrap').hide();
					fileNumAndMetarialsNum = materials.length + children.length;
			
				}else if(materials.length ==0 && children.length !=0){
					buildFiles(children,1);
					aa = children;
					bb = materials;
					pagation(children.length,materials.length);					
					$('.materials').html("");
					$('.main_list').show();
					$('.main_material_none_wrap').hide();
					fileNumAndMetarialsNum = children.length;
					
				}else if(materials.length !=0 && children.length ==0){
					buildMaterials(materials,1,0);
					aa = children;
					bb = materials;
					pagation(children.length,materials.length);					
					$('.cases_files').html("");
					$('.main_list').show();
					$('.main_material_none_wrap').hide();
					fileNumAndMetarialsNum = materials.length;

				}else if(materials.length ==0 && children.length ==0){
					$('.main_list').hide();
					$('.main_material_none_wrap').show();
					$('.materials').html("");
					$('.cases_files').html("");
					pagation(children.length,materials.length);
					fileNumAndMetarialsNum = 0;

					
				}
			}else{
				console.log("错误信息："+data.msg+"，错误码："+data.errorCode)
			}
			
		}
	});
	
	

}
//封装函数结束 根据main的值来建立


//每一个文件夹的双击进入事件,这个双击事件还只能写在外面（已经改成单机事件）
//所以ajax里面的data数据 需要拿出来
function Enter(needRelativePath,needName,needSize){
	//先给main传值
	$('.main').attr("data_relativePath",needRelativePath);
	$('.main').attr("data_name",needName);
	$('.main').attr("data_size",needSize);
	var path_arr = needRelativePath.split("/");
	//console.log(path_arr);//path_arr[0]是空的
	$('.file_forder').html("");
	if(needRelativePath != domain2+"/upload/oss/fs/ls?path="){
		for(var j=1; j<path_arr.length; j++){
			if(j == path_arr.length-1){
				var path_li = $('<li class="now_file">'+path_arr[j]+'</li>');
			}else{
				var needRelativePath1 = "";
				for(var k=1; k<=j; k++){
					needRelativePath1 += "/"+path_arr[k];
				}
				needRelativePath1 = "'"+needRelativePath1+"'";
				var needName = "'"+path_arr[j]+"'";
				var needSize = 1000;//这个size没有具体作用的 随便写写的
				var path_li = $('<li class="can_click" onclick="Enter('+needRelativePath1+','+needName+','+needSize+')">'+path_arr[j]+'<img src="images/bread_line1.png"></li>');
			}
			path_li.appendTo($('.file_forder'));
		}
	}else{
		$('.file_forder').html("");
//		$('.bread_line_p2').css({
//			"color":"#007efb",
//			"text-decoration":"none",
//			"cursor":"default"
//		})
	}
	
	//调用函数
	enter();
}
//每一个文件夹的双击进入事件 end

//返回上一级点击的时候
//$('.back_up').click(function(){
//	var parentPath = domain2+"/upload/oss/fs/ls?path="+$('.main').attr('data_parentPath');
//	//如果parentPath为空字符串，那么就是一级目录
//	if(parentPath == domain2+"/upload/oss/fs/ls?path="){
//		offClickNum = 0;
//		fileNumAndMetarialsNum = 0;
//		$('.del_part').hide();
//		$('.del_all').hide();
//		//那么上一级就是项目一级目录
//		buildFiles(directorys1,1);
//		buildMaterials(files1,1,directorys1.length);
//		$('.cube').removeClass('blue');
//		$('.cube img').hide();
//		$('.del_all').hide();
//		$('.main_list .select_box_on').hide();
//		offClickNum = 0;
//		flag = true;
//		fileNumAndMetarialsNum = directorys1.length + files1.length;
//		aa = directorys1;
//		bb = files1;
//		pagation(directorys1.length,files1.length);
//		
//		//先给main传值
//		$('.main').attr("data_relativePath",domain2+'/upload/oss/fs/ls?path=');
//		$('.main').attr("data_name",'所有项目');
//		$('.main').attr("data_size",'0');
//		$('.main').attr('data_parentPath',"");
//		//传好值了之后 一些内容也要改变
//		$('.main_top_show1').show();//顶部的第一个提示出现
//		$('.main_top_show2').hide();
//		//$('.rightNow_catalog_file').text('所有项目');//当前所在文件夹的名字
//		//$('.bread_line').hide();
//		//既然一级目录可以点击进入，那么一级目录里面肯定是有内容的
//		$('.main_material_none_wrap').hide();
//		$('.main_list').show();
//	}else{		
//		var name = $('.main').attr('data_parentPath').slice(1);
//		$('.main').attr('data_relativePath',$('.main').attr('data_parentPath'));
//		$('.main').attr('data_name',name);
//		//$('.main').attr('data_parentPath',data1.parentPath);
//		//传好值了之后 一些内容也要改变
//		$('.main_top_show1').hide();
//		$('.main_top_show2').show();//顶部的第二个提示出现
//		//$('.rightNow_catalog_file').text(name);//当前所在文件夹的名字
//		$('.cube').removeClass('blue');
//		$('.cube img').hide();
//		$('.del_all').hide();
//		$('.main_list .select_box_on').hide();
//		offClickNum = 0;
//		flag = true;
//		//调用enter()函数
//		enter();
//
//	}
//		
//})
//返回上一级点击  end

//全选按钮点击的时候
var flag = true;
$('.cube_wrap').click(function(){
	if(flag){
		//全选按钮选中
		$('.cube').addClass('blue');
		$('.cube img').show();
		$('.del_all').show();
		$('.del_part').hide();
		$('.main_list .select_box_on').show();
		$('.locked_chioce').show();
		$('.unlocked_chioce').show();
		//offClickNum等于当前页的所有文件夹个数
		offClickNum = $('.cases_files').children('li').length + $('.materials').children('li').length;
	}else{
		$('.cube').removeClass('blue');
		$('.cube img').hide();
		$('.del_all').hide();
		$('.main_list .select_box_on').hide();
		$('.locked_chioce').hide();
		$('.unlocked_chioce').hide();
		offClickNum = 0;
	}
	flag = !flag;
	//console.log($('.main').attr('data_id'));
})
//全选按钮点击的时候 end

//--左边的新建文件夹--------start------------------------------------------------
//最左边目录下的新建文件夹按钮按下的时候 弹出新建框
$('.creat_new_file1').click(function(ev){	
	//阻止事件冒泡
	ev.stopPropagation();
	$('.new_file_toast').slideDown("fast");
})
//新建框里面按下取消按钮
$('.new_file_toast .cancle_btn').click(function(ev){
	//阻止事件冒泡
	ev.stopPropagation();
	$('.new_file_name').val('');
	$('.new_file_toast').fadeOut("fast");
})
//新建框里面按下确认按钮
$('.new_file_toast .sure_btn').click(function(ev){
	//阻止事件冒泡
	ev.stopPropagation();
	if($('.new_file_name').val() == ""){		
		$('.new_file_toast .warm').show();
		setTimeout(function(){
			$('.new_file_toast .warm').hide();
		},1000);
	}else{
		//调用新建的接口
		//console.log($('.new_file_name').val());
		var name = $('.new_file_name').val();
		name = RemoveSymbol(name);
		var new_file_data = domain2+"/upload/oss/fs/mkdir?path=&name="+name;
		$.ajax({
			type:"get",
			url:new_file_data,
			async:true,
			dataType:"JSON",
			success:function(data){
				if(data.success == true){
					//刷新中间的内容和左边的内容
					getList();
					//要弹出一个保存成功的弹框
					$('.new_file_toast .success').show();
					
					setTimeout(function(){
						$('.new_file_name').val('');
						$('.new_file_toast .success').hide();
						$('.new_file_toast').fadeOut("fast");
					},600);
				}else{
					console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
					if(data.errorCode == 50){
						//代表文件夹的名字重复了
						$('.new_file_toast .err').show();
						setTimeout(function(){
							$('.new_file_toast .err').hide();
							$('.new_file_name').val("");
							$('.new_file_toast').hide();
						},1000)
					}
				}
				
			}
		});
		
		
		
	}
	
})

//--左边的新建文件夹---------end-----------------------------------------------


//主体内容里面的新建文件夹按钮 一共有四个！！
var flag_on_off = true;
$('.main_new').click(function(ev){
	//阻止事件冒泡
	ev.stopPropagation();
	if(flag_on_off){
		flag_on_off = false;
		var mainName = $('.main').attr('data_name');
		var mainRelativePath = $('.main').attr('data_relativePath');
		//console.log(mainName);
		$('.rightnow_file').text(mainName);
		//新建文件夹弹框弹出
		$('.new_file_main').show();
		//取消按钮点击的时候
		$('.new_file_main_layout .cancle_btn1').click(function(ev){
			//阻止事件冒泡
			ev.stopPropagation();
			$('.main_file_new_name').val('');
			$('.new_file_main').fadeOut("fast");
			
			$(this).off('click');
			$('.new_file_main_layout .sure_btn1').off('click');
			flag_on_off = true;
		})
		//确定按钮点击的时候
		$('.new_file_main_layout .sure_btn1').click(function(ev){
			//阻止事件冒泡			
			ev.stopPropagation();
			if($('.main_file_new_name').val() == ""){
				$('.warn_tip .tip_p1').text('请填写文件夹名称');
				$('.warn_tip .tip_p2').text('命名不要包含特殊字符');
				$('.warn_tip').show();
				setTimeout(function(){
					$('.warn_tip').hide();
					$('.warn_tip .tip_p1').text('');
					$('.warn_tip .tip_p2').text('');
				},1000);
			}else{
				//过滤掉文件夹里面的特殊符号
				var name = $('.main_file_new_name').val();
				name = RemoveSymbol(name);				
				//调用新建文件夹接口
				var new_file_data1 = domain2+"/upload/oss/fs/mkdir?path="+mainRelativePath+"&name="+name;
				console.log(new_file_data1);
				var new_file_data2 = domain2+"/upload/oss/fs/mkdir?path=&name="+name;				
				if(mainRelativePath == domain2+"/upload/oss/fs/ls?path="){
					$.ajax({
						type:"get",
						url:new_file_data2,
						async:true,
						dataType:"JSON",
						success:function(data){
							if(data.success == true){
								//刷新中间的内容和左边的内容
								//console.log("刷新");
								getList();
							}else{
								console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
								if(data.errorCode == 50){
									//代表文件夹的名字重复了
									$('.err_tip .tip_p1').text('新建失败');
									$('.err_tip .tip_p2').text('文件夹名字重复！');
									$('.err_tip').show();
									setTimeout(function(){
										$('.err_tip').hide();
										$('.err_tip .tip_p1').text('');
										$('.err_tip .tip_p2').text('');
									},1000)
								}
							}
							
						}
					});
				}else{
					$.ajax({
						type:"get",
						url:new_file_data1,
						async:true,
						dataType:"JSON",
						success:function(data){
							if(data.success == true){
								//只要刷新当前的目录
								enter();
							}else{
								console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
								if(data.errorCode == 50){
									//代表文件夹的名字重复了
									$('.err_tip .tip_p1').text('新建失败');
									$('.err_tip .tip_p2').text('文件夹名字重复！');
									$('.err_tip').show();
									setTimeout(function(){
										$('.err_tip').hide();
										$('.err_tip .tip_p1').text('');
										$('.err_tip .tip_p2').text('');
									},1000)
								}
							}
							
						}
					});
				}
				
				//要弹出一个保存成功的弹框
				$('.success_tip .tip_p1').text('新建成功');
				$('.success_tip').show();
				$('.new_file_main').fadeOut("fast");
				$('.main_file_new_name').val('');
				setTimeout(function(){
					
					$('.success_tip').hide();
					$('.success_tip .tip_p1').text('');
					
				},600);
				$(this).off('click');
				$('.new_file_main_layout .cancle_btn1').off('click');
				flag_on_off = true;
				
			}
		})
	}else{
		return false;
	}
	
})

//分页的函数 这个值是需要传进去的fileNumAndMetarialsNum,最主要的分页点击事件也没有写在这里
function pagation(fileNum,MetarialsNum){
	//每页显示24个小方块
	//一共有几页,向上取整的
	var num = fileNum+MetarialsNum;
	var pages = Math.ceil(num/every_page_showNum);
	$('.pages').html("");
	if(pages == 0){
		$('.pagation').hide();
	}else{
		$('.pagation').show();
		//页码大于0，然后分2中情况：页码《=10； 页码》10
		if(pages <= 10){
			//给$('.pages')一个自定义属性：里面的页数小于等于10
			$('.pages').attr('pages_num',pages);
			for(var i=1; i<=pages; i++){	
				var page_li = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+i+',aa,bb)">'+i+'</li>');
				page_li.appendTo($('.pages'));
			}
			$('.page_num').eq(0).addClass('page_blue');
		}else if(pages > 10){
			$('.pages').attr('pages_num',pages);
			for(var i=1; i<=7; i++){
				//初次进入的时候显示8页 ... 和最后一页
				var page_li = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+i+',aa,bb)">'+i+'</li>');
				page_li.appendTo($('.pages'));
			};
			var threeDots = $('<li class="three_dots">...</li>');
			threeDots.appendTo($('.pages'));
			var lastPage = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+pages+',aa,bb)">'+pages+'</li>');
			lastPage.appendTo($('.pages'));
			$('.page_num').eq(0).addClass('page_blue');
		}
		
	}
		
}
//分页的显示函数结束 end

//点击页码的事件
function pageClick(i,aa,bb){
	buildFiles(aa,i);
	buildMaterials(bb,i,aa.length);
	$('.cube').removeClass('blue');
	$('.cube img').hide();
	$('.del_all').hide();
	$('.main_list .select_box_on').hide();
	offClickNum = 0;
	flag = true;
	//判断这个分页的总页码是大于10的 还是小于等于10的
	var pages_num = parseInt($('.pages').attr('pages_num'));
	if(pages_num <= 10){
		//当前页码的颜色改变
		$('.page_num').removeClass('page_blue');
		$('.page_num').eq(i-1).addClass('page_blue');
	}else if(pages_num > 10){
		var click_num = i;
		
		if(click_num >= 5 && click_num <= pages_num-4){
			//清空，然后显示  1 ... 中间5个页码  ... 最后一个页码
			$('.pages').html("");
			var firstPage = $('<li class="page_num" onselectstart="return false" onclick="pageClick(1,aa,bb)">1</li>');
			firstPage.appendTo($('.pages'));
			var threeDots1 = $('<li class="three_dots">...</li>');
			threeDots1.appendTo($('.pages'));
			var five_pages = [click_num-2,click_num-1,click_num,click_num+1,click_num+2];
			for(var i=0; i<five_pages.length; i++){
				//当前页码的颜色
				if(i == 2){
					var page_li = $('<li class="page_num page_blue" onselectstart="return false" onclick="pageClick('+five_pages[i]+',aa,bb)">'+five_pages[i]+'</li>');
				}else{
					var page_li = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+five_pages[i]+',aa,bb)">'+five_pages[i]+'</li>');
				}
				
				page_li.appendTo($('.pages'));
			}
			
			
			var threeDots2 = $('<li class="three_dots">...</li>');
			threeDots2.appendTo($('.pages'));
			var lastPage = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+pages_num+',aa,bb)">'+pages_num+'</li>');
			lastPage.appendTo($('.pages'));					
		}else if(click_num < 5){
			$('.pages').html("");
			for(var i=1; i<=7; i++){
				//初次进入的时候显示8页 ... 和最后一页
				//当前页码的颜色改变
				if(i == click_num){
					var page_li = $('<li class="page_num page_blue" onselectstart="return false" onclick="pageClick('+i+',aa,bb)">'+i+'</li>');
				}else{
					var page_li = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+i+',aa,bb)">'+i+'</li>');
				}
				
				page_li.appendTo($('.pages'));
			};
			var threeDots = $('<li class="three_dots">...</li>');
			threeDots.appendTo($('.pages'));
			var lastPage = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+pages_num+',aa,bb)">'+pages_num+'</li>');
			lastPage.appendTo($('.pages'));					
		}else if(click_num > pages_num-4){
			$('.pages').html("");
			//这里的形式是 1 ...  9 10 11 12 13 14 15后面也是7个页码按钮
			var firstPage = $('<li class="page_num" onselectstart="return false" onclick="pageClick(1,aa,bb)">1</li>');
			firstPage.appendTo($('.pages'));
			var threeDots1 = $('<li class="three_dots">...</li>');
			threeDots1.appendTo($('.pages'));
			for(var i = pages_num-6; i <= pages_num; i++){
				//当前页码的颜色改变
				if(i == click_num){
					var page_li = $('<li class="page_num page_blue" onselectstart="return false" onclick="pageClick('+i+',aa,bb)">'+i+'</li>');
				}else{
					var page_li = $('<li class="page_num" onselectstart="return false" onclick="pageClick('+i+',aa,bb)">'+i+'</li>');
				}
				page_li.appendTo($('.pages'));
			}
		}
	}
}
//点击页码的事件 end
//点击上一页的事件
$('.up_page').click(function(){
	//获取到当前页码的数字
	var now_page = parseInt($(this).next().find('.page_blue').text());
	if(now_page == 1){
		return false;
	}else{
		pageClick(now_page-1,aa,bb);
	}
})
//点击下一页的事件
$('.down_page').click(function(){
	//获取到当前页码的数字
	var now_page = parseInt($(this).prev().find('.page_blue').text());
	//获取总页码数
	var all_page = parseInt($(this).prev().attr('pages_num'));
	if(now_page == all_page){
		return false;
	}else{
		pageClick(now_page+1,aa,bb);
	}
})
//点击跳转事件
$('.want_page_sure').click(function(){
	//获取总页码数
	var all_page = parseInt($(this).parent().children('.pages').attr('pages_num'));
	if($('.want_page_num').val() <= all_page && $('.want_page_num').val() >=1 ){
		//判断输入的数字是不是整数
		var isInteger = dataValidation($('.want_page_num').val());
		if(isInteger){
			//console.log("页码正确");
			var now_page = parseInt($('.want_page_num').val())
			pageClick(now_page,aa,bb);
			$('.want_page_num').val("");
		}else{
			//console.log("页码输入有误，请重新输入");
			$('.err_page').show();
			setTimeout(function(){
				$('.err_page').hide();
				$('.want_page_num').val("");
			},1500)
		}
	}else{
		//console.log("页码输入有误，请重新输入");
		$('.err_page').show();
		setTimeout(function(){
			$('.err_page').hide();
			$('.want_page_num').val("");
		},1500)
		
	}
	
})
//判断数字是不是整数
function dataValidation(val) {
    var type = "^[0-9]*[1-9][0-9]*$";
    var re = new RegExp(type);
    if (val.match(re) == null) {
    	return false;
	} else {
    	return true;
	}
}


//全部删除 或者是 删除所选 按钮点击的时候 出现删除温馨提示
$('.del_all').click(function(){
	$('.delete_warn_tip1').show();
	$('.delete_warn_modal').show();
})
$('.del_part').click(function(){
	$('.delete_warn_tip1').show();
	$('.delete_warn_modal').show();
})
//删除温馨提示中 点击取消按钮
$('.delete_warn_tip1 .delete_warn_cancel').click(function(){
	$('.delete_warn_tip1').hide();
	$('.delete_warn_modal').hide();
})
//删除温馨提示中 点击确定按钮
$('.delete_warn_tip1 .delete_warn_ok').click(function(){
	$('.delete_warn_tip1').hide();
	$('.delete_warn_modal').hide();
	var relativePath = $('.main').attr('data_relativepath');	
	var url;
	var names_arr = [];
	//这里要这样写，要得到当前页打钩的文件夹和文件的名字！
	//----------------------------------------------------------
	var on = $('.main_list').find('.select_box_on');
	for(var i=0; i<on.length; i++){
		if(on.eq(i).attr('style') == 'display: block;'){
			names_arr.push(on.eq(i).parent().next().text());			
		}
	}
	//----------------------------------------------------------
	names_arr = names_arr.join(",");
	if(relativePath == domain2+"/upload/oss/fs/ls?path="){
		//代表根目录
		url = domain2+"/upload/oss/fs/rmr?path=&names="+names_arr;
		//url = "http://172.16.1.78:12121/upload/oss/fs/rmr?path=&names="+names_arr;//测试环境
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				if(data.success == true){
					//左边和中间的内容刷新
					getList();
					//开一个删除成功的小窗口
					$('.success_tip .tip_p1').text('删除成功');
					$('.success_tip').show();
					setTimeout(function(){
						$('.success_tip').hide();
						$('.success_tip .tip_p1').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_part').hide();
				}else{
					//开一个删除失败的小窗口
					$('.err_tip .tip_p1').text('删除失败');
					$('.err_tip .tip_p2').text('请联系管理员');
					$('.err_tip').show();
					setTimeout(function(){
						$('.err_tip').hide();
						$('.err_tip .tip_p1').text('');
						$('.err_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_part').hide();
				}
			}
		});
	}else{
		url = domain2+"/upload/oss/fs/rmr?path="+relativePath+"&names="+names_arr;
		//url = "http://172.16.1.78:12121/upload/oss/fs/rmr?path="+relativePath+"&names="+names_arr;//测试环境
		
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				//$('.main_core_contents')小窗口的父级
				if(data.success == true){
					//中间的内容刷新
					enter();
					//开一个删除成功的小窗口
					$('.success_tip .tip_p1').text('删除成功');
					$('.success_tip').show();
					setTimeout(function(){
						$('.success_tip').hide();
						$('.success_tip .tip_p1').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_part').hide();
				}else{
					//开一个删除失败的小窗口
					$('.err_tip .tip_p1').text('删除失败');
					$('.err_tip .tip_p2').text('请联系管理员');
					$('.err_tip').show();
					setTimeout(function(){
						$('.err_tip').hide();
						$('.err_tip .tip_p1').text('');
						$('.err_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_part').hide();
				}
			}
		});
	}	
})

//锁定勾选项点击的时候
$('.locked_chioce').click(function(){	
	var names_arr = [];
	//这里要这样写，要得到当前页打钩的文件夹和文件的名字！
	//----------------------------------------------------------
	var on = $('.main_list').find('.select_box_on');
	for(var i=0; i<on.length; i++){
		if(on.eq(i).attr('style') == 'display: block;'){
			names_arr.push(on.eq(i).parent().next().text());			
		}
	}
	//----------------------------------------------------------
	names_arr = names_arr.join(",");
	//console.log(names_arr);
	var relativePath = $('.main').attr('data_relativepath');	
	var url;
	if( relativePath == domain2+"/upload/oss/fs/ls?path="){
		url = domain2+"/upload/oss/fs/chattra?path="+"&names="+names_arr+"&deletable=false";
		//ajax调用接口
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				//$('.main_core_contents')小窗口的父级
				if(data.success == true){
					//中间和两边的内容刷新
					getList();
					//开一个删除成功的小窗口
					$('.success_tip .tip_p1').text('上锁成功');
					$('.success_tip .tip_p2').text('上锁的文件不能删除');
					$('.success_tip').show();
					setTimeout(function(){
						$('.success_tip').hide();
						$('.success_tip .tip_p1').text('');
						$('.success_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}else{
					//开一个删除失败的小窗口
					$('.err_tip .tip_p1').text('上锁失败');
					$('.err_tip .tip_p2').text('请联系管理员');
					$('.err_tip').show();
					setTimeout(function(){
						$('.err_tip').hide();
						$('.err_tip .tip_p1').text('');
						$('.err_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}
			}
		});
	}else{
		url = domain2+"/upload/oss/fs/chattra?path="+relativePath+"&names="+names_arr+"&deletable=false";
		//ajax调用接口
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				//$('.main_core_contents')小窗口的父级
				if(data.success == true){
					//中间的内容刷新
					enter();
					//开一个删除成功的小窗口
					$('.success_tip .tip_p1').text('上锁成功');
					$('.success_tip .tip_p2').text('上锁的文件不能删除');
					$('.success_tip').show();
					setTimeout(function(){
						$('.success_tip').hide();
						$('.success_tip .tip_p1').text('');
						$('.success_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}else{
					//开一个删除失败的小窗口
					$('.err_tip .tip_p1').text('上锁失败');
					$('.err_tip .tip_p2').text('请联系管理员');
					$('.err_tip').show();
					setTimeout(function(){
						$('.err_tip').hide();
						$('.err_tip .tip_p1').text('');
						$('.err_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}
			}
		});
	}

	
})

//解锁勾选项
$('.unlocked_chioce').click(function(){	
	var names_arr = [];
	//这里要这样写，要得到当前页打钩的文件夹和文件的名字！
	//----------------------------------------------------------
	var on = $('.main_list').find('.select_box_on');
	for(var i=0; i<on.length; i++){
		if(on.eq(i).attr('style') == 'display: block;'){
			names_arr.push(on.eq(i).parent().next().text());			
		}
	}
	//----------------------------------------------------------
	names_arr = names_arr.join(",");
	//console.log(names_arr);
	var relativePath = $('.main').attr('data_relativepath');	
	var url;
	if( relativePath == domain2+"/upload/oss/fs/ls?path="){
		url = domain2+"/upload/oss/fs/chattra?path="+"&names="+names_arr+"&deletable=true";
		//ajax调用接口
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				//$('.main_core_contents')小窗口的父级
				if(data.success == true){
					//中间和两边的内容刷新
					getList();
					//开一个删除成功的小窗口
					$('.success_tip .tip_p1').text('解锁成功');
					$('.success_tip .tip_p2').text('现在文件可以删除');
					$('.success_tip').show();
					setTimeout(function(){
						$('.success_tip').hide();
						$('.success_tip .tip_p1').text('');
						$('.success_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}else{
					//开一个删除失败的小窗口
					$('.err_tip .tip_p1').text('解锁失败');
					$('.err_tip .tip_p2').text('请联系管理员');
					$('.err_tip').show();
					setTimeout(function(){
						$('.err_tip').hide();
						$('.err_tip .tip_p1').text('');
						$('.err_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}
			}
		});
	}else{
		url = domain2+"/upload/oss/fs/chattra?path="+relativePath+"&names="+names_arr+"&deletable=true";
		//ajax调用接口
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				//$('.main_core_contents')小窗口的父级
				if(data.success == true){
					//中间的内容刷新
					enter();
					//开一个删除成功的小窗口
					$('.success_tip .tip_p1').text('解锁成功');
					$('.success_tip .tip_p2').text('现在文件可以删除');
					$('.success_tip').show();
					setTimeout(function(){
						$('.success_tip').hide();
						$('.success_tip .tip_p1').text('');
						$('.success_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}else{
					//开一个删除失败的小窗口
					$('.err_tip .tip_p1').text('解锁失败');
					$('.err_tip .tip_p2').text('请联系管理员');
					$('.err_tip').show();
					setTimeout(function(){
						$('.err_tip').hide();
						$('.err_tip .tip_p1').text('');
						$('.err_tip .tip_p2').text('');
					},1000)
					$('.unlocked_chioce').hide();
					$('.locked_chioce').hide();
					$('.del_all').hide();
					$('.del_part').hide();
				}
			}
		});
	}

	
})
//表单输入不能有特殊符号
function RemoveSymbol(value) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？《》]"); 
    var rs = ""; 
    for (var i = 0; i < value.length; i++) {
        rs = rs + value.substr(i, 1).replace(pattern, ''); 
    } 
    return rs;
}

//上传文件
function inputChange(ev){
	//1.获取整个form表单的dom的属性
	var formData = new FormData($(".uploadForm")[0]);
	//2.写入文件存放的路径
	var relativepath = $('.main').attr('data_relativepath');
	formData.append("path",relativepath);
	//3.调用文件上传的接口
	$.ajax({  
        url: domain2+'/upload/oss/upload2http',  
        type: 'POST',  
        data: formData,  
        async: true,  
        cache: false,  
        contentType: false,  
        processData: false,  
        success: function (data) {              
            	//开一个提示上传成功的小窗口
            if(data.success == true){
            	$('.success_tip .tip_p1').text('上传成功');
				$('.success_tip').show();
				setTimeout(function(){
					$('.success_tip').hide();
					$('.success_tip .tip_p1').text('');
				},1000)
				if(relativepath == domain2+"/upload/oss/fs/ls?path="){
					//左边和中间的内容刷新
					getList();
				}else{
					//中间的内容刷新
					enter();
				} 
				//upload_flag = false;
            }else{
            	console.log(data)
            }
            	           
        },
        error: function (data) {  
            //开一个提示上传失败的小窗口
        	$('.err_tip .tip_p1').text('删除失败');
			$('.err_tip .tip_p2').text('请联系管理员');
			$('.err_tip').show();
			setTimeout(function(){
				$('.err_tip').hide();
				$('.err_tip .tip_p1').text('');
				$('.err_tip .tip_p2').text('');
			},1000) 
			console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
			//upload_flag = false;
        }
	});	
}

function inputChange1(ev){
	//1.获取整个form表单的dom的属性
	var formData = new FormData($(".uploadForm1")[0]);
	//2.写入文件存放的路径
	var relativepath = $('.main').attr('data_relativepath');
	formData.append("path",relativepath);
	//3.调用文件上传的接口
	$.ajax({  
        url: domain2+'/upload/oss/upload2http',  
        type: 'POST',  
        data: formData,  
        async: true,  
        cache: false,  
        contentType: false,  
        processData: false,  
        success: function (data) {              
            	//开一个提示上传成功的小窗口
            if(data.success == true){
            	$('.success_tip .tip_p1').text('上传成功');
				$('.success_tip').show();
				setTimeout(function(){
					$('.success_tip').hide();
					$('.success_tip .tip_p1').text('');
				},1000)
				if(relativepath == domain2+"/upload/oss/fs/ls?path="){
					//左边和中间的内容刷新
					getList();
				}else{
					//中间的内容刷新
					enter();
				} 
				//upload_flag = false;
            }else{
            	console.log(data)
            }
            	           
        },
        error: function (data) {  
            //开一个提示上传失败的小窗口
        	$('.err_tip .tip_p1').text('删除失败');
			$('.err_tip .tip_p2').text('请联系管理员');
			$('.err_tip').show();
			setTimeout(function(){
				$('.err_tip').hide();
				$('.err_tip .tip_p1').text('');
				$('.err_tip .tip_p2').text('');
			},1000) 
			console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
			//upload_flag = false;
        }
	});	
}

//登录页面
$('.login_btn').click(function(){
	if($('.user_name1').val() != "" && $('.user_passward').val() != ""){
		var md5_password = $.md5($('.user_passward').val());
		//console.log(md5_password);
		//var url = domain2+"/upload/oss/fs/user/login?username="+$('.user_name1').val()+"&password="+$('.user_passward').val();
		var url = domain+"/upload/oss/fs/user/login?username="+$('.user_name1').val()+"&password="+$('.user_passward').val();
		//console.log(url);
		$.ajax({
			type:"get",
			url:url,
			async:true,
			dataType:"JSON",
			success:function(data){
				//console.log(data);
				if(data.success == true){
					console.log('成功');
					//如果成功的话 一天之内不用重复登录，先让cookie记住用户名和密码 					
					$('header').show(); //用于显示主页面
					$('.container').show();//用于显示主页面
					$('.container_usersManager').hide();//用于显示主页面
					$('.users_manager').show();//用于显示主页面
					$('.back_main').hide();//用于显示主页面
					setCookie('username',$('.user_name1').val(),1);
					setCookie('userpassward',$('.user_passward').val(),1);
					//再写一个ajax
					$.ajax({
						type:"get",
						url:domain+"/upload/oss/fs/user/get",
						async:true,
						dataType:"JSON",
						success:function(res){
							if(res.success == true){
								res = res.body;
								console.log(res);								
								if(res.roles.length > 0){
									if(res.roles[0] == "admin"){
										$('.user_warp2').show();
										$('.user_warp1').hide();
									}else{
										$('.user_warp1').show();
										$('.user_warp2').hide();
									}
								}else{
									$('.user_warp1').show();
									$('.user_warp2').hide();
								}
							}
						}
					})
					//$('.user_warp1').show(); //如果是普通用户显示这个
					//$('.user_warp2').show(); //如果是管理员显示这个
					$('.user_name').text($('.user_name1').val());					
					$('.login_wrap').hide();
					$('.user_name1').val("");
					$('.user_passward').val("");
					//这个不知道可不可以获取到
					var jsessionID = getCookie('JSESSIONID');
					setCookie('JSESSIONID',jsessionID,1);
					//console.log(jsessionID);
				}else{
					//开一个提示输入不正确的小窗口
		        	$('.err_tip1 .tip_p11').text('账号或者密码有误');
					$('.err_tip1 .tip_p22').text('如果没有账号密码，请联系管理员');
					$('.err_tip1').show();
					setTimeout(function(){
						$('.err_tip1').hide();
						$('.err_tip1 .tip_p11').text('');
						$('.err_tip1 .tip_p22').text('');
					},2000) 
					console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
				}
			}
		});
	}
})
//退出按钮按下时，返回登录页面
$('.logout').click(function(){
	clearCookie('username');
	clearCookie('userpassward');
	clearCookie('JSESSIONID');
	
	$('.login_wrap').show();
	$('.user_warp1').hide(); 
	$('.user_warp2').hide(); //普通用户和管理员的全部隐藏
})

//设置cookie的方法
function setCookie(c_name,value,expiredays){
	var exdate=new Date()
	exdate.setDate(exdate.getDate()+expiredays)
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

//获得cookie的方法
function getCookie(c_name){
	if (document.cookie.length>0){
		c_start=document.cookie.indexOf(c_name + "=")
	    if (c_start!=-1){ 
	    	c_start=c_start + c_name.length+1 
	    	c_end=document.cookie.indexOf(";",c_start)
	    	if (c_end==-1) c_end=document.cookie.length
	    	return unescape(document.cookie.substring(c_start,c_end))
	    } 
	}
	return ""
}


//一开始进入网站的时候，判断cookie里面有没有输入值
function checkCookie(){
	//html里面的域名改一下
	$('.main').attr('data_relativePath',domain2+'/upload/oss/fs/ls?path=');
	$('.bread_line_p2').attr('onclick',"Enter('"+domain2+"/upload/oss/fs/ls?path=','所有项目','0')");
	username = getCookie('username');
	userpassward = getCookie('userpassward');
	userjsessionID = getCookie('JSESSIONID');
	if (username!=null && username!="" && userpassward!=null && userpassward!="" && userjsessionID!=null && userjsessionID!=""){
		$('.login_wrap').hide();
		$('header').show();
		$('.container').show();
		$('.container_usersManager').hide();//用于显示主页面
		$('.users_manager').show();//用于显示主页面
		$('.back_main').hide();//用于显示主页面
		$.ajax({
			type:"get",
			url:domain+"/upload/oss/fs/user/get",
			async:true,
			dataType:"JSON",
			success:function(res){
				if(res.success == true){
					res = res.body;
					console.log(res);								
					if(res.roles.length > 0){
						if(res.roles[0] == "admin"){
							$('.user_warp2').show();
							$('.user_warp1').hide();
						}else{
							$('.user_warp1').show();
							$('.user_warp2').hide();
						}
					}else{
						$('.user_warp1').show();
						$('.user_warp2').hide();
					}
				}
			}
		})
		//$('.user_warp1').show();//如果是普通用户显示这个
		//$('.user_warp2').show();//如果是管理员显示这个
		$('.user_name').text(username);
	}else{
		$('.login_wrap').show();
	}
}

//清除cookie  
function clearCookie(name) {  
    setCookie(name, "", -1);  
} 

//用户列表的方法
function usersList(){
	$('tbody').html("");
	$.ajax({
		type:"get",
		//url:"js/users.json",
		url:domain+"/upload/oss/fs/user/all",
		async:true,
		dataTpye:"JSON",
		success:function(data){
			if(data.success == true){				
				data = data.body.users; //这个是一个对象 需要用for in循环
				//console.log(data);
				for(var key in data){
					//console.log(data[key]);
					var roles = data[key].roles;
					if(roles.length == 0 || roles[0] == "user"){
						roles = "普通用户";
					}else if(roles[0] == "admin"){
						roles = "管理员";
					}
					var oTr = $('<tr><td><span>'+data[key].username+'</span></td><td><span>'+data[key].password+'</span><input class="upload_password" type="password" placeholder="请输入新密码"/></td><td><span>'+roles+'</span><select><option>普通用户</option><option>管理员</option></select></td><td><button class="user_upload" type="button">修改</button><button class="user_del" type="button">删除</button><button class="user_sure_upload" type="button">确定修改</button><button class="user_cancel" type="button">取消</button></td></tr>');
					oTr.appendTo($('tbody'));
					
				}
				
				//循环结束
			}else{
				console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
			}
			
			//用户列表点击修改的时候
			$('.user_upload').click(function(){
				//按钮的显示变化
				$(this).hide();
				$(this).next().hide();
				$(this).next().next().show();
				$(this).next().next().next().show();
				//td span全部隐藏 input和select显示
				var username = $(this).parent().parent().find('span').eq(0).text();
				var usergrade = $(this).parent().parent().find('span').eq(2).text();
				$(this).parent().parent().find('span').eq(1).hide();
				$(this).parent().parent().find('span').eq(2).hide();
				//$(this).parent().parent().find('.upload_name').val(username);
				$(this).parent().parent().find('.upload_password').val('');
				if(usergrade == "管理员"){
					$(this).parent().parent().find('option').eq(1).attr('selected','selected');
				}else{
					$(this).parent().parent().find('option').eq(0).attr('selected','selected');
				}
				$(this).parent().parent().find('input').show();
				$(this).parent().parent().find('select').show();
			})
			//用户列表点击取消修改的时候
			$('.user_cancel').click(function(){
				//按钮的显示变化
				$(this).hide();
				$(this).prev().hide();
				$(this).prev().prev().show();
				$(this).prev().prev().prev().show();
				//td span全部显示 input和select隐藏
				$(this).parent().parent().find('span').show();
				$(this).parent().parent().find('input').hide();
				$(this).parent().parent().find('select').hide();				
			})
			//用户列表点击确定修改的时候
			$('.user_sure_upload').click(function(){
				var username = $(this).parent().parent().find('span').eq(0).text();
				var userpassword = $(this).parent().parent().find('.upload_password').val();
				var usergrade_old = $(this).parent().parent().find('span').eq(2).text();
				var usergrade = $(this).parent().parent().find('select').val();
				var admin;
				if(usergrade == "管理员"){
					admin = true;
				}else{
					admin = false;
				}
				//按钮的显示变化
				$(this).hide();
				$(this).next().hide();
				$(this).prev().show();
				$(this).prev().prev().show();
				//td span全部显示 input和select隐藏
				$(this).parent().parent().find('span').show();
				$(this).parent().parent().find('input').hide();
				$(this).parent().parent().find('select').hide();
				//名字 密码 用户等级都是新的
				//$(this).parent().parent().find('span').eq(0).text(username);
				//密码的显示还是... 但是需要传给服务器
				userpasswordMD5 = $.md5(userpassword);
				$(this).parent().parent().find('span').eq(1).text(userpasswordMD5);
				$(this).parent().parent().find('span').eq(2).text(usergrade);
				//**1.重置密码的接口
				//console.log(userpassword,username)
				function repsw(){
					$.ajax({
						type:"get",
						url:domain+"/upload/oss/fs/user/resetpwd?username="+username+"&newpwd="+userpassword,
						async:true,
						dataTpye:"JSON",
						success:function(data){
							//console.log(data)
							if(data.success == true){
								//成功小窗口
								$('.success_tip3 .tip_p13').text('修改成功');
								$('.success_tip3').show();
								setTimeout(function(){
									$('.success_tip3').hide();
									$('.success_tip3 .tip_p13').text('');
								},1000)
							}else{
								$('.err_tip3 .tip_p13').text('修改失败');
								$('.err_tip3 .tip_p23').text('请联系管理员');
								$('.err_tip3').show();
								setTimeout(function(){
									$('.err_tip3').hide();
									$('.err_tip3 .tip_p13').text('');
									$('.err_tip3 .tip_p23').text('');
								},2000) 
								console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
							}
						}
					})
				}
				
				//**2.重置用户等级的接口
				function regrade(){
					$.ajax({
						type:"get",
						url:domain+"/upload/oss/fs/user/grant?username="+username+"&admin="+admin,
						async:true,
						dataTpye:"JSON",
						success:function(data){
							if(data.success == true){
								//成功小窗口
								$('.success_tip3 .tip_p13').text('修改成功');
								$('.success_tip3').show();
								setTimeout(function(){
									$('.success_tip3').hide();
									$('.success_tip3 .tip_p13').text('');
								},1000)
							}else{
								$('.err_tip3 .tip_p13').text('修改失败');
								$('.err_tip3 .tip_p23').text('请联系管理员');
								$('.err_tip3').show();
								setTimeout(function(){
									$('.err_tip3').hide();
									$('.err_tip3 .tip_p13').text('');
									$('.err_tip3 .tip_p23').text('');
								},2000) 
								console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
							}
						}
					})
				}
				//如果值修改密码 不修改等级
				//console.log(usergrade_old,usergrade);
				if(userpassword != "" && usergrade_old == usergrade){
					repsw();
				}
				//如果不修改密码 但是修改等级
				if(userpassword == "" && usergrade_old != usergrade){
					regrade();
				}
				//如果同时修改
				if(userpassword != "" && usergrade_old != usergrade){
					repsw();
					regrade();
				}
				
			})
			
			
			//用户列表点击删除的时候
			var delete_username = "";
			$('.user_del').click(function(){
				//弹出删除提示层和模态层
				$('.delete_warn_tip3').show();
				$('.delete_warn_modal3').show();
				//console.log($(this).parent().parent().find('td').eq(0).find('span').text());
				delete_username = $(this).parent().parent().find('td').eq(0).find('span').text();
				
			})
			//删除框的取消按钮点击的时候
			$('.delete_warn_cance2').click(function(){
				$('.delete_warn_tip3').hide();
				$('.delete_warn_modal3').hide();
			})
			//删除框的删除按钮点击的时候
			$('.delete_warn_ok2').click(function(){
				$('.delete_warn_tip3').hide();
				$('.delete_warn_modal3').hide();
				if(delete_username != ""){
					//删除用户的接口 ajax
					$.ajax({
						type:"get",
						url:domain+"/upload/oss/fs/user/delete?username="+delete_username,
						async:true,
						dataType:"JSON",
						success:function(data){
							//console.log(data);
							if(data.success == true){							
								//刷新列表
								usersList();
								//成功小窗口
								$('.success_tip3 .tip_p13').text('删除成功');
								$('.success_tip3').show();
								setTimeout(function(){
									$('.success_tip3').hide();
									$('.success_tip3 .tip_p13').text('');
								},1000)
								delete_username = "";
							}else{
								$('.err_tip3 .tip_p13').text('删除失败');
								$('.err_tip3 .tip_p23').text('请联系管理员');
								$('.err_tip3').show();
								setTimeout(function(){
									$('.err_tip3').hide();
									$('.err_tip3 .tip_p13').text('');
									$('.err_tip3 .tip_p23').text('');
								},2000) 
								console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
								delete_username = "";
							}
							
						}
					});
			
				}
				
			})
		}
	});

}
//管理员 用户管理界面点击的时候
$('.users_manager').click(function(){
	//ajax获得数据	
	usersList();
	//----------------------------------------------
	$('.back_main').show();
	$(this).hide();
	$('.container_usersManager').show();
	$('.container').hide();
})

//添加用户按钮点击的时候
$('.add_user').click(function(){
	//弹出添加提示层和模态层
	$('.add_user_box').show();
	$('.delete_warn_modal3').show();
})

//添加用户 取消的时候
$('.add_cancel').click(function(){
	//关闭提示层和模态层
	$('.add_user_box').hide();
	$('.delete_warn_modal3').hide();
})

//添加用户 确定的时候
$('.add_sure').click(function(){
		
	//判断用户和密码是不是为空
	if($('.username_input').val() != "" && $('.userpassword_input').val()){
		//先调接口
		//关闭提示层和模态层
		$('.add_user_box').hide();
		$('.delete_warn_modal3').hide();
		var username = $('.username_input').val();
		var userpassword = $('.userpassword_input').val();
		$.ajax({
			type:"get",
			url:domain+"/upload/oss/fs/user/add?username="+username+"&password="+userpassword,
			async:true,
			dataType:"JSON",
			success:function(data){
				//刷新列表
				//console.log(data);
				if(data.success == true){
					usersList();
					$('.username_input').val("");
					$('.userpassword_input').val("");
					//成功小窗口
					$('.success_tip3 .tip_p13').text('添加成功');
					$('.success_tip3').show();
					setTimeout(function(){
						$('.success_tip3').hide();
						$('.success_tip3 .tip_p13').text('');
					},1000) 
				}else{
					$('.err_tip3 .tip_p13').text('添加失败');
					if(data.msg == "java.lang.IllegalArgumentException: 用户名已存在！"){
						$('.err_tip3 .tip_p23').text('用户名已存在');
					}else{
						$('.err_tip3 .tip_p23').text('请联系管理员');
					}
					
					$('.err_tip3').show();
					setTimeout(function(){
						$('.err_tip3').hide();
						$('.err_tip3 .tip_p13').text('');
						$('.err_tip3 .tip_p23').text('');
					},2000) 
					console.log("错误信息："+data.msg+"，错误码："+data.errorCode);
					$('.username_input').val("");
					$('.userpassword_input').val("");
				}
				
			}
		})
		
	}else{
		//弹出小窗口
		//console.log("用户名或密码不能为空");
    	$('.warn_tip3 .tip_p13').text('用户名和密码不能为空');
		$('.warn_tip3').show();
		setTimeout(function(){
			$('.warn_tip3').hide();
			$('.warn_tip3 .tip_p11').text('');
		},2000) 
	}
	
})

//管理员 点击返回主页面的时候
$('.back_main').click(function(){
	$('.users_manager').show();
	$(this).hide();
	$('.container_usersManager').hide();
	$('.container').show();
})

//排序  默认是按修改时间倒序的
$('.order').change(function(){
	//console.log($(this).val());
	var option = $(this).val();
	if(option == "(默认)按修改时间倒序"){
		enter("lastModifiedTime:desc;name:desc")
	}else if(option == "按修改时间顺序"){
		enter("lastModifiedTime:asc;name:desc")
	}else if(option == "按文件大小从大到小"){
		enter("size:desc;name:desc")
	}else if(option == "按文件大小从小到大"){
		enter("size:asc;name:desc")
	}else if(option == "按文件名称倒序"){
		enter("name:desc")
	}else if(option == "按文件名称顺序"){
		enter("name:asc")
	}
})

//修改的密码点击的时候
$('.change_psw').click(function(){
	$('.psw_wrap').show();
	//$('.psw_box').show();
	
	
})
//修改密码的取消按钮点击的时候
$('.psw_cancel').click(function(){
	$('.psw_wrap').hide();
	//$('.psw_box').hide();
	$('.new_psw_input').val("");
	$('.new_psw_input2').val("");
})
//修改密码的确定按钮点击的时候
$('.psw_sure').click(function(){	
	if($('.new_psw_input').val() != "" && $('.new_psw_input2').val() != "" && $('.old_psw_input').val() != ""){
		//先获得当前用户信息吧
		var username = $('.user_name').eq(0).text();
		var oldpsw = $('.old_psw_input').val();
		oldpsw_md5 = $.md5(oldpsw);
		console.log(oldpsw);
		var oldpsw2;
		$.ajax({
			type:"get",
			url:domain+"/upload/oss/fs/user/get",
			async:true,
			dataType:"JSON",
			success:function(data){
				if(data.success == true){
					data = data.body;
					oldpsw2 = data.password;
					if(oldpsw_md5 == oldpsw2){
						//如果旧的密码一致，那么判断新的2遍密码一不一样
						if($('.new_psw_input').val() == $('.new_psw_input2').val()){
							//如果两遍新密码一致，那么调用修改密码的接口
							$.ajax({
								type:"get",
								url:domain+"/upload/oss/fs/user/newpwd?username="+username+"&oldpwd="+oldpsw+"&newpwd="+$('.new_psw_input').val(),
								async:true,
								dataType:"JSON",
								success:function(data){
									
									if(data.success == true){
										//console.log('修改成功');
										$('.tip_p1').text('修改成功');
										$('.tip_p2').text('请重新登录');
										$('.success_tip_all').show();
										setTimeout(function(){
											$('.success_tip_all').hide();
											$('.success_tip_all .tip_p1').text('');
											$('.success_tip_all .tip_p2').text('');
											$('.psw_wrap').hide();
											//$('.psw_box').hide();
											$('.new_psw_input').val("");
											$('.new_psw_input2').val("");
											$('.old_psw_input').val("");
										},1000)
										setTimeout(function(){
											clearCookie('username');
											clearCookie('userpassward');
											clearCookie('JSESSIONID');
											
											$('.login_wrap').show();
											$('.user_warp1').hide(); 
											$('.user_warp2').hide(); //普通用户和管理员的全部隐藏
										},1500)
									}else{
										//console.log('修改失败');
										$('.tip_p1').text('修改失败');
										$('.tip_p2').text('请联系管理员');
										$('.err_tip_all').show();
										setTimeout(function(){
											$('.err_tip_all').hide();
											$('.err_tip_all .tip_p1').text('');
											$('.err_tip_all .tip_p2').text('');
											$('.psw_wrap').hide();
											//$('.psw_box').hide();
											$('.new_psw_input').val("");
											$('.new_psw_input2').val("");
											$('.old_psw_input').val("");
										},1000)
									}
									
								}
							})
						}else{
							//console.log('两遍新密码输入不一致');
							$('.tip_p1').text('两遍新密码输入不一致');
							$('.tip_p2').text('请重新输入');
							
							$('.warn_tip_all').show();
							setTimeout(function(){
								$('.warn_tip_all').hide();
								$('.warn_tip_all .tip_p1').text('');
								$('.warn_tip_all .tip_p2').text('');
								$('.new_psw_input').val("");
								$('.new_psw_input2').val("");
							},1000)
						}
						
					}else{
						//console.log('旧的密码错误！')
						$('.tip_p1').text('旧的密码错误');
						$('.tip_p2').text('请重新输入');
						
						$('.warn_tip_all').show();
						setTimeout(function(){
							$('.warn_tip_all').hide();
							$('.warn_tip_all .tip_p1').text('');
							$('.warn_tip_all .tip_p2').text('');
							$('.old_psw_input').val("");
						},1000)
					}
				}
			}
		})
		
	}else{
		//console.log('旧的密码错误！')
		$('.tip_p1').text('需要填写不能为空！');
		
		$('.warn_tip_all').show();
		setTimeout(function(){
			$('.warn_tip_all').hide();
			$('.warn_tip_all .tip_p1').text('');
		},1000)
	}
	
})

