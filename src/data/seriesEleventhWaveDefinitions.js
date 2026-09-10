import { applyLibidoBodyMechanics } from './libidoBodyMechanics.js?v=4.8';
import { buildLibidoDescriptions } from './libidoSeriesDescriptions.js?v=4.8';
// v4.8 eleventh generation: 19 bilateral joint-development series + 1 all-company common-standard series per manufacturer.
import { MANUFACTURERS } from './manufacturers.js?v=4.8';
import { TENTH_WAVE_SERIES_DEFINITIONS } from './seriesTenthWaveDefinitions.js?v=4.8';
import { NEW_MANUFACTURER_PRE_G11_SERIES } from './seriesNewManufacturerDefinitions.js?v=4.8';
import { G11_NAME_POOLS } from './seriesEleventhNamingDefinitions.js?v=4.8';

const SHORT_KANA = {
  kirishima:'霧島', mizuho:'瑞穂', gogaku:'剛岳', yashima:'八洲', hokushin:'北辰', shinonome:'東雲', amagi:'天城', kamishiro:'神代',
  lancaster:'ランカスター', steinwald:'シュタインヴァルト', cromwell:'クロムウェル', rhenium:'レニウム', hawthorne:'ホーソーン', arcadia:'アルカディア',
  solberg:'ソルベルグ', grayson:'グレイソン', laplace:'ラプラス', bureau13:'第十三局', eidolon:'エイドロン', logos:'ロゴス',
  mikage:'御影', meridian:'メリディアン', tokiwa:'常盤', heritage:'ヘリテージ', libido:'リビドー', nomad:'ノマド',
};
const SHORT_LATIN = {
  kirishima:'Kirishima', mizuho:'Mizuho', gogaku:'Gogaku', yashima:'Yashima', hokushin:'Hokushin', shinonome:'Shinonome', amagi:'Amagi', kamishiro:'Kamishiro',
  lancaster:'Lancaster', steinwald:'Steinwald', cromwell:'Cromwell', rhenium:'Rhenium', hawthorne:'Hawthorne', arcadia:'Arcadia', solberg:'Solberg', grayson:'Grayson',
  laplace:'Laplace', bureau13:'Bureau 13', eidolon:'Eidolon', logos:'LOGOS',
  mikage:'Mikage', meridian:'Meridian', tokiwa:'Tokiwa', heritage:'Heritage Gate', libido:'LIBIDO', nomad:'NOMAD',
};

const MAKER_MAP = new Map(MANUFACTURERS.map((m) => [m.id, m]));
const MAKER_INDEX = new Map(MANUFACTURERS.map((m, i) => [m.id, i]));
const G10_BY_MAKER = new Map();
for (const s of [...TENTH_WAVE_SERIES_DEFINITIONS, ...NEW_MANUFACTURER_PRE_G11_SERIES.filter((x)=>x.seriesNumber>=181&&x.seriesNumber<=200)]) {
  if (!G10_BY_MAKER.has(s.manufacturerId)) G10_BY_MAKER.set(s.manufacturerId, []);
  G10_BY_MAKER.get(s.manufacturerId).push(s);
}
for (const list of G10_BY_MAKER.values()) list.sort((a,b)=>a.seriesNumber-b.seriesNumber);

const GROUP_KEYS = ['output','mobility','control','engine','compute','sensor','ai'];
const WEAPON_KEYS = ['blade','hammer','lance','beamBlade','rifle','machineGun','cannon','laser','beamCannon','missile','emp','drone'];
const round3 = (n) => Number(Number(n || 0).toFixed(3));
function scaledMap(map, scale, keys) {
  const out = {};
  for (const key of keys) {
    const value = Number(map?.[key] ?? 0);
    if (value) out[key] = round3(value * scale);
  }
  return out;
}
function addMaps(...maps) {
  const out = {};
  for (const map of maps) for (const [key, value] of Object.entries(map ?? {})) out[key] = round3(Number(out[key] ?? 0) + Number(value ?? 0));
  return out;
}
function topWeapons(profile, count=3) {
  return Object.entries(profile?.weaponBias ?? {}).sort((a,b)=>Number(b[1])-Number(a[1])).filter(([,v])=>Number(v)>0).slice(0,count).map(([k])=>k);
}
function makerStrengths(profile, count=2) {
  return Object.entries(profile?.groupBias ?? {}).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,count).map(([k])=>k);
}
const GROUP_LABEL = {output:'出力',mobility:'駆動',control:'制御',engine:'機関',compute:'演算',sensor:'センサー',ai:'AI'};
const WEAPON_LABEL = {blade:'ブレード',hammer:'ハンマー',lance:'ランス',beamBlade:'ビームブレード',rifle:'ライフル',machineGun:'マシンガン',cannon:'キャノン',laser:'レーザー',beamCannon:'ビーム砲',missile:'ミサイル',emp:'EMP',drone:'ドローン'};

