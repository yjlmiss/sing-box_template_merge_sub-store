# sing-box_template_merge_sub-store

## 使用说明
本项目所搭载的js脚本，必须在[sub-store](https://github.com/sub-store-org/Sub-Store)内使用，仅测试了项目中的singbox模板，未测试其他模板，该模板官方1.12或1.12内核一定可以使用，其余版本未测试。

适用1.12内核的：*singbox_for_win_template.json*  *singbox_for_wrt_template.json*，以及无分区的*for_win.json*  *for_wrt.json*

适用1.11内核的：*singbox-v11.json* ，以及无分区的*for_v11.json*

单独提供1.11的模板是因为目前iOS商店中的[【sing-box VT  APP】](https://apps.apple.com/us/app/sing-box-vt/id6673731168)使用的是1.11内核

## 使用步骤（默认模式）
1. 在sub-store上传singbox_template.json
2. 记住在sub-store中你的单条订阅或组合订阅的名称
3. 在sub-store的文件管理功能中编辑singbox_template.json 添加一个脚本操作，并且选择链接：
```
https://raw.githubusercontent.com/LongLights/sing-box_template_merge_sub-store/refs/heads/main/merge.js#name=<你在sub-store中的订阅名称>&type=<在sub-store中的订阅类型>#noCache
```
type可以赋值0或1,0表示单条订阅，1表示组合订阅

4. 添加脚本操作后再次访问sub-store中的singbox_template.json，就已经是把节点信息正确插入的完整可用配置了

## 无地区分组使用步骤
参考默认模式的步骤，将模板文件和js脚本切换为[【“NoRegion”】](https://github.com/LongLights/sing-box_template_merge_sub-store/tree/main/NoRegion)文件夹内的版本即可

无地区分组去掉了五个地区自动测速组，并且将提供的所有节点无脑追加到全部代理组（在模板中是10个分组，包括1个全量的自动测速组+9个selector组）

后续自己添加新的代理组，或者删除模板原有代理组，将继续执行无脑追加的策略。



## 鸣谢
这段js脚本是由chatgpt参考[xishang0128](https://github.com/xishang0128)大佬所写
[神器sub-store](https://github.com/sub-store-org/Sub-Store)太tm好用了，强烈推荐！！！

## 注意事项
- 适用于OpenWrt的procd脚本、自动更新脚本以及适用Windows端的bat脚本，需要自行修改其中的工作目录及你自己的模板链接
- windows的bat更新脚本，直接下载不可用，需要手动复制其中的内容自己在windows创建（最好记事本编辑并且另存为ANSI编码格式）