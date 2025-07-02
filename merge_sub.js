// append-outbounds.js
// Sub-Store 文件脚本：只追加 outbounds

// 读取 URL 参数 name（订阅名）和 type（1=组合订阅，0=单条订阅）
const { name, type } = $arguments;

// 1. 解析当前 template.json
let config = JSON.parse($files[0]);

// 2. 调用 produceArtifact 拉取节点列表
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// 3. 追加到 outbounds
config.outbounds.push(...proxies);

// 4. 输出最终 JSON
$content = JSON.stringify(config, null, 2);
