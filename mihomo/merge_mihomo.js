const { name, type } = $arguments;
let s = $files[0];
// 1. 拉取订阅节点列表并去掉无用字段
let p = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "ClashMeta",
  produceType: "internal"
});
p = p.map(x => {
  delete x._subName;
  delete x._subDisplayName;
  return x;
});
// 2. 输出为 YAML 格式到 proxies 段
let e = ProxyUtils.yaml.safeDump(p)
  .split('\n')
  .map(line => '  ' + line)
  .join('\n');
s = s.replace(/(?=^proxy-groups:)/m, `proxies:\n${e}\n`);
// 3. 追加分组成员名并将含有dailer-proxy字段的节点排除中继前置组
let all = p.map(x => x.name);
let r = p.filter(x => !x["dialer-proxy"]).map(x => x.name);
s = s.replace(
  /^(\s{2}- name:[\s\S]*?)\s{4}proxies:\s*\[([^\]]*)\]/gm,
  (m, head, body) => {
    let ex = body.split(",").map(x => x.trim()).filter(Boolean);
    let add = head.includes("中继前置") ? r : all;
    let merged = [...new Set([...ex, ...add])];
    return `${head}    proxies: [${merged.join(", ")}]`;
  }
);
$content = s;
