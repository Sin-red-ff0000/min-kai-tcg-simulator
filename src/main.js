import { GAME_CONFIG } from './config.js?v=4.8';
import { MANUFACTURERS } from './data/manufacturers.js?v=4.8';
import { GROUP_KEYS, STAT_GROUPS, RESISTANCE_STATS } from './data/statDefinitions.js?v=4.8';
import { GROUP_GUIDE, STAT_GUIDE, WEAPON_AXIS_GUIDE, RESISTANCE_GUIDE, SYSTEM_GUIDE } from './data/statGuideDefinitions.js?v=4.8';
import { WEAPON_CATEGORIES, WEAPON_AXES } from './data/weaponDefinitions.js?v=4.8';
import { getLibidoBodyOperation } from './data/libidoBodyOperations.js?v=4.8';
import { WEAPON_DOCTRINE_RULES } from './data/battleRules.js?v=4.8';
import { TOURNAMENTS, TOURNAMENT_IDS } from './data/tournamentDefinitions.js?v=4.8';
import { SERIES_DEFINITIONS } from './data/seriesDefinitions.js?v=4.8';
import { FACILITY_DEFINITIONS } from './data/facilityDefinitions.js?v=4.8';
import { createInitialState, advanceYear, migrateState } from './systems/gameState.js?v=4.8';
import { applyTrainingTurn, generateTrainingChoices, generateTrainingChoicesWithCarryover, individualTrainingOptions, seriesGrowthMultiplier } from './systems/trainingSystem.js?v=4.8';
import { simulateBattle } from './systems/battleSystem.js?v=4.8';
import { SPECIAL_ABILITIES } from './data/specialAbilities.js?v=4.8';
import { PART_RARITIES } from './data/partDefinitions.js?v=4.8';
import { adjustedCustomPartEffects, generateCustomPart, useCustomPart } from './systems/partSystem.js?v=4.8';
import { PROCUREMENT_ROUTES, chooseProcurement, procurementStatus, requestProcurement } from './systems/logisticsSystem.js?v=4.8';
import { resolvePostTrainingEvent, tickTrainingModifiers } from './systems/eventSystem.js?v=4.8';
import { describeAbilityChange } from './systems/specialAbilitySystem.js?v=4.8';
import { analysisLevel, trainingChoiceCount, trainingLevelBias, trainingChoiceContext, updateFacilities, weaponsLabLevel } from './systems/facilitySystem.js?v=4.8';
import { battleWinTable, normalizeSettings, trainingTurnsForState } from './systems/settingsSystem.js?v=4.8';
import { manufacturerDisplayName, seriesDisplayName, robotDisplayName, robotFormalName } from './systems/displaySystem.js?v=4.8';
import { careerRecordSummary, extendedCareerRecordSummary, robotCareerHighlights, manufacturerRecords, seriesRecords, seriesDiscoverySummary, isHallOfFame, toggleHallOfFame, updateHallMemo, BEST15_MODES, historicalBest15, isManualBest15, toggleManualBest15 } from './systems/recordSystem.js?v=4.8';
import { rivalArchiveRows } from './systems/rivalTeamSystem.js?v=4.8';
import { exhibitionTeamOptions, exhibitionHistoryRows, simulateExhibitionMatch } from './systems/exhibitionSystem.js?v=4.8';
import { downloadSave, readSaveFile } from './systems/saveSystem.js?v=4.8';
import { ensureTournamentYear, resolveTournamentMatch, tournamentEntry, tournamentMatchOptions, tournamentAvailableTurn } from './systems/tournamentSystem.js?v=4.8';
import { MANAGER_CONTEXT_LABELS, MANAGER_PERSONALITIES, MANAGER_TEMPLATE_TOKENS } from './data/managerDefinitions.js?v=4.8';
import { MANAGER_CUSTOM_MAX_LENGTH, MANAGER_CUSTOM_MAX_LINES, MANAGER_LINE_MODES, clearManagerCustomLines, loadManagerProfile, managerLine, managerRobotInsightContext, parseCustomLines, renderManagerTemplate, resizeImageFile, saveManagerProfile, setManagerCustomLines, standardManagerLines } from './systems/managerSystem.js?v=4.8';
import { MANAGER_PRESET_LIMIT, applyManagerPreset, createManagerPreset, downloadManagerProfile, loadManagerPresets, readManagerProfileFile, removeManagerPreset, saveManagerPresets, upsertManagerPreset } from './systems/managerPresetSystem.js?v=4.8';
import { pwaInstallMessage, pwaInstallState, requestPwaInstall } from './systems/pwaSystem.js?v=4.8';
import {
  arrangeLineup,
  autoSelectLineup,
  availableBenchRobots,
  createOfficialMatch,
  moveLineupSlot,
  preMatchPairingInsight,
  robotSelectionScore,
  runNextBout,
  startOfficialMatch,
  substituteFutureSlot,
  updateLineupSlot,
} from './systems/teamMatchSystem.js?v=4.8';

const loadedState = loadState();
let state = migrateState(loadedState) ?? createInitialState();
state.settings = normalizeSettings(state.settings);
let managerProfile = loadManagerProfile(GAME_CONFIG.managerStorageKey);
let managerPresets = loadManagerPresets(GAME_CONFIG.managerPresetStorageKey);

const uiState = {
  rosterSearch: '',
  rosterYear: 'all',
  rosterManufacturer: 'all',
  rosterWeapon: 'all',
  rosterSort: 'yearDesc',
  partRarity: 'all',
  partType: 'all',
  partManufacturer: 'all',
  partAbility: 'all',
  partSort: 'rarityDesc',
  tutorialOpen: !state.onboarding?.completed,
  tutorialStep: Number(state.onboarding?.step ?? 0),
  managerContext: 'welcome',
  managerLine: managerLine(managerProfile, 'welcome', { manager: managerProfile.name, year: state.year, turn: state.turn }),
  managerVariables: { manager: managerProfile.name, year: state.year, turn: state.turn },
  activeView: 'dashboard',
  managerCustomOpen: false,
  managerEditContext: 'welcome',
  managerPresetId: '',
  managerCollapsed: true,
  unitDetailTab: 'overview',
  teamRadarOpen: false,
  seriesDexManufacturer: 'all',
  seriesDexSearch: '',
  seriesDexDiscovery: 'all',
  seriesDexGeneration: 'all',
  seriesDexGrowth: 'all',
  seriesDexCustom: 'all',
  seriesDexSort: 'number',
  seriesCompareMakerA: MANUFACTURERS[0]?.id ?? '',
  seriesCompareMakerB: MANUFACTURERS[1]?.id ?? MANUFACTURERS[0]?.id ?? '',
  statusGuideOpen: false,
  exhibitionLeft: 'active',
  exhibitionRight: 'best15:overall',
  retirementHistoryExpanded: false,
  rivalArchiveExpanded: false,
};

const PART_RARITY_RANK = Object.fromEntries(Object.keys(PART_RARITIES).map((key, index) => [key, index]));
const MANUFACTURER_INFO_MAP = new Map(MANUFACTURERS.map((item) => [item.id, item]));

const APP_VIEWS = [
  { id: 'dashboard', label: 'ホーム', short: 'ダッシュボード' },
  { id: 'training', label: '育成', short: '育成管理' },
  { id: 'unit', label: '機体詳細', short: '機体情報' },
  { id: 'custom', label: 'カスタム', short: '機体改修' },
  { id: 'competition', label: '大会', short: '大会管理' },
  { id: 'history', label: '設備・記録', short: '設備・記録' },
  { id: 'settings', label: '設定', short: 'システム設定' },
];


function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function weaponListLabel(keys) {
  const labels = (keys ?? []).map((key) => WEAPON_CATEGORIES[key]?.label ?? key).filter(Boolean);
  return labels.length ? labels.join(' / ') : '指定なし';
}

function seriesAbilityTagLabel(tags) {
  const map = { output:'出力', mobility:'駆動', control:'制御', engine:'機関', compute:'演算', sensor:'センサー', ai:'AI', weapon:'兵装全般', ranged:'遠距離', energy:'エネルギー', resistance:'耐性', reliability:'信頼性', official:'公式戦', result:'逆境・結果', accuracy:'精度' };
  return (tags ?? []).map((tag) => WEAPON_CATEGORIES[tag]?.label ?? map[tag] ?? tag).join(' / ') || '標準';
}

const TUTORIAL_STEPS = [
  {
    title: '3年間で育て、次の世代へ',
    body: '毎年5〜8機が加入し、各機体は3年間在籍します。3年目の終了時に売却され、新人が補充されます。基礎能力の永続インフレではなく、毎年の世代差を楽しむゲームです。',
    hint: 'まずは所属機体一覧から気になる1機を選んでください。',
  },
  {
    title: '個別練習と全体練習',
    body: '各機体には個別練習を常時設定でき、毎ターン微小成長します。さらに毎ターン1枚の全体練習カードを選び、対象グループをチーム全体で成長させます。練習Lvは毎回ランダムです。',
    hint: '得意を伸ばすか、弱点を補うかは自由です。',
  },
  {
    title: 'カスタムは消費型パーツで',
    body: 'カスタムパーツは装備品ではなく、使用すると個別パラメーターへ永久反映される消費アイテムです。高レアほど多くの項目が伸びます。「挑戦的な試供品」はマイナスを持つ代わりに強化量が大きめです。',
    hint: '誰に、いつ、どのパーツを投入するかが育成の中心です。',
  },
  {
    title: '公式戦は15機・15戦',
    body: '大会では所属機から15機を選抜し、1機1戦で15戦行います。序盤は相手の詳細情報が少なく、戦闘研究棟が発展すると戦闘思想・主力兵装・耐性との噛み合わせなどが段階的に分かるようになります。並び順と回数制限付き交代が采配になります。',
    hint: '研究棟は正解編成を自動表示しません。得られた情報から15機の順番を考える設備です。',
  },
  {
    title: '個体差は育てて見抜く',
    body: '各個別パラメーターには成長倍率があり、同じシリーズでも伸び方が違います。設備が発展すると成長適性を詳しく解析できるようになります。信頼性が低い機体は試合ごとの能力ブレが大きくなります。',
    hint: '普通に見えた新人が、特定兵装だけ異常に伸びることもあります。',
  },
  {
    title: 'マネージャーを自分好みに',
    body: 'マネージャーは名前・性格・任意画像を登録でき、練習・大会・覚醒・年度更新などに合わせてコメントします。マイカスタムでは状況別に複数の自作セリフを登録できます。画像とマネージャー設定はゲームセーブ本体とは別に保存されます。',
    hint: '標準のみ・標準＋自作・自作優先を切り替えられます。全部の状況を埋める必要はありません。',
  },
  {
    title: '長期プレイは環境が成長',
    body: '長く遊んでも新人の基礎能力そのものは永久強化されません。代わりに設備が育ち、成長解析、練習候補の引き直し・保留、試験兵装指定、相手分析、選択式の技術物資調達、歴代ベスト15など新しい判断手段が増えていきます。',
    hint: '設備・記録画面では、次のLvで何が解禁されるかも確認できます。',
  },
];


const mName = (robot) => manufacturerDisplayName(robot, state.settings);
const sName = (robot) => seriesDisplayName(robot, state.settings);
const robotLabel = (robot) => robotDisplayName(robot, state.settings);
const robotFormalLabel = (robot) => robotFormalName(robot, state.settings);

function recordRobotName(robot) {
  if (!robot) return '---';
  try {
    return robotLabel(robot);
  } catch {
    const manufacturer = robot.manufacturerName ?? robot.manufacturerId ?? 'UNKNOWN';
    const series = robot.seriesNameKana ?? robot.seriesName ?? robot.seriesNameLatin ?? 'SERIES';
    return `${manufacturer} ${series}`;
  }
}


function managerContextVariables(extra = {}) {
  const explicitRobot = extra.robotObject ?? (extra.robotId ? state.roster.find((robot) => robot.id === extra.robotId) : null);
  const robot = explicitRobot ?? selectedRobot();
  const variables = {
    manager: managerProfile.name,
    year: state.year,
    turn: state.turn,
    robot: robot ? robotLabel(robot) : '---',
    manufacturer: robot ? mName(robot) : '---',
    series: robot ? sName(robot) : '---',
    weapon: robot?.weaponName ?? '---',
    training: extra.training ?? '---',
    level: extra.level ?? '---',
    event: extra.event ?? '---',
    tournament: extra.tournament ?? '---',
    round: extra.round ?? '---',
    part: extra.part ?? '---',
    ability: extra.ability ?? '---',
    rookies: extra.rookies ?? state.lastYearSummary?.rookieCount ?? '---',
    retired: extra.retired ?? state.lastYearSummary?.retiredCount ?? '---',
    wins: state.teamRecord?.wins ?? 0,
    losses: state.teamRecord?.losses ?? 0,
  };
  for (const [key, value] of Object.entries(extra)) {
    if (key === 'robotObject' || key === 'robotId') continue;
    if (value !== undefined && value !== null) variables[key] = value;
  }
  return variables;
}

function setManagerMessage(context = 'generic', variables = {}) {
  if (!managerProfile.enabled) return;
  const resolved = managerContextVariables(variables);
  uiState.managerContext = context;
  uiState.managerVariables = resolved;
  uiState.managerLine = managerLine(managerProfile, context, resolved);
}


function setManagerRobotMessage(robot) {
  if (!robot) return;
  setManagerMessage(managerRobotInsightContext(robot), { robotObject: robot });
}

function persistManagerProfile() {
  managerProfile = saveManagerProfile(GAME_CONFIG.managerStorageKey, managerProfile);
}

function persistManagerPresets() {
  managerPresets = saveManagerPresets(GAME_CONFIG.managerPresetStorageKey, managerPresets);
}


function managerInitials() {
  return (managerProfile.name || 'M').trim().slice(0, 2).toUpperCase();
}

function winRate(robot) {
  const wins = robot.record?.wins ?? 0;
  const losses = robot.record?.losses ?? 0;
  const total = wins + losses;
  return total ? wins / total : 0;
}