function bilateralSeries(maker, partner, slotIndex) {
  const predecessor = G10_BY_MAKER.get(maker.id)?.[slotIndex] ?? G10_BY_MAKER.get(maker.id)?.[0];
  const partnerIndex = MAKER_INDEX.get(maker.id) ?? 0;
  const partnerReference = G10_BY_MAKER.get(partner.id)?.[partnerIndex] ?? G10_BY_MAKER.get(partner.id)?.[0];
  const ownStrengths = makerStrengths(maker.profile);
  const partnerStrengths = makerStrengths(partner.profile);
  const partnerWeapons = topWeapons(partner.profile, 3);
  const ownWeapons = [...(predecessor?.preferredWeapons ?? []), ...topWeapons(maker.profile, 2)];
  const preferredWeapons = [...new Set([...ownWeapons, ...partnerWeapons])].slice(0,4);
  const groupAdjustments = addMaps(
    predecessor?.groupAdjustments,
    scaledMap(partner.profile?.groupBias, 0.48, GROUP_KEYS),
    scaledMap(maker.profile?.groupBias, 0.12, GROUP_KEYS),
  );
  const growthAdjustments = addMaps(
    predecessor?.growthAdjustments,
    scaledMap(partner.profile?.growthBias, 0.55, GROUP_KEYS),
    scaledMap(maker.profile?.growthBias, 0.12, GROUP_KEYS),
  );
  const weaponAdjustments = addMaps(
    predecessor?.weaponAdjustments,
    scaledMap(partner.profile?.weaponBias, 0.52, WEAPON_KEYS),
  );
  const weaponGrowthAdjustments = addMaps(
    predecessor?.weaponGrowthAdjustments,
    Object.fromEntries(partnerWeapons.map((key, i)=>[key, round3(0.045 - i*0.008)])),
  );
  const n = 201 + slotIndex;
  const curatedName = G11_NAME_POOLS[maker.id]?.[slotIndex];
  const nameKana = curatedName?.kana ?? `${SHORT_KANA[maker.id]}×${SHORT_KANA[partner.id]}`;
  const nameLatin = curatedName?.latin ?? `${SHORT_LATIN[maker.id]} x ${SHORT_LATIN[partner.id]}`;
  const ownStrengthText = ownStrengths.map((k)=>GROUP_LABEL[k]).join('・') || '総合運用';
  const partnerStrengthText = partnerStrengths.map((k)=>GROUP_LABEL[k]).join('・') || '総合運用';
  const weaponText = preferredWeapons.slice(0,3).map((k)=>WEAPON_LABEL[k]).join(' / ') || '汎用兵装';
  const series = {
    ...predecessor,
    id:`${maker.id}-g11-${n}`,
    seriesNumber:n,
    nameKana,
    nameLatin,
    summary:`${maker.name}と${partner.name}の共同開発系列。${maker.name}の${ownStrengthText}を骨格に、${partner.name}の${partnerStrengthText}と兵装思想を取り込み、単独企業では作りにくい複合的な育成先を持つ。`,
    concept:`第11世代の企業間共同開発計画で成立した系列。主設計と最終調整は${maker.name}が担当し、${partner.name}から基礎技術・制御ロジック・兵装運用の一部を導入する。両社の長所を単純平均せず、${maker.name}側の機体として三年間の育成で完成させることを前提とする。`,
    namingConcept:`名称「${nameKana}」は${maker.name}の命名文化を主軸に、${partner.name}との共同開発機にふさわしい実在語・固有名詞から選定した。メーカー名を連結した仮称ではなく、主導企業側の製品系列として独立して記憶できる名称を採用し、逆主導の共同開発系列とは別名になる。`,
    developmentBackground:`単独メーカー内で成熟した第10世代技術を他社規格へ接続するため、電力・制御・AI・兵装インターフェースを共通化した上で共同試験を実施した。${partner.name}の得意分野をそのまま移植するのではなく、${maker.name}側の整備体系と育成方針へ合わせて再調整している。`,
    engineeringNotes:`主軸は${maker.name}の${ownStrengthText}。そこへ${partner.name}の${partnerStrengthText}を加え、推奨兵装は${weaponText}を中心に設定する。共同規格のためカスタム時の方向転換がしやすい反面、両社の長所を同時に最大化しようとすると育成が散りやすい。`,
    trainingNotes:`1年目は${maker.name}側の基礎骨格を育て、2年目から${partner.name}由来の${partnerStrengthText}や推奨兵装へ寄せる。3年目は両方を平均化するより、完成した個体の伸びに合わせて片方の思想を主軸に決めると強みを残しやすい。`,
    weaponDoctrine:`共同開発兵装は${weaponText}を中心に運用する。${partner.name}由来の兵装適性を追加しつつ、${maker.name}本来の基礎能力で兵装6軸を支える二層構造を狙う。`,
    marketPosition:`第11世代 / ${partner.name}共同開発`,
    groupAdjustments,
    growthAdjustments,
    weaponAdjustments,
    weaponGrowthAdjustments,
    preferredWeapons,
    reliabilityAdjustment: round3(Number(predecessor?.reliabilityAdjustment ?? 0) + Number(partner.profile?.reliabilityBias ?? 0) * 0.22),
    resistanceAdjustment: round3(Number(predecessor?.resistanceAdjustment ?? 0) + Number(partner.profile?.resistanceBias ?? 0) * 0.2),
    predecessorNumber:181 + (slotIndex % 20),
    refitGeneration:11,
    refitVersion:'4.8',
    tenthGeneration:false,
    eleventhGeneration:true,
    cleanSheetNaming:true,
    realWordNaming:true,
    collaborationType:'bilateral',
    collaborationPartnerId:partner.id,
    collaborationPartnerName:partner.name,
    collaborationPartnerSeriesId:partnerReference?.id ?? null,
    collaborationLeadManufacturerId:maker.id,
  };
  if (maker.id==='libido') { const enriched=applyLibidoBodyMechanics(series,1); return {...enriched,...buildLibidoDescriptions(enriched,11),concept:`第11世代共同開発でも主目的は成人向けセクサロイドとしての完成度。${partner.name}の技術は作者の理想の身体・仕草・感覚表現をさらに押し上げるために採用され、戦闘能力はその完成品から引き出される余技として扱う。`}; }
  if (partner.id==='libido') return applyLibidoBodyMechanics(series, 0.35);
  return series;
}

