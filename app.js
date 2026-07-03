const SAMPLE_CSV = `user_id,age,gender,city_tier,visits_30d,product_views,add_to_cart,purchases,total_spend,days_since_last_purchase,coupon_clicks,support_tickets
U1001,28,F,1,24,96,12,6,3860,4,5,0
U1002,34,M,2,18,82,9,3,2140,11,2,1
U1003,22,F,1,9,31,4,1,360,28,7,0
U1004,41,M,3,3,12,1,0,0,95,1,2
U1005,30,F,2,16,67,8,2,1288,18,6,0
U1006,37,F,1,27,130,18,7,5120,3,4,1
U1007,26,M,2,6,25,5,0,0,42,8,0
U1008,45,F,3,2,8,0,0,0,160,0,1
U1009,33,M,1,21,104,11,5,4280,8,3,0
U1010,29,F,2,12,54,7,1,760,35,9,0
U1011,39,M,3,5,19,2,1,420,74,1,2
U1012,24,F,1,20,88,10,3,1860,13,10,0
U1013,48,M,2,4,16,1,0,0,121,2,3
U1014,31,F,1,25,112,14,5,3560,6,4,0
U1015,36,M,2,10,46,6,1,690,52,6,1
U1016,27,F,3,7,22,2,0,0,39,5,0
U1017,43,M,1,17,73,8,4,2980,9,1,0
U1018,25,F,2,11,57,10,1,540,26,11,0
U1019,32,M,3,1,4,0,0,0,210,0,2
U1020,40,F,1,23,118,16,6,4720,5,3,0
U1021,35,M,2,8,34,4,1,590,88,3,1
U1022,29,F,1,15,69,6,2,1460,17,2,0
U1023,38,M,3,3,14,2,0,0,132,1,2
U1024,23,F,2,13,62,9,1,680,24,12,0
U1025,46,M,1,19,90,10,4,3140,10,3,1
U1026,28,F,3,6,28,5,0,0,44,7,0
U1027,31,M,2,14,60,6,2,980,21,5,0
U1028,42,F,1,26,125,17,7,5380,2,4,0
U1029,33,F,2,4,15,1,0,0,115,2,1
U1030,37,M,1,22,101,13,5,4020,7,6,0
U1031,27,F,3,9,38,7,1,420,31,10,0
U1032,44,M,2,2,9,0,0,0,188,0,3`;

const FIELD_ALIASES = {
  user_id: ["user_id", "用户ID", "用户id", "客户ID", "客户id", "id"],
  age: ["age", "年龄"],
  gender: ["gender", "性别"],
  city_tier: ["city_tier", "城市等级", "城市级别"],
  visits_30d: ["visits_30d", "访问次数", "近30天访问次数", "访问数"],
  product_views: ["product_views", "浏览次数", "商品浏览次数", "浏览数"],
  add_to_cart: ["add_to_cart", "加购次数", "加入购物车次数", "加购数"],
  purchases: ["purchases", "下单次数", "购买次数", "订单数"],
  total_spend: ["total_spend", "消费金额", "总消费金额", "成交金额"],
  days_since_last_purchase: ["days_since_last_purchase", "最近购买间隔天", "距上次购买天数", "最近一次购买距今天数"],
  coupon_clicks: ["coupon_clicks", "优惠券点击", "优惠券点击次数"],
  support_tickets: ["support_tickets", "客服咨询次数", "售后次数", "投诉次数"]
};

const SEGMENT_META = {
  "高价值用户": { className: "high", colorClass: "green" },
  "潜力用户": { className: "potential", colorClass: "" },
  "流失风险用户": { className: "risk", colorClass: "red" },
  "低活跃用户": { className: "low", colorClass: "blue" },
  "稳定用户": { className: "stable", colorClass: "amber" }
};

const state = {
  rawRows: [],
  analyzedRows: [],
  metrics: null,
  reportText: ""
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  initIcons();
  setStatus("待导入数据");
});