function filteredRoster() {
  const search = uiState.rosterSearch.trim().toLowerCase();
  const robots = state.roster.filter((robot) => {
    if (uiState.rosterYear !== 'all' && String(robot.cohortYear) !== uiState.rosterYear) return false;
    if (uiState.rosterManufacturer !== 'all' && robot.manufacturerId !== uiState.rosterManufacturer) return false;
    if (uiState.rosterWeapon !== 'all' && robot.weaponKey !== uiState.rosterWeapon) return false;
    if (search) {
      const haystack = `${robotLabel(robot)} ${robotFormalLabel(robot)} ${robot.serial} ${robot.weaponName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
  const sorters = {
    yearDesc: (a, b) => (b.cohortYear - a.cohortYear) || (robotSelectionScore(b) - robotSelectionScore(a)),
    yearAsc: (a, b) => (a.cohortYear - b.cohortYear) || (robotSelectionScore(b) - robotSelectionScore(a)),
    overall: (a, b) => robotSelectionScore(b) - robotSelectionScore(a),
    wins: (a, b) => ((b.record?.wins ?? 0) - (a.record?.wins ?? 0)) || (winRate(b) - winRate(a)),
    winRate: (a, b) => winRate(b) - winRate(a) || ((b.record?.wins ?? 0) - (a.record?.wins ?? 0)),
    reliability: (a, b) => b.reliability - a.reliability || robotSelectionScore(b) - robotSelectionScore(a),
    name: (a, b) => robotLabel(a).localeCompare(robotLabel(b), 'ja'),
  };
  return robots.sort(sorters[uiState.rosterSort] ?? sorters.yearDesc);
}

function filteredParts() {
  const parts = (state.partInventory ?? []).filter((part) => {
    if (uiState.partRarity !== 'all' && part.rarityId !== uiState.partRarity) return false;
    if (uiState.partManufacturer !== 'all' && part.manufacturerId !== uiState.partManufacturer) return false;
    if (uiState.partAbility === 'yes' && !part.abilityId) return false;
    if (uiState.partAbility === 'no' && part.abilityId) return false;
    if (uiState.partType === 'challenge' && !part.challenge) return false;
    if (uiState.partType === 'memorial' && !part.memorial) return false;
    if (uiState.partType === 'tournament' && !part.tournamentSpecial) return false;
    if (uiState.partType === 'normal' && (part.challenge || part.memorial || part.tournamentSpecial)) return false;
    return true;
  });
  const effectTotal = (part) => (part.effects ?? []).reduce((sum, effect) => sum + Math.max(0, effect.amount), 0);
  const sorters = {
    rarityDesc: (a, b) => (PART_RARITY_RANK[b.rarityId] ?? 0) - (PART_RARITY_RANK[a.rarityId] ?? 0) || effectTotal(b) - effectTotal(a),
    rarityAsc: (a, b) => (PART_RARITY_RANK[a.rarityId] ?? 0) - (PART_RARITY_RANK[b.rarityId] ?? 0),
    effect: (a, b) => effectTotal(b) - effectTotal(a),
    newest: () => 0,
    manufacturer: (a, b) => String(a.manufacturerName).localeCompare(String(b.manufacturerName), 'ja'),
  };
  if (uiState.partSort === 'newest') return parts.slice().reverse();
  return parts.sort(sorters[uiState.partSort] ?? sorters.rarityDesc);
}

function saveState() {
  try {
    localStorage.setItem(GAME_CONFIG.saveKey, JSON.stringify(state));
  } catch (error) {
    console.error('save failed', error);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.saveKey);
    if (raw) return JSON.parse(raw);
    for (const legacyKey of GAME_CONFIG.legacySaveKeys ?? []) {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy) return JSON.parse(legacy);
    }
    return null;
  } catch {
    return null;
  }
}

function groupAverage(robot, groupKey) {
  const values = Object.values(robot.stats[groupKey]);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function weaponAverage(robot) {
  const values = Object.values(robot.weaponStats);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function grade(value) {
  if (value >= 90) return 'S';
  if (value >= 80) return 'A';
  if (value >= 70) return 'B';
  if (value >= 60) return 'C';
  if (value >= 50) return 'D';
  return 'E';
}

function selectedRobot() {
  return state.roster.find((robot) => robot.id === state.selectedRobotId) ?? state.roster[0];
}

function battleOpponent() {
  const selected = selectedRobot();
  const preferred = state.roster.find((robot) => robot.id === state.battleOpponentId && robot.id !== selected?.id);
  return preferred ?? state.roster.find((robot) => robot.id !== selected?.id) ?? null;
}

function commit() {
  saveState();
  render();
}

function trainingControlState() {
  state.trainingControl ??= { year: state.year, turn: state.turn, rerollUsed: false, reserved: null };
  if (Number(state.trainingControl.year) !== Number(state.year) || Number(state.trainingControl.turn) !== Number(state.turn)) {
    state.trainingControl = { year: state.year, turn: state.turn, rerollUsed: false, reserved: state.trainingControl.reserved ?? null };
  }
  return state.trainingControl;
}

function refreshTrainingChoices({ preserveCarryover = true } = {}) {
  const control = trainingControlState();
  const carried = preserveCarryover ? state.trainingChoices.find((item) => item.reservedCarryover) ?? null : null;
  state.trainingChoices = generateTrainingChoicesWithCarryover(
    trainingChoiceCount(state),
    state.trainingModifiers ?? [],
    trainingLevelBias(state),
    trainingChoiceContext(state),
    carried,
  );
  control.year = state.year;
  control.turn = state.turn;
}

function rerollTrainingChoices() {
  const control = trainingControlState();
  if ((state.facilities?.training ?? 0) < 2 || control.rerollUsed) return;
  refreshTrainingChoices({ preserveCarryover: true });
  control.rerollUsed = true;
  state.log = ['統合訓練設備：このターンの練習候補を引き直しました。', ...state.log].slice(0, 28);
  commit();
}

function reserveTrainingChoice(trainingId) {
  const control = trainingControlState();
  if ((state.facilities?.training ?? 0) < 4) return;
  const training = state.trainingChoices.find((item) => item.id === trainingId);
  if (!training) return;
  const { reservedCarryover, ...snapshot } = training;
  control.reserved = snapshot;
  state.log = [`統合訓練設備：${training.label} Lv${training.level}を次ターンへ保留しました。`, ...state.log].slice(0, 28);
  commit();
}

function chooseTraining(training) {
  const trainingLock = trainingLockInfo();
  if (trainingLock.locked) {
    uiState.activeView = 'competition';
    state.log = [`${trainingLock.title}。${trainingLock.detail}`, ...state.log].slice(0, 28);
    commit();
    return;
  }
  const control = trainingControlState();
  if (control.reserved?.id === training.id) control.reserved = null;
  const labTarget = weaponsLabLevel(state) >= 3 ? state.weaponsLabControl?.targetWeaponKey : null;
  const appliedTraining = training.weaponLab && labTarget ? { ...training, testWeaponKey: labTarget } : training;
  const logs = applyTrainingTurn(state.roster, appliedTraining);
  if (training.weaponLab && labTarget) {
    const label = WEAPON_CATEGORIES[labTarget]?.label ?? labTarget;
    logs.unshift(`兵装試験場：指定していた${label}を装備変更なしで試験対象にしました。`);
    state.weaponsLabControl.targetWeaponKey = null;
  }
  // 現在ターンで効いていた期間限定強化を1ターン消費した後、イベントを抽選する。
  tickTrainingModifiers(state);
  const event = resolvePostTrainingEvent(state);
  if (event) logs.unshift(`【${event.title}】${event.description}`);
  state.log = [...logs, ...state.log].slice(0, 28);

  const eventPart = event?.partIds?.length ? state.partInventory.find((part) => part.id === event.partIds[0]) : null;
  const trainingVars = { training: training.label ?? training.name ?? '全体練習', level: training.level ?? 1, part: eventPart?.name ?? '---' };
  if (event?.type === 'awakening') setManagerMessage('awakening', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'aggressive-tuning') setManagerMessage('eventBad', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoAfterHours') setManagerMessage('libidoAfterHours', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoFitting') setManagerMessage('libidoFitting', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoRedacted') setManagerMessage('libidoRedacted', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoIntimateCalibration') setManagerMessage('libidoIntimateCalibration', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoAdultInterface') setManagerMessage('libidoAdultInterface', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoBodyOption') setManagerMessage('libidoBodyOption', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoPrivacyMode') setManagerMessage('libidoPrivacyMode', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'tokiwaLivingRoom') setManagerMessage('tokiwaLivingRoom', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'tokiwaApplianceDuty') setManagerMessage('tokiwaApplianceDuty', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'tokiwaHomeSupport') setManagerMessage('tokiwaHomeSupport', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoCompanionService') setManagerMessage('libidoCompanionService', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoPrivateSuite') setManagerMessage('libidoPrivateSuite', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event?.type === 'operational-study' && event?.expansionFamily === 'libidoAftercareUse') setManagerMessage('libidoAftercareUse', { ...trainingVars, robotId: event.robotId, event: event.title });
  else if (event) setManagerMessage(['challenge-part', 'part-supply', 'manufacturer-support', 'rare-prototype'].includes(event.type) ? 'part' : 'eventGood', { ...trainingVars, robotId: event.robotId, event: event.title });
  else {
    const hasLibido = state.roster.some((robot) => robot.manufacturerId === 'libido');
    if (hasLibido && Math.random() < 0.30) setManagerMessage((training.level ?? 1) >= 4 ? 'libidoTrainingHigh' : 'libidoTraining', trainingVars);
    else setManagerMessage((training.level ?? 1) >= 4 ? 'trainingHigh' : 'training', trainingVars);
  }

  if (state.turn >= trainingTurnsForState(state)) {
    state = advanceYear(state);
    setManagerMessage('yearEnd', {
      year: state.lastYearSummary?.year ?? state.year - 1,
      rookies: state.lastYearSummary?.rookieCount ?? 0,
      retired: state.lastYearSummary?.retiredCount ?? 0,
    });
  } else {
    const reservedTraining = control.reserved ?? null;
    state.turn += 1;
    ensureTournamentYear(state);
    state.trainingControl = { year: state.year, turn: state.turn, rerollUsed: false, reserved: null };
    state.trainingChoices = generateTrainingChoicesWithCarryover(trainingChoiceCount(state), state.trainingModifiers ?? [], trainingLevelBias(state), trainingChoiceContext(state), reservedTraining);
  }
  commit();
}

function resetGame() {
  if (!confirm('現在のゲームデータを削除して最初から始めますか？\n必要なら先にセーブを書き出してください。')) return;
  localStorage.removeItem(GAME_CONFIG.saveKey);
  for (const legacyKey of GAME_CONFIG.legacySaveKeys ?? []) localStorage.removeItem(legacyKey);
  state = createInitialState();
  Object.assign(uiState, { tutorialOpen: true, tutorialStep: 0 });
  setManagerMessage('welcome');
  commit();
}

function runBattle() {
  const a = selectedRobot();
  const b = battleOpponent();
  if (!a || !b) return;
  state.lastBattle = {
    robotAId: a.id,
    robotBId: b.id,
    result: simulateBattle(a, b, { winChanceTable: battleWinTable(state.settings) }),
  };
  commit();
}

function prepareOfficialMatch() {
  const forced = requiredTournament();
  if (forced) {
    uiState.activeView = 'competition';
    state.log = [`${forced.def.name}の大会期間中は団体模擬戦を開始できません。大会へ参加してください。`, ...state.log].slice(0, 24);
    commit();
    return;
  }
  if (state.roster.length < GAME_CONFIG.officialMatchSize) {
    state.log = ['所属機体が15機未満のため公式戦を編成できません。', ...state.log].slice(0, 24);
    commit();
    return;
  }
  state.officialMatch = createOfficialMatch(state, { context: { type: 'scrimmage', name: '団体模擬戦', prestige: 0 } });
  state.log = ['試作用の団体模擬戦を生成しました。模擬戦は成長・戦績・報酬に影響しません。', ...state.log].slice(0, 24);
  commit();
}


function prepareTournamentRound(tournamentId) {
  if (state.roster.length < GAME_CONFIG.officialMatchSize) {
    state.log = ['所属機体が15機未満のため大会へ出場できません。', ...state.log].slice(0, 28);
    commit();
    return;
  }
  if (state.officialMatch) {
    state.log = ['現在の公式戦結果を整理してから次の大会戦へ進んでください。', ...state.log].slice(0, 28);
    commit();
    return;
  }
  const options = tournamentMatchOptions(state, tournamentId);
  if (!options) return;
  state.officialMatch = createOfficialMatch(state, options);
  state.log = [`${options.context.tournamentName} ${options.context.roundName}の対戦相手が決まりました。`, ...state.log].slice(0, 28);
  const tournamentDef = TOURNAMENTS[tournamentId];
  const isFinal = options.context.roundIndex >= tournamentDef.rounds.length - 1;
  const hasLibido = state.roster.some((robot) => robot.manufacturerId === 'libido');
  const hasTokiwa = state.roster.some((robot) => robot.manufacturerId === 'tokiwa');
  setManagerMessage(hasLibido ? (isFinal ? 'libidoFinal' : 'libidoTournament') : (hasTokiwa ? 'tokiwaMatch' : (isFinal ? 'tournamentFinal' : 'tournamentPrepare')), {
    tournament: options.context.tournamentName,
    round: options.context.roundName,
  });
  commit();
}

function clearOfficialMatch() {
  state.officialMatch = null;
  commit();
}

function beginOfficialMatch() {
  if (!state.officialMatch) return;
  if (!startOfficialMatch(state.officialMatch)) return;
  state.log = [state.officialMatch.context?.type === 'scrimmage' ? '団体模擬戦を開始しました。' : '公式大会戦を開始しました。', ...state.log].slice(0, 24);
  commit();
}

function boutLogs(bout) {
  const ally = state.roster.find((robot) => robot.id === bout.allyId);
  const text = `第${bout.slot + 1}戦 ${ally ? sName(ally) : '自機'}：${bout.allyWon ? '勝利' : '敗北'}（比較 ${bout.result.aWins}-${bout.result.bWins}）`;
  const abilityMessages = (bout.abilityChanges ?? []).map(describeAbilityChange).filter(Boolean);
  return [
    ...abilityMessages.map((message) => `${ally ? sName(ally) : '自機'}：${message}。`),
    text,
  ];
}

function finalizeOfficialMatch(logs = []) {
  const match = state.officialMatch;
  if (!match || match.status !== 'complete' || match.resolutionProcessed) return logs;
  match.resolutionProcessed = true;
  if (match.context?.type === 'tournament') {
    const tournamentResult = resolveTournamentMatch(state, match);
    if (tournamentResult?.logs?.length) logs.unshift(...tournamentResult.logs);
  } else if (match.context?.type !== 'scrimmage') {
    const rewardCount = match.teamWon ? 2 : 1;
    const logistics = state.facilities?.logistics ?? 0;
    const rewards = Array.from({ length: rewardCount }, () => generateCustomPart({ rarityBias: logistics }));
    state.partInventory.push(...rewards);
    logs.unshift(`公式戦報酬としてカスタムパーツ${rewardCount}個を獲得。`);
  } else {
    logs.unshift('団体模擬戦のため、成長・戦績・報酬は発生しません。');
  }
  const unlocked = updateFacilities(state);
  logs.unshift(...unlocked.map((item) => `設備拡充：${item.name} Lv${item.level}が利用可能になりました。`));
  logs.unshift(`${match.context?.type === 'scrimmage' ? '団体模擬戦' : '公式大会戦'}終了 ${match.allyWins}-${match.enemyWins}。${match.teamWon ? 'チーム勝利！' : 'チーム敗北。'}`);
  const matchVars = {
    tournament: match.context?.tournamentName ?? match.context?.name ?? '団体戦',
    round: match.context?.roundName ?? '---',
    wins: match.allyWins,
    losses: match.enemyWins,
  };
  const libidoParticipated = (match.bouts ?? []).some((bout) => state.roster.find((robot) => robot.id === bout.allyId)?.manufacturerId === 'libido');
  const tokiwaParticipated = (match.bouts ?? []).some((bout) => state.roster.find((robot) => robot.id === bout.allyId)?.manufacturerId === 'tokiwa');
  const tournamentChampion = match.context?.type === 'tournament' && match.teamWon && tournamentEntry(state, match.context.tournamentId)?.champion;
  if (libidoParticipated && tournamentChampion) setManagerMessage('libidoChampion', matchVars);
  else if (libidoParticipated) setManagerMessage(match.teamWon ? 'libidoVictory' : 'libidoLoss', matchVars);
  else if (tokiwaParticipated) setManagerMessage(match.teamWon ? 'tokiwaVictory' : 'tokiwaMatch', matchVars);
  else if (match.context?.type === 'tournament' && match.teamWon) {
    if (tournamentChampion) setManagerMessage('tournamentChampion', matchVars);
    else setManagerMessage('matchWin', matchVars);
  } else {
    setManagerMessage(match.teamWon ? 'matchWin' : 'matchLoss', matchVars);
  }
  return logs;
}

function playNextOfficialBout() {
  if (!state.officialMatch) return;
  const bout = runNextBout(state, state.officialMatch);
  if (!bout) return;
  const logs = boutLogs(bout);
  finalizeOfficialMatch(logs);
  state.log = [...logs, ...state.log].slice(0, 28);
  commit();
}

function playRemainingOfficialBouts() {
  const match = state.officialMatch;
  if (!match || match.status !== 'running') return;
  const start = match.currentBout + 1;
  const abilityLogs = [];
  while (match.status === 'running') {
    const bout = runNextBout(state, match);
    if (!bout) break;
    for (const message of (bout.abilityChanges ?? []).map(describeAbilityChange).filter(Boolean)) {
      const ally = state.roster.find((robot) => robot.id === bout.allyId);
      abilityLogs.push(`${ally ? sName(ally) : '自機'}：${message}。`);
    }
  }
  const logs = [`第${start}戦以降をスキップして15戦すべて処理しました。`, ...abilityLogs];
  finalizeOfficialMatch(logs);
  state.log = [...logs, ...state.log].slice(0, 32);
  commit();
}

function renderRosterControls() {
  const manufacturerIds = [...new Set(state.roster.map((robot) => robot.manufacturerId))];
  const weaponKeys = [...new Set(state.roster.map((robot) => robot.weaponKey))];
  return `
    <div class="list-tools roster-tools">
      <input id="roster-search" type="search" placeholder="機体名・型式を検索" value="${uiState.rosterSearch}">
      <select id="roster-year-filter">
        <option value="all" ${uiState.rosterYear === 'all' ? 'selected' : ''}>全年次</option>
        ${[3,2,1].map((year) => `<option value="${year}" ${uiState.rosterYear === String(year) ? 'selected' : ''}>${year}年目</option>`).join('')}
      </select>
      <select id="roster-manufacturer-filter">
        <option value="all">全メーカー</option>
        ${manufacturerIds.map((id) => {
          const robot = state.roster.find((item) => item.manufacturerId === id);
          return `<option value="${id}" ${uiState.rosterManufacturer === id ? 'selected' : ''}>${robot ? mName(robot) : id}</option>`;
        }).join('')}
      </select>
      <select id="roster-weapon-filter">
        <option value="all">全兵装</option>
        ${weaponKeys.map((key) => `<option value="${key}" ${uiState.rosterWeapon === key ? 'selected' : ''}>${WEAPON_CATEGORIES[key]?.label ?? key}</option>`).join('')}
      </select>
      <select id="roster-sort">
        <option value="yearDesc" ${uiState.rosterSort === 'yearDesc' ? 'selected' : ''}>年次：ベテラン順</option>
        <option value="yearAsc" ${uiState.rosterSort === 'yearAsc' ? 'selected' : ''}>年次：新人順</option>
        <option value="overall" ${uiState.rosterSort === 'overall' ? 'selected' : ''}>総合評価順</option>
        <option value="wins" ${uiState.rosterSort === 'wins' ? 'selected' : ''}>勝利数順</option>
        <option value="winRate" ${uiState.rosterSort === 'winRate' ? 'selected' : ''}>勝率順</option>
        <option value="reliability" ${uiState.rosterSort === 'reliability' ? 'selected' : ''}>信頼性順</option>
        <option value="name" ${uiState.rosterSort === 'name' ? 'selected' : ''}>名前順</option>
      </select>
      <button id="roster-filter-clear" class="mini-button">解除</button>
    </div>
  `;
}

function renderRoster() {
  const robots = filteredRoster();
  if (!robots.length) return '<div class="filtered-empty">条件に一致する機体はいません。</div>';
  return robots.map((robot) => {
    const isSelected = robot.id === selectedRobot()?.id;
    const rate = winRate(robot);
    return `
      <button class="robot-row ${isSelected ? 'selected' : ''}" data-robot-id="${robot.id}">
        <span class="year-badge">${robot.cohortYear}年目</span>
        <span class="robot-name">${robotLabel(robot)}${robot.nickname ? `<small>${robotFormalLabel(robot)}</small>` : ''}</span>
        <span class="weapon-tag">${robot.weaponName}</span>
        <span class="serial">${robot.serial} / ${robot.record?.wins ?? 0}勝${robot.record?.losses ?? 0}敗${(robot.record?.wins ?? 0) + (robot.record?.losses ?? 0) ? ` / ${(rate * 100).toFixed(0)}%` : ''}</span>
        <span class="robot-score">総合 ${robotSelectionScore(robot).toFixed(0)}</span>
        <span class="reliability">信頼 ${robot.reliability}</span>
      </button>
    `;
  }).join('');
}

function growthBand(multiplier, detailLevel = analysisLevel(state)) {
  const mode = state.settings?.growthMode ?? 'facility';
  if (mode === 'hidden') return '';
  if (mode === 'visible' || detailLevel >= 4) return `×${multiplier.toFixed(2)}`;
  if (detailLevel <= 0) return '';
  if (detailLevel === 1 || detailLevel === 2) {
    if (multiplier >= 1.16) return '伸びやすい';
    if (multiplier <= 0.88) return '伸びにくい';
    return '普通';
  }
  if (multiplier >= 1.30) return '非常に高い';
  if (multiplier >= 1.10) return '高い';
  if (multiplier <= 0.78) return '非常に低い';
  if (multiplier <= 0.95) return '低い';
  return '普通';
}

function groupGrowthAverage(robot, groupKey) {
  const values = Object.values(robot.growthMultipliers[groupKey]);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function totalBaseGrowthMultiplier(robot, groupKey, statName, options = {}) {
  const base = Number(robot.growthMultipliers?.[groupKey]?.[statName] ?? 1);
  return base * seriesGrowthMultiplier(robot, groupKey, options);
}

function groupTotalGrowthAverage(robot, groupKey, options = {}) {
  const stats = STAT_GROUPS[groupKey]?.stats ?? [];
  if (!stats.length) return 1;
  return stats.reduce((sum, statName) => sum + totalBaseGrowthMultiplier(robot, groupKey, statName, options), 0) / stats.length;
}

const BASE_ABILITY_REFERENCE = 60;
function baseAbilityMultiplier(value) {
  return Number(value || 0) / BASE_ABILITY_REFERENCE;
}
function overallBaseAbilityAverage(robot) {
  const values = GROUP_KEYS.flatMap((groupKey) => Object.values(robot.stats?.[groupKey] ?? {}));
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(1, values.length);
}

function renderGroupCards(robot) {
  return GROUP_KEYS.map((groupKey) => {
    const value = groupAverage(robot, groupKey);
    const group = STAT_GROUPS[groupKey];
    return `
      <div class="group-card">
        <div class="group-title">${group.label}<strong>${grade(value)}</strong></div>
        <div class="group-value">${value.toFixed(1)}</div>
        <small class="base-hint">基礎 ×${baseAbilityMultiplier(value).toFixed(2)}</small>
        ${state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 1 || state.settings?.growthMode === 'visible') ? `<small class="growth-hint">総合成長 ${growthBand(groupTotalGrowthAverage(robot, groupKey), Math.max(1, analysisLevel(state)))}${analysisLevel(state) >= 4 || state.settings?.growthMode === 'visible' ? ` / 基礎成長×${groupGrowthAverage(robot, groupKey).toFixed(2)}` : ''}</small>` : ''}
      </div>
    `;
  }).join('');
}

function renderResistance(robot) {
  const rows = Object.entries(robot.resistances).map(([name, value]) => `
    <li><span>${name}</span><strong>${value}</strong></li>
  `).join('');
  return `
    <details>
      <summary>耐性</summary>
      <ul class="stat-list compact">${rows}</ul>
    </details>
  `;
}

function renderWeaponDetail(robot) {
  const weapon = WEAPON_CATEGORIES[robot.weaponKey];
  const rows = WEAPON_AXES.map((axis) => {
    const value = robot.weaponStats[axis];
    const growth = robot.weaponGrowthMultipliers[axis];
    const growthText = state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 2 || state.settings?.growthMode === 'visible') ? growthBand(growth) : '';
    return `<li><span>${weapon.stats[axis]}</span><strong>${value.toFixed(1)}</strong><em>${growthText ? ` ${growthText}` : ''}</em></li>`;
  }).join('');
  return `
    <details open>
      <summary>武器：${weapon.label} / ${weapon.range}・${weapon.type}　平均 ${weaponAverage(robot).toFixed(1)}</summary>
      <ul class="stat-list">${rows}</ul>
    </details>
  `;
}

function renderAbilities(robot) {
  const ids = robot.specialAbilities ?? [];
  if (!ids.length) {
    return `<div class="ability-empty">特殊能力なし</div>`;
  }
  return `
    <div class="ability-list">
      ${ids.map((id) => {
        const ability = SPECIAL_ABILITIES[id];
        if (!ability) return '';
        return `
          <div class="ability-chip ${ability.polarity} ${ability.tier}">
            <strong>${ability.name}</strong>
            <span>${ability.description}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function effectText(effect) {
  const sign = effect.amount >= 0 ? '+' : '';
  return `${effect.label} ${sign}${effect.amount}`;
}

function adjustedEffectText(effect, adjusted) {
  if (!adjusted || Number(adjusted.amount) === Number(effect.amount)) return effectText(effect);
  const sign = adjusted.amount >= 0 ? '+' : '';
  return `${effectText(effect)} → 適性補正後 ${sign}${adjusted.amount}`;
}

function renderProcurementPanel() {
  const status = procurementStatus(state);
  if (status.level <= 0) return '<div class="procurement-panel"><strong>技術物資ネットワーク</strong><small>Lv1で比較調達を利用できます。</small></div>';
  const pending = status.pending;
  const routeOptions = Object.values(PROCUREMENT_ROUTES)
    .filter((route) => route.minLevel <= status.level)
    .map((route) => `<option value="${route.id}">${route.label} — ${route.description}</option>`).join('');
  const makerOptions = MANUFACTURERS.map((maker) => `<option value="${maker.id}">${maker.name}</option>`).join('');
  const choices = pending?.choices ?? [];
  return `
    <div class="procurement-panel">
      <div class="procurement-head"><div><strong>技術物資ネットワーク</strong><small>今年の調達依頼 ${status.used}/${status.limit}回</small></div></div>
      ${pending ? `
        <p>${escapeHtml(pending.routeLabel)}の候補です。受け取れるのは1つだけです。</p>
        <div class="procurement-choices">
          ${choices.map((part) => {
            const ability = part.abilityId ? SPECIAL_ABILITIES[part.abilityId] : null;
            const positiveTotal = (part.effects ?? []).reduce((sum, effect) => sum + Math.max(0, effect.amount), 0);
            const negativeTotal = Math.abs((part.negatives ?? []).reduce((sum, effect) => sum + Math.min(0, effect.amount), 0));
            return `<article class="part-card ${part.challenge ? 'challenge' : ''}">
              <div class="part-card-head"><div><span class="part-rarity">${part.rarityLabel}${part.challenge ? ' / 挑戦的' : ''}</span><strong>${part.name}</strong><small>総強化 +${positiveTotal}${negativeTotal ? ` / 代償 -${negativeTotal}` : ''}</small></div><button class="mini-button procurement-choose" data-procurement-part="${part.id}">これを受け取る</button></div>
              <div class="part-effects positive">${(part.effects ?? []).map(effectText).map((text) => `<span>${text}</span>`).join('')}</div>
              ${(part.negatives ?? []).length ? `<div class="part-effects negative">${part.negatives.map(effectText).map((text) => `<span>${text}</span>`).join('')}</div>` : ''}
              ${ability ? `<div class="part-ability"><b>${ability.name}</b><span>${ability.description}</span></div>` : ''}
            </article>`;
          }).join('')}
        </div>` : `
        <div class="procurement-controls">
          <select id="procurement-route">${routeOptions}</select>
          ${status.level >= 2 ? `<select id="procurement-maker"><option value="">メーカー指定なし</option>${makerOptions}</select>` : ''}
          <button id="procurement-request" class="mini-button" ${status.remaining <= 0 ? 'disabled' : ''}>候補を取り寄せる</button>
        </div>
        <small>${status.remaining > 0 ? '調達は能力倍率を上げず、候補から選ぶ機会そのものを増やします。' : '今年の調達依頼回数を使い切りました。次年度に回復します。'}</small>`}
    </div>`;
}

function renderPartInventory(robot) {
  const allParts = state.partInventory ?? [];
  const parts = filteredParts();
  const manufacturerIds = [...new Set(allParts.map((part) => part.manufacturerId).filter(Boolean))];
  const filters = `
    <div class="list-tools parts-filters">
      <select id="part-rarity-filter">
        <option value="all">全レアリティ</option>
        ${Object.entries(PART_RARITIES).map(([key, rarity]) => `<option value="${key}" ${uiState.partRarity === key ? 'selected' : ''}>${rarity.label}</option>`).join('')}
      </select>
      <select id="part-type-filter">
        <option value="all" ${uiState.partType === 'all' ? 'selected' : ''}>全タイプ</option>
        <option value="normal" ${uiState.partType === 'normal' ? 'selected' : ''}>通常</option>
        <option value="challenge" ${uiState.partType === 'challenge' ? 'selected' : ''}>挑戦的</option>
        <option value="memorial" ${uiState.partType === 'memorial' ? 'selected' : ''}>記念</option>
        <option value="tournament" ${uiState.partType === 'tournament' ? 'selected' : ''}>大会特別</option>
      </select>
      <select id="part-manufacturer-filter">
        <option value="all">全メーカー</option>
        ${manufacturerIds.map((id) => {
          const part = allParts.find((item) => item.manufacturerId === id);
          return `<option value="${id}" ${uiState.partManufacturer === id ? 'selected' : ''}>${part?.manufacturerName ?? id}</option>`;
        }).join('')}
      </select>
      <select id="part-ability-filter">
        <option value="all" ${uiState.partAbility === 'all' ? 'selected' : ''}>特殊能力：全て</option>
        <option value="yes" ${uiState.partAbility === 'yes' ? 'selected' : ''}>特殊能力あり</option>
        <option value="no" ${uiState.partAbility === 'no' ? 'selected' : ''}>特殊能力なし</option>
      </select>
      <select id="part-sort">
        <option value="rarityDesc" ${uiState.partSort === 'rarityDesc' ? 'selected' : ''}>高レア順</option>
        <option value="rarityAsc" ${uiState.partSort === 'rarityAsc' ? 'selected' : ''}>低レア順</option>
        <option value="effect" ${uiState.partSort === 'effect' ? 'selected' : ''}>総強化量順</option>
        <option value="newest" ${uiState.partSort === 'newest' ? 'selected' : ''}>新着順</option>
        <option value="manufacturer" ${uiState.partSort === 'manufacturer' ? 'selected' : ''}>メーカー順</option>
      </select>
      <button id="part-filter-clear" class="mini-button">解除</button>
    </div>`;
  if (!allParts.length) {
    return `
      ${filters}
      <div class="parts-empty">
        <p>カスタムパーツを所持していません。大会報酬やイベント、売却記念パーツで入手できます。</p>
      </div>
    `;
  }
  return `
    <div class="parts-toolbar">
      <div><strong>所持 ${allParts.length}個 / 表示 ${parts.length}個</strong><span>選択中：${robot ? sName(robot) : '---'}</span>${robot ? `<small>カスタム適性：${escapeHtml(robot.seriesCustomAptitude?.label ?? '標準適合')} — 同じパーツでも適性補正後の実効値が変わります。</small>` : ''}</div>
    </div>
    ${filters}
    ${parts.length ? `<div class="parts-list">
      ${parts.map((part) => {
        const ability = part.abilityId ? SPECIAL_ABILITIES[part.abilityId] : null;
        const positiveTotal = (part.effects ?? []).reduce((sum, effect) => sum + Math.max(0, effect.amount), 0);
        const negativeTotal = Math.abs((part.negatives ?? []).reduce((sum, effect) => sum + Math.min(0, effect.amount), 0));
        const adjusted = robot ? adjustedCustomPartEffects(robot, part) : [];
        const adjustedPositive = adjusted.slice(0, part.effects?.length ?? 0);
        const adjustedNegative = adjusted.slice(part.effects?.length ?? 0);
        const adjustedPositiveTotal = adjustedPositive.reduce((sum, effect) => sum + Math.max(0, Number(effect.amount) || 0), 0);
        const adjustedNegativeTotal = Math.abs(adjustedNegative.reduce((sum, effect) => sum + Math.min(0, Number(effect.amount) || 0), 0));
        const aptitudeChanges = robot && (Math.abs(adjustedPositiveTotal - positiveTotal) > 0.01 || Math.abs(adjustedNegativeTotal - negativeTotal) > 0.01);
        return `
          <article class="part-card ${part.challenge ? 'challenge' : ''}">
            <div class="part-card-head">
              <div>
                <span class="part-rarity">${part.rarityLabel}${part.challenge ? ' / 挑戦的' : ''}${part.memorial ? ' / 記念' : ''}${part.tournamentSpecial ? ' / 大会特別' : ''}</span>
                <strong>${part.name}</strong>
                <small>総強化 +${positiveTotal}${negativeTotal ? ` / 代償 -${negativeTotal}` : ''}${aptitudeChanges ? ` → この機体では +${adjustedPositiveTotal.toFixed(1)}${adjustedNegativeTotal ? ` / 代償 -${adjustedNegativeTotal.toFixed(1)}` : ''}` : ''}</small>
              </div>
              <button class="part-use-button" data-part-id="${part.id}" ${robot ? '' : 'disabled'}>使用</button>
            </div>
            <div class="part-effects positive">
              ${part.effects.map((effect, index) => `<span>${adjustedEffectText(effect, adjustedPositive[index])}</span>`).join('')}
            </div>
            ${part.negatives.length ? `<div class="part-effects negative">${part.negatives.map((effect, index) => `<span>${adjustedEffectText(effect, adjustedNegative[index])}</span>`).join('')}</div>` : ''}
            ${ability ? `<div class="part-ability"><b>${ability.name}</b><span>${ability.description}</span></div>` : ''}
            ${part.source ? `<div class="part-source">入手：${part.source}</div>` : ''}
            ${part.sourceRobot ? `<div class="part-source">由来：${part.sourceRobot.seriesName} ${part.sourceRobot.serial} / ${part.sourceRobot.wins}勝${part.sourceRobot.losses}敗</div>` : ''}
          </article>
        `;
      }).join('')}
    </div>` : '<div class="filtered-empty">条件に一致するカスタムパーツはありません。</div>'}
  `;
}

function renderDetail(robot) {
  if (!robot) return '<p>機体がありません。</p>';

  const detailRows = GROUP_KEYS.map((groupKey) => {
    const group = STAT_GROUPS[groupKey];
    const stats = group.stats.map((statName) => {
      const value = robot.stats[groupKey][statName];
      const growth = robot.growthMultipliers[groupKey][statName];
      const growthText = state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 2 || state.settings?.growthMode === 'visible') ? growthBand(growth) : '';
      return `<li><span>${statName}</span><strong>${value.toFixed(1)}</strong><em>${growthText ? ` ${growthText}` : ''}</em></li>`;
    }).join('');
    return `
      <details>
        <summary>${group.label}：${groupAverage(robot, groupKey).toFixed(1)}</summary>
        <ul class="stat-list">${stats}</ul>
      </details>
    `;
  }).join('');

  const options = individualTrainingOptions(robot).map((option) => {
    return `<option value="${option.value}" ${robot.individualTrainingTarget === option.value ? 'selected' : ''}>${option.label}</option>`;
  }).join('');

  return `
    <div class="detail-header">
      <div>
        <span class="eyebrow">${robot.cohortYear}年目 / ${mName(robot)}</span>
        <h2>${sName(robot)}</h2>
        <p>${robot.serial} / ${robot.weaponName} / 通算 ${robot.record?.wins ?? 0}勝${robot.record?.losses ?? 0}敗</p>
      </div>
      <div class="reliability-big">信頼性<strong>${robot.reliability}</strong></div>
    </div>
    <div class="group-grid">${renderGroupCards(robot)}</div>
    <label class="weapon-equip-select">
      使用兵装
      <select id="weapon-equip">${Object.entries(WEAPON_CATEGORIES).map(([key, weapon]) => `<option value="${key}" ${robot.weaponKey === key ? 'selected' : ''}>${weapon.label} / ${weapon.range}・${weapon.type}</option>`).join('')}</select>
      <small>兵装ごとに別の個別値を保持します。カスタムパーツによる別兵装強化も切替後に反映されます。</small>
    </label>
    <div class="special-ability-section">
      <div class="subsection-title"><strong>特殊能力</strong><span>${robot.specialAbilities?.length ?? 0}個</span></div>
      ${renderAbilities(robot)}
    </div>
    <label class="training-select">
      個別練習
      <select id="individual-training">${options}</select>
    </label>
    <div class="detail-groups">
      ${renderWeaponDetail(robot)}
      ${renderResistance(robot)}
      ${detailRows}
    </div>
  `;
}


function equipRobotWeapon(robot, nextKey) {
  if (!robot || !WEAPON_CATEGORIES[nextKey] || nextKey === robot.weaponKey) return false;
  robot.weaponCategoryStats ??= {};
  robot.weaponCategoryGrowthMultipliers ??= {};
  robot.weaponCategoryStats[robot.weaponKey] = { ...robot.weaponStats };
  robot.weaponCategoryGrowthMultipliers[robot.weaponKey] = { ...robot.weaponGrowthMultipliers };
  robot.weaponKey = nextKey;
  robot.weaponName = WEAPON_CATEGORIES[nextKey].label;
  robot.weaponStats = { ...(robot.weaponCategoryStats[nextKey] ?? {}) };
  robot.weaponGrowthMultipliers = { ...(robot.weaponCategoryGrowthMultipliers[nextKey] ?? {}) };
  if ((robot.individualTrainingTarget ?? '').startsWith('weapon:')) robot.individualTrainingTarget = `weapon:${nextKey}`;
  state.lastBattle = null;
  state.log = [`${sName(robot)}の使用兵装を${robot.weaponName}へ変更。`, ...state.log].slice(0, 28);
  return true;
}

function weaponCategoryValues(robot, weaponKey) {
  if (weaponKey === robot.weaponKey) return robot.weaponStats ?? {};
  return robot.weaponCategoryStats?.[weaponKey] ?? {};
}

function weaponCategoryGrowth(robot, weaponKey) {
  if (weaponKey === robot.weaponKey) return robot.weaponGrowthMultipliers ?? {};
  return robot.weaponCategoryGrowthMultipliers?.[weaponKey] ?? {};
}

function weaponCategoryAverage(robot, weaponKey) {
  const values = WEAPON_AXES.map((axis) => Number(weaponCategoryValues(robot, weaponKey)?.[axis] ?? 0));
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function weaponCategoryGrowthAverage(robot, weaponKey) {
  const values = WEAPON_AXES.map((axis) => Number(weaponCategoryGrowth(robot, weaponKey)?.[axis] ?? 1));
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

const WEAPON_LINKED_GROUP_UI = {
  blade:'control', hammer:'output', lance:'mobility', beamBlade:'engine', rifle:'sensor', machineGun:'mobility',
  cannon:'control', laser:'sensor', beamCannon:'engine', missile:'compute', emp:'ai', drone:'compute',
};

function growthAnalysisRows(robot) {
  const rows = [];
  for (const groupKey of GROUP_KEYS) {
    for (const statName of STAT_GROUPS[groupKey].stats) {
      rows.push({ groupKey, statName, total: totalBaseGrowthMultiplier(robot, groupKey, statName), current: Number(robot.stats[groupKey][statName] ?? 0) });
    }
  }
  return rows.sort((a,b) => b.total - a.total);
}

function renderGrowthAnalysisInsight(robot) {
  const level = analysisLevel(state);
  if (level < 2) return '';
  const rows = growthAnalysisRows(robot);
  const best = rows.slice(0, level >= 4 ? 3 : 2);
  const weak = [...rows].sort((a,b) => a.total - b.total).slice(0, level >= 4 ? 3 : 2);
  const spread = best[0]?.total - weak[0]?.total;
  const direction = spread >= 0.45 ? '成長差が大きい特化型' : spread >= 0.22 ? '得意不得意が出る準特化型' : '成長差が小さい均衡型';
  const fmt = (item) => `${item.statName}${level >= 4 ? ` ×${item.total.toFixed(2)}` : `（${growthBand(item.total, level)}）`}`;
  return `<section class="analysis-insight-card">
    <div><span>成長解析室 Lv${level}</span><strong>${direction}</strong></div>
    <p>伸びやすい：${best.map(fmt).join(' / ')}</p>
    <p>伸びにくい：${weak.map(fmt).join(' / ')}</p>
    ${level >= 3 ? `<small>現在値ではなく、系列特性・個体差を含めた総合成長倍率から見た育成方向です。</small>` : ''}
  </section>`;
}

function weaponTestScore(robot, weaponKey) {
  const current = weaponCategoryAverage(robot, weaponKey);
  const growth = weaponCategoryGrowthAverage(robot, weaponKey);
  const preferred = (robot.seriesPreferredWeapons ?? []).includes(weaponKey) ? 6 : 0;
  const avoided = (robot.seriesAvoidedWeapons ?? []).includes(weaponKey) ? -5 : 0;
  const linked = WEAPON_LINKED_GROUP_UI[weaponKey];
  const linkedValue = linked ? groupAverage(robot, linked) : 0;
  return current * 0.62 + growth * 24 + linkedValue * 0.14 + preferred + avoided;
}

function renderWeaponLabInsight(robot) {
  const level = weaponsLabLevel(state);
  if (level < 2) return '';
  const currentKey = robot.weaponKey;
  const linked = WEAPON_LINKED_GROUP_UI[currentKey];
  const linkedLabel = STAT_GROUPS[linked]?.label ?? '基礎能力';
  const target = state.weaponsLabControl?.targetWeaponKey;
  const ranked = Object.keys(WEAPON_CATEGORIES).map((weaponKey) => ({ weaponKey, score: weaponTestScore(robot, weaponKey), current: weaponCategoryAverage(robot, weaponKey), growth: weaponCategoryGrowthAverage(robot, weaponKey) })).sort((a,b) => b.score - a.score);
  const top = ranked.slice(0, level >= 5 ? 3 : 1);
  return `<section class="analysis-insight-card weapon-lab-insight">
    <div><span>兵装試験場 Lv${level}</span><strong>${WEAPON_CATEGORIES[currentKey].label}試験レポート</strong></div>
    <p>現在兵装の連携基礎：${linkedLabel}系 / 兵装平均 ${weaponCategoryAverage(robot, currentKey).toFixed(1)}${level >= 4 ? ` / 成長 ${growthBand(weaponCategoryGrowthAverage(robot,currentKey), 4)}` : ''}</p>
    ${level >= 4 ? `<p>試験候補：${top.map((item) => `${WEAPON_CATEGORIES[item.weaponKey].label}（現在${item.current.toFixed(1)} / 成長×${item.growth.toFixed(2)}）`).join(' / ')}</p>` : ''}
    ${level >= 3 ? `<small>${target ? `次の兵装試験対象：${WEAPON_CATEGORIES[target]?.label ?? target}` : '試験兵装を指定すると、装備変更なしで次の兵装試験カードだけその兵装へ適用できます。'}</small>` : ''}
  </section>`;
}

function chartCeiling(values, minimum = 100) {
  const highest = Math.max(minimum, ...values.map((value) => Number(value) || 0));
  return Math.ceil(highest / 20) * 20;
}

function renderRadarChart(robot) {
  const values = GROUP_KEYS.map((groupKey) => ({
    key: groupKey,
    label: STAT_GROUPS[groupKey].label,
    value: groupAverage(robot, groupKey),
  }));
  const maxValue = chartCeiling(values.map((item) => item.value));
  const cx = 180;
  const cy = 145;
  const radius = 96;
  const labelRadius = 122;
  const angleFor = (index) => (-Math.PI / 2) + (Math.PI * 2 * index / values.length);
  const point = (index, ratio, useLabelRadius = false) => {
    const angle = angleFor(index);
    const r = useLabelRadius ? labelRadius : radius * ratio;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const points = values.map((_, index) => point(index, ratio).map((value) => value.toFixed(1)).join(',')).join(' ');
    return `<polygon class="radar-grid-ring" points="${points}"></polygon>`;
  }).join('');
  const axes = values.map((_, index) => {
    const [x, y] = point(index, 1);
    return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;
  }).join('');
  const dataPoints = values.map((item, index) => {
    const ratio = Math.max(0, Math.min(1, item.value / maxValue));
    return point(index, ratio).map((value) => value.toFixed(1)).join(',');
  }).join(' ');
  const dots = values.map((item, index) => {
    const ratio = Math.max(0, Math.min(1, item.value / maxValue));
    const [x, y] = point(index, ratio);
    return `<circle class="radar-data-point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"><title>${item.label} ${item.value.toFixed(1)}</title></circle>`;
  }).join('');
  const labels = values.map((item, index) => {
    const [x, y] = point(index, 1, true);
    const anchor = x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle';
    const dy = y < cy - 30 ? -4 : y > cy + 30 ? 12 : 4;
    return `<text class="radar-label" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}"><tspan>${item.label}</tspan><tspan class="radar-label-value" x="${x.toFixed(1)}" dy="12">${item.value.toFixed(0)}</tspan></text>`;
  }).join('');
  return `
    <div class="radar-chart-wrap">
      <svg class="radar-chart" viewBox="0 0 360 300" role="img" aria-label="基礎能力レーダーチャート">
        ${rings}${axes}
        <polygon class="radar-data-shape" points="${dataPoints}"></polygon>
        ${dots}${labels}
      </svg>
      <div class="chart-scale-note">表示上限 ${maxValue}</div>
    </div>`;
}


function teamGroupAverages() {
  if (!state.roster.length) return GROUP_KEYS.map((groupKey) => ({ key: groupKey, label: STAT_GROUPS[groupKey].label, value: 0 }));
  return GROUP_KEYS.map((groupKey) => ({
    key: groupKey,
    label: STAT_GROUPS[groupKey].label,
    value: state.roster.reduce((sum, robot) => sum + groupAverage(robot, groupKey), 0) / state.roster.length,
  }));
}

function renderTeamRadarChart() {
  const values = teamGroupAverages();
  const maxValue = chartCeiling(values.map((item) => item.value));
  const cx = 180;
  const cy = 145;
  const radius = 96;
  const labelRadius = 122;
  const angleFor = (index) => (-Math.PI / 2) + (Math.PI * 2 * index / values.length);
  const point = (index, ratio, useLabelRadius = false) => {
    const angle = angleFor(index);
    const r = useLabelRadius ? labelRadius : radius * ratio;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const points = values.map((_, index) => point(index, ratio).map((value) => value.toFixed(1)).join(',')).join(' ');
    return `<polygon class="radar-grid-ring" points="${points}"></polygon>`;
  }).join('');
  const axes = values.map((_, index) => {
    const [x, y] = point(index, 1);
    return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;
  }).join('');
  const dataPoints = values.map((item, index) => {
    const ratio = Math.max(0, Math.min(1, item.value / maxValue));
    return point(index, ratio).map((value) => value.toFixed(1)).join(',');
  }).join(' ');
  const dots = values.map((item, index) => {
    const ratio = Math.max(0, Math.min(1, item.value / maxValue));
    const [x, y] = point(index, ratio);
    return `<circle class="radar-data-point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"><title>${item.label} ${item.value.toFixed(1)}</title></circle>`;
  }).join('');
  const labels = values.map((item, index) => {
    const [x, y] = point(index, 1, true);
    const anchor = x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle';
    const dy = y < cy - 30 ? -4 : y > cy + 30 ? 12 : 4;
    return `<text class="radar-label" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}"><tspan>${item.label}</tspan><tspan class="radar-label-value" x="${x.toFixed(1)}" dy="12">${item.value.toFixed(0)}</tspan></text>`;
  }).join('');
  return `<div class="radar-chart-wrap team-radar-chart-wrap"><svg class="radar-chart" viewBox="0 0 360 300" role="img" aria-label="チーム全体の基礎能力平均レーダーチャート">${rings}${axes}<polygon class="radar-data-shape" points="${dataPoints}"></polygon>${dots}${labels}</svg><div class="chart-scale-note">所属 ${state.roster.length}機の平均 / 表示上限 ${maxValue}</div></div>`;
}

function renderTeamRadarOverlay() {
  if (!uiState.teamRadarOpen) return '';
  const values = teamGroupAverages();
  const sorted = [...values].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted.at(-1);
  return `
    <div class="team-radar-backdrop" role="dialog" aria-modal="true" aria-label="チーム能力傾向">
      <section class="team-radar-modal">
        <header class="team-radar-modal-head">
          <div><p class="eyebrow">チーム分析</p><h2>チーム全体の能力傾向</h2><p>所属${state.roster.length}機の基礎7グループ平均。全体練習を選ぶ時の参考にできます。</p></div>
          <button id="team-radar-close" class="ghost compact-button" aria-label="チームレーダーを閉じる">閉じる</button>
        </header>
        <div class="team-radar-modal-body">
          <div class="team-radar-visual">${renderTeamRadarChart()}</div>
          <div class="team-radar-summary">
            <div class="team-radar-highlow"><article><span>最も高い</span><strong>${strongest?.label ?? '---'}</strong><b>${strongest?.value.toFixed(1) ?? '---'}</b></article><article><span>最も低い</span><strong>${weakest?.label ?? '---'}</strong><b>${weakest?.value.toFixed(1) ?? '---'}</b></article></div>
            <div class="team-average-grid">${values.map((item) => `<div><span>${item.label}</span><strong>${item.value.toFixed(1)}</strong><em>${grade(item.value)}</em></div>`).join('')}</div>
            <p class="team-radar-hint">弱点補強なら「${weakest?.label ?? '---'}」系、長所を伸ばすなら「${strongest?.label ?? '---'}」系の全体練習が候補です。</p>
          </div>
        </div>
      </section>
    </div>`;
}

function renderMetricBars(items, { maxValue = null, weaponKey = null } = {}) {
  const ceiling = maxValue ?? chartCeiling(items.map((item) => item.value));
  return `<div class="metric-bar-chart">${items.map((item) => {
    const width = Math.max(1.5, Math.min(100, (Number(item.value) || 0) / ceiling * 100));
    const equipped = item.key && item.key === weaponKey;
    return `<div class="metric-bar-row ${equipped ? 'equipped' : ''}">
      <div class="metric-bar-label"><span>${item.label}</span>${equipped ? '<em>装備中</em>' : ''}</div>
      <div class="metric-bar-track"><div class="metric-bar-fill" style="width:${width.toFixed(1)}%"></div></div>
      <strong>${Number(item.value).toFixed(1)}</strong>
    </div>`;
  }).join('')}<div class="chart-scale-note">表示上限 ${ceiling}</div></div>`;
}

function renderBaseAbilityBars(robot) {
  return renderMetricBars(GROUP_KEYS.map((groupKey) => ({
    key: groupKey,
    label: STAT_GROUPS[groupKey].label,
    value: groupAverage(robot, groupKey),
  })));
}

function renderWeaponAptitudeBars(robot) {
  const items = Object.keys(WEAPON_CATEGORIES).map((weaponKey) => ({
    key: weaponKey,
    label: WEAPON_CATEGORIES[weaponKey].label,
    value: weaponCategoryAverage(robot, weaponKey),
  }));
  return renderMetricBars(items, { weaponKey: robot.weaponKey });
}

function renderCompactUnitProfile(robot) {
  if (!robot) return '<p>機体がありません。</p>';
  const wins = robot.record?.wins ?? 0;
  const losses = robot.record?.losses ?? 0;
  return `
    <div class="compact-unit-profile">
      <div class="detail-header compact-detail-header">
        <div>
          <span class="eyebrow">${robot.cohortYear}年目 / ${mName(robot)}</span>
          <h2>${robot.nickname ? escapeHtml(robot.nickname) : sName(robot)}</h2>
          ${robot.nickname ? `<p class="formal-unit-name">${robotFormalLabel(robot)}</p>` : ''}
          <p>${robot.serial} / ${robot.weaponName} / ${wins}勝${losses}敗</p>
        </div>
        <div class="reliability-big overall-score-big">総合評価<strong>${robotSelectionScore(robot).toFixed(0)}</strong></div>
      </div>
      <div class="group-grid compact-group-grid">${renderGroupCards(robot)}</div>
      <div class="compact-profile-footer">
        <span>現在兵装 <b>${robot.weaponName}</b></span>
        <span>兵装平均 <b>${weaponAverage(robot).toFixed(1)}</b></span>
        <span>特殊能力 <b>${robot.specialAbilities?.length ?? 0}</b></span>
        <button class="view-tab mini-button" data-view="unit">機体詳細を開く</button>
      </div>
    </div>`;
}

function renderUnitOverview(robot) {
  const options = individualTrainingOptions(robot).map((option) => `<option value="${option.value}" ${robot.individualTrainingTarget === option.value ? 'selected' : ''}>${option.label}</option>`).join('');
  const wins = robot.record?.wins ?? 0;
  const losses = robot.record?.losses ?? 0;
  const total = wins + losses;
  return `
    <div class="unit-overview-dashboard">
      <section class="panel unit-chart-panel overview-radar-panel">
        <div class="panel-title compact-panel-title"><div><p class="eyebrow">能力レーダー</p><h2>基礎能力レーダー</h2></div><small class="panel-note">7グループ</small></div>
        ${renderRadarChart(robot)}
      </section>
      <section class="panel unit-summary-panel overview-summary-panel">
        <div class="detail-header overview-detail-header">
          <div>
            <span class="eyebrow">${robot.cohortYear}年目 / ${mName(robot)}</span>
            <h2>${robot.nickname ? escapeHtml(robot.nickname) : sName(robot)}</h2>
            ${robot.nickname ? `<p class="formal-unit-name">正式名称：${robotFormalLabel(robot)}</p>` : ''}
            <p>${robot.serial} / ${wins}勝${losses}敗${total ? ` / 勝率 ${(wins / total * 100).toFixed(0)}%` : ''}</p>
          </div>
          <div class="overview-score-stack">
            <div class="overall-evaluation-card"><span>総合評価</span><strong>${robotSelectionScore(robot).toFixed(0)}</strong><small>基礎能力＋現在兵装＋信頼性</small></div>
            <div class="reliability-card"><span>信頼性</span><strong>${robot.reliability}</strong><small>試合時の性能ブレ</small></div>
          </div>
        </div>
        <div class="unit-design-context">
          <div><span>メーカー思想</span><strong>${escapeHtml(MANUFACTURER_INFO_MAP.get(robot.manufacturerId)?.philosophy ?? '---')}</strong></div>
          <div><span>シリーズ傾向</span><strong>${escapeHtml(robot.seriesTrendLabel ?? '標準汎用')}：${escapeHtml(robot.seriesTrendSummary ?? '')}</strong></div>
          <div><span>生産・系譜</span><strong>${escapeHtml(robot.seriesProductionTierLabel ?? '標準生産')} / ${escapeHtml(robot.seriesMarketPosition ?? '')}${robot.seriesLineageLabel ? ` / ${escapeHtml(robot.seriesLineageLabel)}` : ''}${robot.seriesPredecessorNameKana ? ` / 前身 ${escapeHtml(robot.seriesPredecessorNameKana)}` : ''}</strong></div>
          <div><span>個体差・兵装嗜好</span><strong>${escapeHtml(robot.seriesIndividualityLabel ?? '標準個体差')} / 推奨 ${escapeHtml(weaponListLabel(robot.seriesPreferredWeapons))} / 非推奨 ${escapeHtml(weaponListLabel(robot.seriesAvoidedWeapons))}</strong></div>
          <div><span>固有特性</span><strong>${escapeHtml(robot.seriesIntrinsicTrait?.label ?? '成熟基盤')}：${escapeHtml(robot.seriesIntrinsicTrait?.summary ?? '')}</strong></div>
          <div><span>成長曲線</span><strong>${escapeHtml(robot.seriesGrowthCurve?.label ?? '均等成長')}：${escapeHtml(robot.seriesGrowthCurve?.summary ?? '')}</strong></div>
          <div><span>カスタム適性</span><strong>${escapeHtml(robot.seriesCustomAptitude?.label ?? '標準適合')}：${escapeHtml(robot.seriesCustomAptitude?.summary ?? '')}</strong></div>
          <div><span>特殊能力傾向</span><strong>${escapeHtml(seriesAbilityTagLabel(robot.seriesAbilityTendencyTags))} 系を取得しやすい</strong></div>
          <div><span>製造年度</span><strong>${robot.productionYear ?? '---'}年 / ${escapeHtml(robot.annualTrend?.label ?? '年度補正なし')}${robot.annualTrend?.seriesYearEvent?.type !== 'normal' ? ` / ${escapeHtml(robot.annualTrend.seriesYearEvent.description ?? '')}` : ''}</strong></div>
          ${robot.seriesJackpot ? `<div><span>個体特記</span><strong>${escapeHtml(robot.seriesJackpot.label ?? '系列平均から外れた当たり個体')}</strong></div>` : ''}
          ${robot.libidoBodyArchetypeId ? (() => { const op = getLibidoBodyOperation(robot.libidoBodyArchetypeId); return `<div><span>特殊身体の運用</span><strong>${escapeHtml(robot.libidoBodyArchetype)} / 戦闘転用：${escapeHtml(robot.libidoBodyCombatRole || op.battleLabel)} / 整備：${escapeHtml(op.maintenance)}</strong></div>`; })() : ''}
        </div>
        <details class="series-lore-details">
          <summary><span>シリーズ設計解説</span>${robot.seriesRefitGeneration === 9 ? '<em>第9世代クリーンシート</em>' : robot.seriesRefitGeneration === 8 ? '<em>第8世代クリーンシート</em>' : robot.seriesRefitGeneration === 7 ? '<em>第7世代新設計</em>' : robot.seriesRefitGeneration === 6 ? '<em>第6世代新設計</em>' : robot.seriesRefitGeneration === 5 ? '<em>第5世代新設計</em>' : robot.seriesRefitGeneration === 4 ? '<em>第4世代再設計</em>' : robot.seriesRefitGeneration === 3 ? '<em>第3世代再設計</em>' : robot.seriesRefitGeneration === 2 ? '<em>第2世代再設計</em>' : robot.seriesLegacyRefit ? '<em>初期系列再設計</em>' : ''}</summary>
          <div class="series-lore-body">
            ${robot.seriesConcept ? `<section><span>総合コンセプト</span><p>${escapeHtml(robot.seriesConcept)}</p></section>` : ''}
            ${robot.seriesNamingConcept ? `<section><span>名称と設計モチーフ</span><p>${escapeHtml(robot.seriesNamingConcept)}</p></section>` : ''}
            ${robot.seriesDevelopmentBackground ? `<section><span>開発背景</span><p>${escapeHtml(robot.seriesDevelopmentBackground)}</p></section>` : ''}
            ${robot.seriesEngineeringNotes ? `<section><span>設計上の癖</span><p>${escapeHtml(robot.seriesEngineeringNotes)}</p></section>` : ''}
            ${robot.seriesTrainingNotes ? `<section><span>育成・改修の見方</span><p>${escapeHtml(robot.seriesTrainingNotes)}</p></section>` : ''}
            ${robot.seriesWeaponDoctrine ? `<section><span>兵装ドクトリン</span><p>${escapeHtml(robot.seriesWeaponDoctrine)}</p></section>` : ''}
          </div>
        </details>
        <div class="panel-title compact-panel-title overview-bars-title"><div><p class="eyebrow">基礎能力比較</p><h2>基礎能力比較</h2></div><small class="panel-note">平均値 / 全41項目 基礎×${baseAbilityMultiplier(overallBaseAbilityAverage(robot)).toFixed(2)}</small></div>
        <div class="overview-base-bars">${renderBaseAbilityBars(robot)}</div>
      </section>
      <section class="panel unit-control-panel overview-control-panel">
        <div class="panel-title compact-panel-title"><div><p class="eyebrow">現在設定</p><h2>現在の育成・兵装</h2></div></div>
        <div class="nickname-editor unit-control-field">
          <span>ニックネーム</span>
          <div><input id="robot-nickname" maxlength="24" value="${escapeHtml(robot.nickname ?? '')}" placeholder="任意の呼び名"><button id="robot-nickname-save" class="mini-button">保存</button>${robot.nickname ? '<button id="robot-nickname-clear" class="mini-button ghost">解除</button>' : ''}</div>
        </div>
        <label class="weapon-equip-select unit-control-field">
          使用兵装
          <select id="weapon-equip">${Object.entries(WEAPON_CATEGORIES).map(([key, weapon]) => `<option value="${key}" ${robot.weaponKey === key ? 'selected' : ''}>${weapon.label} / ${weapon.range}・${weapon.type}</option>`).join('')}</select>
        </label>
        <label class="training-select unit-control-field">
          個別練習
          <select id="individual-training">${options}</select>
        </label>
        <div class="overall-evaluation-note"><b>総合評価 ${robotSelectionScore(robot).toFixed(0)}</b><span>基礎7グループ平均 68% ＋ 現在兵装平均 24% ＋ 信頼性 8% の比較用指標。戦闘力そのものを1数値で決める値ではありません。</span></div>
        <div class="unit-key-stats compact-key-stats">
          <div class="overall-key-stat"><span>総合評価</span><strong>${robotSelectionScore(robot).toFixed(0)}</strong></div>
          <div><span>兵装平均</span><strong>${weaponAverage(robot).toFixed(1)}</strong></div>
          <div><span>信頼性（安定）</span><strong>${robot.reliability}</strong></div>
          <div><span>特殊能力</span><strong>${robot.specialAbilities?.length ?? 0}</strong></div>
        </div>
        <div class="group-grid overview-group-grid">${renderGroupCards(robot)}</div>
        <div class="unit-analysis-insights">${renderGrowthAnalysisInsight(robot)}${renderWeaponLabInsight(robot)}</div>
      </section>
    </div>`;
}

function renderBaseAbilityDetail(robot) {
  const detailRows = GROUP_KEYS.map((groupKey) => {
    const group = STAT_GROUPS[groupKey];
    const stats = group.stats.map((statName) => {
      const value = robot.stats[groupKey][statName];
      const growth = robot.growthMultipliers[groupKey][statName];
      const totalGrowth = totalBaseGrowthMultiplier(robot, groupKey, statName);
      const growthVisible = state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 2 || state.settings?.growthMode === 'visible');
      const totalGrowthText = growthVisible ? growthBand(totalGrowth) : '';
      const baseGrowthText = growthVisible && (analysisLevel(state) >= 4 || state.settings?.growthMode === 'visible') ? `基礎成長×${growth.toFixed(2)}` : '';
      return `<li><span>${statName}</span><strong>${value.toFixed(1)}</strong><em>${totalGrowthText ? `総合 ${totalGrowthText}${baseGrowthText ? ` / ${baseGrowthText}` : ''}` : ''}</em></li>`;
    }).join('');
    return `
      <section class="unit-stat-group">
        <div class="unit-stat-group-head"><strong>${group.label}</strong><span>${groupAverage(robot, groupKey).toFixed(1)} / ${grade(groupAverage(robot, groupKey))}${state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 1 || state.settings?.growthMode === 'visible') ? ` / 総合成長 ${growthBand(groupTotalGrowthAverage(robot, groupKey), Math.max(1, analysisLevel(state)))}${analysisLevel(state) >= 4 || state.settings?.growthMode === 'visible' ? ` / 基礎成長×${groupGrowthAverage(robot, groupKey).toFixed(2)}` : ''}` : ''}</span></div>
        <ul class="stat-list">${stats}</ul>
      </section>`;
  }).join('');
  return `<div class="unit-stat-groups">${detailRows}</div>`;
}