function consortiumSeries(maker) {
  const predecessor = G10_BY_MAKER.get(maker.id)?.[19] ?? G10_BY_MAKER.get(maker.id)?.[0];
  const avgGroup = {}, avgGrowth = {}, avgWeapon = {};
  for (const key of GROUP_KEYS) {
    avgGroup[key] = round3(MANUFACTURERS.reduce((s,m)=>s+Number(m.profile?.groupBias?.[key]??0),0)/MANUFACTURERS.length);
    avgGrowth[key] = round3(MANUFACTURERS.reduce((s,m)=>s+Number(m.profile?.growthBias?.[key]??0),0)/MANUFACTURERS.length);
  }
  for (const key of WEAPON_KEYS) avgWeapon[key] = round3(MANUFACTURERS.reduce((s,m)=>s+Number(m.profile?.weaponBias?.[key]??0),0)/MANUFACTURERS.length);
  const preferredWeapons = Object.entries(avgWeapon).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k])=>k);
  const consortiumName = G11_NAME_POOLS[maker.id]?.[MANUFACTURERS.length - 1] ?? { kana:'全社共同規格', latin:'Common Standard' };
  const series = {
    ...predecessor,
    id:`${maker.id}-g11-${200 + MANUFACTURERS.length}`, seriesNumber:200 + MANUFACTURERS.length,
    nameKana:consortiumName.kana, nameLatin:consortiumName.latin,
    summary:`${MANUFACTURERS.length}メーカーが参加する第11世代共通規格計画の${maker.name}製系列。企業間で部品・兵装・制御規格を共有しつつ、最終的な能力配分と育成特性には${maker.name}の設計思想を残す。`,
    concept:`第11世代の締めとなる全社共同プロジェクト。${MANUFACTURERS.length}メーカー共通の接続規格を用いることで、多様なカスタムパーツと兵装運用へ対応する。完全な平均機ではなく、共通規格の上に${maker.name}固有の強みを載せる方式を採用する。`,
    namingConcept:`共通規格計画そのものは${MANUFACTURERS.length}社共同だが、${maker.name}製の完成機には固有系列名「${consortiumName.kana}」を与える。共通規格をそのまま製品名にせず、各社の命名文化に沿った実在語・固有名詞で市場上の系列を区別する。`,
    developmentBackground:'企業ごとに異なっていた電力、制御、兵装、AI、整備インターフェースを共同仕様へまとめ、相互運用性を実戦レベルまで引き上げるために始動した。各社の企業秘密に当たる中核技術は保持しつつ、交換可能な領域だけを標準化している。',
    engineeringNotes:`全社平均に近い拡張性を持ちながら、${maker.name}のメーカー補正を残す。突出した共同相手は持たない代わりに、兵装変更・カスタム・育成方針転換への対応力を第11世代で最も高く取る。`,
    trainingNotes:'特定の共同相手へ寄せる系列より初期の方向性は広い。1年目で個体差と成長曲線を見極め、2年目に主力兵装を決め、3年目は設備・カスタム・特殊能力まで同じ勝ち筋へ集約する運用が向く。',
    weaponDoctrine:`共通規格により${preferredWeapons.map(k=>WEAPON_LABEL[k]).join(' / ')}を含む複数兵装へ対応しやすい。装備そのものより、個体の41基礎能力と成長適性に合わせて兵装を選び直すことを主眼とする。`,
    marketPosition:`第11世代 / ${MANUFACTURERS.length}社共同共通規格`,
    groupAdjustments:addMaps(predecessor?.groupAdjustments, scaledMap(avgGroup,0.28,GROUP_KEYS)),
    growthAdjustments:addMaps(predecessor?.growthAdjustments, scaledMap(avgGrowth,0.32,GROUP_KEYS)),
    weaponAdjustments:addMaps(predecessor?.weaponAdjustments, scaledMap(avgWeapon,0.26,WEAPON_KEYS)),
    weaponGrowthAdjustments:addMaps(predecessor?.weaponGrowthAdjustments, Object.fromEntries(preferredWeapons.map(k=>[k,0.025]))),
    preferredWeapons:[...new Set([...(predecessor?.preferredWeapons??[]),...preferredWeapons])].slice(0,5),
    statVarianceMultiplier:round3(Number(predecessor?.statVarianceMultiplier??1)*0.96),
    growthVarianceMultiplier:round3(Number(predecessor?.growthVarianceMultiplier??1)*0.96),
    predecessorNumber:200,
    refitGeneration:11, refitVersion:'4.8', tenthGeneration:false, eleventhGeneration:true,
    cleanSheetNaming:true, realWordNaming:true,
    collaborationType:'consortium', collaborationPartnerId:null, collaborationPartnerName:`${MANUFACTURERS.length}メーカー共同`, collaborationLeadManufacturerId:maker.id,
    commonStandard:true,
  };
  if (maker.id==='libido') { const enriched=applyLibidoBodyMechanics(series,1); return {...enriched,...buildLibidoDescriptions(enriched,11),concept:'26社共通規格を利用しながらも、LIBIDOは成人向けセクサロイドとしての作者性を最優先する。共通規格は作品を均質化するためではなく、各クリエイターがより自由な身体・人格・感覚設計へ踏み込むための土台として使われる。'}; }
  return series;
}

export const ELEVENTH_WAVE_SERIES_DEFINITIONS = MANUFACTURERS.flatMap((maker) => {
  const partners = MANUFACTURERS.filter((m)=>m.id!==maker.id);
  return [...partners.map((partner, slotIndex)=>bilateralSeries(maker, partner, slotIndex)), consortiumSeries(maker)];
});
