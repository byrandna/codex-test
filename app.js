const defaults = {
  tier: 1,
  projectBrief:
    "我有一个运营多年的购物中心，想判断是否值得改造，并估算改造后的收益、成本和回收期。",
  projectName: "老厂房改造购物中心",
  location: "核心商圈外延 1.5km",
  area: 52000,
  rentableRatio: 72,
  footfall: 36000,
  occupancy: 88,
  cityTier: "newFirst",
  populationFlow: "stable",
  consumerProfile: "family",
  positioning: "family",
  districtMaturity: "mature",
  futureArea: "normal",
  industrySupport: "normal",
  competitors: 3,
  metroAccess: "near",
  roadExposure: "main",
  visibility: "medium",
  brandAnchor: "none",
  retailMix: 32,
  fnbMix: 28,
  experienceMix: 18,
  childrenMix: 12,
  anchorMix: 10,
  floorCount: 5,
  avgFloorArea: 9000,
  schemeRentableRatio: 68,
  commonArea: 8200,
  parkingSpaces: 780,
  parkingRenovationArea: 16000,
  lightRenovationArea: 26000,
  heavyRenovationArea: 18000,
  facadeArea: 5200,
  mepLevel: "medium",
  rentAdjustment: 0,
  opexRatio: 28,
  acquisitionCost: 98000,
  capex: 4200,
  otherIncome: 1800,
};

let activeTier = defaults.tier;

const cityRentBaseline = {
  beishang: { label: "北京/上海", rent: 9.8, score: 95 },
  newFirst: { label: "强二线/新一线", rent: 7.2, score: 84 },
  second: { label: "普通二线", rent: 5.1, score: 70 },
  third: { label: "三线城市", rent: 3.1, score: 55 },
};

const factorMaps = {
  populationFlow: {
    strongIn: { label: "人口持续净流入", value: 1.12, score: 8 },
    stable: { label: "人口基本稳定", value: 1.02, score: 3 },
    slightOut: { label: "人口轻微流出", value: 0.94, score: -5 },
    outflow: { label: "人口明显流出", value: 0.86, score: -12 },
  },
  consumerProfile: {
    young: { label: "年轻客群占优", value: 1.06, score: 6 },
    family: { label: "家庭客群占优", value: 1.03, score: 4 },
    balanced: { label: "客群结构均衡", value: 1, score: 2 },
    senior: { label: "老龄化明显", value: 0.9, score: -9 },
  },
  districtMaturity: {
    core: { label: "成熟核心区", value: 1.16, score: 12 },
    mature: { label: "成熟居住/办公区", value: 1.06, score: 6 },
    growth: { label: "成长新区", value: 0.96, score: -2 },
    early: { label: "导入期新区", value: 0.84, score: -12 },
  },
  futureArea: {
    policy: { label: "未来导入强", value: 1.08, score: 6 },
    normal: { label: "正常发展", value: 1, score: 1 },
    weak: { label: "发展动能偏弱", value: 0.92, score: -7 },
  },
  industrySupport: {
    strong: { label: "产业/办公成熟", value: 1.08, score: 6 },
    normal: { label: "居住办公均衡", value: 1, score: 2 },
    weak: { label: "配套仍需培育", value: 0.91, score: -8 },
  },
  metroAccess: {
    direct: { label: "地铁直连/上盖", value: 1.13, score: 10 },
    near: { label: "800米内有站点", value: 1.05, score: 5 },
    bus: { label: "公交为主", value: 0.96, score: -3 },
    weak: { label: "公共交通弱", value: 0.87, score: -11 },
  },
  roadExposure: {
    corner: { label: "主干道交叉口", value: 1.1, score: 8 },
    main: { label: "临主干道", value: 1.04, score: 4 },
    secondary: { label: "次干道", value: 0.96, score: -3 },
    inside: { label: "街区内部", value: 0.88, score: -10 },
  },
  visibility: {
    high: { label: "强展示面", value: 1.08, score: 7 },
    medium: { label: "一般展示面", value: 1, score: 1 },
    low: { label: "可见性较弱", value: 0.88, score: -10 },
  },
  brandAnchor: {
    none: { label: "暂无强锚点", value: 1, score: 0 },
    popmart: { label: "潮玩品牌锚点", value: 1.08, score: 7 },
    fnb: { label: "全国连锁餐饮锚点", value: 1.05, score: 5 },
    supermarket: { label: "精品超市锚点", value: 1.02, score: 3 },
    cinema: { label: "影院/大主力店锚点", value: 0.94, score: -4 },
  },
};