function renderWeaponAptitudeCard(robot, weaponKey) {
  const weapon = WEAPON_CATEGORIES[weaponKey];
  const stats = weaponCategoryValues(robot, weaponKey);
  const growth = weaponCategoryGrowth(robot, weaponKey);
  const average = weaponCategoryAverage(robot, weaponKey);
  const growthAverage = weaponCategoryGrowthAverage(robot, weaponKey);
  const growthVisible = state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 1 || state.settings?.growthMode === 'visible');
  return `
    <article class="weapon-aptitude-card ${weaponKey === robot.weaponKey ? 'equipped' : ''}">
      <header>
        <div><span>${weapon.range} / ${weapon.type}</span><strong>${weapon.label}</strong></div>
        <div class="weapon-aptitude-score"><b>${grade(average)}</b><strong>${average.toFixed(1)}</strong></div>
      </header>
      <div class="weapon-aptitude-meta">
        ${weaponKey === robot.weaponKey ? '<span class="equipped-badge">現在装備</span>' : ''}
        <span>対応耐性：${weapon.resistance}</span>
        ${growthVisible ? `<span>成長 ${growthBand(growthAverage, Math.max(1, analysisLevel(state)))}</span>` : ''}
      </div>
      ${WEAPON_DOCTRINE_RULES[weaponKey] ? `<p class="weapon-doctrine-note"><b>${WEAPON_DOCTRINE_RULES[weaponKey].label}</b>：${WEAPON_DOCTRINE_RULES[weaponKey].description}</p>` : ''}
      <div class="weapon-aptitude-actions">
        ${weaponKey === robot.weaponKey ? '<button class="weapon-equip-from-card equipped" disabled>使用中</button>' : `<button class="weapon-equip-from-card" data-equip-weapon="${weaponKey}">この兵装を使用</button>`}
      </div>
      <ul class="weapon-aptitude-stats">
        ${WEAPON_AXES.map((axis) => {
          const value = Number(stats?.[axis] ?? 0);
          const growthText = state.settings?.growthMode !== 'hidden' && (analysisLevel(state) >= 2 || state.settings?.growthMode === 'visible') ? growthBand(Number(growth?.[axis] ?? 1)) : '';
          return `<li><span>${weapon.stats[axis]}</span><strong>${value.toFixed(1)}</strong>${growthText ? `<em>${growthText}</em>` : ''}</li>`;
        }).join('')}
      </ul>
    </article>`;
}

function renderAllWeaponAptitudes(robot) {
  const ranges = ['近距離', '遠距離', '特殊兵装'];
  return `
    <div class="all-weapon-aptitudes">
      <section class="panel weapon-chart-panel">
        <div class="panel-title"><div><p class="eyebrow">兵装適性</p><h2>全兵装適性グラフ</h2></div><small class="panel-note">12兵装の平均値を装備変更なしで比較</small></div>
        ${renderWeaponAptitudeBars(robot)}
      </section>
      <div class="weapon-aptitude-guide">全兵装カテゴリの現在値と成長傾向を比較できます。各カードの「この兵装を使用」から、そのまま現在兵装を変更できます。装備中の兵装は青枠で表示されます。</div>
      ${ranges.map((range) => {
        const keys = Object.keys(WEAPON_CATEGORIES).filter((key) => WEAPON_CATEGORIES[key].range === range);
        return `<section class="weapon-range-section"><div class="weapon-range-title"><h3>${range}</h3><span>${keys.length}カテゴリ</span></div><div class="weapon-aptitude-grid">${keys.map((key) => renderWeaponAptitudeCard(robot, key)).join('')}</div></section>`;
      }).join('')}
    </div>`;
}

