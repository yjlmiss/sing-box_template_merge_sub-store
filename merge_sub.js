// merge_sub.js
// Sub-Store 文件脚本：追加 outbounds 并注入“手动切换”“自动选择”两组 + 五大地区分组
// 用法：template.json → 操作 → 脚本操作（链接）
// https://…/merge_sub.js#name=jiuguang&type=1

(async function() {
  const { name, type } = $arguments;
  if (!name || !type) throw new Error('请在链接中传入 #name=订阅名&type=类型');

  // 1. 读取原始 template.json
  let config = JSON.parse($files[0]);

  // 2. 拉取订阅节点
  let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal'
  });

  // 3. 追加到 outbounds
  config.outbounds.push(...proxies);

  // 4. 提取所有节点 tag
  const allTags = proxies.map(p => p.tag);

  // 5. 注入“手动切换”（selector）
  let manual = config.outbounds.find(o => o.tag === '手动切换' && o.type === 'selector');
  if (manual) {
    manual.outbounds = Array.from(new Set([...manual.outbounds, ...allTags]));
  }

  // 6. 注入“自动选择”（urltest）
  let auto = config.outbounds.find(o => o.tag === '自动选择' && o.type === 'urltest');
  if (auto) {
    auto.outbounds = Array.from(new Set([...auto.outbounds, ...allTags]));
  }

  // 7. 按节点名正则注入五大地区分组（不区分 type）
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