const positioningFit = {
  young: { young: 1.09, family: 0.97, balanced: 1.02, senior: 0.88 },
  family: { young: 0.99, family: 1.08, balanced: 1.04, senior: 1.01 },
  community: { young: 0.96, family: 1.04, balanced: 1.03, senior: 1.02 },
  traditional: { young: 0.92, family: 0.99, balanced: 1, senior: 0.98 },
};

const positioningLabels = {
  young: "年轻潮流定位",
  family: "家庭亲子定位",
  community: "社区生活定位",
  traditional: "传统综合定位",
};

const cityScorePremium = {
  beishang: 16,
  newFirst: 9,
  second: 0,
  third: -12,
};

const fields = Object.keys(defaults);
const form = document.querySelector("#calculatorForm");
const resetButton = document.querySelector("#resetButton");
const tierButtons = [...document.querySelectorAll(".tier-button")];
const tierSections = [...document.querySelectorAll(".tier-section")];

const numberFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function getNumber(id) {
  const value = Number(document.querySelector(`#${id}`).value);
  return Number.isFinite(value) ? value : 0;
}

function getValue(id) {
  return document.querySelector(`#${id}`).value;
}

function getInputs() {
  return {
    tier: activeTier,
    projectBrief: getValue("projectBrief").trim() || defaults.projectBrief,
    projectName: getValue("projectName").trim() || defaults.projectName,
    location: getValue("location").trim() || defaults.location,
    area: getNumber("area"),
    rentableRatio: getNumber("rentableRatio") / 100,
    footfall: getNumber("footfall"),
    occupancy: getNumber("occupancy") / 100,
    cityTier: getValue("cityTier"),
    populationFlow: getValue("populationFlow"),
    consumerProfile: getValue("consumerProfile"),
    positioning: getValue("positioning"),
    districtMaturity: getValue("districtMaturity"),
    futureArea: getValue("futureArea"),
    industrySupport: getValue("industrySupport"),
    competitors: getNumber("competitors"),
    metroAccess: getValue("metroAccess"),
    roadExposure: getValue("roadExposure"),
    visibility: getValue("visibility"),
    brandAnchor: getValue("brandAnchor"),
    retailMix: getNumber("retailMix"),
    fnbMix: getNumber("fnbMix"),
    experienceMix: getNumber("experienceMix"),
    childrenMix: getNumber("childrenMix"),
    anchorMix: getNumber("anchorMix"),
    floorCount: getNumber("floorCount"),
    avgFloorArea: getNumber("avgFloorArea"),
    schemeRentableRatio: getNumber("schemeRentableRatio") / 100,
    commonArea: getNumber("commonArea"),
    parkingSpaces: getNumber("parkingSpaces"),
    parkingRenovationArea: getNumber("parkingRenovationArea"),
    lightRenovationArea: getNumber("lightRenovationArea"),
    heavyRenovationArea: getNumber("heavyRenovationArea"),
    facadeArea: getNumber("facadeArea"),
    mepLevel: getValue("mepLevel"),
    rentAdjustment: getNumber("rentAdjustment") / 100,
    opexRatio: getNumber("opexRatio") / 100,
    acquisitionCost: getNumber("acquisitionCost"),
    capex: getNumber("capex"),
    otherIncome: getNumber("otherIncome"),
  };
}