function renderUnitSpecialDetail(robot) {
  const resistanceRows = Object.entries(robot.resistances).map(([name, value]) => `<li><span>${name}</span><strong>${value}</strong></li>`).join('');
  const history = (robot.customHistory ?? []).slice().reverse();
  return `
    <div class="unit-special-grid">
      <section class="panel">
        <div class="panel-title"><div><p class="eyebrow">特殊能力</p><h2>特殊能力</h2></div><span>${robot.specialAbilities?.length ?? 0}個</span></div>
        ${renderAbilities(robot)}
      </section>
      <section class="panel">
        <div class="panel-title"><div><p class="eyebrow">耐性</p><h2>耐性</h2></div></div>
        <ul class="resistance-grid">${resistanceRows}</ul>
      </section>
      <section class="panel unit-history-panel">
        <div class="panel-title"><div><p class="eyebrow">改修履歴</p><h2>カスタム履歴</h2></div><span>${history.length}件</span></div>
        ${history.length ? `<div class="unit-custom-history">${history.map((entry) => `<article><strong>${escapeHtml(entry.partName)}</strong><div>${(entry.effects ?? []).map((effect) => `<span>${escapeHtml(effect.label ?? effect.statName ?? effect.axis ?? effect.resistance ?? effect.kind)} ${effect.amount >= 0 ? '+' : ''}${effect.amount}</span>`).join('')}</div>${entry.abilityId && SPECIAL_ABILITIES[entry.abilityId] ? `<small>特殊能力：${SPECIAL_ABILITIES[entry.abilityId].name}</small>` : ''}</article>`).join('')}</div>` : '<div class="filtered-empty">まだカスタム履歴はありません。</div>'}
      </section>
    </div>`;
}

function renderUnitDetailPage(robot) {
  if (!robot) return `${renderPageHeader('機体詳細', 'unit')}<div class="filtered-empty">機体がありません。</div>`;
  const tabs = [
    ['overview', '概要'],
    ['base', '基礎能力'],
    ['weapons', '全兵装適性'],
    ['special', '特殊・履歴'],
  ];
  let content = renderUnitOverview(robot);
  if (uiState.unitDetailTab === 'base') content = renderBaseAbilityDetail(robot);
  if (uiState.unitDetailTab === 'weapons') content = renderAllWeaponAptitudes(robot);
  if (uiState.unitDetailTab === 'special') content = renderUnitSpecialDetail(robot);
  const rosterIndex = Math.max(0, state.roster.findIndex((item) => item.id === robot.id));
  const previous = state.roster[(rosterIndex - 1 + state.roster.length) % state.roster.length];
  const next = state.roster[(rosterIndex + 1) % state.roster.length];
  const selectorOptions = state.roster.map((item, index) => `<option value="${item.id}" ${item.id === robot.id ? 'selected' : ''}>${index + 1}. ${robotLabel(item)} / ${item.cohortYear}年目 / ${item.weaponName}</option>`).join('');
  return `
    <section class="unit-detail-switcher">
      <button class="unit-switch-button" data-unit-nav="${previous?.id ?? ''}">← 前の機体</button>
      <div class="unit-switch-center">
        <span>${rosterIndex + 1} / ${state.roster.length}</span>
        <select id="unit-detail-selector" aria-label="機体詳細で表示する機体">${selectorOptions}</select>
      </div>
      <button class="unit-switch-button" data-unit-nav="${next?.id ?? ''}">次の機体 →</button>
      <div class="unit-detail-quick-actions"><button class="view-tab mini-button ghost" data-view="training">育成へ</button><button class="view-tab mini-button ghost" data-view="custom">カスタムへ</button><button id="unit-status-guide" class="mini-button ghost">能力解説</button></div>
    </section>
    <nav class="unit-detail-tabs" aria-label="機体詳細カテゴリ">
      ${tabs.map(([id, label]) => `<button class="unit-detail-tab ${uiState.unitDetailTab === id ? 'active' : ''}" data-unit-detail-tab="${id}">${label}</button>`).join('')}
    </nav>
    <div class="unit-detail-content">${content}</div>`;
}

function trainingTargetLabel(training) {
  if (training.specialMode === 'weakest') return '各機体の弱点グループ';
  if (training.specialMode === 'rookieFoundation') return '1年目機体の弱点グループ';
  if (training.specialMode === 'favorite') return '各機体の得意グループ';
  if (training.specialMode === 'reliability') return '信頼性・状態調整';
  if (training.specialMode === 'finalTune') return '各機体の仕上げ対象';
  if (training.weaponLab) {
    const target = weaponsLabLevel(state) >= 3 ? state.weaponsLabControl?.targetWeaponKey : null;
    return `${target ? WEAPON_CATEGORIES[target]?.label ?? target : '現在兵装'}＋連携基礎能力`;
  }
  return `${STAT_GROUPS[training.groupKey]?.label ?? '特殊'}系`;
}

function trainingEffectSummary(training) {
  if (training.specialMode === 'weakest') return '各機体で最も低い基礎グループを補強';
  if (training.specialMode === 'rookieFoundation') return '1年目機体だけを対象に、最も低い基礎グループを底上げ';
  if (training.specialMode === 'favorite') return '各機体の得意グループを重点強化';
  if (training.specialMode === 'reliability') return '能力成長を抑え、信頼性の回復・安定化を優先';
  if (training.specialMode === 'finalTune') return '3年目機体だけを対象に、得意分野を最終仕上げ';
  if (training.weaponLab) {
    const target = weaponsLabLevel(state) >= 3 ? state.weaponsLabControl?.targetWeaponKey : null;
    return `${target ? WEAPON_CATEGORIES[target]?.label ?? target : '現在兵装'}と対応する基礎グループを同時訓練${target ? '（装備変更なし）' : ''}`;
  }
  return `全機体の${STAT_GROUPS[training.groupKey]?.label ?? '特殊'}系が小成長${training.focusStats?.length ? ` / ${training.focusStats.join('・')}を重点強化` : ''}`;
}

function trainingCardAnalysis(training) {
  const level = analysisLevel(state);
  const bits = [];
  if (level >= 1) bits.push(`対象：${trainingTargetLabel(training)}`);
  if (level >= 2) bits.push(`性質：${training.nature ?? '標準'}`);
  if (level >= 3) bits.push(`傾向：${training.stability ?? '安定'}${training.reservedCarryover ? ' / 前ターンから保留' : training.facilityPromotion ? ` / 設備派生（${training.promotedFromLabel}から置換）` : training.advanced ? ' / 上位派生' : ''}`);
  if (level >= 4 && training.risk?.reliability) bits.push('追加：低確率で信頼性低下');
  if (level >= 5) bits.push(`出現：${training.rarity ?? '標準'} / ${training.source ?? '通常'}`);
  return bits.length ? ` / ${bits.join(' / ')}` : '';
}

function renderTrainingChoiceControls() {
  const level = Number(state.facilities?.training ?? 0);
  const labLevel = weaponsLabLevel(state);
  const control = trainingControlState();
  const controls = [];
  if (level >= 2) {
    const reroll = `<button id="training-reroll" class="ghost compact-button" ${control.rerollUsed ? 'disabled' : ''}>${control.rerollUsed ? '候補引き直し済み' : '候補を1回引き直す'}</button>`;
    controls.push(reroll);
    if (level >= 4) {
      const options = state.trainingChoices.map((item) => `<option value="${item.id}" ${control.reserved?.id === item.id ? 'selected' : ''}>${escapeHtml(item.label)} Lv${item.level}</option>`).join('');
      controls.push(`<label class="training-reserve-control"><span>次ターンへ保留</span><select id="training-reserve-select"><option value="">選択...</option>${options}</select><button id="training-reserve" class="ghost compact-button">保留する</button></label>`);
    }
  }
  if (labLevel >= 3) {
    const target = state.weaponsLabControl?.targetWeaponKey ?? '';
    const weaponOptions = Object.entries(WEAPON_CATEGORIES).map(([key, weapon]) => `<option value="${key}" ${target === key ? 'selected' : ''}>${weapon.label}</option>`).join('');
    controls.push(`<label class="training-reserve-control"><span>試験兵装指定</span><select id="weapon-test-target"><option value="">指定なし（現在兵装）</option>${weaponOptions}</select><button id="weapon-test-target-save" class="ghost compact-button">指定</button></label>`);
  }
  if (!controls.length) return '';
  const notes = [];
  if (level >= 2) notes.push(`訓練Lv${level}：引き直し${level >= 4 ? '・1枚保留' : ''}`);
  if (labLevel >= 3) notes.push(`兵装試験場Lv${labLevel}：次に選ぶ兵装試験カードの対象を予約`);
  return `<div class="training-choice-tools">${controls.join('')}<small>${notes.join(' / ')}</small></div>`;
}

function renderTrainingChoices() {
  const lock = trainingLockInfo();
  return state.trainingChoices.map((training) => `
    <button class="training-card ${lock.locked ? 'locked' : ''}" data-training-id="${training.id}" ${lock.locked ? 'disabled aria-disabled="true"' : ''}>
      <span>${training.label}</span>
      <strong>Lv${training.level}</strong>
      <small>${lock.locked ? '大会期間中のため練習停止' : `${trainingEffectSummary(training)}${trainingCardAnalysis(training)}`}</small>
    </button>
  `).join('');
}