function cacheElements() {
  Object.assign(els, {
    csvFile: document.getElementById("csvFile"),
    csvText: document.getElementById("csvText"),
    parseBtn: document.getElementById("parseBtn"),
    loadSampleBtn: document.getElementById("loadSampleBtn"),
    clearBtn: document.getElementById("clearBtn"),
    apiKey: document.getElementById("apiKey"),
    modelName: document.getElementById("modelName"),
    temperature: document.getElementById("temperature"),
    temperatureValue: document.getElementById("temperatureValue"),
    runStatus: document.getElementById("runStatus"),
    metricUsers: document.getElementById("metricUsers"),
    metricUsersSub: document.getElementById("metricUsersSub"),
    metricConversion: document.getElementById("metricConversion"),
    metricConversionSub: document.getElementById("metricConversionSub"),
    metricSpend: document.getElementById("metricSpend"),
    metricSpendSub: document.getElementById("metricSpendSub"),
    metricRisk: document.getElementById("metricRisk"),
    metricRiskSub: document.getElementById("metricRiskSub"),
    segmentChart: document.getElementById("segmentChart"),
    funnelChart: document.getElementById("funnelChart"),
    diagnosisList: document.getElementById("diagnosisList"),
    tableSearch: document.getElementById("tableSearch"),
    segmentTableBody: document.getElementById("segmentTableBody"),
    exportCsvBtn: document.getElementById("exportCsvBtn"),
    generateReportBtn: document.getElementById("generateReportBtn"),
    copyReportBtn: document.getElementById("copyReportBtn"),
    reportOutput: document.getElementById("reportOutput")
  });
}