function getCompetitorFactor(count) {
  if (count <= 1) return { label: "5公里竞品较少", value: 1.08, score: 7 };
  if (count <= 3) return { label: "5公里竞品适中", value: 1, score: 1 };
  if (count <= 5) return { label: "5公里竞品偏多", value: 0.92, score: -7 };
  return { label: "5公里竞争激烈", value: 0.84, score: -13 };
}

function getTrafficFactor(footfall) {
  const value = Math.min(1.28, Math.max(0.72, 0.78 + footfall / 85000));
  const score = Math.round((value - 1) * 45);
  return { label: "实际客流强度", value, score };
}

function getMixFactor(inputs) {
  const mix = {
    retail: inputs.retailMix,
    fnb: inputs.fnbMix,
    experience: inputs.experienceMix,
    children: inputs.childrenMix,
    anchor: inputs.anchorMix,
  };
  const total = Object.values(mix).reduce((sum, value) => sum + Math.max(value, 0), 0) || 100;
  const weighted =
    (mix.retail * 1.05 +
      mix.fnb * 1.12 +
      mix.experience * 0.96 +
      mix.children * 0.84 +
      mix.anchor * 0.68) /
    total;
  const score = Math.round((weighted - 0.96) * 80);

  return {
    label: "业态配比租金力",
    value: Math.min(1.16, Math.max(0.78, weighted)),
    score,
  };
}

function predictRent(inputs) {
  const city = cityRentBaseline[inputs.cityTier];
  const mapFactors =
    inputs.tier >= 2
      ? [
          factorMaps.populationFlow[inputs.populationFlow],
          factorMaps.consumerProfile[inputs.consumerProfile],
          factorMaps.districtMaturity[inputs.districtMaturity],
          factorMaps.futureArea[inputs.futureArea],
          factorMaps.industrySupport[inputs.industrySupport],
          factorMaps.metroAccess[inputs.metroAccess],
          factorMaps.roadExposure[inputs.roadExposure],
          factorMaps.visibility[inputs.visibility],
          factorMaps.brandAnchor[inputs.brandAnchor],
        ]
      : [];
  const competitorFactor = getCompetitorFactor(inputs.competitors);
  const trafficFactor = getTrafficFactor(inputs.footfall);
  const mixFactor = getMixFactor(inputs);
  const positioningValue = positioningFit[inputs.positioning][inputs.consumerProfile];
  const positioningFactor = {
    label: `${positioningLabels[inputs.positioning]}匹配度`,
    value: positioningValue,
    score: Math.round((positioningValue - 1) * 90),
  };
  const adjustmentFactor = {
    label: "人工修正",
    value: 1 + inputs.rentAdjustment,
    score: Math.round(inputs.rentAdjustment * 60),
  };

  const factors =
    inputs.tier >= 2
      ? [
          ...mapFactors,
          competitorFactor,
          trafficFactor,
          positioningFactor,
          mixFactor,
          adjustmentFactor,
        ]
      : [trafficFactor, positioningFactor, adjustmentFactor];

  const combinedFactor = factors.reduce((product, factor) => product * factor.value, 1);
  const predictedRent = city.rent * combinedFactor;
  const factorScore = factors.reduce((sum, factor) => sum + factor.score, 0);
  const score = Math.max(
    0,
    Math.min(100, Math.round(50 + cityScorePremium[inputs.cityTier] + factorScore * 0.55))
  );

  return {
    city,
    predictedRent,
    marketBaseRent: city.rent,
    combinedFactor,
    trafficFactor: trafficFactor.value,
    mixFactor: mixFactor.value,
    score,
    factors,
  };
}

