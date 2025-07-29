const { name, type } = $arguments;               // 获取脚本参数
let s = $files[0];                                 // 读取 Mihomo 模板

// 1. 拉取订阅节点列表
let p = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "mihomo",
  produceType: "internal"
});

// 2. 构建顶层 proxies 段（保留 JSON 单行格式）
let e = p.map(x => `  - ${JSON.stringify(x)}`).join("\n");
s = s.replace(/(?=^proxy-groups:)/m, `proxies:\n${e}\n\n`);

// 3. 准备节点名称列表
let all = p.map(x => x.name);
let r = p.filter(x => !x["dialer-proxy"]).map(x => x.name);

// 4. 在每个策略组已有 proxies: [...] 后追加名称
s = s.replace(
  /^(\s{2}- name:[\s\S]*?)\s{4}proxies:\s*\[([^\]]*)\]/gm,
  (m, head, body) => {
    // 提取已有列表，选择要追加的节点
    let ex = body.split(",").map(x => x.trim()).filter(Boolean);
    let add = head.includes("中继前置") ? r : all;
    let merged = [...new Set([...ex, ...add])];
    // 重写该行
    return `${head}    proxies: [${merged.join(", ")}]`;
  }
);

$content = s; // 输出最终 YAML
