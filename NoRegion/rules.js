const { rules_file = "rules.json" } = $arguments;

let config = JSON.parse($files[0]);
let customRulesRaw = await produceArtifact({
  type: "file",
  name: rules_file,
});
if (!customRulesRaw) throw new Error(`未找到自定义规则文件: ${rules_file}`);

let customRules;
try {
  customRules = JSON.parse(customRulesRaw);
} catch (e) {
  throw new Error(`自定义规则文件 JSON 解析失败: ${e.message}`);
}

// 插入 clash_mode === "global" 这条规则下面
let idx = config.route.rules.findIndex(r => r.clash_mode === "global");

if (idx !== -1) {
  const existingRulesStr = new Set(config.route.rules.map(r => JSON.stringify(r)));
  customRules = customRules.filter(r => !existingRulesStr.has(JSON.stringify(r)));
  config.route.rules.splice(idx + 1, 0, ...customRules);
} else {
  config.route.rules.push(...customRules);
}

$content = JSON.stringify(config, null, 2);