function estimateSchemeCost(inputs) {
  const schemeCommercialArea = inputs.floorCount * inputs.avgFloorArea;
  const schemeTotalArea = schemeCommercialArea + inputs.parkingRenovationArea;
  const schemeRentableArea = schemeCommercialArea * inputs.schemeRentableRatio;
  const lightRenovationCost = (inputs.lightRenovationArea * inputs.capex * 0.65) / 10000;
  const heavyRenovationCost = (inputs.heavyRenovationArea * inputs.capex * 1.35) / 10000;
  const parkingCost = (inputs.parkingRenovationArea * 1600) / 10000;
  const facadeCost = (inputs.facadeArea * 2200) / 10000;
  const mepRate = { light: 450, medium: 900, heavy: 1450 }[inputs.mepLevel];
  const mepCost = (schemeCommercialArea * mepRate) / 10000;
  const renovationCost =
    lightRenovationCost + heavyRenovationCost + parkingCost + facadeCost + mepCost;

  return {
    schemeCommercialArea,
    schemeTotalArea,
    schemeRentableArea,
    lightRenovationCost,
    heavyRenovationCost,
    parkingFacadeCost: parkingCost + facadeCost,
    mepCost,
    renovationCost,
  };
}

function calculate(inputs) {
  const rentPrediction = predictRent(inputs);
  const schemeCost = estimateSchemeCost(inputs);
  const rentableArea =
    inputs.tier >= 3 ? schemeCost.schemeRentableArea : inputs.area * inputs.rentableRatio;
  const effectiveRent = rentPrediction.predictedRent;
  const annualRent = (effectiveRent * rentableArea * inputs.occupancy * 365) / 10000;
  const grossIncome = annualRent + inputs.otherIncome;
  const noi = grossIncome * (1 - inputs.opexRatio);
  const renovationCost =
    inputs.tier >= 3 ? schemeCost.renovationCost : (inputs.capex * inputs.area) / 10000;
  const totalInvestment = inputs.acquisitionCost + renovationCost;
  const roi = totalInvestment > 0 ? noi / totalInvestment : 0;
  const payback = noi > 0 ? totalInvestment / noi : 0;

  return {
    rentableArea,
    trafficFactor: rentPrediction.trafficFactor,
    mixFactor: rentPrediction.mixFactor,
    effectiveRent,
    annualRent,
    grossIncome,
    noi,
    renovationCost,
    totalInvestment,
    roi,
    payback,
    rentPrediction,
    schemeCost,
  };
}

function formatWan(value) {
  return `${numberFormatter.format(value)} 万`;
}

function formatPercent(value) {
  return `${decimalFormatter.format(value * 100)}%`;
}

function setText(id, text) {
  document.querySelector(`#${id}`).textContent = text;
}

function renderRating(roi) {
  const rating = document.querySelector("#rating");
  rating.classList.remove("warning", "risk");

  if (roi >= 0.075) {
    rating.textContent = "优良";
    return;
  }

  if (roi >= 0.052) {
    rating.textContent = "稳健";
    rating.classList.add("warning");
    return;
  }

  rating.textContent = "需优化";
  rating.classList.add("risk");
}

