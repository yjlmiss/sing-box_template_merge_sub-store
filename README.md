# sing-box_template_merge_sub-store

## 使用说明
本项目所搭载的js脚本，必须在sub-store内使用，仅测试了项目中的singbox模板，未测试其他模板，该模板官方1.12内核一定可以使用，其余版本未测试。

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
