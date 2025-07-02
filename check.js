(async function() {
  // merge_sub.js
  // Sub-Store 文件脚本：追加 outbounds 并注入分组（回退版）
  // 用法：在 template.json → 操作 → 脚本操作（链接） 中填写：
  // https://…/merge_sub.js#name=jiuguang&type=1

  const { name, type } = $arguments;
  if (!name || !type) throw new Error('请在链接中传入 #name=订阅名&type=类型');

  let config = JSON.parse($files[0]);
  let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal'
  });

  // 追加所有节点到 outbounds
  config.outbounds.push(...proxies);

  // 注入“手动切换”和“自动选择”两组
  const allTags = proxies.map(p => p.tag);
  ['手动切换','自动选择'].forEach(group => {
    const sel = config.outbounds.find(o=>o.tag===group&&o.type==='selector');
    if (sel) sel.outbounds = Array.from(new Set([...sel.outbounds, ...allTags]));
  });

  // 按节点名正则注入五大地区分组
  const regions = {
    '台湾节点':   /台湾|台|Tai\s?Wan|TW|TWN/i,
    '香港节点':   /香港|HK|Hong\s?Kong/i,
    '新加坡节点': /新加坡|SG|SIN/i,
    '美国节点':   /美国|US|USA/i,
    '日本节点':   /日本|JP|JPN|Tokyo/i
  };
  Object.entries(regions).forEach(([group,re]) => {
    const sel = config.outbounds.find(o=>o.tag===group&&o.type==='selector');
    if (sel) {
      const matches = allTags.filter(t=>re.test(t));
      sel.outbounds = Array.from(new Set([...sel.outbounds, ...matches]));
    }
  });

  // 返回最终 JSON
  $content = JSON.stringify(config, null, 2);
})();
