// merge_sub.js
// Sub-Store 文件脚本：追加 outbounds 并注入两大组 (手动切换 + 自动选择) 及五大地区分组
// 用法：在 template.json → 操作 → 脚本操作（链接） 中填写：
// https://…/merge_sub.js#name=jiuguang&type=1

(async function() {
  // 1. 获取订阅名和类型
  const { name, type } = $arguments;
  if (!name || !type) throw new Error('请在链接中传入 #name=订阅名&type=类型');

  // 2. 解析 template.json
  let config = JSON.parse($files[0]);

  // 3. 拉取订阅节点列表
  let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal'
  });

  // 4. 追加到 outbounds
  config.outbounds.push(...proxies);

  // 5. 提取所有节点 tag
  const allTags = proxies.map(p => p.tag);

  // 6. 注入“手动切换”和“自动选择”两组（不区分 type）
  ['手动切换', '自动选择'].forEach(group => {
    let sel = config.outbounds.find(o => o.tag === group);
    if (sel && Array.isArray(sel.outbounds)) {
      sel.outbounds = Array.from(new Set([...sel.outbounds, ...allTags]));
    }
  });

  // 7. 按节点名正则注入五大地区分组
  const regions = {
    '台湾节点':   /台湾|台|Tai\s?Wan|TW|TWN/i,
    '香港节点':   /香港|HK|Hong\s?Kong/i,
    '新加坡节点': /新加坡|SG|SIN|Singapore/i,
    '美国节点':   /美国|US|USA|United\s?States/i,
    '日本节点':   /日本|JP|JPN|Japan|Tokyo/i
  };
  Object.entries(regions).forEach(([group, re]) => {
    let sel = config.outbounds.find(o => o.tag === group);
    if (sel && Array.isArray(sel.outbounds)) {
      const matches = allTags.filter(t => re.test(t));
      sel.outbounds = Array.from(new Set([...sel.outbounds, ...matches]));
    }
  });

  // 8. 输出最终 JSON
  $content = JSON.stringify(config, null, 2);
})();
