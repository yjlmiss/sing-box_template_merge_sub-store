(async function() {
  const { name, type } = $arguments;
  if (!name || !type) throw new Error('请在链接中传入 #name=订阅名&type=类型');

  let config = JSON.parse($files[0]);
  let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal'
  });

  config.outbounds.push(...proxies);
  const allTags = proxies.map(p => p.tag);
  ['手动切换','自动选择'].forEach(group => {
    const sel = config.outbounds.find(o => o.tag===group&&o.type==='selector');
    if (sel) sel.outbounds = Array.from(new Set([...sel.outbounds,...allTags]));
  });

  const regions = {
    '台湾节点':   /台湾|台|Tai\s?Wan|TW|TWN/i,
    '香港节点':   /香港|HK|Hong\s?Kong/i,
    '新加坡节点': /新加坡|SG|SIN/i,
    '美国节点':   /美国|US|USA/i,
    '日本节点':   /日本|JP|JPN|Tokyo/i
  };
  Object.entries(regions).forEach(([g,re])=>{
    const sel = config.outbounds.find(o=>o.tag===g&&o.type==='selector');
    if(sel){
      const m = allTags.filter(t=>re.test(t));
      sel.outbounds = Array.from(new Set([...sel.outbounds,...m]));
    }
  });

  config.outbounds.forEach(o=>{
    if(o.type==='selector' && (!Array.isArray(o.outbounds)||o.outbounds.length===0)){
      config.outbounds.push({tag:'COMPATIBLE',type:'direct'});
      o.outbounds=['COMPATIBLE'];
    }
  });

  $content = JSON.stringify(config,null,2);
})();