function getDecision(inputs, result) {
  const reasons = [];
  const risks = [];

  if (result.roi >= 0.075) {
    reasons.push(`资本回报率达到 ${formatPercent(result.roi)}，初步具备推进价值`);
  } else if (result.roi >= 0.052) {
    reasons.push(`资本回报率为 ${formatPercent(result.roi)}，需要继续校准租金和成本`);
  } else {
    risks.push(`资本回报率仅 ${formatPercent(result.roi)}，可能支撑不了改造投入`);
  }

  if (result.payback <= 10) {
    reasons.push(`投资回收期约 ${decimalFormatter.format(result.payback)} 年，资金效率较好`);
  } else if (result.payback <= 14) {
    reasons.push(`回收期约 ${decimalFormatter.format(result.payback)} 年，适合进入下一轮验证`);
  } else {
    risks.push(`回收期约 ${decimalFormatter.format(result.payback)} 年，退出压力偏大`);
  }

  if (result.rentPrediction.score >= 78) {
    reasons.push(`租金条件评分 ${result.rentPrediction.score}，收入端有一定支撑`);
  } else if (result.rentPrediction.score < 58) {
    risks.push(`租金条件评分 ${result.rentPrediction.score}，需要重点复核市场租金`);
  }

  if (inputs.occupancy >= 0.85) {
    reasons.push(`出租率假设 ${decimalFormatter.format(inputs.occupancy * 100)}%，资产盘活空间可测算`);
  } else if (inputs.occupancy < 0.65) {
    risks.push(`出租率假设仅 ${decimalFormatter.format(inputs.occupancy * 100)}%，招商风险较高`);
  }

  if (inputs.tier >= 2 && inputs.competitors >= 6) {
    risks.push("5公里同类竞品较多，需要进一步验证差异化定位");
  }

  if (inputs.tier >= 3) {
    const costIntensity = (result.renovationCost * 10000) / Math.max(result.schemeCost.schemeTotalArea, 1);
    if (costIntensity > 4500) {
      risks.push(`方案改造强度约 ${numberFormatter.format(costIntensity)} 元/㎡，成本压力偏高`);
    } else {
      reasons.push(`方案改造强度约 ${numberFormatter.format(costIntensity)} 元/㎡，可进入设计复核`);
    }
  }

  if (reasons.length === 0) {
    reasons.push("当前信息仍不足，建议先补充租金、竞品和成本假设");
  }

  if (risks.length === 0) {
    risks.push("现阶段主要风险是租金和改造成本仍需专业复核");
  }

  if (result.roi >= 0.075 && result.payback <= 13) {
    return {
      status: "go",
      title: "建议继续推进",
      summary: "收入和回收期初步成立，可以进入下一步专业验证。",
      nextAction:
        inputs.tier === 1 ? "进入 AI 收入测算" : inputs.tier === 2 ? "进入方案成本测算" : "预约改造方案咨询",
      nextTier: Math.min(inputs.tier + 1, 3),
      reasons,
      risks,
    };
  }

  if (result.roi >= 0.052 && result.payback <= 16) {
    return {
      status: "watch",
      title: "谨慎推进",
      summary: "项目有机会，但需要先校准关键假设，避免收入高估或成本低估。",
      nextAction:
        inputs.tier === 1 ? "补充市场与竞品" : inputs.tier === 2 ? "请设计师验证方案成本" : "复核成本并寻找运营方",
      nextTier: Math.min(inputs.tier + 1, 3),
      reasons,
      risks,
    };
  }

  return {
    status: "stop",
    title: "暂不建议推进",
    summary: "当前测算下投资回报不足，建议先调整定位、成本或收购价格。",
    nextAction: "调整假设后重算",
    nextTier: inputs.tier,
    reasons,
    risks,
  };
}

function renderDecision(inputs, result) {
  const decision = getDecision(inputs, result);
  const card = document.querySelector("#decisionCard");
  card.classList.remove("go", "watch", "stop");
  card.classList.add(decision.status);

  setText("decisionTitle", decision.title);
  setText("decisionSummary", decision.summary);
  setText("nextAction", decision.nextAction);
  const actionButton = document.querySelector("#actionButton");
  actionButton.textContent = decision.nextAction;
  actionButton.dataset.nextTier = decision.nextTier;
  document.querySelector("#reasonList").innerHTML = decision.reasons
    .slice(0, 4)
    .map((reason) => `<div><span></span><p>${reason}</p></div>`)
    .join("");
  document.querySelector("#riskList").innerHTML = decision.risks
    .slice(0, 4)
    .map((risk) => `<div><span></span><p>${risk}</p></div>`)
    .join("");
}

