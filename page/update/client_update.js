layui.config({
  base : "../../js/"
})
layui.use(['table', 'jquery', 'session', 'form', 'layer'], function(){
	var session = layui.session;
	var table = layui.table;
	var layer = layui.layer;
	var form = layui.form;
	var $ = layui.jquery;
	var versions = {};

	function update_list(name) {
		table.render({
			elem:'#list',
			cols:[[
				{title:'版本号', field:'version', sort:true, width:80},
				{title:'说明', field:'desc', edit: 'text'},
				{title:'日期', field:'time', width:160},
				{title:'提交版本', field:'git_version', width:100},
				{title:'当前使用', field:'cur', type:'radio', width:100},
				{title:'操作', field:'right', toolbar:'#toolbar', align:'center', width:110}
			]],
			page:true,
			data:versions[name]
		});
		if(versions[name][0]){
			var cur = versions[name][0].version;
			var nums = cur.match(/\d+/g);
			nums[2] = Number(nums[2])+1;
			console.log(nums);
			$("#new_version").val(nums[0]+'.'+nums[1]+'.'+nums[2]);
		}
	}

	session.call('/cms/update/client_update/list', {}, function(data){
		versions = data.versions;
		$("#wrapper_name").empty();
		for(var name in versions){
			$("#wrapper_name").append('<option value="'+name+'">'+name+'</option>');
		}
		for(var name in versions){
			update_list(name);
			break;
		}
		form.render();
	})

	form.on("submit(*)", function(data) {
		var field = data.field;
		session.call('/cms/update/client_update/wrapper', {
			version: field.version,
			desc: field.desc,
			wrapper: field.wrapper
		}, function(ret) {
			layer.open({
				title: "打包日志",
				maxWidth: 1000,
				content: '<textarea class="layui-textarea" style="width:900px;height:500px">'+ret.output+'</textarea>',
                success: function(){
                    $(".layui-textarea").scrollTop(500000);
                }
			});
		})
		return false;
	})

	table.on("tool(list)", function(obj) {
        switch(obj.event){
            case "del":
                var index = layer.open({
                    title: '删除版本',
                    content: '确定删除版本'+obj.data.version+'?',
                    btn: ['确定'],
                    yes: function(){
                        console.log("delete");
                        layer.close(index);
                        session.call("/cms/update/client_update/remove", {
                            wrapper: $("#wrapper_name").val(),
                            version: obj.data.version
                        }, function(){
                            console.log("done");
                        })
                    }
                });
                break;
        }
	})
    
    table.on("radio(list)", function(obj) {
        var index = layer.open({
            title: '切换版本',
            content: '确定把当前版本切换到'+obj.data.version+'?',
            btn: ['确定'],
            yes: function() {
                layer.close(index);
                session.call("/cms/update/client_update/current", {
                    wrapper: $("#wrapper_name").val(),
                    version: obj.data.version
                }, function(){
                    console.log("done");
                });
            }
        });
    })
})