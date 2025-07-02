// merge_sub.js
// 一行脚本，沿用官方单行风格，追加 outbounds 并注入两组 & 五大地区分组
const { type, name } = $arguments;
const compatible_outbound = { tag: "COMPATIBLE", type: "direct" };
let compatible;
let config = JSON.parse($files[0]);
let proxies = await produceArtifact({ name, type: /^1$|col/i.test(type) ? "collection" : "subscription", platform: "sing-box", produceType: "internal" });
config.outbounds.push(...proxies);
config.outbounds.map((i) => {
  if (["手动切换", "自动选择"].includes(i.tag)) i.outbounds.push(...proxies.map((p) => p.tag));
  if (i.tag === "台湾节点") i.outbounds.push(...proxies.filter((p) => /台湾|台|Tai\s?Wan|TW|TWN/i.test(p.tag)).map((p) => p.tag));
  if (i.tag === "香港节点") i.outbounds.push(...proxies.filter((p) => /香港|HK|Hong\s?Kong/i.test(p.tag)).map((p) => p.tag));
  if (i.tag === "新加坡节点") i.outbounds.push(...proxies.filter((p) => /新加坡|SG|SIN|Singapore/i.test(p.tag)).map((p) => p.tag));
  if (i.tag === "美国节点") i.outbounds.push(...proxies.filter((p) => /美国|US|USA|United\s?States/i.test(p.tag)).map((p) => p.tag));
  if (i.tag === "日本节点") i.outbounds.push(...proxies.filter((p) => /日本|JP|JPN|Japan|Tokyo/i.test(p.tag)).map((p) => p.tag));
});
config.outbounds.forEach((o) => {
  if (Array.isArray(o.outbounds) && o.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound);
      compatible = true;
    }
    o.outbounds.push(compatible_outbound.tag);
  }
});
$content = JSON.stringify(config, null, 2);