function getAgentReport(inputs, result) {
  const decision = getDecision(inputs, result);
  const competitorPhrase =
    inputs.tier >= 2 && inputs.competitors >= 6
      ? "周边竞品压力偏高，需要靠定位和品牌组合拉开差异"
      : "周边竞争仍在可测算范围内，可以继续用品牌和业态校准租金";
  const rentPhrase =
    result.rentPrediction.score >= 78
      ? `租金条件评分 ${result.rentPrediction.score}，有效租金 ${decimalFormatter.format(result.effectiveRent)} 元/㎡/日具备初步支撑`
      : `租金条件评分 ${result.rentPrediction.score}，有效租金需要继续用真实竞品和品牌租金校准`;
  const financePhrase =
    result.roi >= 0.075
      ? `ROI ${formatPercent(result.roi)}，项目有推进价值，但仍需复核资金退出路径`
      : `ROI ${formatPercent(result.roi)}，当前更适合谨慎推进，重点压实成本和租金假设`;
  const designPhrase =
    inputs.tier >= 3
      ? `方案口径可租面积 ${numberFormatter.format(result.schemeCost.schemeRentableArea)} ㎡，应优先优化公区效率、主入口展示和机电改造范围`
      : "现阶段还缺少楼层、动线、停车和改造范围，建议进入方案成本测算";
  const operationPhrase =
    inputs.positioning === "family"
      ? "家庭亲子定位与当前客群较匹配，运营上应验证儿童、餐饮、社区服务和体验业态的承租能力"
      : "需要进一步验证目标客群和城市人口结构是否匹配，避免定位好看但租金落不下来";

  return {
    market: `${rentPhrase}；${competitorPhrase}。市场 Agent 建议下一步抓取 3-5 公里竞品、近期租金和主力品牌样本。`,
    finance: `${financePhrase}；回收期约 ${decimalFormatter.format(result.payback)} 年。财务 Agent 建议把收购价、改造成本和出租率作为三条敏感性主线。`,
    design: `${designPhrase}。设计 Agent 建议先做概念方案，不做施工深度，重点验证可租效率和改造强度。`,
    operation: `${operationPhrase}。运营 Agent 建议先找 2-3 个锚定品牌或运营方验证租金承受区间。`,
    summary: `${decision.title}：${decision.summary} 这不是最终投资建议，而是一份投前会诊结果，适合进入下一轮专业复核。`,
    checklist: [
      "补充真实地址、现状出租率、租金和空置面积",
      "抓取周边竞品、轨交距离、主干道展示面和商圈客群",
      "请设计师输出概念改造方向、楼层面积和可租效率",
      "请运营/招商团队验证品牌锚点、业态比例和出租率假设",
      "复核改造成本、资金成本、退出估值和投资人沟通材料",
    ],
  };
}

