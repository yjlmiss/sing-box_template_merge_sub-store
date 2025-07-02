// merge_sub.js
// Sub-Store 文件脚本：追加 outbounds 并注入分组
// 用法：在 template.json → 操作 → 脚本操作（链接） 中填写：
// https://…/merge_sub.js#name=jiuguang&type=1

const { name, type } = $arguments;

// 1. 读取 template.json
let config = JSON.parse($files[0]);

// 2. 拉取节点列表
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// 3. 追加到 outbounds
config.outbounds.push(...proxies);

// 4. 提取所有节点 tag
const allTags = proxies.map(p => p.tag);

// 5. 注入“手动切换”和“自动选择”两组
['手动切换', '自动选择'].forEach(group => {
  let sel = config.outbounds.find(o => o.type==='selector' && o.tag===group);
  if (sel) {
    sel.outbounds = Array.from(new Set([...sel.outbounds, ...allTags]));
  }
});

// 6. 按节点名正则注入五大地区分组
const regions = {
  '台湾节点':   /台湾|台|Tai\s?Wan|TW|TWN/i,
  '香港节点':   /香港|HK|Hong\s?Kong/i,
  '新加坡节点': /新加坡|SG|SIN|Singapore/i,
  '美国节点':   /美国|US|USA|United\s?States/i,
  '日本节点':   /日本|JP|JPN|Japan|Tokyo/i
};
Object.entries(regions).forEach(([group, re]) => {
  let sel = config.outbounds.find(o => o.type==='selector' && o.tag===group);
  if (sel) {
    const matches = allTags.filter(t => re.test(t));
    sel.outbounds = Array.from(new Set([...sel.outbounds, ...matches]));
  }
});

// 7. 返回最终 JSON
$content = JSON.stringify(config, null, 2);
