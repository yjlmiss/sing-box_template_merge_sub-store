const { name, type } = $arguments;
let yamlText = $files[0];

const proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "mihomo",
  produceType: "internal",
});

const proxyJsonLines = proxies.map(p => `  - ${JSON.stringify(p)}`).join('\n');
const allNames = proxies.map(p => p.name);
const terminalNames = proxies.filter(p => !p["dialer-proxy"]).map(p => p.name);

// 1. 插入 proxies 段（若无，则放在 proxy-groups 前）
if (/^\s*proxies:\s*\n/m.test(yamlText)) {
  yamlText = yamlText.replace(/(^\s*proxies:\s*\n)([\s\S]*?)(?=\n\w|$)/m, (_, head, body) => {
    return `${head}${body.trimEnd()}\n${proxyJsonLines}\n`;
  });
} else {
  yamlText = yamlText.replace(/^(?=\s*proxy-groups:)/m, `proxies:\n${proxyJsonLines}\n\n`);
}

// 2. 精准只替换 proxy-groups 段内的组（防止误伤 rules）
yamlText = yamlText.replace(
  /(?<=proxy-groups:\n)([\s\S]*?)(?=\n\w|$)/,
  section => section.replace(
    /(( *)(- name: .+?)\n([\s\S]*?))(?=\n\2- name: |\n\2#|\n\w|$)/g,
    (_, block, indent, nameLine, body) => {
      const name = nameLine.match(/- name: (.+)/)[1].trim();
      const lines = body.trim().split('\n');
      const idx = lines.findIndex(l => /^\s*proxies:/.test(l));
      let existing = [];

      if (idx !== -1) {
        const m = lines[idx].match(/\[(.*?)\]/);
        if (m) existing = m[1].split(',').map(x => x.trim());
        lines.splice(idx, 1);
      }

      let add = name === '中继前置' ? terminalNames : (name === '自动选择' || existing.length ? allNames : []);
      const merged = [...new Set([...existing, ...add])];
      lines.push(`${indent}  proxies: [${merged.join(', ')}]`);
      return `${indent}${nameLine}\n${lines.map(l => `${indent}  ${l.trim()}`).join('\n')}`;
    }
  )
);

$content = yamlText;