function renderAgentReport(inputs, result) {
  const report = getAgentReport(inputs, result);
  setText("marketAgentText", report.market);
  setText("financeAgentText", report.finance);
  setText("designAgentText", report.design);
  setText("operationAgentText", report.operation);
  setText("agentReportSummary", report.summary);
  document.querySelector("#agentChecklist").innerHTML = report.checklist
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderFactorList(factors) {
  const html = factors
    .filter((factor) => Math.abs(factor.value - 1) >= 0.015 || factor.label === "人工修正")
    .sort((a, b) => Math.abs(b.value - 1) - Math.abs(a.value - 1))
    .slice(0, 8)
    .map((factor) => {
      const delta = factor.value - 1;
      const className = delta >= 0 ? "positive" : "negative";
      const sign = delta >= 0 ? "+" : "";

      return `
        <div class="factor-row">
          <span>${factor.label}</span>
          <strong class="${className}">${sign}${decimalFormatter.format(delta * 100)}%</strong>
        </div>
      `;
    })
    .join("");

  document.querySelector("#factorList").innerHTML = html;
}

function renderSensitivity(inputs, baseResult) {
  const scenarios = [
    {
      label: "租金预测上浮 10%",
      inputs: { ...inputs, rentAdjustment: inputs.rentAdjustment + 0.1 },
    },
    {
      label: "出租率下降 5 个点",
      inputs: { ...inputs, occupancy: Math.max(0, inputs.occupancy - 0.05) },
    },
    {
      label: "竞品增加 2 个",
      inputs: { ...inputs, competitors: inputs.competitors + 2 },
    },
  ];

  const html = scenarios
    .map((scenario) => {
      const result = calculate(scenario.inputs);
      const delta = result.roi - baseResult.roi;
      const className = delta >= 0 ? "positive" : "negative";
      const sign = delta >= 0 ? "+" : "";

      return `
        <div class="sensitivity-row">
          <span>${scenario.label}</span>
          <strong class="${className}">${sign}${decimalFormatter.format(delta * 100)} 个点</strong>
        </div>
      `;
    })
    .join("");

  document.querySelector("#sensitivity").innerHTML = html;
}

function renderRentConfidence(score) {
  if (score >= 78) return "租金条件较强";
  if (score >= 58) return "租金条件中性";
  return "需重点校准租金";
}

function renderTierSections() {
  tierButtons.forEach((button) => {
    const tier = Number(button.dataset.tier);
    button.classList.toggle("active", tier === activeTier);
    button.classList.toggle("completed", tier < activeTier);
  });

  tierSections.forEach((section) => {
    const minTier = Number(section.dataset.minTier);
    section.classList.toggle("is-hidden", activeTier < minTier);
  });
}

function update() {
  const inputs = getInputs();
  const result = calculate(inputs);

  setText("resultProjectName", inputs.projectName);
  setText("resultLocation", inputs.location);
  setText("roi", formatPercent(result.roi));
  setText("payback", `${decimalFormatter.format(result.payback)} 年`);
  setText("annualRent", formatWan(result.annualRent));
  setText("noi", formatWan(result.noi));
  setText("effectiveRent", `${decimalFormatter.format(result.effectiveRent)} 元/㎡/日`);
  setText("rentableArea", `${numberFormatter.format(result.rentableArea)} ㎡`);
  setText("totalInvestment", `${numberFormatter.format(result.totalInvestment)} 万元`);
  setText("trafficFactor", decimalFormatter.format(result.trafficFactor));
  setText("aiBaseRent", `${decimalFormatter.format(result.rentPrediction.marketBaseRent)} 元/㎡/日`);
  setText("mixFactor", decimalFormatter.format(result.mixFactor));
  setText("rentScore", result.rentPrediction.score);
  setText("rentConfidence", renderRentConfidence(result.rentPrediction.score));
  setText("schemeArea", `${numberFormatter.format(result.schemeCost.schemeTotalArea)} ㎡`);
  setText("schemeRentableArea", `${numberFormatter.format(result.schemeCost.schemeRentableArea)} ㎡`);
  setText("lightRenovationCost", formatWan(result.schemeCost.lightRenovationCost));
  setText("heavyRenovationCost", formatWan(result.schemeCost.heavyRenovationCost));
  setText("parkingFacadeCost", formatWan(result.schemeCost.parkingFacadeCost));
  setText("mepCost", formatWan(result.schemeCost.mepCost));

  renderTierSections();
  renderRating(result.roi);
  renderDecision(inputs, result);
  renderAgentReport(inputs, result);
  renderFactorList(result.rentPrediction.factors);
  renderSensitivity(inputs, result);
}

function resetDefaults() {
  fields.forEach((field) => {
    if (field === "tier") return;
    document.querySelector(`#${field}`).value = defaults[field];
  });
  activeTier = defaults.tier;
  update();
}

form.addEventListener("input", update);
form.addEventListener("change", update);
resetButton.addEventListener("click", resetDefaults);
document.querySelector("#actionButton").addEventListener("click", () => {
  activeTier = Number(document.querySelector("#actionButton").dataset.nextTier);
  update();
});
tierButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeTier = Number(button.dataset.tier);
    update();
  });
});

update();
