// LongLight.js
// Sub-Store 文件脚本：追加 outbounds 并注入“手动切换”“自动选择”两组 + 五大地区分组
// 用法：在 template.json → 操作 → 脚本操作（链接） 中填写：
// https://…/LongLight.js#name=jiuguang&type=1

const { name, type } = $arguments;

// 1. 解析 template.json
let config = JSON.parse($files[0]);

// 2. 拉取并追加节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});
config.outbounds.push(...proxies);

// 3. 提取所有节点 tag
const allTags = proxies.map(p => p.tag);

// 4. 定义区域正则
const regions = {
  '台湾节点':   /台湾|台|Tai\s?Wan|TW|TWN/i,
  '香港节点':   /香港|HK|Hong\s?Kong/i,
  '新加坡节点': /新加坡|SG|SIN|Singapore/i,
  '美国节点':   /美国|US|USA|United\s?States/i,
  '日本节点':   /日本|JP|JPN|Japan|Tokyo/i,
};

// 5. 按 tag 注入各分组
['手动切换', '自动选择', '台湾节点', '香港节点', '新加坡节点', '美国节点', '日本节点']
  .forEach(tag => {
    let group = config.outbounds.find(o => o.tag === tag);
    if (!group || !Array.isArray(group.outbounds)) return;

    if (tag === '手动切换' || tag === '自动选择') {
      // 两大万能组，插入全部节点
      group.outbounds = Array.from(new Set([...group.outbounds, ...allTags]));
    } else {
      // 地区分组，按正则过滤
      const re = regions[tag];
      const matches = allTags.filter(t => re.test(t));
      group.outbounds = Array.from(new Set([...group.outbounds, ...matches]));
    }
  });

// 6. 输出最终完整 JSON
$content = JSON.stringify(config, null, 2);
