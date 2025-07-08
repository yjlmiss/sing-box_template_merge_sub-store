const { name, type } = $arguments;

// 1. 加载模板
let config = JSON.parse($files[0]);

// 2. 拉取订阅或合集节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// 3. 去重：过滤掉 tag 冲突的节点
const existingTags = config.outbounds.map(o => o.tag);
proxies = proxies.filter(p => !existingTags.includes(p.tag));

// 4. 添加到 outbounds
config.outbounds.push(...proxies);

// 5. 获取新节点 tag 列表
const allTags = proxies.map(p => p.tag);

// 6. 区域匹配规则（可随时扩展）
const regions = {
  '🇭🇰 香港节点': /香港|HK|Hong\s?Kong/i,
  '🇹🇼 台湾节点': /台湾|台|Tai\s?Wan|TW|TWN/i,
  '🇯🇵 日本节点': /日本|JP|JPN|Japan|Tokyo/i,
  '🇺🇸 美国节点': /美国|US|USA|United\s?States|America/i,
  '🇸🇬 新加坡节点': /新加坡|SG|SIN|Singapore/i,
};

// 7. 匹配并追加到分组
[
  '⚙️ 手动切换',
  '🎚️ 自动选择',
  ...Object.keys(regions)
].forEach(groupTag => {
  const group = config.outbounds.find(o => o.tag === groupTag && Array.isArray(o.outbounds));
  if (!group) return;

  const matched = (groupTag === '⚙️ 手动切换' || groupTag === '🎚️ 自动选择')
    ? allTags
    : allTags.filter(tag => regions[groupTag].test(tag));

  const directLast = group.outbounds.includes('direct-tag');
  const merged = Array.from(new Set([...group.outbounds, ...matched])).filter(t => t !== 'direct-tag');
  if (directLast) merged.push('direct-tag');

  group.outbounds = merged;
});

// 8. 输出最终配置
$content = JSON.stringify(config, null, 2);
