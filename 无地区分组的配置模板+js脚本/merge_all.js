const { name, type } = $arguments;

// 1. 加载配置模板
let config = JSON.parse($files[0]);

// 2. 拉取订阅或合集节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "sing-box",
  produceType: "internal",
});

// 3. 去重：过滤掉 tag 冲突的节点
const existingTags = config.outbounds.map((o) => o.tag);
proxies = proxies.filter((p) => !existingTags.includes(p.tag));

// 4. 将新节点添加到 outbounds 中
config.outbounds.push(...proxies);

// 5. 获取新节点的 tags 列表
const allTags = proxies.map((p) => p.tag);

// 6. 遍历所有分组，并将新节点添加到每个分组
config.outbounds.forEach((group) => {
  // 排除 "🔄 直连入口" 分组
  if (group.tag !== "🔄 直连入口" && Array.isArray(group.outbounds)) {
    // 将所有新节点加入到该分组的 outbounds 中
    group.outbounds.push(...allTags);
  }
});

// 7. 输出最终配置
$content = JSON.stringify(config, null, 2);