function renderBattleDebug(lastBattle) {
  if (!lastBattle) return '';
  const a = state.roster.find((robot) => robot.id === lastBattle.robotAId);
  const b = state.roster.find((robot) => robot.id === lastBattle.robotBId);
  if (!a || !b) return '';
  const result = lastBattle.result;
  const rows = result.comparisons.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.aLabel}</td>
      <td>${item.aValue.toFixed(1)}</td>
      <td>${item.winner === 'a' ? '○' : '×'}</td>
      <td>${item.bValue.toFixed(1)}</td>
      <td>${item.bLabel}</td>
    </tr>
  `).join('');
  return `
    <details class="battle-debug">
      <summary>内部比較を見る（デバッグ）</summary>
      <div class="debug-meta">優勢側勝率 ${(result.favoredChance * 100).toFixed(0)}% / 比較 ${result.aWins}-${result.bWins}</div>
      <table>
        <thead><tr><th>#</th><th>${sName(a)}</th><th>値</th><th></th><th>値</th><th>${sName(b)}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </details>
  `;
}

function renderBattlePanel() {
  const robot = selectedRobot();
  const opponent = battleOpponent();
  if (!robot || !opponent) return '<p>模擬戦を行える機体が足りません。</p>';
  const opponentOptions = state.roster
    .filter((item) => item.id !== robot.id)
    .map((item) => `<option value="${item.id}" ${item.id === opponent.id ? 'selected' : ''}>${item.cohortYear}年目 ${robotLabel(item)} / ${item.weaponName}</option>`)
    .join('');

  const lastBattle = state.lastBattle && state.lastBattle.robotAId === robot.id && state.lastBattle.robotBId === opponent.id
    ? state.lastBattle
    : null;
  const result = lastBattle?.result;
  const outcome = result ? (result.winner === 'a' ? '勝利！' : '敗北……') : '未実施';

  return `
    <div class="battle-setup">
      <div class="battle-unit ally">
        <span class="eyebrow">自機</span>
        <strong>${robotLabel(robot)}</strong>
        <small>${robot.weaponName} / 信頼性 ${robot.reliability}</small>
      </div>
      <div class="versus">VS</div>
      <label class="opponent-select">
        <span class="eyebrow">対戦相手</span>
        <select id="battle-opponent">${opponentOptions}</select>
      </label>
      <button id="battle-button" class="battle-button">模擬戦を実行</button>
    </div>
    <div class="battle-result ${result ? (result.winner === 'a' ? 'win' : 'loss') : ''}">
      <p>${result?.summary ?? '育成した機体同士で9項目比較の模擬戦を行えます。'}</p>
      ${result?.reversalText ? `<p class="reversal">${result.reversalText}</p>` : ''}
      <strong>${outcome}</strong>
      ${result ? `<small>内部比較 ${result.aWins}-${result.bWins}</small>` : ''}
    </div>
    ${renderBattleDebug(lastBattle)}
  `;
}

function robotOption(robot, selected = false) {
  return `<option value="${robot.id}" ${selected ? 'selected' : ''}>${robot.cohortYear}年目 ${robotLabel(robot)} / ${robot.weaponName}</option>`;
}

function renderOfficialSetup(match) {
  const enemyMap = new Map(match.enemyRoster.map((robot) => [robot.id, robot]));
  const researchLevel = Number(state.facilities?.combatResearch ?? 0);
  const rows = match.lineupIds.map((robotId, index) => {
    const enemy = enemyMap.get(match.enemyLineupIds[index]);
    const ally = state.roster.find((robot) => robot.id === robotId);
    const insight = preMatchPairingInsight(ally, enemy, researchLevel);
    const options = state.roster.map((robot) => robotOption(robot, robot.id === robotId)).join('');
    return `
      <div class="lineup-row setup-row">
        <span class="bout-number">${index + 1}</span>
        <div class="lineup-select-wrap">
          <select class="official-lineup-select" data-slot="${index}">${options}</select>
          <div class="lineup-order-buttons">
            <button class="mini-button" data-lineup-move="up" data-slot="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="mini-button" data-lineup-move="down" data-slot="${index}" ${index === match.lineupIds.length - 1 ? 'disabled' : ''}>↓</button>
          </div>
        </div>
        <span class="match-vs">VS</span>
        <div class="enemy-card">
          <strong>${robotLabel(enemy)}</strong>
          <small>${enemy.cohortYear}年目 / ${enemy.weaponName}</small>
          ${insight ? `<small class="pairing-insight">${insight}</small>` : ''}
        </div>
      </div>
    `;
  }).join('');
  const benchCount = state.roster.length - GAME_CONFIG.officialMatchSize;
  return `
    ${match.context?.type === 'tournament' ? `<div class="tournament-match-banner"><b>${match.context.tournamentName}</b><span>${match.context.roundName}</span></div>` : ''}
    <div class="rival-analysis-card"><span class="eyebrow">対戦チーム分析${match.context?.rivalRank ? ` / ${match.context.rivalRank}` : ''}${match.context?.rivalRelationship ? ` / ${match.context.rivalRelationship}` : ''}</span><h3>${match.context?.rivalTeamName ?? '対戦チーム'}</h3>${Number(match.context?.rivalMeetingsBefore ?? 0) > 0 ? `<small>対戦履歴：${match.context.rivalMeetingsBefore}戦 ${match.context.rivalWinsBefore ?? 0}勝 ${match.context.rivalLossesBefore ?? 0}敗 / 因縁度 ${match.context.rivalRivalryPoints ?? 0}</small>` : '<small>初対戦</small>'}<p>${match.context?.rivalAnalysis ?? '分析情報なし'}</p><blockquote>${match.context?.rivalManagerLine ?? ''}</blockquote></div>
    <div class="official-toolbar enhanced">
      <div><strong>15機を選抜</strong><span>補欠 ${Math.max(0, benchCount)}機 / 相手の15機は全て確認可能</span></div>
      <div class="lineup-quick-tools">
        <label>自動選抜<select id="lineup-auto-strategy"><option value="overall">総合評価</option><option value="veteran">3年目優先</option><option value="rookie">新人優先</option><option value="wins">勝利数</option><option value="reliability">信頼性</option></select></label>
        <button id="lineup-auto-apply" class="mini-button">反映</button>
        <label>並び替え<select id="lineup-order-strategy"><option value="strongFirst">強い順</option><option value="weakFirst">弱い順</option><option value="veteranFirst">ベテラン順</option><option value="rookieFirst">新人順</option><option value="winsFirst">勝利数順</option><option value="random">ランダム</option></select></label>
        <button id="lineup-order-apply" class="mini-button">反映</button>
      </div>
      <button id="official-start" class="battle-button">この編成で試合開始</button>
    </div>
    <div class="lineup-list">${rows}</div>
  `;
}

function renderBoutResult(result, ally, enemy) {
  if (!result) return '<span class="bout-state upcoming">未実施</span>';
  const abilityMessages = (result.abilityChanges ?? []).map(describeAbilityChange).filter(Boolean);
  return `
    <div class="bout-result ${result.allyWon ? 'win' : 'loss'}">
      <span>${result.result.summary}</span>
      ${result.result.reversalText ? `<em>${result.result.reversalText}</em>` : ''}
      <strong>${result.allyWon ? '勝利' : '敗北'}</strong>
      <small>${result.result.aWins}-${result.result.bWins}</small>
      ${abilityMessages.length ? `<div class="bout-ability-change">${abilityMessages.map((message) => `<b>${message}</b>`).join('')}</div>` : ''}
    </div>
  `;
}

function renderOfficialRunning(match) {
  const enemyMap = new Map(match.enemyRoster.map((robot) => [robot.id, robot]));
  const resultBySlot = new Map(match.results.map((result) => [result.slot, result]));
  const rows = match.lineupIds.map((robotId, index) => {
    const ally = state.roster.find((robot) => robot.id === robotId);
    const enemy = enemyMap.get(match.enemyLineupIds[index]);
    const result = resultBySlot.get(index);
    const rowState = result ? 'played' : (index === match.currentBout ? 'current' : 'future');
    return `
      <div class="lineup-row match-row ${rowState}">
        <span class="bout-number">${index + 1}</span>
        <div class="match-robot">
          <strong>${ally ? robotLabel(ally) : '---'}</strong>
          <small>${ally?.cohortYear ?? '-'}年目 / ${ally?.weaponName ?? '-'}</small>
        </div>
        <span class="match-vs">VS</span>
        <div class="enemy-card">
          <strong>${robotLabel(enemy)}</strong>
          <small>${enemy.cohortYear}年目 / ${enemy.weaponName}</small>
        </div>
        ${renderBoutResult(result, ally, enemy)}
      </div>
    `;
  }).join('');

  const bench = availableBenchRobots(state, match);
  const futureSlots = match.lineupIds
    .map((id, index) => ({ id, index }))
    .filter((item) => item.index >= match.currentBout);
  const substitution = match.status === 'running' && match.substitutionsRemaining > 0 && bench.length > 0
    ? `
      <div class="substitution-box">
        <div>
          <strong>交代</strong>
          <span>残り${match.substitutionsRemaining}回。未出場枠を補欠機と入れ替えます。</span>
        </div>
        <select id="sub-slot">
          ${futureSlots.map(({ index }) => `<option value="${index}">第${index + 1}戦</option>`).join('')}
        </select>
        <select id="sub-robot">${bench.map((robot) => robotOption(robot)).join('')}</select>
        <button id="substitute-button" class="ghost">交代する</button>
      </div>
    ` : '';

  return `
    <div class="official-scoreboard">
      <div><span>自軍</span><strong>${match.allyWins}</strong></div>
      <p>第${Math.min(match.currentBout + 1, 15)}戦 / 15</p>
      <div><span>相手</span><strong>${match.enemyWins}</strong></div>
      <div class="official-run-actions"><button id="official-next-bout" class="battle-button">第${match.currentBout + 1}戦を実行</button><button id="official-skip-remaining" class="ghost">残りをスキップ</button></div>
    </div>
    ${substitution}
    <div class="lineup-list">${rows}</div>
  `;
}

function renderOfficialComplete(match) {
  const enemyMap = new Map(match.enemyRoster.map((robot) => [robot.id, robot]));
  const rows = match.results.map((result) => {
    const ally = state.roster.find((robot) => robot.id === result.allyId);
    const enemy = enemyMap.get(result.enemyId);
    return `
      <div class="lineup-row match-row played">
        <span class="bout-number">${result.slot + 1}</span>
        <div class="match-robot"><strong>${ally ? sName(ally) : '---'}</strong><small>${ally?.weaponName ?? '-'}</small></div>
        <span class="match-vs">VS</span>
        <div class="enemy-card"><strong>${enemy ? sName(enemy) : '---'}</strong><small>${enemy?.weaponName ?? '-'}</small></div>
        ${renderBoutResult(result, ally, enemy)}
      </div>
    `;
  }).join('');
  return `
    <div class="official-finish ${match.teamWon ? 'win' : 'loss'}">
      <span>最終スコア</span>
      <strong>${match.allyWins} - ${match.enemyWins}</strong>
      <h3>${match.teamWon ? 'チーム勝利！' : 'チーム敗北'}</h3>
      <p>${match.context?.type === 'tournament' ? `${match.context.tournamentName} / ${match.context.roundName}` : `チーム通算 ${state.teamRecord?.wins ?? 0}勝 ${state.teamRecord?.losses ?? 0}敗`}</p>
      ${match.context?.type === 'tournament'
        ? `<button id="official-clear" class="battle-button">大会画面へ戻る</button>`
        : `<div class="finish-actions"><button id="official-clear" class="ghost">結果を閉じる</button><button id="official-new-match" class="battle-button">次の対戦相手を生成</button></div>`}
    </div>
    <div class="lineup-list compact-lineup">${rows}</div>
  `;
}

function renderOfficialMatchPanel() {
  const match = state.officialMatch;
  if (!match) {
    const forced = requiredTournament();
    if (forced) {
      return `<div class="official-empty tournament-waiting"><div><p>${forced.def.name}へ参加する必要があります。</p><small>上の「年間大会」から大会戦を編成してください。大会期間中は団体模擬戦と通常練習を行えません。</small></div></div>`;
    }
    return `
      <div class="official-empty">
        <div>
          <p>大会外で15対15の編成・試合処理を確認するための団体模擬戦です。</p>
          <small>成長・戦績・報酬なし / 1機1戦固定 / 15戦すべて実施 / 試合中3回まで交代可能</small>
        </div>
        <button id="official-prepare" class="battle-button">団体模擬戦を生成</button>
      </div>
    `;
  }
  if (match.status === 'setup') return renderOfficialSetup(match);
  if (match.status === 'running') return renderOfficialRunning(match);
  return renderOfficialComplete(match);
}

function renderEventPanel() {
  const event = state.lastEvent;
  const history = state.eventHistory ?? [];
  if (!event) {
    return `
      <div class="event-empty">
        <p>練習後にランダムイベントが発生します。</p>
        <small>カスタムパーツ、期間限定練習強化、特殊能力、弱点克服、ごく稀に覚醒が発生。</small>
      </div>
    `;
  }
  const target = event.robotId ? state.roster.find((robot) => robot.id === event.robotId) : null;
  return `
    <article class="event-card ${event.awakening ? 'awakening' : ''}">
      <span class="event-type">${event.awakening ? 'レアイベント' : '直近イベント'}</span>
      <h3>${event.title}</h3>
      ${target ? `<strong>${robotLabel(target)}</strong>` : ''}
      <p>${event.description}</p>
    </article>
    <details class="event-history">
      <summary>イベント履歴 ${history.length}件</summary>
      <div>${history.slice(0, 12).map((item) => `<p><b>${item.title}</b><span>${item.description}</span></p>`).join('')}</div>
    </details>
  `;
}

function tournamentStatusLabel(entry, def) {
  if (entry.status === 'locked') return `練習${tournamentAvailableTurn(state, def)}回目から開催`;
  if (entry.status === 'available') return '出場可能';
  if (entry.status === 'active') return `${def.rounds[entry.roundIndex]?.name ?? '次戦'}へ進出`;
  if (entry.status === 'champion') return '優勝';
  if (entry.status === 'eliminated') return '敗退';
  if (entry.status === 'missed') return '不参加';
  return entry.status;
}

function renderTournamentPanel() {
  ensureTournamentYear(state);
  const required = requiredTournament();
  return `
    ${required ? `<div class="tournament-required-banner"><div><span>参加必須</span><strong>${required.def.name}</strong><small>大会期間中のため、決着するまで通常練習は停止しています。</small></div></div>` : ''}
    <div class="tournament-grid">
      ${TOURNAMENT_IDS.map((id) => {
        const def = TOURNAMENTS[id];
        const entry = tournamentEntry(state, id);
        const canStart = ['available', 'active'].includes(entry.status) && !state.officialMatch;
        const currentRound = def.rounds[entry.roundIndex];
        return `
          <article class="tournament-card ${entry.status}">
            <span class="tournament-status">${tournamentStatusLabel(entry, def)}</span>
            <h3>${def.name}</h3>
            <p>${def.description}</p>
            <div class="tournament-progress">
              ${def.rounds.map((round, index) => `<span class="${index < entry.roundIndex || entry.champion ? 'cleared' : index === entry.roundIndex && ['available','active'].includes(entry.status) ? 'current' : ''}">${round.name}</span>`).join('')}
            </div>
            ${canStart ? `<button class="battle-button tournament-start" data-tournament-id="${id}">${entry.status === 'available' ? '大会へ出場' : `${currentRound?.name ?? '次戦'}を編成`}</button>` : ''}
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function facilityNextHint(id, level) {
  const hints = {
    analysis: ['公式戦3勝または3年目でLv1','公式戦10勝または5年目でLv2','大会優勝2回または8年目でLv3','大会優勝4回または11年目でLv4','大会優勝7回または15年目でLv5','最大Lv'],
    training: ['公式戦5勝でLv1','公式戦15勝または優勝でLv2','公式戦25勝または優勝2回でLv3','公式戦40勝または優勝4回でLv4','公式戦60勝または優勝7回でLv5','最大Lv'],
    weaponsLab: ['公式戦4勝でLv1','公式戦12勝でLv2','公式戦24勝または優勝でLv3','公式戦38勝または優勝3回でLv4','公式戦55勝または優勝6回でLv5','最大Lv'],
    combatResearch: ['公式戦2勝でLv1','公式戦8勝でLv2','公式戦18勝または優勝でLv3','公式戦32勝または優勝3回でLv4','公式戦50勝または優勝5回でLv5','最大Lv'],
    logistics: ['売却5機または公式戦8勝でLv1','売却15機または優勝でLv2','売却25機または優勝2回でLv3','売却35機または優勝4回でLv4','売却50機または優勝7回でLv5','最大Lv'],
    archive: ['売却5機または3年目でLv1','売却18機または6年目でLv2','売却30機または8年目でLv3','売却40機または11年目でLv4','売却55機または14年目でLv5','最大Lv'],
  };
  return hints[id]?.[level] ?? '';
}

function renderFacilities() {
  return `
    <div class="facility-grid">
      ${Object.entries(FACILITY_DEFINITIONS).map(([id, def]) => {
        const level = state.facilities?.[id] ?? 0;
        const data = def.levels[level] ?? def.levels.at(-1);
        return `
          <article class="facility-card">
            <div><span>Lv${level}/${def.maxLevel}</span><h3>${def.name}</h3></div>
            <p>${data.description}</p>
            <small>${facilityNextHint(id, level)}</small>
          </article>
        `;
      }).join('')}
    </div>
    <div class="career-strip">
      <span>大会出場 <b>${state.career?.tournamentEntries ?? 0}</b></span>
      <span>大会勝利 <b>${state.career?.tournamentWins ?? 0}</b></span>
      <span>優勝 <b>${state.career?.championships ?? 0}</b></span>
      <span>売却機 <b>${state.career?.totalRetired ?? 0}</b></span>
    </div>
  `;
}

function renderRetirementHistory() {
  const history = state.retirementHistory ?? [];
  if (!history.length) return '<p class="history-empty">まだ3年目機の売却記録はありません。</p>';
  const archive = state.facilities?.archive ?? 0;
  const unlockedLimit = archive >= 3 ? history.length : archive === 2 ? 20 : archive === 1 ? 8 : 3;
  const longPlayLimit = archive >= 3 && !uiState.retirementHistoryExpanded ? Math.min(unlockedLimit, 50) : unlockedLimit;
  const visibleHistory = history.slice(0, longPlayLimit);
  const hiddenCount = Math.max(0, unlockedLimit - visibleHistory.length);
  const rows = visibleHistory.map((item) => {
    const retiredRobot = (state.retired ?? []).find((robot) => robot.id === item.robotId);
    const formal = `${item.manufacturerName} ${state.settings?.seriesLabelMode === 'latin' ? (item.seriesNameLatin ?? item.seriesName) : (item.seriesNameKana ?? item.seriesName)}`;
    const display = retiredRobot ? robotLabel(retiredRobot) : (item.nickname || formal);
    const hall = isHallOfFame(state, item.robotId);
    const best15 = isManualBest15(state, item.robotId);
    return `
    <div class="retirement-row">
      <span>${item.year}年目</span>
      <strong>${display}</strong>
      <small>${item.serial} / ${item.record.wins}勝${item.record.losses}敗</small>
      <em>${escapeHtml((item.careerHighlights ?? (retiredRobot ? robotCareerHighlights(retiredRobot) : [])).join(' / ') || '記録なし')}</em>
      <em>${item.memorialPartName ?? '記念パーツなし'}</em>
      <button class="mini-button hall-toggle" data-retired-id="${item.robotId}">${hall ? '殿堂解除' : '殿堂入り'}</button>
      ${archive >= 5 ? `<button class="mini-button best15-toggle" data-best15-id="${item.robotId}">${best15 ? 'ベスト15解除' : 'ベスト15登録'}</button>` : ''}
    </div>`;
  }).join('');
  const toggle = archive >= 3 && unlockedLimit > 50
    ? `<div class="history-list-footer"><span>${uiState.retirementHistoryExpanded ? `${unlockedLimit}件すべて表示中` : `最新${visibleHistory.length}件を表示 / 残り${hiddenCount}件`}</span><button id="retirement-history-toggle" class="primary-compact">${uiState.retirementHistoryExpanded ? '最新50件に戻す' : '売却履歴をすべて表示'}</button></div>`
    : '';
  return `<div class="retirement-list">${rows}</div>${toggle}`;
}

function renderCareerRecords() {
  const summary = careerRecordSummary(state);
  const extended = extendedCareerRecordSummary(state);
  const topRate = summary.bestWinRate;
  const topRateGames = topRate ? (topRate.record?.wins ?? 0) + (topRate.record?.losses ?? 0) : 0;
  const manufacturerRows = manufacturerRecords(state).slice(0, 8).map((row) => {
    const games = row.wins + row.losses;
    const rate = games ? ((row.wins / games) * 100).toFixed(1) : '---';
    return `<tr><td>${mName({ manufacturerId: row.manufacturerId, manufacturerName: row.manufacturerName })}</td><td>${row.robots}</td><td>${row.wins}-${row.losses}</td><td>${rate}${games ? '%' : ''}</td></tr>`;
  }).join('');
  return `
    <div class="record-highlight-grid">
      <article><span>歴代最多勝</span><strong>${recordRobotName(summary.mostWins)}</strong><b>${summary.mostWins?.record?.wins ?? 0}勝</b></article>
      <article><span>歴代最高勝率</span><strong>${recordRobotName(topRate)}</strong><b>${topRate ? `${(100 * (topRate.record.wins / topRateGames)).toFixed(1)}%` : '---'}</b></article>
      <article><span>最多特殊能力</span><strong>${recordRobotName(summary.mostAbilities)}</strong><b>${summary.mostAbilities?.specialAbilities?.length ?? 0}個</b></article>
      <article><span>歴代最高個別値</span><strong>${recordRobotName(summary.highestStatRobot)}</strong><b>${summary.highestStat ? `${summary.highestStat.label} ${Number(summary.highestStat.value).toFixed(1)}` : '---'}</b></article>
    </div>
    <div class="record-highlight-grid secondary-records">
      <article><span>歴代最多出場</span><strong>${recordRobotName(extended.mostAppearances)}</strong><b>${extended.mostAppearances ? ((extended.mostAppearances.record?.wins ?? 0) + (extended.mostAppearances.record?.losses ?? 0)) : 0}戦</b></article>
      <article><span>最多カスタム</span><strong>${recordRobotName(extended.mostCustomizations)}</strong><b>${extended.mostCustomizations?.customHistory?.length ?? 0}回</b></article>
      <article><span>最多覚醒</span><strong>${recordRobotName(extended.mostAwakenings)}</strong><b>${extended.mostAwakenings?.awakenings?.length ?? 0}回</b></article>
      <article><span>最高信頼性</span><strong>${recordRobotName(extended.highestReliability)}</strong><b>${extended.highestReliability ? Number(extended.highestReliability.reliability ?? 0).toFixed(1) : '---'}</b></article>
    </div>
    <details class="record-table-wrap" open>
      <summary>メーカー別通算成績</summary>
      <table class="record-table"><thead><tr><th>メーカー</th><th>在籍機</th><th>個人戦績</th><th>勝率</th></tr></thead><tbody>${manufacturerRows}</tbody></table>
    </details>
  `;
}

function renderBest15Archive() {
  const level = Number(state.facilities?.archive ?? 0);
  if (level < 5) return '<p class="history-empty">戦績・設計アーカイブLv5で「歴代ベスト15」が解禁されます。</p>';
  state.best15 ??= { manualIds: [], selectedMode: 'overall' };
  const mode = state.best15.selectedMode ?? 'overall';
  const rows = historicalBest15(state, mode);
  const manualCount = state.best15.manualIds?.length ?? 0;
  const options = [`<option value="manual" ${mode==='manual'?'selected':''}>手動登録</option>`, ...BEST15_MODES.map((item)=>`<option value="${item.id}" ${mode===item.id?'selected':''}>自動：${item.label}</option>`)].join('');
  const body = rows.length ? rows.map(({robot, rank}) => {
    const games = Number(robot.record?.wins ?? 0) + Number(robot.record?.losses ?? 0);
    const rate = games ? `${(100 * Number(robot.record?.wins ?? 0) / games).toFixed(1)}%` : '---';
    const peak = highestStatForBest15(robot);
    const highlights = robotCareerHighlights(robot).join(' / ');
    return `<tr><td>${rank}</td><td><strong>${escapeHtml(robotLabel(robot))}</strong><small>${escapeHtml(robot.manufacturerName ?? '')} / ${escapeHtml(robot.seriesNameKana ?? robot.seriesName ?? '')}</small></td><td>${robot.record?.wins ?? 0}勝${robot.record?.losses ?? 0}敗</td><td>${rate}</td><td>${robot.specialAbilities?.length ?? 0}</td><td>${escapeHtml(peak.label)} ${Number(peak.value ?? 0).toFixed(1)}</td><td>${Number(robot.reliability ?? 0).toFixed(1)}</td><td>${escapeHtml(highlights)}</td></tr>`;
  }).join('') : '<tr><td colspan="8">対象となる売却済み機体がまだありません。</td></tr>';
  return `<div class="best15-controls"><label>選出方法<select id="best15-mode">${options}</select></label><span>手動登録 ${manualCount}/15</span><small>手動登録は売却履歴の「ベスト15登録」から変更できます。</small></div><div class="record-table-wrap"><table class="record-table"><thead><tr><th>#</th><th>機体</th><th>戦績</th><th>勝率</th><th>特殊</th><th>最高個別値</th><th>信頼性</th><th>主な記録</th></tr></thead><tbody>${body}</tbody></table></div>`;
}


function renderExhibitionArchive() {
  const level = Number(state.facilities?.archive ?? 0);
  if (level < 5) return '<p class="history-empty">戦績・設計アーカイブLv5で、歴代チームのエキシビション戦が解禁されます。</p>';
  const options = exhibitionTeamOptions(state);
  if (options.length < 2) return '<p class="history-empty">エキシビションには、15機以上の現役チームまたは十分な売却済み機体が必要です。</p>';
  const ids = new Set(options.map((o)=>o.id));
  if (!ids.has(uiState.exhibitionLeft)) uiState.exhibitionLeft = options[0].id;
  if (!ids.has(uiState.exhibitionRight) || uiState.exhibitionRight === uiState.exhibitionLeft) uiState.exhibitionRight = options.find((o)=>o.id!==uiState.exhibitionLeft)?.id ?? options[0].id;
  const optHtml = (selected)=>options.map((o)=>`<option value="${escapeHtml(o.id)}" ${o.id===selected?'selected':''}>${escapeHtml(o.label)}</option>`).join('');
  const last = state.lastExhibition;
  const lastHtml = last ? `<div class="exhibition-result"><strong>${escapeHtml(last.leftLabel)} ${last.leftWins} - ${last.rightWins} ${escapeHtml(last.rightLabel)}</strong><span>${last.leftWins > last.rightWins ? escapeHtml(last.leftLabel) : escapeHtml(last.rightLabel)} 勝利</span></div>` : '<p class="history-empty compact">まだエキシビション戦は行われていません。</p>';
  const history = exhibitionHistoryRows(state).slice(0,10);
  const historyHtml = history.length ? `<div class="record-table-wrap"><table class="record-table"><thead><tr><th>年</th><th>左</th><th>結果</th><th>右</th></tr></thead><tbody>${history.map((r)=>`<tr><td>${r.year}</td><td>${escapeHtml(r.leftLabel)}</td><td><strong>${r.leftWins}-${r.rightWins}</strong></td><td>${escapeHtml(r.rightLabel)}</td></tr>`).join('')}</tbody></table></div>` : '';
  return `<div class="best15-controls exhibition-controls"><label>左チーム<select id="exhibition-left">${optHtml(uiState.exhibitionLeft)}</select></label><label>右チーム<select id="exhibition-right">${optHtml(uiState.exhibitionRight)}</select></label><button id="run-exhibition" class="primary-compact">15対15で対戦</button><small>能力成長・戦績・特殊能力獲得は発生しない記録用の模擬戦です。</small></div>${lastHtml}${historyHtml}`;
}

function highestStatForBest15(robot) {
  let best = { value:-Infinity, label:'---' };
  for (const group of Object.values(robot.stats ?? {})) for (const [label,value] of Object.entries(group ?? {})) if (Number(value) > best.value) best = { value:Number(value), label };
  for (const [axis,value] of Object.entries(robot.weaponStats ?? {})) if (Number(value) > best.value) best = { value:Number(value), label:WEAPON_CATEGORIES[robot.weaponKey]?.stats?.[axis] ?? '兵装能力' };
  if (!Number.isFinite(best.value)) return { value:0, label:'---' };
  return best;
}

function renderRivalArchive() {
  const level = Number(state.facilities?.archive ?? 0);
  if (level < 3) return '<p class="history-empty">戦績・設計アーカイブLv3で、対戦相手との因縁記録を閲覧できます。</p>';
  const rows = rivalArchiveRows(state);
  if (!rows.length) return '<p class="history-empty">まだ記録されたライバル対戦はありません。</p>';
  const baseLimit = level >= 5 ? rows.length : level >= 4 ? 20 : 8;
  const renderLimit = level >= 5 && !uiState.rivalArchiveExpanded ? Math.min(baseLimit, 40) : baseLimit;
  const visible = rows.slice(0, renderLimit);
  const hiddenCount = Math.max(0, baseLimit - visible.length);
  const body = visible.map(({ team, entry, tier }) => {
    const games = Number(entry.meetings ?? 0);
    const detail = level >= 5
      ? `${entry.closeGames ?? 0}僅差 / 大会${entry.tournamentMeetings ?? 0}戦 / 決勝${entry.finalMeetings ?? 0}戦 / 優勝阻止${entry.titleDenied ?? 0}回`
      : `${entry.lastTournamentName || '通常戦'} ${entry.lastRoundName || ''} / 前回 ${entry.lastScore || '---'} ${entry.lastResult === 'W' ? '勝' : entry.lastResult === 'L' ? '敗' : ''}`;
    return `<tr><td><strong>${escapeHtml(team.name)}</strong><small>${escapeHtml(team.rankLabel ?? '')}</small></td><td>${tier.label || '対戦記録'}</td><td>${games}戦 ${entry.wins ?? 0}勝${entry.losses ?? 0}敗</td><td>${entry.rivalryPoints ?? 0}</td><td>${escapeHtml(detail)}</td></tr>`;
  }).join('');
  return `<div class="record-highlight-grid">
    <article><span>記録済みライバル</span><strong>${rows.length}チーム</strong><b>対戦履歴を保存</b></article>
    <article><span>宿敵以上</span><strong>${rows.filter((row)=>row.tier.rank>=3).length}チーム</strong><b>因縁度10以上</b></article>
    <article><span>最大の宿敵</span><strong>${rows.filter((row)=>row.tier.rank>=4).length}チーム</strong><b>因縁度20以上</b></article>
  </div><div class="record-table-wrap long-record-table"><table class="record-table"><thead><tr><th>チーム</th><th>関係</th><th>通算</th><th>因縁度</th><th>${level >= 5 ? '詳細因縁' : '直近対戦'}</th></tr></thead><tbody>${body}</tbody></table></div>${level >= 5 && rows.length > 40 ? `<div class="history-list-footer"><span>${uiState.rivalArchiveExpanded ? `${rows.length}チームすべて表示中` : `上位${visible.length}チームを表示 / 残り${hiddenCount}チーム`}</span><button id="rival-archive-toggle" class="primary-compact">${uiState.rivalArchiveExpanded ? '上位40件に戻す' : 'ライバル記録をすべて表示'}</button></div>` : ''}`;
}

function renderSeriesEncyclopedia() {
  const rows = seriesRecords(state);
  const summary = seriesDiscoverySummary(state, rows);
  const statusLabel = { seen:'遭遇', joined:'加入', retired:'育成完了', hall:'殿堂', unseen:'未発見' };
  const joinedStatuses = new Set(['joined','retired','hall']);
  const catalogFullUnlock = Boolean(state.settings?.seriesCatalogFullUnlock);
  const makerMap = new Map(MANUFACTURERS.map((maker) => [maker.id, maker]));
  const makerDexName = (maker) => state.settings?.manufacturerLabelMode === 'original' ? (maker?.originalName ?? maker?.name ?? '') : (maker?.name ?? '');
  const generationOf = (row) => Number(row.seriesNumber ?? 1) >= 201 ? 11 : Math.max(1, Math.ceil(Number(row.seriesNumber ?? 1) / 20));
  const visibleName = (row) => state.settings?.seriesLabelMode === 'latin' ? row.nameLatin : row.nameKana;
  const growthOptions = [...new Map(rows.filter((row) => row.joined > 0 || catalogFullUnlock).map((row) => [row.profile?.growthCurveId, row.profile?.growthCurve?.label]).filter(([id,label]) => id && label)).entries()]
    .sort((a,b)=>String(a[1]).localeCompare(String(b[1]), 'ja'));
  const customOptions = [...new Map(rows.filter((row) => row.joined > 0 || catalogFullUnlock).map((row) => [row.profile?.customAptitudeId, row.profile?.customAptitude?.label]).filter(([id,label]) => id && label)).entries()]
    .sort((a,b)=>String(a[1]).localeCompare(String(b[1]), 'ja'));

  const selector = `<div class="series-dex-toolbar series-dex-toolbar-advanced">
    <label>メーカー<select id="series-dex-maker"><option value="all" ${uiState.seriesDexManufacturer === 'all' ? 'selected' : ''}>全メーカー</option>${MANUFACTURERS.map((maker) => `<option value="${maker.id}" ${uiState.seriesDexManufacturer === maker.id ? 'selected' : ''}>${escapeHtml(makerDexName(maker))}</option>`).join('')}</select></label>
    <label class="series-dex-search-field">シリーズ検索<div><input id="series-dex-search" type="search" value="${escapeHtml(uiState.seriesDexSearch)}" placeholder="名称・思想・特徴"><button type="button" id="series-dex-search-apply" class="mini-button">検索</button></div></label>
    <label>発見状況<select id="series-dex-discovery"><option value="all" ${uiState.seriesDexDiscovery==='all'?'selected':''}>すべて</option><option value="discovered" ${uiState.seriesDexDiscovery==='discovered'?'selected':''}>発見済み</option><option value="unseen" ${uiState.seriesDexDiscovery==='unseen'?'selected':''}>未発見</option><option value="seen" ${uiState.seriesDexDiscovery==='seen'?'selected':''}>遭遇のみ</option><option value="joined" ${uiState.seriesDexDiscovery==='joined'?'selected':''}>自軍加入済み</option><option value="completed" ${uiState.seriesDexDiscovery==='completed'?'selected':''}>育成完了</option><option value="hall" ${uiState.seriesDexDiscovery==='hall'?'selected':''}>殿堂</option></select></label>
    <label>世代<select id="series-dex-generation"><option value="all" ${uiState.seriesDexGeneration==='all'?'selected':''}>全世代</option>${[1,2,3,4,5,6,7,8,9,10,11].map((g)=>`<option value="${g}" ${String(uiState.seriesDexGeneration)===String(g)?'selected':''}>第${g}世代 (#${(g-1)*20+1}～${g===11?223:g*20})</option>`).join('')}</select></label>
    <label>成長曲線<select id="series-dex-growth"><option value="all" ${uiState.seriesDexGrowth==='all'?'selected':''}>すべて</option>${growthOptions.map(([id,label])=>`<option value="${id}" ${uiState.seriesDexGrowth===id?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select></label>
    <label>カスタム適性<select id="series-dex-custom"><option value="all" ${uiState.seriesDexCustom==='all'?'selected':''}>すべて</option>${customOptions.map(([id,label])=>`<option value="${id}" ${uiState.seriesDexCustom===id?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select></label>
    <label>並び順<select id="series-dex-sort"><option value="number" ${uiState.seriesDexSort==='number'?'selected':''}>シリーズ番号</option><option value="name" ${uiState.seriesDexSort==='name'?'selected':''}>シリーズ名</option><option value="discovery" ${uiState.seriesDexSort==='discovery'?'selected':''}>発見段階</option><option value="wins" ${uiState.seriesDexSort==='wins'?'selected':''}>通算勝利</option><option value="winrate" ${uiState.seriesDexSort==='winrate'?'selected':''}>勝率</option><option value="average" ${uiState.seriesDexSort==='average'?'selected':''}>平均総合評価</option><option value="best" ${uiState.seriesDexSort==='best'?'selected':''}>最高総合評価</option></select></label>
    <button type="button" id="series-dex-clear" class="ghost compact-button series-dex-clear">条件クリア</button><button type="button" id="series-dex-unlock-all" class="compact-button">${catalogFullUnlock ? 'カタログ全開放済み' : 'カタログ全開放'}</button>
  </div>
  <p class="series-dex-help">${catalogFullUnlock ? 'カタログ全開放中：全系列の名称・成長曲線・カスタム適性・設計説明文を閲覧できます。戦績や加入・殿堂実績は実プレイ記録のままです。' : '名称検索は発見済み系列だけが対象です。成長曲線・カスタム適性・設計説明文は自軍加入で解析されます。'}</p>`;

  const summaryHtml = `<div class="series-dex-summary"><div><span>発見</span><strong>${summary.discovered}</strong><small>/ ${summary.total}</small></div><div><span>遭遇のみ</span><strong>${summary.seen}</strong></div><div><span>自軍加入</span><strong>${summary.joined + summary.retired + summary.hall}</strong></div><div><span>育成完了</span><strong>${summary.retired + summary.hall}</strong></div><div><span>殿堂</span><strong>${summary.hall}</strong></div></div>`;

  const search = String(uiState.seriesDexSearch ?? '').trim().toLocaleLowerCase('ja');
  const hasAdvancedFilter = Boolean(search || uiState.seriesDexDiscovery !== 'all' || uiState.seriesDexGeneration !== 'all' || uiState.seriesDexGrowth !== 'all' || uiState.seriesDexCustom !== 'all' || uiState.seriesDexSort !== 'number');
  let filteredRows = rows.filter((row) => uiState.seriesDexManufacturer === 'all' || row.manufacturerId === uiState.seriesDexManufacturer);
  filteredRows = filteredRows.filter((row) => {
    if (uiState.seriesDexDiscovery === 'discovered' && row.discovery === 'unseen') return false;
    if (uiState.seriesDexDiscovery === 'unseen' && row.discovery !== 'unseen') return false;
    if (uiState.seriesDexDiscovery === 'seen' && row.discovery !== 'seen') return false;
    if (uiState.seriesDexDiscovery === 'joined' && !joinedStatuses.has(row.discovery)) return false;
    if (uiState.seriesDexDiscovery === 'completed' && !['retired','hall'].includes(row.discovery)) return false;
    if (uiState.seriesDexDiscovery === 'hall' && row.discovery !== 'hall') return false;
    if (uiState.seriesDexGeneration !== 'all' && generationOf(row) !== Number(uiState.seriesDexGeneration)) return false;
    if (uiState.seriesDexGrowth !== 'all' && !((row.joined > 0 || catalogFullUnlock) && row.profile?.growthCurveId === uiState.seriesDexGrowth)) return false;
    if (uiState.seriesDexCustom !== 'all' && !((row.joined > 0 || catalogFullUnlock) && row.profile?.customAptitudeId === uiState.seriesDexCustom)) return false;
    if (search) {
      if (row.discovery === 'unseen' && !catalogFullUnlock) return false;
      const maker = makerMap.get(row.manufacturerId);
      const basic = [visibleName(row), row.nameKana, row.nameLatin, maker?.name, maker?.nameEn, row.seriesNumber].join(' ').toLocaleLowerCase('ja');
      const deep = (row.joined > 0 || catalogFullUnlock) ? [row.profile?.summary, row.profile?.creatorIntent, row.profile?.companionAppeal, row.profile?.signatureScene, row.profile?.creatorNonnegotiable, row.profile?.creatorQuirk, row.profile?.creatorFirstDecision, row.profile?.privateUsePriority, row.profile?.appealHook, row.profile?.marketPosition, row.profile?.concept, row.profile?.namingConcept, row.profile?.developmentBackground, row.profile?.engineeringNotes, row.profile?.trainingNotes, row.profile?.weaponDoctrine, row.profile?.intrinsicTrait?.label, row.profile?.growthCurve?.label, row.profile?.customAptitude?.label].join(' ').toLocaleLowerCase('ja') : '';
      if (!`${basic} ${deep}`.includes(search)) return false;
    }
    return true;
  });

  const discoveryRank = { hall:5, retired:4, joined:3, seen:2, unseen:1 };
  filteredRows.sort((a,b) => {
    if (uiState.seriesDexSort === 'name') return String(visibleName(a)).localeCompare(String(visibleName(b)), 'ja');
    if (uiState.seriesDexSort === 'discovery') return (discoveryRank[b.discovery] ?? 0) - (discoveryRank[a.discovery] ?? 0) || b.joined-a.joined;
    if (uiState.seriesDexSort === 'wins') return b.wins-a.wins || b.joined-a.joined;
    if (uiState.seriesDexSort === 'winrate') { const ar=a.wins/Math.max(1,a.wins+a.losses), br=b.wins/Math.max(1,b.wins+b.losses); return br-ar || (b.wins+b.losses)-(a.wins+a.losses); }
    if (uiState.seriesDexSort === 'average') return b.averageOverall-a.averageOverall || b.joined-a.joined;
    if (uiState.seriesDexSort === 'best') return b.bestOverall-a.bestOverall || b.joined-a.joined;
    const makerA = MANUFACTURERS.findIndex((m)=>m.id===a.manufacturerId), makerB = MANUFACTURERS.findIndex((m)=>m.id===b.manufacturerId);
    return makerA-makerB || a.seriesNumber-b.seriesNumber;
  });

  const renderRow = (row, includeMaker = false) => {
    const maker = makerMap.get(row.manufacturerId);
    const makerDisplay = state.settings?.manufacturerLabelMode === 'original' ? (maker?.originalName ?? maker?.name ?? row.manufacturerId) : (maker?.name ?? row.manufacturerId);
    const makerLabel = includeMaker ? `${escapeHtml(makerDisplay)} / ` : '';
    if (row.discovery === 'unseen' && !catalogFullUnlock) return `<div class="series-dex-row unseen"><span class="series-dex-status">未発見</span><strong>${makerLabel}#${row.seriesNumber} ???</strong><small>第${generationOf(row)}世代 / 未解析</small><em>大会・新人加入で発見</em></div>`;
    const games=row.wins+row.losses; const rate=games?`${(row.wins/games*100).toFixed(1)}%`:'---';
    const visibleDeep = row.joined > 0 || catalogFullUnlock;
    const displayStatus = row.discovery === 'unseen' && catalogFullUnlock ? 'カタログ開放' : statusLabel[row.discovery];
    const seriesName = visibleName(row);
    if (!visibleDeep) return `<div class="series-dex-row ${row.discovery}"><span class="series-dex-status">${displayStatus}</span><strong>${makerLabel}#${row.seriesNumber} ${escapeHtml(seriesName)}</strong><small>第${generationOf(row)}世代 / 詳細は自軍加入で解析</small><em>遭遇 ${row.encounters}回</em></div>`;
    const lore = row.profile ?? {};
    return `<details class="series-dex-expand ${row.discovery}">
      <summary class="series-dex-row"><span class="series-dex-status">${displayStatus}</span><strong>${makerLabel}#${row.seriesNumber} ${escapeHtml(seriesName)}</strong><small>第${generationOf(row)}世代 / ${escapeHtml(lore.marketPosition ?? '')} / ${escapeHtml(lore.growthCurve?.label ?? '')} / ${escapeHtml(lore.customAptitude?.label ?? '')}</small><em>加入${row.joined} / ${row.wins}-${row.losses} / 勝率${rate} / 平均${row.averageOverall.toFixed(1)} / 最高${row.bestOverall.toFixed(1)}${row.hall ? ` / 殿堂${row.hall}` : ''}</em></summary>
      <div class="series-dex-lore">
        <p><b>系列要約</b>${escapeHtml(lore.summary ?? '')}</p>
        ${lore.creatorProfile?.creator ? `<p><b>クリエイター</b>${escapeHtml(lore.creatorProfile.creator)} / ${escapeHtml(lore.creatorProfile.profession ?? '')} / 偏愛：${escapeHtml(lore.creatorProfile.obsession ?? '')}</p>` : ''}
        ${lore.creatorIntent ? `<p><b>作者の理想</b>${escapeHtml(lore.creatorIntent)}</p>` : ''}
        ${lore.companionAppeal ? `<p><b>セクサロイドとしての魅力</b>${escapeHtml(lore.companionAppeal)}</p>` : ''}
        ${lore.appealHook ? `<p><b>この作品の刺さりどころ</b>${escapeHtml(lore.appealHook)}</p>` : ''}
        ${lore.signatureScene ? `<p><b>代表シーン</b>${escapeHtml(lore.signatureScene)}</p>` : ''}
        ${lore.creatorNonnegotiable ? `<p><b>作者が譲らない条件</b>${escapeHtml(lore.creatorNonnegotiable)}</p>` : ''}
        ${lore.creatorQuirk ? `<p><b>作品固有の癖</b>${escapeHtml(lore.creatorQuirk)}</p>` : ''}
        ${lore.creatorFirstDecision ? `<p><b>作者が最初に決めたこと</b>${escapeHtml(lore.creatorFirstDecision)}</p>` : ''}
        ${lore.privateUsePriority ? `<p><b>私物としての実用思想</b>${escapeHtml(lore.privateUsePriority)}</p>` : ''}
        ${lore.namingConcept ? `<p><b>名称と設計モチーフ</b>${escapeHtml(lore.namingConcept)}</p>` : ''}
        ${lore.developmentBackground ? `<p><b>開発背景</b>${escapeHtml(lore.developmentBackground)}</p>` : ''}
        ${lore.engineeringNotes ? `<p><b>設計上の癖</b>${escapeHtml(lore.engineeringNotes)}</p>` : ''}
        ${lore.trainingNotes ? `<p><b>育成・改修</b>${escapeHtml(lore.trainingNotes)}</p>` : ''}
        ${lore.weaponDoctrine ? `<p><b>兵装ドクトリン</b>${escapeHtml(lore.weaponDoctrine)}</p>` : ''}
      </div>
    </details>`;
  };

  const makerCompareStats = (makerId) => {
    const maker = makerMap.get(makerId) ?? MANUFACTURERS[0];
    const makerRows = rows.filter((row)=>row.manufacturerId===maker.id);
    const joinedRows = makerRows.filter((row)=>row.joined>0);
    const units = joinedRows.reduce((sum,row)=>sum+row.joined,0);
    const wins = joinedRows.reduce((sum,row)=>sum+row.wins,0);
    const losses = joinedRows.reduce((sum,row)=>sum+row.losses,0);
    const totalOverall = joinedRows.reduce((sum,row)=>sum+Number(row.totalOverall??0),0);
    const best = [...joinedRows].sort((a,b)=>b.bestOverall-a.bestOverall)[0];
    const modeLabel = (getter) => {
      const count = new Map();
      for (const row of joinedRows) { const value=getter(row); if (!value) continue; count.set(value,(count.get(value)??0)+1); }
      return [...count.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '未解析';
    };
    return {
      maker,
      total:makerRows.length,
      discovered:makerRows.filter((row)=>row.discovery!=='unseen').length,
      joinedSeries:joinedRows.length,
      completed:makerRows.filter((row)=>['retired','hall'].includes(row.discovery)).length,
      hall:makerRows.filter((row)=>row.discovery==='hall').length,
      units,wins,losses,
      winRate:wins+losses ? wins/(wins+losses)*100 : null,
      average:units ? totalOverall/units : null,
      best,
      growth:modeLabel((row)=>row.profile?.growthCurve?.label),
      custom:modeLabel((row)=>row.profile?.customAptitude?.label),
      trait:modeLabel((row)=>row.profile?.intrinsicTrait?.label),
    };
  };
  const compareCard = (stats, side) => `<article class="series-maker-compare-card ${side}"><span>${escapeHtml(stats.maker.theme)}系メーカー</span><h4>${escapeHtml(makerDexName(stats.maker))}</h4><p>${escapeHtml(stats.maker.philosophy)}</p><div class="series-maker-compare-metrics"><div><small>発見</small><strong>${stats.discovered}/${stats.total}</strong></div><div><small>加入系列</small><strong>${stats.joinedSeries}</strong></div><div><small>育成完了</small><strong>${stats.completed}</strong></div><div><small>殿堂</small><strong>${stats.hall}</strong></div><div><small>自軍機体</small><strong>${stats.units}</strong></div><div><small>通算勝率</small><strong>${stats.winRate===null?'---':`${stats.winRate.toFixed(1)}%`}</strong></div><div><small>平均総合</small><strong>${stats.average===null?'---':stats.average.toFixed(1)}</strong></div><div><small>最高総合</small><strong>${stats.best?stats.best.bestOverall.toFixed(1):'---'}</strong></div></div><dl><div><dt>よく育てた成長曲線</dt><dd>${escapeHtml(stats.growth)}</dd></div><div><dt>よく育てた改修適性</dt><dd>${escapeHtml(stats.custom)}</dd></div><div><dt>よく見た固有特性</dt><dd>${escapeHtml(stats.trait)}</dd></div>${stats.best?`<div><dt>最高系列</dt><dd>${escapeHtml(visibleName(stats.best))} / ${escapeHtml(stats.best.bestRobotName||'---')}</dd></div>`:''}</dl></article>`;
  const compareA = makerCompareStats(uiState.seriesCompareMakerA || MANUFACTURERS[0]?.id);
  const compareB = makerCompareStats(uiState.seriesCompareMakerB || MANUFACTURERS[1]?.id || MANUFACTURERS[0]?.id);
  const compareHtml = `<details class="series-maker-compare" open><summary>メーカー比較</summary><div class="series-maker-compare-controls"><label>比較A<select id="series-compare-a">${MANUFACTURERS.map((maker)=>`<option value="${maker.id}" ${compareA.maker.id===maker.id?'selected':''}>${escapeHtml(makerDexName(maker))}</option>`).join('')}</select></label><b>比較</b><label>比較B<select id="series-compare-b">${MANUFACTURERS.map((maker)=>`<option value="${maker.id}" ${compareB.maker.id===maker.id?'selected':''}>${escapeHtml(makerDexName(maker))}</option>`).join('')}</select></label></div><div class="series-maker-compare-grid">${compareCard(compareA,'a')}${compareCard(compareB,'b')}</div><small class="series-maker-compare-note">比較値はあなたのセーブ内で実際に加入・育成した機体の実績。未加入系列の内部性能は比較に使用しません。</small></details>`;

  if (uiState.seriesDexManufacturer === 'all' && !hasAdvancedFilter) {
    const makerProgress = MANUFACTURERS.map((maker) => {
      const makerRows = rows.filter((row) => row.manufacturerId === maker.id);
      const discovered = makerRows.filter((row) => row.discovery !== 'unseen').length;
      const joined = makerRows.filter((row) => joinedStatuses.has(row.discovery)).length;
      return `<button type="button" class="series-dex-progress-card" data-series-maker="${maker.id}"><strong>${escapeHtml(makerDexName(maker))}</strong><span>${discovered}/${makerRows.length} 発見</span><small>自軍加入 ${joined}系列</small><i><b style="width:${Math.min(100, discovered / Math.max(1, makerRows.length) * 100)}%"></b></i></button>`;
    }).join('');
    return `${selector}${summaryHtml}${compareHtml}<div class="series-dex-progress-grid">${makerProgress}</div>`;
  }

  const totalMatches = filteredRows.length;
  const displayRows = filteredRows.slice(0, 300);
  const includeMaker = uiState.seriesDexManufacturer === 'all';
  const listHtml = displayRows.map((row)=>renderRow(row, includeMaker)).join('') || '<p class="history-empty">条件に一致するシリーズはありません。</p>';
  const truncation = totalMatches > displayRows.length ? `<small class="series-dex-result-limit">結果が多いため先頭300件を表示しています。メーカー・世代・発見状況などでさらに絞り込めます。</small>` : '';
  const resultHead = `<div class="series-dex-result-head"><strong>${totalMatches}系列</strong><span>${includeMaker?'全メーカー検索':'メーカー内検索'} / 最大300件表示</span></div>`;
  if (uiState.seriesDexManufacturer === 'all') return `${selector}${summaryHtml}${compareHtml}${resultHead}${truncation}<div class="series-dex-full-list global-results">${listHtml}</div>`;

  const maker = makerMap.get(uiState.seriesDexManufacturer) ?? MANUFACTURERS[0];
  const makerRows = rows.filter((row)=>row.manufacturerId===maker.id);
  const found = makerRows.filter((row)=>row.discovery!=='unseen').length;
  return `${selector}${summaryHtml}<div class="series-dex-maker-header"><div><span>${escapeHtml(maker.theme)}系メーカー</span><strong>${escapeHtml(makerDexName(maker))}</strong><small>${escapeHtml(maker.philosophy)}</small></div><b>${found}/${makerRows.length}</b></div>${resultHead}${truncation}<div class="series-dex-full-list">${listHtml}</div>`;
}
function renderHallOfFame() {
  const entries = state.hallOfFame ?? [];
  if (!entries.length) return '<p class="history-empty">殿堂入り機体はまだありません。売却履歴から任意の機体を登録できます。</p>';
  return `<div class="hall-list">${entries.map((entry) => {
    const robot = entry.snapshot ?? (state.retired ?? []).find((item) => item.id === entry.robotId);
    if (!robot) return '';
    return `
      <article class="hall-card hall-card-detailed">
        <div class="hall-card-header"><div><span>殿堂入り ${entry.inductedYear}年目</span><strong>${robotLabel(robot)}</strong><small>${robot.serial} / ${robot.record?.wins ?? 0}勝${robot.record?.losses ?? 0}敗 / 特殊能力${robot.specialAbilities?.length ?? 0}個</small></div><div class="hall-actions"><button class="mini-button hall-memo" data-hall-id="${entry.robotId}">メモ編集</button><button class="mini-button hall-remove" data-hall-id="${entry.robotId}">殿堂解除</button></div></div>
        <p>${escapeHtml(entry.memo || 'メモなし')}</p>
        <details class="hall-snapshot-details"><summary>保存された機体データを見る</summary>${renderHallSnapshotDetails(robot)}</details>
      </article>`;
  }).join('')}</div>`;
}

function renderTournamentHistory() {
  const completed = [...(state.tournamentHistory ?? [])].slice().reverse();
  if (!completed.length) return '<p class="history-empty">年度完了後、ここに大会履歴が蓄積されます。</p>';
  return `<div class="year-history-list">${completed.slice(0, 12).map((yearState) => {
    const results = TOURNAMENT_IDS.map((id) => {
      const entry = yearState.entries?.[id];
      const def = TOURNAMENTS[id];
      const label = entry?.champion ? '優勝' : entry?.status === 'eliminated' ? `${entry.wins ?? 0}勝で敗退` : entry?.status === 'missed' ? '不参加' : `${entry?.wins ?? 0}勝`;
      return `<span><b>${def.shortName}</b>${label}</span>`;
    }).join('');
    return `<div class="year-history-row"><strong>${yearState.year}年目</strong><div>${results}</div></div>`;
  }).join('')}</div>`;
}


function renderStatusGuide() {
  const groupSections = GROUP_KEYS.map((groupKey) => {
    const group = STAT_GROUPS[groupKey];
    return `<details class="status-guide-group"><summary><strong>${group.label}</strong><span>${escapeHtml(GROUP_GUIDE[groupKey] ?? '')}</span></summary><div>${group.stats.map((statName) => `<article><b>${statName}</b><p>${escapeHtml(STAT_GUIDE[statName] ?? '')}</p></article>`).join('')}</div></details>`;
  }).join('');
  const axisLabels = { power:'出力・威力', accuracy:'精度', control:'兵装制御', response:'応答', stability:'安定性', efficiency:'効率・固有運用' };
  return `
    <details class="status-guide" id="status-guide" ${uiState.statusGuideOpen ? 'open' : ''}>
      <summary><div><p class="eyebrow">能力解説</p><strong>ステータス・戦闘指標を詳しく見る</strong><span>総合評価、信頼性、基礎41項目、兵装6軸、耐性、戦闘時の使われ方</span></div><b>開く</b></summary>
      <div class="status-guide-body">
        <section class="status-guide-system"><h3>まず知っておきたい指標</h3><div>${SYSTEM_GUIDE.map((item) => `<article><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.text)}</p></article>`).join('')}</div></section>
        <section><h3>基礎能力 7グループ / 41項目</h3><p class="status-guide-lead">レーダーチャートは各グループ内の個別能力平均です。戦闘では全41項目を毎回使うのではなく、機体・兵装・相性に応じて一部が比較対象になります。</p><div class="status-guide-groups">${groupSections}</div></section>
        <section><h3>兵装適性の6軸</h3><div class="status-guide-axis-grid">${Object.entries(WEAPON_AXIS_GUIDE).map(([axis, text]) => `<article><strong>${axisLabels[axis] ?? axis}</strong><p>${escapeHtml(text)}</p></article>`).join('')}</div><p class="status-guide-lead">12兵装はすべてこの6軸を持ちますが、表示名は兵装に合わせて変化します。装備していない兵装の値と成長倍率も機体ごとに保持されます。</p></section>
        <section><h3>耐性</h3><div class="status-guide-resistance-grid">${RESISTANCE_STATS.map((name) => `<article><strong>${name}</strong><p>${escapeHtml(RESISTANCE_GUIDE[name] ?? '')}</p></article>`).join('')}</div></section>
      </div>
    </details>`;
}

function renderSettingsPanel() {
  state.settings = normalizeSettings(state.settings);
  const settings = state.settings;
  const locked = state.officialMatch?.status === 'running';
  const trainingLocked = state.turn !== 1 || locked;
  const custom = settings.customUpset;
  const pwa = pwaInstallState();
  return `
    <div class="pwa-install-card">
      <div class="pwa-install-copy">
        <p class="eyebrow">アプリ版</p>
        <strong>${pwa.standalone ? 'アプリとして起動中' : 'スマホのホーム画面に追加'}</strong>
        <span>${escapeHtml(pwaInstallMessage(pwa))}</span>
      </div>
      <div class="pwa-install-actions">
        ${pwa.promptAvailable && !pwa.standalone ? '<button id="pwa-install-button" class="primary-compact">アプリをインストール</button>' : ''}
        ${pwa.ios && !pwa.standalone ? '<small>iPhone/iPadはSafariの共有メニューを使用します。</small>' : ''}
        ${pwa.standalone ? '<span class="pwa-installed-badge">インストール済み</span>' : ''}
      </div>
    </div>
    <div class="settings-grid">
      <label><span>成長適性表示</span><select id="setting-growth-mode"><option value="facility" ${settings.growthMode === 'facility' ? 'selected' : ''}>設備準拠</option><option value="visible" ${settings.growthMode === 'visible' ? 'selected' : ''}>常時表示</option><option value="hidden" ${settings.growthMode === 'hidden' ? 'selected' : ''}>非表示</option></select></label>
      <label><span>シリーズ名表記</span><select id="setting-series-label"><option value="kana" ${settings.seriesLabelMode === 'kana' ? 'selected' : ''}>カタカナ/日本語</option><option value="latin" ${settings.seriesLabelMode === 'latin' ? 'selected' : ''}>英字/ローマ字</option></select></label>
      <label><span>メーカー名表記</span><select id="setting-manufacturer-label"><option value="localized" ${settings.manufacturerLabelMode === 'localized' ? 'selected' : ''}>日本語表記</option><option value="original" ${settings.manufacturerLabelMode === 'original' ? 'selected' : ''}>原語/英字表記</option></select></label>
      <label><span>イベント頻度</span><select id="setting-event-frequency"><option value="low" ${settings.eventFrequency === 'low' ? 'selected' : ''}>少ない</option><option value="standard" ${settings.eventFrequency === 'standard' ? 'selected' : ''}>標準</option><option value="high" ${settings.eventFrequency === 'high' ? 'selected' : ''}>多い</option></select></label>
      <label><span>年間練習回数</span><select id="setting-training-turns" ${trainingLocked ? 'disabled' : ''}>${[12,24,36,48,60].map((turns) => `<option value="${turns}" ${settings.trainingTurns === turns ? 'selected' : ''}>${turns}回</option>`).join('')}</select><small>${trainingLocked ? '年度途中では変更不可' : '12回刻み / 最大60回。年度開始時のみ変更可能'}</small></label>
      <label><span>番狂わせ</span><select id="setting-upset-mode" ${locked ? 'disabled' : ''}><option value="ability" ${settings.upsetMode === 'ability' ? 'selected' : ''}>能力重視</option><option value="standard" ${settings.upsetMode === 'standard' ? 'selected' : ''}>標準</option><option value="volatile" ${settings.upsetMode === 'volatile' ? 'selected' : ''}>波乱重視</option><option value="custom" ${settings.upsetMode === 'custom' ? 'selected' : ''}>カスタム</option></select><small>${locked ? '試合中は変更不可' : '能力比較が最終勝敗へ与える強さ'}</small></label>
    </div>
    <div class="custom-upset ${settings.upsetMode === 'custom' ? 'visible' : ''}">
      ${[1,3,5,7,9].map((margin) => `<label><span>${(margin + 9) / 2}-${(9 - margin) / 2} 優勢側</span><input class="upset-custom-input" data-margin="${margin}" type="number" min="51" max="99.9" step="0.5" value="${(Number(custom[margin]) * 100).toFixed(1)}" ${locked ? 'disabled' : ''}><em>%</em></label>`).join('')}
    </div>
    <div class="save-tools">
      <div><strong>セーブ管理</strong><span>自動保存に加えて、JSONファイルへ手動バックアップできます。</span></div>
      <div class="save-actions">
        <button id="save-export" class="ghost">セーブを書き出す</button>
        <button id="save-import-trigger" class="ghost">セーブを読み込む</button>
        <button id="tutorial-open" class="ghost">チュートリアル</button>
        <input id="save-import-file" type="file" accept="application/json,.json" hidden>
      </div>
    </div>
    ${renderStatusGuide()}
    <p class="settings-note">シリーズは各メーカー${200 + MANUFACTURERS.length}系列・合計${MANUFACTURERS.length * (200 + MANUFACTURERS.length)}系列を収録。図鑑には遭遇・加入・育成完了・殿堂の履歴が蓄積されます。マネージャーのマイカスタム設定はゲームセーブ本体とは別に保存されます。</p>
  `;
}

function requiredTournament() {
  ensureTournamentYear(state);
  const entries = TOURNAMENT_IDS.map((id) => ({ id, def: TOURNAMENTS[id], entry: tournamentEntry(state, id) }));
  return entries.find((item) => item.entry?.status === 'active')
    ?? entries.find((item) => item.entry?.status === 'available')
    ?? null;
}

function trainingLockInfo() {
  if (state.officialMatch && ['setup', 'running'].includes(state.officialMatch.status)) {
    return {
      locked: true,
      title: state.officialMatch.context?.type === 'tournament' ? '大会戦を先に完了してください' : '団体戦の編成・試合中です',
      detail: '試合中は練習を進められません。大会・試合画面で現在の対戦を完了してください。',
      tournament: state.officialMatch.context?.type === 'tournament',
    };
  }
  const required = requiredTournament();
  if (!required) return { locked: false, title: '', detail: '', tournament: false };
  const roundName = required.def.rounds?.[required.entry.roundIndex]?.name ?? '次戦';
  return {
    locked: true,
    title: `${required.def.name}の大会期間です`,
    detail: required.entry.status === 'active'
      ? `${roundName}へ進むまで通常練習は停止します。大会画面で編成を続けてください。`
      : `この時期は${required.def.name}へ強制参加します。大会を終えるまで通常練習は選択できません。`,
    tournament: true,
    tournamentId: required.id,
  };
}

function renderTrainingLockNotice() {
  const lock = trainingLockInfo();
  if (!lock.locked) return '';
  return `<div class="training-lock-notice"><div><span>大会期間</span><strong>${escapeHtml(lock.title)}</strong><small>${escapeHtml(lock.detail)}</small></div><button class="view-tab mini-button" data-view="competition">大会画面へ</button></div>`;
}

function currentTournamentSummary() {
  const entries = TOURNAMENT_IDS.map((id) => ({ id, def: TOURNAMENTS[id], entry: tournamentEntry(state, id) }));
  return {
    active: entries.find((item) => item.entry?.status === 'active') ?? null,
    available: entries.filter((item) => item.entry?.status === 'available'),
    entries,
  };
}

function pageDescription(viewId) {
  const descriptions = {
    dashboard: '現在の状況と、次にやることをひと目で確認します。',
    training: '所属機体を選び、個別練習と全体練習で3年間の育成方針を組み立てます。',
    unit: '選択機体の基礎能力・成長傾向・全兵装適性・特殊能力をまとめて確認します。',
    custom: '選択中の機体へカスタムパーツを投入し、個別能力や特殊能力を伸ばします。',
    competition: '15機を編成して大会へ。試合そのものは短く、采配と育成結果を確認します。',
    history: '設備の発展、売却履歴、歴代記録、殿堂入り機体を確認します。',
    settings: '表示・番狂わせ・セーブなど、ゲーム全体の設定を管理します。',
  };
  return descriptions[viewId] ?? '';
}

function renderSidebar() {
  const tournaments = currentTournamentSummary();
  const badges = {
    training: state.turn < trainingTurnsForState(state) ? `${trainingTurnsForState(state) - state.turn}` : '',
    custom: state.partInventory?.length ? `${state.partInventory.length}` : '',
    competition: state.officialMatch?.status === 'running' ? '試合中' : (tournaments.active ? '進行中' : tournaments.available.length ? `${tournaments.available.length}` : ''),
    history: state.career?.championships ? `${state.career.championships}` : '',
  };
  return `
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <span class="brand-mark">AI</span>
        <div><strong>ロボット育成ラボ</strong><small>育成ローグライク v${GAME_CONFIG.version}</small></div>
      </div>
      <nav class="sidebar-nav" aria-label="主要画面">
        ${APP_VIEWS.map((view) => `<button class="view-tab sidebar-nav-item ${uiState.activeView === view.id ? 'active' : ''}" data-view="${view.id}"><span>${view.short}</span><strong>${view.label}</strong>${badges[view.id] ? `<em>${badges[view.id]}</em>` : ''}</button>`).join('')}
      </nav>
      <div class="sidebar-season">
        <span>年度</span><strong>${state.year}</strong><small>練習 ${state.turn}/${trainingTurnsForState(state)}</small>
        <div><b>${state.teamRecord?.wins ?? 0}</b>勝 <b>${state.teamRecord?.losses ?? 0}</b>敗</div>
      </div>
      <button id="tutorial-open-side" class="sidebar-help">？　遊び方</button>
    </aside>`;
}

function renderSelectedUnitBar(robot) {
  const options = state.roster.map((item) => `<option value="${item.id}" ${item.id === robot?.id ? 'selected' : ''}>${robotLabel(item)} / ${item.cohortYear}年目 / ${item.weaponName}</option>`).join('');
  if (!robot) return '';
  return `
    <section class="selected-unit-bar">
      <div class="selected-unit-heading"><span>選択機体</span><strong>${robotLabel(robot)}</strong>${robot.nickname ? `<small>${robotFormalLabel(robot)}</small>` : ''}</div>
      <select id="global-robot-selector" aria-label="操作する機体">${options}</select>
      <div class="selected-unit-meta">
        <span>${robot.cohortYear}年目</span><span>${robot.weaponName}</span><span>総合 ${robotSelectionScore(robot).toFixed(0)}</span><span>信頼 ${robot.reliability}</span>
      </div>
      <div class="selected-unit-actions">
        <button class="view-tab compact-action ${uiState.activeView === 'training' ? 'active' : ''}" data-view="training">育成</button>
        <button class="view-tab compact-action ${uiState.activeView === 'unit' ? 'active' : ''}" data-view="unit">詳細</button>
        <button class="view-tab compact-action ${uiState.activeView === 'custom' ? 'active' : ''}" data-view="custom">カスタム</button>
      </div>
    </section>`;
}

function renderPageHeader(title, viewId, actionHtml = '') {
  return `<header class="page-header"><div><p class="eyebrow">${APP_VIEWS.find((item) => item.id === viewId)?.short ?? ''}</p><h2>${title}</h2><p>${pageDescription(viewId)}</p></div>${actionHtml}</header>`;
}

function gameplayGuideItems() {
  const totalOfficial = Number(state.teamRecord?.wins ?? 0) + Number(state.teamRecord?.losses ?? 0);
  const customCount = state.roster.reduce((sum, robot) => sum + (robot.customHistory?.length ?? 0), 0);
  const retiredCount = Number(state.career?.totalRetired ?? state.retired?.length ?? 0);
  const facilityLevels = state.facilities ?? {};
  const facilityTotal = Object.values(facilityLevels).reduce((sum, value) => sum + Number(value ?? 0), 0);
  const completedTraining = Math.max(0, Number(state.turn ?? 1) - 1);
  return [
    {
      id: 'training',
      done: completedTraining > 0,
      title: '全体練習を1回選ぶ',
      detail: '個別練習は自動で進むので、まずは全体練習を1枚選べばOK。',
      view: 'training',
      action: completedTraining > 0 ? '育成を見る' : '最初の練習へ',
    },
    {
      id: 'unit',
      done: Boolean(state.onboarding?.unitViewed),
      title: '機体詳細で能力を見る',
      detail: '基礎能力・12兵装適性・特殊能力を1画面から確認できます。',
      view: 'unit',
      action: '機体詳細へ',
    },
    {
      id: 'custom',
      done: customCount > 0,
      title: 'カスタムパーツを1個使う',
      detail: 'パーツは消費型。使用した強化はその機体へ永久反映されます。',
      view: 'custom',
      action: 'カスタムへ',
    },
    {
      id: 'competition',
      done: totalOfficial > 0,
      title: '15機編成で公式戦を経験する',
      detail: '大会時期になると通常練習が停止し、大会画面へ案内されます。',
      view: 'competition',
      action: '大会を見る',
    },
    {
      id: 'history',
      done: facilityTotal > 0 || retiredCount > 0,
      title: '設備と歴代記録を確認する',
      detail: '長期プレイでは能力倍率ではなく、新しい情報・操作・選択肢が解禁されます。',
      view: 'history',
      action: '設備・記録へ',
    },
  ];
}

function facilityFeatureTips() {
  const f = state.facilities ?? {};
  const tips = [];
  if ((f.analysis ?? 0) >= 2) tips.push({ label: '成長解析', text: '選択機体の伸びやすい能力・伸びにくい能力を育成判断に使えます。', view: 'unit' });
  if ((f.training ?? 0) >= 2) tips.push({ label: '練習引き直し', text: '統合訓練設備Lv2以上なら、各ターン1回だけ候補を引き直せます。', view: 'training' });
  if ((f.training ?? 0) >= 4) tips.push({ label: '練習保留', text: 'Lv4以上なら候補1枚を次ターンへLvごと持ち越せます。', view: 'training' });
  if ((f.weaponsLab ?? 0) >= 3) tips.push({ label: '試験兵装指定', text: '装備を変えず、次の兵装試験だけ別兵装を育成対象へ指定できます。', view: 'unit' });
  if ((f.combatResearch ?? 0) >= 3) tips.push({ label: '対戦枠分析', text: '大会編成で自軍兵装と相手耐性の噛み合わせを確認できます。', view: 'competition' });
  if ((f.logistics ?? 0) >= 1) tips.push({ label: '選択式調達', text: '技術物資ネットワークから候補を取り寄せ、比較して1つ選べます。', view: 'custom' });
  if ((f.archive ?? 0) >= 5) tips.push({ label: '歴代ベスト15', text: '歴代機を自動・手動で15機選び、エキシビション戦に出せます。', view: 'history' });
  return tips.slice(-4).reverse();
}

function renderGameplayGuide() {
  const items = gameplayGuideItems();
  const unfinished = items.filter((item) => !item.done);
  const featureTips = facilityFeatureTips();
  if (!unfinished.length && !featureTips.length) return '';
  if (unfinished.length) {
    const completed = items.length - unfinished.length;
    return `<section class="panel dashboard-guide">
      <div class="panel-title"><div><p class="eyebrow">プレイガイド</p><h2>最初に覚える5つ</h2></div><span>${completed} / ${items.length}</span></div>
      <div class="dashboard-guide-progress"><span style="width:${(completed / items.length) * 100}%"></span></div>
      <div class="dashboard-guide-list">${items.map((item) => `<article class="dashboard-guide-item ${item.done ? 'done' : ''}"><i>${item.done ? '✓' : '○'}</i><div><strong>${item.title}</strong><small>${item.detail}</small></div><button class="view-tab mini-button ${item.done ? 'ghost' : ''}" data-view="${item.view}" data-guide-action="${item.id}">${item.action}</button></article>`).join('')}</div>
    </section>`;
  }
  return `<section class="panel dashboard-guide dashboard-feature-guide">
    <div class="panel-title"><div><p class="eyebrow">解禁機能</p><h2>今使える便利機能</h2></div><span>設備連動</span></div>
    <div class="dashboard-feature-list">${featureTips.map((item) => `<button class="view-tab dashboard-feature-tip" data-view="${item.view}"><strong>${item.label}</strong><span>${item.text}</span><em>開く →</em></button>`).join('')}</div>
  </section>`;
}

function renderDashboard(robot) {
  const cohortCounts = [1, 2, 3].map((cohortYear) => state.roster.filter((item) => item.cohortYear === cohortYear).length);
  const tournaments = currentTournamentSummary();
  const nextView = state.officialMatch?.status === 'running' || tournaments.active || tournaments.available.length ? 'competition' : 'training';
  const nextTitle = state.officialMatch?.status === 'running'
    ? '団体戦の続きを進める'
    : tournaments.active
      ? `${tournaments.active.def.shortName}の次戦を編成`
      : tournaments.available.length
        ? `${tournaments.available[0].def.shortName}に出場できる`
        : '次の全体練習を選ぶ';
  const best = [...state.roster].sort((a, b) => robotSelectionScore(b) - robotSelectionScore(a)).slice(0, 3);
  const rookie = [...state.roster].filter((item) => item.cohortYear === 1).sort((a, b) => robotSelectionScore(b) - robotSelectionScore(a))[0];
  return `
    ${renderPageHeader('ホーム', 'dashboard')}
    <section class="dashboard-hero">
      <div><span>次の行動</span><h3>${nextTitle}</h3><p>${state.officialMatch?.status === 'running' ? '現在の試合を完了すると大会進行へ戻れます。' : tournaments.available.length || tournaments.active ? '大会は練習ターンを消費しません。編成を確認して挑戦できます。' : '個別練習は自動で進みます。全体練習だけ選べば次のターンへ進みます。'}</p></div>
      <button class="view-tab primary-cta" data-view="${nextView}">${nextView === 'competition' ? '大会画面へ' : '育成を進める'} →</button>
    </section>
    ${renderGameplayGuide()}
    <section class="dashboard-stats">
      <article><span>所属機体</span><strong>${state.roster.length}</strong><small>1年 ${cohortCounts[0]} / 2年 ${cohortCounts[1]} / 3年 ${cohortCounts[2]}</small></article>
      <article><span>パーツ在庫</span><strong>${state.partInventory?.length ?? 0}</strong><small>使用上限なし</small></article>
      <article><span>公式戦</span><strong>${state.teamRecord?.wins ?? 0}-${state.teamRecord?.losses ?? 0}</strong><small>通算 / 優勝 ${state.career?.championships ?? 0}</small></article>
      <article><span>残り練習</span><strong>${Math.max(0, trainingTurnsForState(state) - state.turn)}</strong><small>${trainingTurnsForState(state)}回制</small></article>
    </section>
    <div class="dashboard-grid">
      <section class="panel dashboard-panel">
        <div class="panel-title"><div><p class="eyebrow">練習候補</p><h2>今ターンの練習候補</h2></div><button class="view-tab text-action" data-view="training">育成画面を開く</button></div>
        ${renderTrainingLockNotice()}<div class="training-grid dashboard-training-grid">${renderTrainingChoices()}</div>
      </section>
      <section class="panel dashboard-panel">
        <div class="panel-title"><div><p class="eyebrow">注目機体</p><h2>現在の注目機体</h2></div></div>
        <div class="dashboard-unit-list">${best.map((item, index) => `<button data-robot-id="${item.id}" class="dashboard-unit"><b>${index + 1}</b><div><strong>${robotLabel(item)}</strong><small>${item.cohortYear}年目 / ${item.weaponName} / ${item.record?.wins ?? 0}勝</small></div><em>${robotSelectionScore(item).toFixed(0)}</em></button>`).join('')}</div>
        ${rookie ? `<div class="rookie-callout"><span>注目新人</span><strong>${robotLabel(rookie)}</strong><small>総合 ${robotSelectionScore(rookie).toFixed(0)} / 信頼 ${rookie.reliability}</small></div>` : ''}
      </section>
      <section class="panel dashboard-panel">
        <div class="panel-title"><div><p class="eyebrow">大会</p><h2>大会状況</h2></div><button class="view-tab text-action" data-view="competition">大会画面を開く</button></div>
        <div class="dashboard-tournaments">${tournaments.entries.map(({ id, def, entry }) => `<div><span>${def.shortName}</span><strong>${tournamentStatusLabel(entry, def)}</strong></div>`).join('')}</div>
      </section>
      <section class="panel dashboard-panel">
        <div class="panel-title"><div><p class="eyebrow">最近の記録</p><h2>最近の出来事</h2></div></div>
        <div class="dashboard-log">${(state.log ?? []).slice(0, 8).map((line) => `<p>${escapeHtml(line)}</p>`).join('') || '<p>まだ記録はありません。</p>'}</div>
      </section>
    </div>`;
}


function renderTutorialOverlay() {
  if (!uiState.tutorialOpen) return '';
  const stepIndex = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, uiState.tutorialStep));
  const step = TUTORIAL_STEPS[stepIndex];
  const first = stepIndex === 0;
  const last = stepIndex === TUTORIAL_STEPS.length - 1;
  return `
    <div class="tutorial-backdrop" role="dialog" aria-modal="true" aria-label="チュートリアル">
      <article class="tutorial-card">
        <div class="tutorial-progress"><span>クイックスタート</span><strong>${stepIndex + 1} / ${TUTORIAL_STEPS.length}</strong></div>
        <h2>${step.title}</h2>
        <p>${step.body}</p>
        <aside>${step.hint}</aside>
        <div class="tutorial-dots">${TUTORIAL_STEPS.map((_, index) => `<i class="${index === stepIndex ? 'active' : ''}"></i>`).join('')}</div>
        <div class="tutorial-actions">
          <button id="tutorial-skip" class="ghost">${state.onboarding?.completed ? '閉じる' : 'スキップ'}</button>
          <div>
            <button id="tutorial-prev" class="ghost" ${first ? 'disabled' : ''}>戻る</button>
            <button id="tutorial-next" class="battle-button">${last ? 'ゲーム開始' : '次へ'}</button>
          </div>
        </div>
      </article>
    </div>`;
}

function closeTutorial() {
  state.onboarding ??= { completed: false, step: 0 };
  state.onboarding.completed = true;
  state.onboarding.step = 0;
  uiState.tutorialOpen = false;
  uiState.tutorialStep = 0;
  commit();
}

function renderTrainingModifiers() {
  const modifiers = state.trainingModifiers ?? [];
  if (!modifiers.length) return '<span class="modifier-empty">期間限定強化なし</span>';
  return modifiers.map((modifier) => `
    <span class="training-modifier">${STAT_GROUPS[modifier.groupKey].label} Lv+${modifier.levelBonus} / 残り${modifier.remainingTurns}回</span>
  `).join('');
}

function renderManagerPanel() {
  if (!managerProfile.enabled) {
    return `
      <section id="manager-section" class="manager-strip manager-disabled">
        <div><p class="eyebrow">マネージャー</p><strong>マネージャー機能は無効です</strong></div>
        <button id="manager-enable" class="mini-button">ONにする</button>
      </section>`;
  }
  const personality = MANAGER_PERSONALITIES[managerProfile.personalityId] ?? MANAGER_PERSONALITIES.cheerful;
  const portrait = managerProfile.imageDataUrl
    ? `<img src="${managerProfile.imageDataUrl}" alt="${escapeHtml(managerProfile.name)}" class="manager-portrait-image">`
    : `<div class="manager-portrait-placeholder">${escapeHtml(managerInitials())}</div>`;
  const activeLine = escapeHtml(uiState.managerLine || managerLine(managerProfile, 'generic', managerContextVariables()));

  if (uiState.managerCollapsed) {
    return `
      <section id="manager-section" class="manager-strip manager-collapsed">
        <div class="manager-collapsed-portrait">${portrait}</div>
        <div class="manager-collapsed-talk"><p class="eyebrow">マネージャー / ${escapeHtml(personality.label)}</p><strong>${escapeHtml(managerProfile.name)}</strong><span>「${activeLine}」</span></div>
        <div class="manager-collapsed-actions"><button id="manager-reroll-line" class="mini-button ghost">一言</button><button id="manager-expand" class="mini-button">展開</button></div>
      </section>`;
  }

  const editContext = MANAGER_CONTEXT_LABELS[uiState.managerEditContext] ? uiState.managerEditContext : 'welcome';
  const customLines = managerProfile.customLines?.[editContext] ?? [];
  const standardLines = standardManagerLines(managerProfile, editContext);
  const customCount = Object.values(managerProfile.customLines ?? {}).reduce((sum, lines) => sum + (Array.isArray(lines) ? lines.length : 0), 0);
  const templatePreviewSource = customLines[0] ?? standardLines[0] ?? '……';
  const templatePreview = renderManagerTemplate(templatePreviewSource, managerContextVariables());
  const templateTokenButtons = Object.entries(MANAGER_TEMPLATE_TOKENS)
    .map(([token, label]) => `<button type="button" class="manager-token" data-manager-token="{${token}}"><code>{${token}}</code><small>${escapeHtml(label)}</small></button>`)
    .join('');
  const selectedPreset = managerPresets.find((preset) => preset.id === uiState.managerPresetId) ?? null;
  const presetOptions = managerPresets
    .map((preset) => `<option value="${escapeHtml(preset.id)}" ${preset.id === uiState.managerPresetId ? 'selected' : ''}>${escapeHtml(preset.label)}</option>`)
    .join('');
  const editor = uiState.managerCustomOpen ? `
      <div class="manager-custom-editor">
        <div class="manager-custom-heading">
          <div><p class="eyebrow">マイカスタム</p><h3>状況別セリフ編集</h3></div>
          <span>登録 ${customCount}件</span>
        </div>
        <div class="manager-custom-controls">
          <label><span>表示方式</span><select id="manager-line-mode">${Object.values(MANAGER_LINE_MODES).map((mode) => `<option value="${mode.id}" ${mode.id === managerProfile.lineMode ? 'selected' : ''}>${mode.label}</option>`).join('')}</select><small>${MANAGER_LINE_MODES[managerProfile.lineMode]?.description ?? ''}</small></label>
          <label><span>編集する状況</span><select id="manager-custom-context">${Object.entries(MANAGER_CONTEXT_LABELS).map(([key, label]) => `<option value="${key}" ${key === editContext ? 'selected' : ''}>${label}</option>`).join('')}</select><small>現在 ${customLines.length} / ${MANAGER_CUSTOM_MAX_LINES}件</small></label>
        </div>
        <label class="manager-custom-textarea-label"><span>マイカスタムセリフ（1行＝1パターン）</span><textarea id="manager-custom-lines" rows="7" maxlength="${MANAGER_CUSTOM_MAX_LINES * (MANAGER_CUSTOM_MAX_LENGTH + 2)}" placeholder="例：{robot}、今日は{training}を頑張りましょう。">${escapeHtml(customLines.join('\n'))}</textarea><small>最大${MANAGER_CUSTOM_MAX_LINES}件 / 1件${MANAGER_CUSTOM_MAX_LENGTH}文字。空行は無視されます。</small></label>
        <div class="manager-template-help"><strong>差し込みタグ</strong><p>クリックすると編集欄へ追加します。状況に情報がないタグは「---」になります。</p><div class="manager-token-list">${templateTokenButtons}</div></div>
        <div class="manager-template-preview"><strong>プレビュー</strong><span>「${escapeHtml(templatePreview)}」</span></div>
        <div class="manager-standard-preview"><strong>${escapeHtml(MANAGER_CONTEXT_LABELS[editContext])}の標準セリフ</strong>${standardLines.map((line) => `<span>「${escapeHtml(line)}」</span>`).join('')}</div>
        <div class="manager-custom-actions">
          <button id="manager-custom-save" class="mini-button">この状況を保存</button>
          <button id="manager-custom-copy-standard" class="mini-button ghost">標準をコピー</button>
          <button id="manager-custom-clear-context" class="mini-button ghost" ${customLines.length ? '' : 'disabled'}>この状況を消去</button>
          <button id="manager-custom-clear-all" class="mini-button danger-ghost" ${customCount ? '' : 'disabled'}>自作セリフを全消去</button>
        </div>
        <div class="manager-profile-tools">
          <div class="manager-profile-tools-heading"><div><p class="eyebrow">プリセット / バックアップ</p><h3>人格プリセット・設定ファイル</h3></div><span>${managerPresets.length} / ${MANAGER_PRESET_LIMIT}</span></div>
          <div class="manager-preset-row">
            <select id="manager-preset-select"><option value="">人格プリセットを選択</option>${presetOptions}</select>
            <button id="manager-preset-apply" class="mini-button" ${selectedPreset ? '' : 'disabled'}>適用</button>
            <button id="manager-preset-new" class="mini-button ghost" ${managerPresets.length >= MANAGER_PRESET_LIMIT ? 'disabled' : ''}>現在設定を新規保存</button>
            <button id="manager-preset-overwrite" class="mini-button ghost" ${selectedPreset ? '' : 'disabled'}>上書き</button>
            <button id="manager-preset-delete" class="mini-button danger-ghost" ${selectedPreset ? '' : 'disabled'}>削除</button>
          </div>
          <small class="manager-preset-note">人格プリセットは「性格・セリフ表示方式・マイカスタム」だけを保存します。名前と画像は変えずに人格だけ切り替えられます。</small>
          <div class="manager-backup-actions">
            <button id="manager-profile-export" class="mini-button ghost">マネージャー設定を書き出す</button>
            <button id="manager-profile-import-trigger" class="mini-button ghost">マネージャー設定を読み込む</button>
            <input id="manager-profile-import-file" type="file" accept="application/json,.json" hidden>
          </div>
          <small class="manager-preset-note">設定JSONには名前・画像・性格・自作セリフをまとめて保存します。別PCへの移行やバックアップに使用できます。</small>
        </div>
      </div>` : '';
  return `
    <section id="manager-section" class="manager-panel ${uiState.managerCustomOpen ? 'custom-open' : ''}">
      <div class="manager-portrait">${portrait}</div>
      <div class="manager-talk">
        <div class="manager-heading"><div><p class="eyebrow">マネージャー / サポート</p><h2>${escapeHtml(managerProfile.name)}</h2></div><span>${personality.label}</span></div>
        <p class="manager-dialogue">「${activeLine}」</p>
        <div class="manager-talk-actions">
          <button id="manager-reroll-line" class="mini-button ghost">一言</button>
          <button id="manager-custom-toggle" class="mini-button ${uiState.managerCustomOpen ? '' : 'ghost'}">${uiState.managerCustomOpen ? 'マイカスタムを閉じる' : 'マイカスタム'}</button>
          <button id="manager-collapse" class="mini-button ghost">最小化</button>
          <button id="manager-image-trigger" class="mini-button ghost">画像を設定</button>
          ${managerProfile.imageDataUrl ? '<button id="manager-image-remove" class="mini-button ghost">画像を外す</button>' : ''}
          <input id="manager-image-file" type="file" accept="image/*" hidden>
        </div>
      </div>
      <div class="manager-settings">
        <label><span>名前</span><input id="manager-name" maxlength="24" value="${escapeHtml(managerProfile.name)}"></label>
        <label><span>性格</span><select id="manager-personality">${Object.values(MANAGER_PERSONALITIES).map((item) => `<option value="${item.id}" ${item.id === managerProfile.personalityId ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label>
        <label><span>セリフ</span><select id="manager-line-mode-compact">${Object.values(MANAGER_LINE_MODES).map((mode) => `<option value="${mode.id}" ${mode.id === managerProfile.lineMode ? 'selected' : ''}>${mode.label}</option>`).join('')}</select></label>
        <small>${personality.description}</small>
        <button id="manager-disable" class="mini-button ghost">機能を無効化</button>
      </div>
      ${editor}
    </section>`;
}
function renderYearSummary() {
  const summary = state.lastYearSummary;
  if (!summary) return '';
  const results = (summary.tournamentResults ?? []).map((entry) => {
    const def = TOURNAMENTS[entry.tournamentId];
    const result = entry.champion ? '優勝' : entry.status === 'eliminated' ? `${entry.wins}勝で敗退` : entry.status === 'missed' ? '不参加' : `${entry.wins}勝`;
    return `<span><b>${def?.shortName ?? entry.tournamentId}</b>${result}</span>`;
  }).join('');
  return `
    <section class="year-summary-banner">
      <div><p class="eyebrow">${summary.year}年目 年度まとめ</p><h2>${summary.year}年目が終了しました</h2></div>
      <div class="year-summary-stats"><span>売却 <b>${summary.retiredCount}</b>機</span><span>新人 <b>${summary.rookieCount}</b>機</span><span>記念パーツ <b>${summary.memorialPartCount}</b>個</span></div>
      <div class="year-summary-results">${results || '<span>大会記録なし</span>'}</div>
      <button id="year-summary-close" class="mini-button">閉じる</button>
    </section>`;
}

function renderCustomUnitSwitcher(robot) {
  if (!robot || !state.roster.length) return '';
  const index = Math.max(0, state.roster.findIndex((item) => item.id === robot.id));
  const previous = state.roster[(index - 1 + state.roster.length) % state.roster.length];
  const next = state.roster[(index + 1) % state.roster.length];
  return `<section class="custom-unit-switcher">
    <button class="unit-switch-button compact" data-unit-nav="${previous?.id ?? ''}">← 前</button>
    <div><span>${index + 1} / ${state.roster.length}</span><strong>${robotLabel(robot)}</strong><small>${robot.cohortYear}年目 / ${robot.weaponName}</small></div>
    <button class="unit-switch-button compact" data-unit-nav="${next?.id ?? ''}">次 →</button>
    <button class="view-tab mini-button ghost" data-view="unit">詳細</button>
  </section>`;
}

function renderHallSnapshotDetails(robot) {
  if (!robot) return '<div class="history-empty">保存データなし</div>';
  const groupRows = GROUP_KEYS.map((key) => `<div><span>${STAT_GROUPS[key].label}</span><strong>${groupAverage(robot, key).toFixed(1)}</strong><em>${grade(groupAverage(robot, key))}</em></div>`).join('');
  const weaponRows = Object.keys(WEAPON_CATEGORIES)
    .map((key) => ({ key, value: weaponCategoryAverage(robot, key), label: WEAPON_CATEGORIES[key].label }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((item) => `<div><span>${item.label}</span><strong>${item.value.toFixed(1)}</strong></div>`).join('');
  const resistanceRows = Object.entries(robot.resistances ?? {}).map(([name, value]) => `<span>${name} <b>${value}</b></span>`).join('');
  const abilityRows = (robot.specialAbilities ?? []).map((id) => SPECIAL_ABILITIES[id]?.name).filter(Boolean).map((name) => `<span>${escapeHtml(name)}</span>`).join('');
  return `<div class="hall-snapshot">
    <div class="hall-snapshot-meta"><span>信頼性 <b>${robot.reliability ?? '---'}</b></span><span>使用兵装 <b>${escapeHtml(robot.weaponName ?? '---')}</b></span><span>カスタム <b>${robot.customHistory?.length ?? 0}</b>回</span><span>覚醒 <b>${robot.awakenings?.length ?? 0}</b>回</span></div>
    <div class="hall-snapshot-columns">
      <section><h4>基礎能力</h4><div class="hall-group-grid">${groupRows}</div></section>
      <section><h4>兵装適性 上位6</h4><div class="hall-weapon-list">${weaponRows}</div></section>
    </div>
    <div class="hall-resistance-list">${resistanceRows || '<span>耐性データなし</span>'}</div>
    <div class="hall-ability-list">${abilityRows || '<span>特殊能力なし</span>'}</div>
  </div>`;
}

function renderActiveView(robot) {
  switch (uiState.activeView) {
    case 'dashboard':
      return renderDashboard(robot);
    case 'unit':
      return renderUnitDetailPage(robot);
    case 'custom':
      return `
        ${renderPageHeader('カスタム', 'custom')}
        ${renderCustomUnitSwitcher(robot)}
        <div class="custom-workspace">
          <section class="panel custom-unit-panel">
            <div class="panel-title"><div><p class="eyebrow">機体プロフィール</p><h2>選択機体</h2></div><small class="panel-note">詳しい能力・全兵装適性は機体詳細画面で確認できます。</small></div>
            ${renderCompactUnitProfile(robot)}
          </section>
          <section id="parts-section" class="panel parts-panel">
            <div class="panel-title"><div><p class="eyebrow">パーツ一覧</p><h2>カスタムパーツ</h2></div><small class="panel-note">使用した時点で消費され、機体へ永久反映されます。</small></div>
            ${renderProcurementPanel()}
            ${renderPartInventory(robot)}
          </section>
        </div>`;
    case 'competition':
      return `
        ${renderPageHeader('大会・試合', 'competition')}
        <section id="tournament-section" class="panel tournament-panel view-wide">
          <div class="panel-title"><div><p class="eyebrow">公式大会</p><h2>年間大会</h2></div><small class="panel-note">まずここを確認。出場可能なら大会編成へ進めます。</small></div>
          ${renderTournamentPanel()}
        </section>
        <section class="panel official-panel view-wide"><div class="panel-title"><div><p class="eyebrow">15機対15機</p><h2>団体戦編成・進行</h2></div><small class="panel-note">大会の公式戦と団体模擬戦をここで進めます。</small></div>${renderOfficialMatchPanel()}</section>
        <details class="panel optional-tool view-wide"><summary>1対1 模擬戦（調整・確認用）</summary>${renderBattlePanel()}</details>`;
    case 'history':
      return `
        ${renderPageHeader('設備・記録', 'history')}
        <section class="panel facility-panel view-wide">
          <div class="panel-title"><div><p class="eyebrow">設備</p><h2>設備・長期実績</h2></div><small class="panel-note">能力値ではなく、育成環境と情報量が発展します。</small></div>
          ${renderFacilities()}<details class="retirement-history"><summary>売却履歴</summary>${renderRetirementHistory()}</details>
        </section>
        <section id="records-section" class="panel records-panel view-wide">
          <div class="panel-title"><div><p class="eyebrow">歴代記録</p><h2>歴代記録・殿堂</h2></div></div>
          ${renderCareerRecords()}<details class="history-details" open><summary>歴代ベスト15</summary>${renderBest15Archive()}</details><details class="history-details" open><summary>歴代チーム・エキシビション</summary>${renderExhibitionArchive()}</details><details class="history-details"><summary>歴代ライバル・宿敵</summary>${renderRivalArchive()}</details><details class="history-details" open><summary>シリーズ図鑑・シリーズ別戦績</summary>${renderSeriesEncyclopedia()}</details><details class="history-details"><summary>殿堂入り機体</summary>${renderHallOfFame()}</details><details class="history-details"><summary>年度別大会履歴</summary>${renderTournamentHistory()}</details>
        </section>`;
    case 'settings':
      return `${renderPageHeader('設定', 'settings')}<section id="settings-section" class="panel settings-panel view-wide"><div class="panel-title"><div><p class="eyebrow">ゲーム設定</p><h2>プレイ設定・セーブ</h2></div></div>${renderSettingsPanel()}<div class="danger-zone"><div><strong>ゲームデータの初期化</strong><small>現在の進行データを削除して最初から開始します。マネージャー設定は別保存です。</small></div><button id="reset-button" class="danger-button">ゲームをリセット</button></div></section>`;
    case 'training':
    default:
      return `
        ${renderPageHeader('育成', 'training')}
        <div class="training-action-grid">
          <section id="training-section" class="panel training-panel">
            <div class="panel-title training-panel-head"><div><p class="eyebrow">第${state.turn}ターン / 全${trainingTurnsForState(state)}ターン</p><h2>全体練習を選択</h2></div><div class="training-head-actions"><button id="team-radar-open" class="ghost compact-button">チーム傾向を見る</button><div class="turn-progress"><span style="width:${Math.min(100, (state.turn / trainingTurnsForState(state)) * 100)}%"></span></div></div></div>
            ${renderTrainingLockNotice()}<div class="training-modifier-list">${renderTrainingModifiers()}</div>${renderTrainingChoiceControls()}<div class="training-grid training-grid-stacked">${renderTrainingChoices()}</div>
          </section>
          <section class="panel event-panel training-event-top"><div class="panel-title"><div><p class="eyebrow">イベント</p><h2>イベント</h2></div></div>${renderEventPanel()}</section>
        </div>
        <section id="roster-section" class="panel roster-panel training-roster-wide">
          <div class="panel-title"><div><p class="eyebrow">所属機体</p><h2>所属機体 <span>${state.roster.length}</span></h2></div><button class="view-tab text-action" data-view="unit">選択機体の詳細を見る</button></div>
          ${renderRosterControls()}<div class="roster-list">${renderRoster()}</div>
        </section>
        <section class="panel log-panel training-log-wide"><div class="panel-title"><div><p class="eyebrow">活動ログ</p><h2>最近のログ</h2></div></div><div class="log standalone-log">${state.log.slice(0, 12).map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div></section>`;
  }
}

function render() {
  ensureTournamentYear(state);
  const robot = selectedRobot();
  document.querySelector('#app').innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <div class="app-content">
        <header class="topbar app-topbar">
          <div><p class="eyebrow">AI戦闘ロボット育成ローグライク</p><h1>${APP_VIEWS.find((item) => item.id === uiState.activeView)?.label ?? 'ホーム'} <small>v${GAME_CONFIG.version}</small></h1></div>
          <div class="topbar-actions"><div class="calendar"><strong>${state.year}年目</strong><span>練習 ${state.turn}/${trainingTurnsForState(state)}</span></div><button id="tutorial-open-top" class="ghost compact-button">ヘルプ</button></div>
        </header>
        ${renderYearSummary()}
        ${renderManagerPanel()}
        ${uiState.activeView === 'unit' ? '' : renderSelectedUnitBar(robot)}
        <main class="page-content">${renderActiveView(robot)}</main>
      </div>
    </div>
    ${renderTutorialOverlay()}
    ${renderTeamRadarOverlay()}
  `;

  document.querySelectorAll('.view-tab').forEach((button) => {
    button.addEventListener('click', () => {
      uiState.activeView = button.dataset.view || 'training';
      if (uiState.activeView === 'unit') {
        state.onboarding ??= { completed: true, step: 0 };
        state.onboarding.unitViewed = true;
        saveState();
      }
      render();
    });
  });

  document.querySelector('#team-radar-open')?.addEventListener('click', () => {
    uiState.teamRadarOpen = true;
    render();
  });
  document.querySelector('#team-radar-close')?.addEventListener('click', () => {
    uiState.teamRadarOpen = false;
    render();
  });
  document.querySelector('#unit-status-guide')?.addEventListener('click', () => {
    uiState.activeView = 'settings';
    uiState.statusGuideOpen = true;
    render();
  });
  document.querySelector('#status-guide')?.addEventListener('toggle', (event) => {
    uiState.statusGuideOpen = Boolean(event.currentTarget?.open);
  });
  document.querySelector('.team-radar-backdrop')?.addEventListener('click', (event) => {
    if (event.target.classList?.contains('team-radar-backdrop')) {
      uiState.teamRadarOpen = false;
      render();
    }
  });

  document.querySelectorAll('[data-unit-detail-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      uiState.unitDetailTab = button.dataset.unitDetailTab || 'overview';
      render();
    });
  });

  document.querySelectorAll('[data-unit-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.unitNav;
      const chosen = state.roster.find((item) => item.id === targetId);
      if (!chosen) return;
      state.selectedRobotId = chosen.id;
      state.battleOpponentId = battleOpponent()?.id ?? null;
      state.lastBattle = null;
      setManagerRobotMessage(chosen);
      commit();
    });
  });

  document.querySelector('#robot-nickname-save')?.addEventListener('click', () => {
    const robot = selectedRobot();
    if (!robot) return;
    const value = String(document.querySelector('#robot-nickname')?.value ?? '').trim().slice(0, 24);
    robot.nickname = value;
    state.log = [`${robotFormalLabel(robot)}のニックネームを${value ? `「${value}」に設定` : '解除'}しました。`, ...state.log].slice(0, 32);
    commit();
  });
  document.querySelector('#robot-nickname-clear')?.addEventListener('click', () => {
    const robot = selectedRobot();
    if (!robot) return;
    robot.nickname = '';
    state.log = [`${robotFormalLabel(robot)}のニックネームを解除しました。`, ...state.log].slice(0, 32);
    commit();
  });

  document.querySelector('#global-robot-selector')?.addEventListener('change', (event) => {
    const chosen = state.roster.find((item) => item.id === event.target.value);
    if (!chosen) return;
    state.selectedRobotId = chosen.id;
    state.battleOpponentId = battleOpponent()?.id ?? null;
    state.lastBattle = null;
    setManagerRobotMessage(chosen);
    commit();
  });


  document.querySelector('#unit-detail-selector')?.addEventListener('change', (event) => {
    const chosen = state.roster.find((item) => item.id === event.target.value);
    if (!chosen) return;
    state.selectedRobotId = chosen.id;
    state.battleOpponentId = battleOpponent()?.id ?? null;
    state.lastBattle = null;
    setManagerRobotMessage(chosen);
    commit();
  });

  document.querySelectorAll('[data-robot-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedRobotId = button.dataset.robotId;
      const chosen = state.roster.find((item) => item.id === state.selectedRobotId);
      const nextOpponent = battleOpponent();
      state.battleOpponentId = nextOpponent?.id ?? null;
      state.lastBattle = null;
      setManagerRobotMessage(chosen);
      commit();
    });
  });

  document.querySelectorAll('[data-training-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const training = state.trainingChoices.find((item) => item.id === button.dataset.trainingId);
      chooseTraining(training);
    });
  });

  document.querySelector('#training-reroll')?.addEventListener('click', rerollTrainingChoices);
  document.querySelector('#training-reserve')?.addEventListener('click', () => {
    const id = document.querySelector('#training-reserve-select')?.value;
    if (id) reserveTrainingChoice(id);
  });
  document.querySelector('#weapon-test-target-save')?.addEventListener('click', () => {
    if (weaponsLabLevel(state) < 3) return;
    state.weaponsLabControl ??= { targetWeaponKey: null };
    const value = document.querySelector('#weapon-test-target')?.value || null;
    state.weaponsLabControl.targetWeaponKey = WEAPON_CATEGORIES[value] ? value : null;
    const label = state.weaponsLabControl.targetWeaponKey ? WEAPON_CATEGORIES[state.weaponsLabControl.targetWeaponKey].label : '現在兵装';
    state.log = [`兵装試験場：次の兵装試験対象を「${label}」に設定しました。`, ...state.log].slice(0, 28);
    commit();
  });

  const bindUiValue = (selector, key) => {
    document.querySelector(selector)?.addEventListener('change', (event) => {
      uiState[key] = event.target.value;
      render();
    });
  };
  bindUiValue('#roster-search', 'rosterSearch');
  bindUiValue('#roster-year-filter', 'rosterYear');
  bindUiValue('#roster-manufacturer-filter', 'rosterManufacturer');
  bindUiValue('#roster-weapon-filter', 'rosterWeapon');
  bindUiValue('#roster-sort', 'rosterSort');
  document.querySelector('#roster-filter-clear')?.addEventListener('click', () => {
    Object.assign(uiState, { rosterSearch: '', rosterYear: 'all', rosterManufacturer: 'all', rosterWeapon: 'all', rosterSort: 'yearDesc' });
    render();
  });

  bindUiValue('#part-rarity-filter', 'partRarity');
  bindUiValue('#part-type-filter', 'partType');
  bindUiValue('#part-manufacturer-filter', 'partManufacturer');
  bindUiValue('#part-ability-filter', 'partAbility');
  bindUiValue('#part-sort', 'partSort');
  bindUiValue('#series-dex-maker', 'seriesDexManufacturer');
  bindUiValue('#series-dex-discovery', 'seriesDexDiscovery');
  bindUiValue('#series-dex-generation', 'seriesDexGeneration');
  bindUiValue('#series-dex-growth', 'seriesDexGrowth');
  bindUiValue('#series-dex-custom', 'seriesDexCustom');
  bindUiValue('#series-dex-sort', 'seriesDexSort');
  bindUiValue('#series-compare-a', 'seriesCompareMakerA');
  bindUiValue('#series-compare-b', 'seriesCompareMakerB');
  document.querySelector('#series-dex-search-apply')?.addEventListener('click', () => {
    uiState.seriesDexSearch = String(document.querySelector('#series-dex-search')?.value ?? '').trim();
    render();
  });
  document.querySelector('#series-dex-search')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    uiState.seriesDexSearch = String(event.currentTarget?.value ?? '').trim();
    render();
  });
  document.querySelector('#series-dex-clear')?.addEventListener('click', () => {
    Object.assign(uiState, { seriesDexSearch:'', seriesDexDiscovery:'all', seriesDexGeneration:'all', seriesDexGrowth:'all', seriesDexCustom:'all', seriesDexSort:'number' });
    render();
  });
  document.querySelector('#series-dex-unlock-all')?.addEventListener('click', () => {
    state.seriesEncounters ??= {};
    for (const def of SERIES_DEFINITIONS) state.seriesEncounters[def.id] = Math.max(1, Number(state.seriesEncounters[def.id] ?? 0));
    state.settings ??= {};
    state.settings.seriesCatalogFullUnlock = true;
    state.log = [`シリーズカタログを全開放しました。${SERIES_DEFINITIONS.length}系列の名称・成長特性・設計説明文を閲覧できます。`, ...state.log].slice(0, 28);
    commit();
  });
  document.querySelectorAll('[data-series-maker]').forEach((button) => { button.addEventListener('click', () => { uiState.seriesDexManufacturer = button.dataset.seriesMaker || 'all'; render(); }); });
  document.querySelector('#part-filter-clear')?.addEventListener('click', () => {
    Object.assign(uiState, { partRarity: 'all', partType: 'all', partManufacturer: 'all', partAbility: 'all', partSort: 'rarityDesc' });
    render();
  });

  document.querySelector('#weapon-equip')?.addEventListener('change', (event) => {
    if (equipRobotWeapon(selectedRobot(), event.target.value)) commit();
  });

  document.querySelectorAll('[data-equip-weapon]').forEach((button) => {
    button.addEventListener('click', () => {
      if (equipRobotWeapon(selectedRobot(), button.dataset.equipWeapon)) commit();
    });
  });

  document.querySelector('#individual-training')?.addEventListener('change', (event) => {
    robot.individualTrainingTarget = event.target.value;
    const option = individualTrainingOptions(robot).find((item) => item.value === event.target.value);
    state.log = [`${robot.serial}の個別練習を${option?.label ?? event.target.value}に変更。`, ...state.log].slice(0, 24);
    commit();
  });


  document.querySelector('#battle-opponent')?.addEventListener('change', (event) => {
    state.battleOpponentId = event.target.value;
    state.lastBattle = null;
    commit();
  });

  const bindSettingSelect = (selector, key, parser = (value) => value) => {
    document.querySelector(selector)?.addEventListener('change', (event) => {
      state.settings = normalizeSettings(state.settings);
      state.settings[key] = parser(event.target.value);
      state.lastBattle = null;
      commit();
    });
  };
  bindSettingSelect('#setting-growth-mode', 'growthMode');
  bindSettingSelect('#setting-series-label', 'seriesLabelMode');
  bindSettingSelect('#setting-manufacturer-label', 'manufacturerLabelMode');
  bindSettingSelect('#setting-event-frequency', 'eventFrequency');
  bindSettingSelect('#setting-training-turns', 'trainingTurns', Number);
  bindSettingSelect('#setting-upset-mode', 'upsetMode');

  document.querySelector('#pwa-install-button')?.addEventListener('click', async () => {
    const result = await requestPwaInstall();
    if (result?.outcome === 'accepted') {
      state.log = ['ロボット育成ラボをアプリとしてインストールしました。', ...state.log].slice(0, 32);
    }
    render();
  });

  document.querySelectorAll('.upset-custom-input').forEach((input) => {
    input.addEventListener('change', (event) => {
      if (state.officialMatch?.status === 'running') return;
      const margin = Number(event.target.dataset.margin);
      const percent = Math.max(51, Math.min(99.9, Number(event.target.value) || 60));
      state.settings.customUpset[margin] = percent / 100;
      state.lastBattle = null;
      commit();
    });
  });

  document.querySelector('#retirement-history-toggle')?.addEventListener('click', () => {
    uiState.retirementHistoryExpanded = !uiState.retirementHistoryExpanded;
    render();
  });
  document.querySelector('#rival-archive-toggle')?.addEventListener('click', () => {
    uiState.rivalArchiveExpanded = !uiState.rivalArchiveExpanded;
    render();
  });

  document.querySelector('#exhibition-left')?.addEventListener('change', (event) => {
    uiState.exhibitionLeft = event.target.value;
    render();
  });
  document.querySelector('#exhibition-right')?.addEventListener('change', (event) => {
    uiState.exhibitionRight = event.target.value;
    render();
  });
  document.querySelector('#run-exhibition')?.addEventListener('click', () => {
    if (uiState.exhibitionLeft === uiState.exhibitionRight) {
      alert('左右で異なるチームを選択してください。');
      return;
    }
    const result = simulateExhibitionMatch(state, uiState.exhibitionLeft, uiState.exhibitionRight);
    if (!result.ok) {
      alert('15機を揃えられないため、エキシビション戦を開始できません。');
      return;
    }
    state.log = [`エキシビション：${result.record.leftLabel} ${result.record.leftWins}-${result.record.rightWins} ${result.record.rightLabel}`, ...state.log].slice(0,32);
    commit();
  });

  document.querySelector('#best15-mode')?.addEventListener('change', (event) => {
    state.best15 ??= { manualIds: [], selectedMode: 'overall' };
    state.best15.selectedMode = event.target.value;
    commit();
  });
  document.querySelectorAll('.best15-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const result = toggleManualBest15(state, button.dataset.best15Id);
      if (result.reason === 'full') alert('手動の歴代ベスト15は15機までです。登録済み機体を1機解除してから追加してください。');
      else commit();
    });
  });

  document.querySelectorAll('.hall-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      toggleHallOfFame(state, button.dataset.retiredId);
      commit();
    });
  });
  document.querySelectorAll('.hall-remove').forEach((button) => {
    button.addEventListener('click', () => {
      toggleHallOfFame(state, button.dataset.hallId);
      commit();
    });
  });
  document.querySelectorAll('.hall-memo').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = (state.hallOfFame ?? []).find((item) => item.robotId === button.dataset.hallId);
      const memo = prompt('この機体について残すメモ（160文字まで）', entry?.memo ?? '');
      if (memo === null) return;
      updateHallMemo(state, button.dataset.hallId, memo);
      commit();
    });
  });

  document.querySelector('#procurement-request')?.addEventListener('click', () => {
    const routeId = document.querySelector('#procurement-route')?.value ?? 'standard';
    const makerId = document.querySelector('#procurement-maker')?.value || null;
    const result = requestProcurement(state, routeId, makerId);
    if (!result.ok) {
      state.log = [`調達依頼：${result.reason}`, ...state.log].slice(0, 28);
    } else {
      state.log = [`技術物資ネットワークで「${result.pending.routeLabel}」を実施。候補から1つ選択してください。`, ...state.log].slice(0, 28);
    }
    commit();
  });

  document.querySelectorAll('.procurement-choose').forEach((button) => {
    button.addEventListener('click', () => {
      const result = chooseProcurement(state, button.dataset.procurementPart);
      if (!result.ok) return;
      state.log = [`調達候補から${result.part.name}を受領。`, ...state.log].slice(0, 28);
      commit();
    });
  });

  document.querySelectorAll('.part-use-button').forEach((button) => {
    button.addEventListener('click', () => {
      const target = selectedRobot();
      const index = state.partInventory.findIndex((part) => part.id === button.dataset.partId);
      if (!target || index < 0) return;
      const part = state.partInventory[index];
      const result = useCustomPart(target, part);
      state.partInventory.splice(index, 1);
      const abilityText = result.gainedAbility ? ` 特殊能力「${SPECIAL_ABILITIES[result.gainedAbility].name}」を獲得。` : '';
      state.log = [`${sName(target)}に${part.name}を使用。${abilityText}`, ...state.log].slice(0, 28);
      setManagerMessage(target.manufacturerId === 'libido' ? 'libidoPart' : (target.manufacturerId === 'tokiwa' ? 'tokiwaPart' : 'partUse'), { robotObject: target, part: part.name, ability: result.gainedAbility ? SPECIAL_ABILITIES[result.gainedAbility]?.name : '---' });
      state.lastBattle = null;
      commit();
    });
  });

  document.querySelector('#manager-enable')?.addEventListener('click', () => {
    managerProfile.enabled = true;
    persistManagerProfile();
    setManagerMessage('welcome');
    render();
  });
  document.querySelector('#manager-disable')?.addEventListener('click', () => {
    managerProfile.enabled = false;
    persistManagerProfile();
    render();
  });
  document.querySelector('#manager-name')?.addEventListener('change', (event) => {
    managerProfile.name = String(event.target.value ?? '').trim().slice(0, 24) || 'マネージャー';
    persistManagerProfile();
    setManagerMessage(uiState.managerContext || 'welcome', uiState.managerVariables ?? {});
    render();
  });
  document.querySelector('#manager-personality')?.addEventListener('change', (event) => {
    managerProfile.personalityId = event.target.value;
    persistManagerProfile();
    setManagerMessage('welcome');
    render();
  });
  const updateManagerLineMode = (value) => {
    managerProfile.lineMode = MANAGER_LINE_MODES[value] ? value : 'standard';
    persistManagerProfile();
    setManagerMessage(uiState.managerContext || 'generic', uiState.managerVariables ?? {});
    render();
  };
  document.querySelector('#manager-line-mode-compact')?.addEventListener('change', (event) => updateManagerLineMode(event.target.value));
  document.querySelector('#manager-line-mode')?.addEventListener('change', (event) => updateManagerLineMode(event.target.value));
  document.querySelector('#manager-custom-toggle')?.addEventListener('click', () => {
    uiState.managerCustomOpen = !uiState.managerCustomOpen;
    render();
  });
  document.querySelector('#manager-collapse')?.addEventListener('click', () => {
    uiState.managerCollapsed = true;
    uiState.managerCustomOpen = false;
    render();
  });
  document.querySelector('#manager-expand')?.addEventListener('click', () => {
    uiState.managerCollapsed = false;
    render();
  });
  document.querySelector('#manager-custom-context')?.addEventListener('change', (event) => {
    uiState.managerEditContext = MANAGER_CONTEXT_LABELS[event.target.value] ? event.target.value : 'welcome';
    render();
  });
  document.querySelectorAll('.manager-token').forEach((button) => {
    button.addEventListener('click', () => {
      const textarea = document.querySelector('#manager-custom-lines');
      if (!textarea) return;
      const token = button.dataset.managerToken ?? '';
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      const before = textarea.value.slice(0, start);
      const after = textarea.value.slice(end);
      textarea.value = `${before}${token}${after}`;
      const next = start + token.length;
      textarea.focus();
      textarea.setSelectionRange(next, next);
    });
  });
  document.querySelector('#manager-custom-save')?.addEventListener('click', () => {
    const textarea = document.querySelector('#manager-custom-lines');
    const lines = parseCustomLines(textarea?.value ?? '');
    managerProfile = setManagerCustomLines(managerProfile, uiState.managerEditContext, lines);
    persistManagerProfile();
    setManagerMessage(uiState.managerEditContext);
    render();
  });
  document.querySelector('#manager-custom-copy-standard')?.addEventListener('click', () => {
    const lines = standardManagerLines(managerProfile, uiState.managerEditContext);
    managerProfile = setManagerCustomLines(managerProfile, uiState.managerEditContext, lines);
    persistManagerProfile();
    render();
  });
  document.querySelector('#manager-custom-clear-context')?.addEventListener('click', () => {
    managerProfile = clearManagerCustomLines(managerProfile, uiState.managerEditContext);
    persistManagerProfile();
    setManagerMessage(uiState.managerEditContext);
    render();
  });
  document.querySelector('#manager-custom-clear-all')?.addEventListener('click', () => {
    if (!confirm('登録したマイカスタムセリフをすべて消去しますか？')) return;
    managerProfile = clearManagerCustomLines(managerProfile);
    persistManagerProfile();
    setManagerMessage(uiState.managerContext || 'generic', uiState.managerVariables ?? {});
    render();
  });
  document.querySelector('#manager-preset-select')?.addEventListener('change', (event) => {
    uiState.managerPresetId = event.target.value ?? '';
    render();
  });
  document.querySelector('#manager-preset-apply')?.addEventListener('click', () => {
    const preset = managerPresets.find((item) => item.id === uiState.managerPresetId);
    if (!preset) return;
    managerProfile = applyManagerPreset(managerProfile, preset);
    persistManagerProfile();
    setManagerMessage('welcome');
    render();
  });
  document.querySelector('#manager-preset-new')?.addEventListener('click', () => {
    if (managerPresets.length >= MANAGER_PRESET_LIMIT) {
      alert(`人格プリセットは最大${MANAGER_PRESET_LIMIT}件です。`);
      return;
    }
    const label = prompt('人格プリセット名（32文字まで）', `${MANAGER_PERSONALITIES[managerProfile.personalityId]?.label ?? 'カスタム'}人格`);
    if (label === null) return;
    const preset = createManagerPreset(managerProfile, label);
    managerPresets = upsertManagerPreset(managerPresets, preset);
    persistManagerPresets();
    uiState.managerPresetId = preset.id;
    render();
  });
  document.querySelector('#manager-preset-overwrite')?.addEventListener('click', () => {
    const current = managerPresets.find((item) => item.id === uiState.managerPresetId);
    if (!current) return;
    if (!confirm(`人格プリセット「${current.label}」を現在の設定で上書きしますか？`)) return;
    const preset = createManagerPreset(managerProfile, current.label, { id: current.id, createdAt: current.createdAt });
    managerPresets = upsertManagerPreset(managerPresets, preset);
    persistManagerPresets();
    render();
  });
  document.querySelector('#manager-preset-delete')?.addEventListener('click', () => {
    const current = managerPresets.find((item) => item.id === uiState.managerPresetId);
    if (!current) return;
    if (!confirm(`人格プリセット「${current.label}」を削除しますか？`)) return;
    managerPresets = removeManagerPreset(managerPresets, current.id);
    persistManagerPresets();
    uiState.managerPresetId = '';
    render();
  });
  document.querySelector('#manager-profile-export')?.addEventListener('click', () => {
    try {
      downloadManagerProfile(managerProfile);
    } catch (error) {
      alert(`マネージャー設定を書き出せませんでした。\n${error.message ?? error}`);
    }
  });
  document.querySelector('#manager-profile-import-trigger')?.addEventListener('click', () => document.querySelector('#manager-profile-import-file')?.click());
  document.querySelector('#manager-profile-import-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await readManagerProfileFile(file);
      if (!confirm(`マネージャー設定「${imported.name}」を読み込みますか？\n現在の名前・画像・マイカスタム設定は置き換わります。`)) return;
      managerProfile = imported;
      persistManagerProfile();
      uiState.managerPresetId = '';
      uiState.managerCollapsed = false;
      setManagerMessage('welcome');
      render();
    } catch (error) {
      alert(`マネージャー設定を読み込めませんでした。\n${error.message ?? error}`);
    } finally {
      event.target.value = '';
    }
  });
  document.querySelector('#manager-reroll-line')?.addEventListener('click', () => {
    setManagerMessage(uiState.managerContext || 'generic', uiState.managerVariables ?? {});
    render();
  });
  document.querySelector('#manager-image-trigger')?.addEventListener('click', () => document.querySelector('#manager-image-file')?.click());
  document.querySelector('#manager-image-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      managerProfile.imageDataUrl = await resizeImageFile(file);
      persistManagerProfile();
      render();
    } catch (error) {
      alert(`画像を設定できませんでした。\n${error.message ?? error}`);
    } finally {
      event.target.value = '';
    }
  });
  document.querySelector('#manager-image-remove')?.addEventListener('click', () => {
    managerProfile.imageDataUrl = null;
    persistManagerProfile();
    render();
  });

  document.querySelector('#save-export')?.addEventListener('click', () => {
    try {
      downloadSave(state);
      state.log = ['セーブデータを書き出しました。', ...state.log].slice(0, 28);
      commit();
    } catch (error) {
      alert(`セーブの書き出しに失敗しました。\n${error.message ?? error}`);
    }
  });
  document.querySelector('#save-import-trigger')?.addEventListener('click', () => document.querySelector('#save-import-file')?.click());
  document.querySelector('#save-import-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = migrateState(await readSaveFile(file));
      if (!confirm(`${imported.year}年目のセーブデータを読み込みますか？\n現在の自動保存データは上書きされます。`)) return;
      state = imported;
      state.settings = normalizeSettings(state.settings);
      state.log = ['外部セーブデータを読み込みました。', ...(state.log ?? [])].slice(0, 28);
      Object.assign(uiState, { tutorialOpen: false, tutorialStep: 0 });
      commit();
    } catch (error) {
      alert(`セーブデータを読み込めませんでした。\n${error.message ?? error}`);
    } finally {
      event.target.value = '';
    }
  });

  const openTutorial = () => {
    uiState.tutorialOpen = true;
    uiState.tutorialStep = 0;
    render();
  };
  document.querySelector('#tutorial-open')?.addEventListener('click', openTutorial);
  document.querySelector('#tutorial-open-top')?.addEventListener('click', openTutorial);
  document.querySelector('#tutorial-open-side')?.addEventListener('click', openTutorial);
  document.querySelector('#tutorial-skip')?.addEventListener('click', closeTutorial);
  document.querySelector('#tutorial-prev')?.addEventListener('click', () => {
    uiState.tutorialStep = Math.max(0, uiState.tutorialStep - 1);
    state.onboarding ??= { completed: false, step: 0 };
    state.onboarding.step = uiState.tutorialStep;
    render();
  });
  document.querySelector('#tutorial-next')?.addEventListener('click', () => {
    if (uiState.tutorialStep >= TUTORIAL_STEPS.length - 1) {
      closeTutorial();
      return;
    }
    uiState.tutorialStep += 1;
    state.onboarding ??= { completed: false, step: 0 };
    state.onboarding.step = uiState.tutorialStep;
    render();
  });

  document.querySelector('#battle-button')?.addEventListener('click', runBattle);
  document.querySelector('#reset-button')?.addEventListener('click', resetGame);
  document.querySelector('#year-summary-close')?.addEventListener('click', () => {
    const summary = state.lastYearSummary;
    setManagerMessage('rookieArrival', {
      rookies: summary?.rookieCount ?? state.roster.filter((item) => item.cohortYear === 1).length,
      retired: summary?.retiredCount ?? 0,
    });
    state.lastYearSummary = null;
    commit();
  });
  document.querySelector('#official-prepare')?.addEventListener('click', prepareOfficialMatch);
  document.querySelector('#official-new-match')?.addEventListener('click', prepareOfficialMatch);
  document.querySelector('#official-start')?.addEventListener('click', beginOfficialMatch);
  document.querySelector('#official-next-bout')?.addEventListener('click', playNextOfficialBout);
  document.querySelector('#official-skip-remaining')?.addEventListener('click', playRemainingOfficialBouts);
  document.querySelector('#official-clear')?.addEventListener('click', clearOfficialMatch);
  document.querySelector('#lineup-auto-apply')?.addEventListener('click', () => {
    const strategy = document.querySelector('#lineup-auto-strategy')?.value ?? 'overall';
    if (autoSelectLineup(state, state.officialMatch, strategy)) {
      state.log = ['15機を自動選抜しました。必要なら各枠を手動で調整できます。', ...state.log].slice(0, 28);
      commit();
    }
  });
  document.querySelector('#lineup-order-apply')?.addEventListener('click', () => {
    const order = document.querySelector('#lineup-order-strategy')?.value ?? 'strongFirst';
    if (arrangeLineup(state, state.officialMatch, order)) commit();
  });
  document.querySelectorAll('.tournament-start').forEach((button) => {
    button.addEventListener('click', () => prepareTournamentRound(button.dataset.tournamentId));
  });

  document.querySelectorAll('.official-lineup-select').forEach((select) => {
    select.addEventListener('change', (event) => {
      updateLineupSlot(state.officialMatch, Number(event.target.dataset.slot), event.target.value);
      commit();
    });
  });

  document.querySelectorAll('[data-lineup-move]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.lineupMove === 'up' ? -1 : 1;
      moveLineupSlot(state.officialMatch, Number(button.dataset.slot), direction);
      commit();
    });
  });

  document.querySelector('#substitute-button')?.addEventListener('click', () => {
    const slotIndex = Number(document.querySelector('#sub-slot')?.value);
    const benchRobotId = document.querySelector('#sub-robot')?.value;
    const result = substituteFutureSlot(state, state.officialMatch, slotIndex, benchRobotId);
    state.log = [result.ok ? `第${slotIndex + 1}戦の出場機を交代しました。` : result.reason, ...state.log].slice(0, 24);
    commit();
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('robotlab-pwa-ready', () => {
    if (uiState.activeView === 'settings') render();
  });
  window.addEventListener('robotlab-pwa-installed', () => {
    if (uiState.activeView === 'settings') render();
  });
}

render();
