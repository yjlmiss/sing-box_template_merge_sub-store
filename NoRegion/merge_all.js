const { name, type } = $arguments;

// 1. 加载模板
let config = JSON.parse($files[0]);

// 2. 拉取订阅或合集节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "sing-box",
  produceType: "internal",
});

// 3. 去重：过滤掉已有的 tag
const existingTags = config.outbounds.map(o => o.tag);
proxies = proxies.filter(p => !existingTags.includes(p.tag));

// 4. 将新节点添加到 outbounds 数组（供分组引用）
config.outbounds.push(...proxies);

// 5. 准备两份 tag 列表
const allTags      = proxies.map(p => p.tag);
const terminalTags = proxies.filter(p => !p.detour).map(p => p.tag);

// 6. 遍历每个分组，追加节点
config.outbounds.forEach(group => {
  // 只处理有 outbounds 数组的分组，且跳过直连入口
  if (!Array.isArray(group.outbounds) || group.tag === "🔄 直连入口") return;

  if (group.tag === "🔗 中继节点") {
    // “🔗 中继节点” 只追加不带 detour 的终端节点
    group.outbounds.push(...terminalTags);
  } else {
    // 其余分组全部追加
    group.outbounds.push(...allTags);
  }
});

// 7. 去重每个分组内部可能的重复 tag
config.outbounds.forEach(group => {
  if (Array.isArray(group.outbounds)) {
    group.outbounds = [...new Set(group.outbounds)];
  }
});

// 8. 输出最终配置
$content = JSON.stringify(config, null, 2);