function bindEvents() {
  els.loadSampleBtn.addEventListener("click", () => {
    els.csvText.value = SAMPLE_CSV;
    setStatus("样例数据已载入", "ready");
    toast("已载入 32 条样例消费者数据");
  });

  els.clearBtn.addEventListener("click", resetApp);
  els.parseBtn.addEventListener("click", parseCurrentInput);
  els.exportCsvBtn.addEventListener("click", exportSegmentsCsv);
  els.generateReportBtn.addEventListener("click", generateQwenReport);
  els.copyReportBtn.addEventListener("click", copyReport);

  els.csvFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    els.csvText.value = text;
    setStatus(`已读取文件：${file.name}`, "ready");
  });

  els.temperature.addEventListener("input", () => {
    els.temperatureValue.textContent = els.temperature.value;
  });

  els.tableSearch.addEventListener("input", () => {
    renderSegmentTable(state.analyzedRows);
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function resetApp() {
  state.rawRows = [];
  state.analyzedRows = [];
  state.metrics = null;
  state.reportText = "";
  els.csvText.value = "";
  els.csvFile.value = "";
  els.tableSearch.value = "";
  updateMetrics(null);
  els.segmentChart.innerHTML = "";
  els.funnelChart.innerHTML = "";
  els.diagnosisList.innerHTML = `<div class="empty-state">导入数据后显示诊断结论</div>`;
  els.segmentTableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">暂无数据</td></tr>`;
  els.reportOutput.innerHTML = `<div class="empty-state">完成数据分析并输入 API Key 后，可生成 Qwen 专业报告</div>`;
  setStatus("待导入数据");
}

function parseCurrentInput() {
  const text = els.csvText.value.trim();
  if (!text) {
    toast("请先上传或粘贴 CSV 数据");
    return;
  }

  try {
    const parsed = parseCsv(text);
    const normalized = normalizeRows(parsed);
    if (!normalized.length) {
      throw new Error("没有读取到有效数据行");
    }
    const result = analyzeRows(normalized);
    state.rawRows = normalized;
    state.analyzedRows = result.rows;
    state.metrics = result.metrics;
    state.reportText = "";
    renderAll();
    setStatus(`分析完成：${result.rows.length} 位用户`, "ready");
    switchTab("overview");
    toast("本地规则分析完成，可以生成 Qwen 报告");
  } catch (error) {
    setStatus("数据解析失败", "error");
    toast(error.message || "数据解析失败，请检查 CSV 格式");
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);

  if (rows.length < 2) {
    throw new Error("CSV 至少需要表头和一行数据");
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });
}

function normalizeRows(rows) {
  return rows.map((row, index) => ({
    user_id: readString(row, "user_id") || `USER_${index + 1}`,
    age: readNumber(row, "age"),
    gender: readString(row, "gender"),
    city_tier: readString(row, "city_tier"),
    visits_30d: readNumber(row, "visits_30d"),
    product_views: readNumber(row, "product_views"),
    add_to_cart: readNumber(row, "add_to_cart"),
    purchases: readNumber(row, "purchases"),
    total_spend: readNumber(row, "total_spend"),
    days_since_last_purchase: readNumber(row, "days_since_last_purchase", 999),
    coupon_clicks: readNumber(row, "coupon_clicks"),
    support_tickets: readNumber(row, "support_tickets")
  }));
}

function readString(row, key) {
  const alias = FIELD_ALIASES[key] || [key];
  const found = alias.find((name) => row[name] !== undefined && row[name] !== "");
  return found ? String(row[found]).trim() : "";
}

function readNumber(row, key, fallback = 0) {
  const raw = readString(row, key);
  if (raw === "") return fallback;
  const cleaned = raw.replace(/[¥,\s]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : fallback;
}

function analyzeRows(rows) {
  const ranges = {
    spend: getRange(rows.map((row) => row.total_spend)),
    purchases: getRange(rows.map((row) => row.purchases)),
    engagement: getRange(rows.map((row) => row.visits_30d + row.product_views + row.add_to_cart * 3)),
    recency: getRange(rows.map((row) => row.days_since_last_purchase))
  };

  const analyzedRows = rows.map((row) => {
    const engagement = row.visits_30d + row.product_views + row.add_to_cart * 3;
    const conversion = row.product_views > 0 ? row.purchases / row.product_views : 0;
    const spendScore = normalize(row.total_spend, ranges.spend) * 34;
    const purchaseScore = normalize(row.purchases, ranges.purchases) * 22;
    const engagementScore = normalize(engagement, ranges.engagement) * 16;
    const recencyScore = (1 - normalize(row.days_since_last_purchase, ranges.recency)) * 18;
    const conversionScore = clamp(conversion * 260, 0, 10);
    const valueScore = Math.round(clamp(spendScore + purchaseScore + engagementScore + recencyScore + conversionScore, 0, 100));

    const noPurchasePenalty = row.purchases === 0 ? 20 : 0;
    const inactivePenalty = row.visits_30d <= 3 ? 14 : 0;
    const abandonedCartPenalty = row.add_to_cart >= 2 && row.purchases <= 1 ? 16 : 0;
    const recentSpendRelief = row.total_spend > ranges.spend.max * 0.55 ? 10 : 0;
    const servicePenalty = Math.min(row.support_tickets * 5, 15);
    const riskScore = Math.round(clamp(
      normalize(row.days_since_last_purchase, { min: 0, max: Math.max(90, ranges.recency.max) }) * 45 +
        noPurchasePenalty +
        inactivePenalty +
        abandonedCartPenalty +
        servicePenalty -
        recentSpendRelief,
      0,
      100
    ));

    const segment = decideSegment(row, valueScore, riskScore);
    return {
      ...row,
      valueScore,
      riskScore,
      segment,
      nextAction: recommendAction(segment, row)
    };
  });

  const metrics = buildMetrics(analyzedRows);
  return { rows: analyzedRows, metrics };
}

function getRange(values) {
  const safe = values.filter((value) => Number.isFinite(value));
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 1 };
}

function normalize(value, range) {
  if (range.max === range.min) return range.max === 0 ? 0 : 1;
  return clamp((value - range.min) / (range.max - range.min), 0, 1);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function decideSegment(row, valueScore, riskScore) {
  if (valueScore >= 70 && row.purchases >= 3) return "高价值用户";
  if (riskScore >= 65) return "流失风险用户";
  if (row.add_to_cart >= 4 && row.purchases <= 1 && row.visits_30d >= 6) return "潜力用户";
  if (row.visits_30d <= 3 && row.product_views <= 15) return "低活跃用户";
  return "稳定用户";
}

function recommendAction(segment, row) {
  const actions = {
    "高价值用户": "提供会员权益、专属新品和复购激励",
    "潜力用户": "推送限时优惠，减少加购到下单阻力",
    "流失风险用户": "触达召回券，结合最近浏览品类做个性化提醒",
    "低活跃用户": "降低触达频次，用爆款内容重新激活",
    "稳定用户": "保持常规推荐，观察下一周期消费变化"
  };
  if (row.support_tickets >= 2) return "优先处理服务体验，再进行营销触达";
  return actions[segment];
}

function buildMetrics(rows) {
  const total = rows.length;
  const buyers = rows.filter((row) => row.purchases > 0);
  const repeatBuyers = rows.filter((row) => row.purchases >= 2);
  const totals = rows.reduce((acc, row) => {
    acc.visits += row.visits_30d;
    acc.views += row.product_views;
    acc.carts += row.add_to_cart;
    acc.purchases += row.purchases;
    acc.spend += row.total_spend;
    acc.recency += row.days_since_last_purchase;
    return acc;
  }, { visits: 0, views: 0, carts: 0, purchases: 0, spend: 0, recency: 0 });

  const segmentCounts = rows.reduce((acc, row) => {
    acc[row.segment] = (acc[row.segment] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    buyers: buyers.length,
    repeatBuyers: repeatBuyers.length,
    highValue: segmentCounts["高价值用户"] || 0,
    risk: segmentCounts["流失风险用户"] || 0,
    avgSpend: total ? totals.spend / total : 0,
    conversionRate: total ? buyers.length / total : 0,
    repurchaseRate: buyers.length ? repeatBuyers.length / buyers.length : 0,
    avgRecency: total ? totals.recency / total : 0,
    totals,
    segmentCounts
  };
}

function renderAll() {
  updateMetrics(state.metrics);
  renderSegmentChart(state.metrics.segmentCounts);
  renderFunnel(state.metrics.totals);
  renderDiagnosis();
  renderSegmentTable(state.analyzedRows);
  renderLocalReportPlaceholder();
  initIcons();
}

function updateMetrics(metrics) {
  if (!metrics) {
    els.metricUsers.textContent = "0";
    els.metricUsersSub.textContent = "等待数据";
    els.metricConversion.textContent = "0%";
    els.metricConversionSub.textContent = "有购买用户占比";
    els.metricSpend.textContent = "¥0";
    els.metricSpendSub.textContent = "按用户计算";
    els.metricRisk.textContent = "0";
    els.metricRiskSub.textContent = "需优先干预";
    return;
  }

  els.metricUsers.textContent = String(metrics.total);
  els.metricUsersSub.textContent = `${metrics.buyers} 位用户已购买`;
  els.metricConversion.textContent = formatPercent(metrics.conversionRate);
  els.metricConversionSub.textContent = `复购率 ${formatPercent(metrics.repurchaseRate)}`;
  els.metricSpend.textContent = formatMoney(metrics.avgSpend);
  els.metricSpendSub.textContent = `总消费 ${formatMoney(metrics.totals.spend)}`;
  els.metricRisk.textContent = String(metrics.risk);
  els.metricRiskSub.textContent = `占比 ${formatPercent(metrics.risk / metrics.total)}`;
}

function renderSegmentChart(segmentCounts) {
  const order = ["高价值用户", "潜力用户", "流失风险用户", "低活跃用户", "稳定用户"];
  const max = Math.max(...Object.values(segmentCounts), 1);
  els.segmentChart.innerHTML = order.map((name) => {
    const count = segmentCounts[name] || 0;
    const pct = Math.round((count / max) * 100);
    const colorClass = SEGMENT_META[name].colorClass;
    return `
      <div class="bar-row">
        <div class="bar-label">${name}</div>
        <div class="bar-track"><div class="bar-fill ${colorClass}" style="width:${pct}%"></div></div>
        <div class="bar-value">${count} 人</div>
      </div>
    `;
  }).join("");
}

function renderFunnel(totals) {
  const steps = [
    ["访问", totals.visits],
    ["商品浏览", totals.views],
    ["加入购物车", totals.carts],
    ["购买", totals.purchases]
  ];
  const max = Math.max(...steps.map((step) => step[1]), 1);
  els.funnelChart.innerHTML = steps.map(([label, value]) => {
    const pct = Math.round((value / max) * 100);
    return `
      <div class="funnel-step">
        <div class="funnel-label">${label}</div>
        <div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(pct, 8)}%">${pct}%</div></div>
        <div class="bar-value">${formatNumber(value)}</div>
      </div>
    `;
  }).join("");
}

function renderDiagnosis() {
  const { metrics } = state;
  if (!metrics) return;

  const items = [];
  if (metrics.conversionRate < 0.45) {
    items.push(["danger", "购买转化偏低", `当前购买转化率为 ${formatPercent(metrics.conversionRate)}，需要重点优化加购到下单环节。`]);
  } else {
    items.push(["good", "购买转化表现良好", `当前购买转化率为 ${formatPercent(metrics.conversionRate)}，可以继续放大高转化人群投放。`]);
  }

  if (metrics.repurchaseRate < 0.55) {
    items.push(["warning", "复购仍有提升空间", `复购率为 ${formatPercent(metrics.repurchaseRate)}，建议对首购用户设计二次购买激励。`]);
  } else {
    items.push(["good", "复购基础较稳定", `复购率达到 ${formatPercent(metrics.repurchaseRate)}，高价值用户维护值得优先投入。`]);
  }

  if (metrics.risk > metrics.total * 0.2) {
    items.push(["danger", "流失风险用户占比较高", `${metrics.risk} 位用户被识别为流失风险，需要召回券、客服补救或个性化提醒。`]);
  } else {
    items.push(["good", "整体流失风险可控", `流失风险用户 ${metrics.risk} 位，建议持续监控最近购买间隔和服务反馈。`]);
  }

  if (metrics.segmentCounts["潜力用户"]) {
    items.push(["warning", "潜力用户值得转化", `${metrics.segmentCounts["潜力用户"]} 位用户有明显浏览或加购行为，但购买次数偏低。`]);
  }

  els.diagnosisList.innerHTML = items.map(([type, title, body]) => `
    <div class="diagnosis-item">
      <div class="diagnosis-icon ${type}"><i data-lucide="${type === "danger" ? "alert-triangle" : type === "warning" ? "circle-alert" : "check"}"></i></div>
      <div>
        <strong>${title}</strong>
        <p>${body}</p>
      </div>
    </div>
  `).join("");
}

function renderSegmentTable(rows) {
  const keyword = els.tableSearch.value.trim().toLowerCase();
  const visibleRows = rows.filter((row) => {
    if (!keyword) return true;
    return `${row.user_id} ${row.segment} ${row.nextAction}`.toLowerCase().includes(keyword);
  });

  if (!visibleRows.length) {
    els.segmentTableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">没有匹配的用户</td></tr>`;
    return;
  }

  els.segmentTableBody.innerHTML = visibleRows
    .slice()
    .sort((a, b) => b.valueScore - a.valueScore || b.riskScore - a.riskScore)
    .map((row) => {
      const meta = SEGMENT_META[row.segment] || SEGMENT_META["稳定用户"];
      return `
        <tr>
          <td>${escapeHtml(row.user_id)}</td>
          <td><span class="badge ${meta.className}">${row.segment}</span></td>
          <td>${row.valueScore}</td>
          <td>${row.riskScore}</td>
          <td>${row.purchases}</td>
          <td>${formatMoney(row.total_spend)}</td>
          <td>${row.days_since_last_purchase} 天</td>
          <td>${escapeHtml(row.nextAction)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderLocalReportPlaceholder() {
  els.reportOutput.innerHTML = `
    <div class="report-section">
      <h3>本地分析已完成</h3>
      <p>当前数据包含 ${state.metrics.total} 位用户，购买转化率 ${formatPercent(state.metrics.conversionRate)}，流失风险用户 ${state.metrics.risk} 位。输入阿里云百炼 API Key 后，可调用 Qwen 生成完整经营分析报告。</p>
    </div>
  `;
}

async function generateQwenReport() {
  if (!state.metrics || !state.analyzedRows.length) {
    toast("请先完成数据分析");
    return;
  }

  const apiKey = els.apiKey.value.trim();
  if (!apiKey) {
    toast("请先输入阿里云百炼 API Key");
    switchTab("report");
    return;
  }

  const model = els.modelName.value.trim() || "qwen-plus";
  const temperature = Number(els.temperature.value);
  const payload = buildPromptPayload();

  setStatus("正在调用 Qwen 生成报告", "busy");
  els.generateReportBtn.disabled = true;
  els.reportOutput.innerHTML = `<div class="empty-state">Qwen 正在分析数据，请稍候</div>`;
  switchTab("report");

  try {
    const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是消费者行为分析与增长策略智能体。请基于输入的结构化指标进行专业、审慎、可执行的经营分析。只输出 JSON，不要输出 Markdown。"
          },
          {
            role: "user",
            content: JSON.stringify(payload)
          }
        ],
        temperature,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || data?.error?.message || `接口请求失败：${response.status}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("模型没有返回有效内容");
    }

    state.reportText = content;
    renderQwenReport(content);
    setStatus("Qwen 报告已生成", "ready");
    toast("智能报告生成完成");
  } catch (error) {
    setStatus("Qwen 调用失败", "error");
    els.reportOutput.innerHTML = `<pre>${escapeHtml(error.message || "调用失败，请检查 API Key、模型名称或网络状态")}</pre>`;
  } finally {
    els.generateReportBtn.disabled = false;
  }
}

function buildPromptPayload() {
  const topRiskUsers = state.analyzedRows
    .slice()
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8)
    .map(pickUserForPrompt);

  const topValueUsers = state.analyzedRows
    .slice()
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 8)
    .map(pickUserForPrompt);

  return {
    task: "生成消费者行为分析与预测智能体报告",
    output_schema: {
      overview: "总体经营判断，100字以内",
      key_findings: ["3到5条关键发现"],
      segment_strategy: [
        { segment: "分群名称", insight: "洞察", action: "建议动作" }
      ],
      risk_users: ["流失风险治理建议"],
      growth_actions: ["可执行增长动作"],
      data_limitations: ["数据局限和后续补充建议"]
    },
    metrics: {
      total_users: state.metrics.total,
      buyers: state.metrics.buyers,
      conversion_rate: round(state.metrics.conversionRate),
      repurchase_rate: round(state.metrics.repurchaseRate),
      average_spend: round(state.metrics.avgSpend),
      average_recency_days: round(state.metrics.avgRecency),
      high_value_users: state.metrics.highValue,
      churn_risk_users: state.metrics.risk,
      segment_counts: state.metrics.segmentCounts,
      totals: state.metrics.totals
    },
    top_risk_users: topRiskUsers,
    top_value_users: topValueUsers,
    rules: {
      value_score: "由消费金额、购买次数、浏览加购活跃度、最近购买时间、浏览到购买效率综合得到，范围0到100",
      risk_score: "由最近购买间隔、低活跃、无购买、加购未购买、客服问题综合得到，范围0到100"
    }
  };
}

function pickUserForPrompt(row) {
  return {
    user_id: row.user_id,
    segment: row.segment,
    value_score: row.valueScore,
    risk_score: row.riskScore,
    visits_30d: row.visits_30d,
    purchases: row.purchases,
    total_spend: row.total_spend,
    days_since_last_purchase: row.days_since_last_purchase,
    next_action: row.nextAction
  };
}

function renderQwenReport(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    els.reportOutput.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
    return;
  }

  const sections = [];
  if (parsed.overview) {
    sections.push(reportSection("总体判断", `<p>${escapeHtml(parsed.overview)}</p>`));
  }
  if (Array.isArray(parsed.key_findings)) {
    sections.push(reportSection("关键发现", renderList(parsed.key_findings)));
  }
  if (Array.isArray(parsed.segment_strategy)) {
    sections.push(reportSection("分群策略", renderSegmentStrategy(parsed.segment_strategy)));
  }
  if (Array.isArray(parsed.risk_users)) {
    sections.push(reportSection("风险治理", renderList(parsed.risk_users)));
  }
  if (Array.isArray(parsed.growth_actions)) {
    sections.push(reportSection("增长动作", renderList(parsed.growth_actions)));
  }
  if (Array.isArray(parsed.data_limitations)) {
    sections.push(reportSection("数据局限", renderList(parsed.data_limitations)));
  }

  els.reportOutput.innerHTML = sections.length ? sections.join("") : `<pre>${escapeHtml(JSON.stringify(parsed, null, 2))}</pre>`;
}

function reportSection(title, body) {
  return `<div class="report-section"><h3>${title}</h3>${body}</div>`;
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`;
}

function renderSegmentStrategy(items) {
  return `<ul>${items.map((item) => {
    const segment = escapeHtml(item.segment || "分群");
    const insight = escapeHtml(item.insight || "");
    const action = escapeHtml(item.action || "");
    return `<li><strong>${segment}</strong>：${insight} ${action}</li>`;
  }).join("")}</ul>`;
}

async function copyReport() {
  const text = state.reportText || els.reportOutput.innerText.trim();
  if (!text) {
    toast("没有可复制的报告内容");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast("报告已复制");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    toast("报告已复制");
  }
}

function exportSegmentsCsv() {
  if (!state.analyzedRows.length) {
    toast("没有可导出的分群数据");
    return;
  }

  const headers = ["user_id", "segment", "value_score", "risk_score", "purchases", "total_spend", "days_since_last_purchase", "next_action"];
  const lines = [headers.join(",")].concat(state.analyzedRows.map((row) => [
    row.user_id,
    row.segment,
    row.valueScore,
    row.riskScore,
    row.purchases,
    row.total_spend,
    row.days_since_last_purchase,
    row.nextAction
  ].map(csvCell).join(",")));

  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "consumer_segments.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === name);
  });
  document.querySelectorAll(".tab-view").forEach((view) => {
    view.classList.remove("active");
  });
  document.getElementById(`${name}View`).classList.add("active");
}

function setStatus(text, type = "") {
  els.runStatus.className = `status-pill ${type}`.trim();
  els.runStatus.innerHTML = `<span class="status-dot"></span>${escapeHtml(text)}`;
}

function toast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function formatMoney(value) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("zh-CN");
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
