import { EXPANDED_SERIES_DEFINITIONS } from './seriesExpansionDefinitions.js?v=4.8';
import { THIRD_WAVE_SERIES_DEFINITIONS } from './seriesThirdWaveDefinitions.js?v=4.8';
import { FOURTH_WAVE_SERIES_DEFINITIONS } from './seriesFourthWaveDefinitions.js?v=4.8';
import { FIFTH_WAVE_SERIES_DEFINITIONS } from './seriesFifthWaveDefinitions.js?v=4.8';
import { SIXTH_WAVE_SERIES_DEFINITIONS } from './seriesSixthWaveDefinitions.js?v=4.8';
import { SEVENTH_WAVE_SERIES_DEFINITIONS } from './seriesSeventhWaveDefinitions.js?v=4.8';
import { EIGHTH_WAVE_SERIES_DEFINITIONS } from './seriesEighthWaveDefinitions.js?v=4.8';
import { NINTH_WAVE_SERIES_DEFINITIONS } from './seriesNinthWaveDefinitions.js?v=4.8';
import { TENTH_WAVE_SERIES_DEFINITIONS } from './seriesTenthWaveDefinitions.js?v=4.8';
import { ELEVENTH_WAVE_SERIES_DEFINITIONS } from './seriesEleventhWaveDefinitions.js?v=4.8';
import { NEW_MANUFACTURER_PRE_G11_SERIES } from './seriesNewManufacturerDefinitions.js?v=4.8';
import { localizeSeriesName, seriesJapaneseDisplayIsValid } from './seriesNameLocalization.js?v=4.8';
import { LEGACY_SERIES_REFIT_OVERRIDES } from './seriesLegacyRefitDefinitions.js?v=4.8';
import { SECOND_GENERATION_REFIT_OVERRIDES } from './seriesSecondGenerationRefitDefinitions.js?v=4.8';
import { THIRD_GENERATION_REFIT_OVERRIDES } from './seriesThirdGenerationRefitDefinitions.js?v=4.8';
import { FOURTH_GENERATION_REFIT_OVERRIDES } from './seriesFourthGenerationRefitDefinitions.js?v=4.8';
import { BASE_SYNERGY_RULES } from './battleRules.js?v=4.8';
import { WEAPON_CATEGORIES } from './weaponDefinitions.js?v=4.8';
import { MANUFACTURERS } from './manufacturers.js?v=4.8';

// Original catalog: 20 legacy manufacturers x 20 series per generation. Additional manufacturers are merged through seriesNewManufacturerDefinitions; generation 11 is generated from the complete current roster.
// v3.1 refits the original 400 entries; v3.2 applies the same review standard to the 400 second-generation legacy entries.

export const SERIES_ARCHETYPES = {
  "balanced": {
    "label": "標準汎用",
    "summary": "突出より総合完成度を優先する汎用設計。",
    "groupBias": {},
    "growthBias": {},
    "reliabilityBias": 3,
    "resistanceBias": 1,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "highOutput": {
    "label": "高出力",
    "summary": "出力と機関を優先し、機動・情報系をある程度割り切る。",
    "groupBias": {
      "output": 9,
      "engine": 5,
      "mobility": -4,
      "sensor": -2
    },
    "growthBias": {
      "output": 0.08,
      "engine": 0.04,
      "mobility": -0.02
    },
    "reliabilityBias": -2,
    "resistanceBias": 1,
    "weaponBias": {
      "hammer": 5,
      "cannon": 5,
      "beamCannon": 4
    },
    "weaponGrowthBias": {
      "hammer": 0.08,
      "cannon": 0.07,
      "beamCannon": 0.06
    },
    "preferredWeapons": [
      "hammer",
      "cannon",
      "beamCannon"
    ],
    "statVariance": 1.05,
    "growthVariance": 1.05
  },
  "mobile": {
    "label": "高機動",
    "summary": "駆動・反応・制御を重視した高速設計。",
    "groupBias": {
      "mobility": 10,
      "control": 5,
      "output": -2,
      "engine": -2
    },
    "growthBias": {
      "mobility": 0.09,
      "control": 0.04
    },
    "reliabilityBias": 0,
    "resistanceBias": -2,
    "weaponBias": {
      "blade": 4,
      "lance": 4,
      "beamBlade": 4,
      "machineGun": 2
    },
    "weaponGrowthBias": {
      "blade": 0.05,
      "lance": 0.05,
      "beamBlade": 0.05
    },
    "preferredWeapons": [
      "blade",
      "lance",
      "beamBlade"
    ],
    "statVariance": 1.0,
    "growthVariance": 1.0
  },
  "control": {
    "label": "精密制御",
    "summary": "姿勢・装備・微細制御を軸に、武装を正確に扱う設計。",
    "groupBias": {
      "control": 10,
      "compute": 3,
      "mobility": 2,
      "output": -2
    },
    "growthBias": {
      "control": 0.09,
      "compute": 0.03
    },
    "reliabilityBias": 4,
    "resistanceBias": 0,
    "weaponBias": {
      "rifle": 4,
      "laser": 4,
      "lance": 3,
      "beamBlade": 3
    },
    "weaponGrowthBias": {
      "rifle": 0.05,
      "laser": 0.05
    },
    "preferredWeapons": [
      "rifle",
      "laser",
      "lance"
    ],
    "statVariance": 0.86,
    "growthVariance": 0.88
  },
  "engine": {
    "label": "機関強化",
    "summary": "発電・供給・冷却に余裕を持たせ、兵装の土台を強くする。",
    "groupBias": {
      "engine": 10,
      "output": 4,
      "control": 1,
      "mobility": -2
    },
    "growthBias": {
      "engine": 0.09,
      "output": 0.03
    },
    "reliabilityBias": 5,
    "resistanceBias": 2,
    "weaponBias": {
      "beamCannon": 4,
      "laser": 3,
      "cannon": 3,
      "beamBlade": 2
    },
    "weaponGrowthBias": {
      "beamCannon": 0.05,
      "laser": 0.04
    },
    "preferredWeapons": [
      "beamCannon",
      "laser",
      "cannon"
    ],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "compute": {
    "label": "演算特化",
    "summary": "処理能力と情報統合へ資源を集中した演算中心設計。",
    "groupBias": {
      "compute": 11,
      "ai": 4,
      "sensor": 3,
      "output": -4,
      "engine": -2
    },
    "growthBias": {
      "compute": 0.1,
      "ai": 0.03,
      "sensor": 0.02
    },
    "reliabilityBias": 0,
    "resistanceBias": -1,
    "weaponBias": {
      "emp": 5,
      "drone": 4,
      "missile": 3
    },
    "weaponGrowthBias": {
      "emp": 0.06,
      "drone": 0.05
    },
    "preferredWeapons": [
      "emp",
      "drone",
      "missile"
    ],
    "statVariance": 0.95,
    "growthVariance": 0.98
  },
  "sensor": {
    "label": "センサー特化",
    "summary": "探知・追跡・情報更新を優先する観測能力重視の設計。",
    "groupBias": {
      "sensor": 11,
      "compute": 4,
      "ai": 2,
      "output": -3
    },
    "growthBias": {
      "sensor": 0.1,
      "compute": 0.03
    },
    "reliabilityBias": 2,
    "resistanceBias": 0,
    "weaponBias": {
      "rifle": 5,
      "laser": 5,
      "missile": 5
    },
    "weaponGrowthBias": {
      "rifle": 0.05,
      "laser": 0.05,
      "missile": 0.05
    },
    "preferredWeapons": [
      "rifle",
      "laser",
      "missile"
    ],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "ai": {
    "label": "AI特化",
    "summary": "判断・予測・戦術選択を中心に戦闘AIへ比重を置く。",
    "groupBias": {
      "ai": 12,
      "compute": 4,
      "sensor": 3,
      "engine": -2,
      "output": -3
    },
    "growthBias": {
      "ai": 0.11,
      "compute": 0.03
    },
    "reliabilityBias": -1,
    "resistanceBias": 0,
    "weaponBias": {
      "drone": 6,
      "missile": 4,
      "emp": 3
    },
    "weaponGrowthBias": {
      "drone": 0.07,
      "missile": 0.05
    },
    "preferredWeapons": [
      "drone",
      "missile",
      "emp"
    ],
    "statVariance": 1.0,
    "growthVariance": 1.03
  },
  "meleePhysical": {
    "label": "近接物理",
    "summary": "物理近接兵装を扱うための出力・駆動・制御を強化。",
    "groupBias": {
      "output": 5,
      "mobility": 5,
      "control": 5,
      "sensor": -3
    },
    "growthBias": {
      "output": 0.03,
      "mobility": 0.04,
      "control": 0.04
    },
    "reliabilityBias": 0,
    "resistanceBias": 2,
    "weaponBias": {
      "blade": 8,
      "hammer": 8,
      "lance": 8
    },
    "weaponGrowthBias": {
      "blade": 0.08,
      "hammer": 0.08,
      "lance": 0.08
    },
    "preferredWeapons": [
      "blade",
      "hammer",
      "lance"
    ],
    "statVariance": 1.0,
    "growthVariance": 1.0
  },
  "meleeEnergy": {
    "label": "近接エネルギー",
    "summary": "ビームブレード運用を軸に出力・制御・機関を高める。",
    "groupBias": {
      "output": 4,
      "control": 5,
      "engine": 5,
      "mobility": 3
    },
    "growthBias": {
      "control": 0.04,
      "engine": 0.04,
      "output": 0.03
    },
    "reliabilityBias": -1,
    "resistanceBias": 0,
    "weaponBias": {
      "beamBlade": 10,
      "blade": 2
    },
    "weaponGrowthBias": {
      "beamBlade": 0.11
    },
    "preferredWeapons": [
      "beamBlade"
    ],
    "statVariance": 1.0,
    "growthVariance": 1.02
  },
  "rangedPhysical": {
    "label": "遠距離物理",
    "summary": "実弾射撃の精度・制御・追跡を安定させる設計。",
    "groupBias": {
      "control": 4,
      "sensor": 5,
      "compute": 2,
      "mobility": -1
    },
    "growthBias": {
      "control": 0.03,
      "sensor": 0.04
    },
    "reliabilityBias": 3,
    "resistanceBias": 0,
    "weaponBias": {
      "rifle": 8,
      "machineGun": 8,
      "cannon": 7
    },
    "weaponGrowthBias": {
      "rifle": 0.08,
      "machineGun": 0.08,
      "cannon": 0.07
    },
    "preferredWeapons": [
      "rifle",
      "machineGun",
      "cannon"
    ],
    "statVariance": 0.92,
    "growthVariance": 0.94
  },
  "rangedEnergy": {
    "label": "遠距離エネルギー",
    "summary": "エネルギー射撃の出力・収束・熱処理を重視する。",
    "groupBias": {
      "engine": 5,
      "control": 4,
      "sensor": 4,
      "output": 3
    },
    "growthBias": {
      "engine": 0.04,
      "control": 0.03,
      "sensor": 0.03
    },
    "reliabilityBias": -1,
    "resistanceBias": 0,
    "weaponBias": {
      "laser": 9,
      "beamCannon": 9
    },
    "weaponGrowthBias": {
      "laser": 0.09,
      "beamCannon": 0.09
    },
    "preferredWeapons": [
      "laser",
      "beamCannon"
    ],
    "statVariance": 1.0,
    "growthVariance": 1.02
  },
  "missile": {
    "label": "誘導兵装",
    "summary": "追跡・演算・AIを連携させ、ミサイル運用へ寄せる。",
    "groupBias": {
      "sensor": 6,
      "compute": 5,
      "ai": 4,
      "control": 2
    },
    "growthBias": {
      "sensor": 0.05,
      "compute": 0.04,
      "ai": 0.03
    },
    "reliabilityBias": 1,
    "resistanceBias": 0,
    "weaponBias": {
      "missile": 12
    },
    "weaponGrowthBias": {
      "missile": 0.13
    },
    "preferredWeapons": [
      "missile"
    ],
    "statVariance": 0.96,
    "growthVariance": 0.98
  },
  "emp": {
    "label": "電子戦",
    "summary": "演算・センサー・AIを電子攻撃へ最適化する。",
    "groupBias": {
      "compute": 7,
      "sensor": 5,
      "ai": 5,
      "output": -3
    },
    "growthBias": {
      "compute": 0.06,
      "sensor": 0.04,
      "ai": 0.04
    },
    "reliabilityBias": -2,
    "resistanceBias": 1,
    "weaponBias": {
      "emp": 13
    },
    "weaponGrowthBias": {
      "emp": 0.14
    },
    "preferredWeapons": [
      "emp"
    ],
    "statVariance": 1.05,
    "growthVariance": 1.08
  },
  "drone": {
    "label": "無人機管制",
    "summary": "並列処理・AI・制御をドローン群運用へ最適化する。",
    "groupBias": {
      "compute": 6,
      "ai": 7,
      "control": 3,
      "sensor": 3
    },
    "growthBias": {
      "compute": 0.05,
      "ai": 0.06,
      "control": 0.02
    },
    "reliabilityBias": -1,
    "resistanceBias": 0,
    "weaponBias": {
      "drone": 13
    },
    "weaponGrowthBias": {
      "drone": 0.14
    },
    "preferredWeapons": [
      "drone"
    ],
    "statVariance": 1.02,
    "growthVariance": 1.05
  },
  "heavyAssault": {
    "label": "重攻撃",
    "summary": "出力・機関・耐性を高め、重兵装の正面性能を追求する。",
    "groupBias": {
      "output": 8,
      "engine": 7,
      "control": 2,
      "mobility": -6,
      "sensor": -2
    },
    "growthBias": {
      "output": 0.07,
      "engine": 0.06,
      "mobility": -0.02
    },
    "reliabilityBias": 3,
    "resistanceBias": 6,
    "weaponBias": {
      "hammer": 9,
      "cannon": 9,
      "beamCannon": 6
    },
    "weaponGrowthBias": {
      "hammer": 0.09,
      "cannon": 0.09
    },
    "preferredWeapons": [
      "hammer",
      "cannon"
    ],
    "statVariance": 0.96,
    "growthVariance": 0.98
  },
  "precision": {
    "label": "精密戦闘",
    "summary": "制御・センサー・演算を揃え、誤差の少ない戦闘を志向する。",
    "groupBias": {
      "control": 7,
      "sensor": 7,
      "compute": 5,
      "output": -3
    },
    "growthBias": {
      "control": 0.05,
      "sensor": 0.05,
      "compute": 0.04
    },
    "reliabilityBias": 7,
    "resistanceBias": 0,
    "weaponBias": {
      "rifle": 6,
      "laser": 6,
      "missile": 3
    },
    "weaponGrowthBias": {
      "rifle": 0.06,
      "laser": 0.06
    },
    "preferredWeapons": [
      "rifle",
      "laser"
    ],
    "statVariance": 0.72,
    "growthVariance": 0.78
  },
  "resilient": {
    "label": "耐環境",
    "summary": "耐性・機関・制御の余裕を高め、不得意条件で崩れにくくする。",
    "groupBias": {
      "engine": 5,
      "control": 3,
      "ai": 2,
      "output": 1
    },
    "growthBias": {
      "engine": 0.04,
      "control": 0.02
    },
    "reliabilityBias": 6,
    "resistanceBias": 9,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.82,
    "growthVariance": 0.86
  },
  "reliable": {
    "label": "高信頼",
    "summary": "性能の再現性と安定稼働を最優先する堅実設計。",
    "groupBias": {
      "control": 2,
      "engine": 2,
      "compute": 1
    },
    "growthBias": {
      "control": 0.01,
      "engine": 0.01
    },
    "reliabilityBias": 12,
    "resistanceBias": 2,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.62,
    "growthVariance": 0.7
  },
  "volatileExperimental": {
    "label": "実験特化",
    "summary": "大きな長所と欠点を同居させる試験色の強い設計。",
    "groupBias": {
      "output": 4,
      "mobility": 4,
      "compute": 4,
      "ai": 3,
      "engine": -3,
      "control": -2
    },
    "growthBias": {
      "output": 0.05,
      "mobility": 0.05,
      "compute": 0.05,
      "ai": 0.05
    },
    "reliabilityBias": -12,
    "resistanceBias": -1,
    "weaponBias": {
      "beamCannon": 4,
      "emp": 4,
      "drone": 4
    },
    "weaponGrowthBias": {
      "beamCannon": 0.08,
      "emp": 0.08,
      "drone": 0.08
    },
    "preferredWeapons": [
      "beamCannon",
      "emp",
      "drone"
    ],
    "statVariance": 1.45,
    "growthVariance": 1.45,
    "eccentricBonus": 0.18
  },
  "hybridClose": {
    "label": "近接複合",
    "summary": "近接兵装を選ばず扱えるよう駆動・制御・出力を均衡させる。",
    "groupBias": {
      "output": 3,
      "mobility": 6,
      "control": 6,
      "engine": 1
    },
    "growthBias": {
      "mobility": 0.05,
      "control": 0.05,
      "output": 0.02
    },
    "reliabilityBias": 2,
    "resistanceBias": 1,
    "weaponBias": {
      "blade": 5,
      "hammer": 5,
      "lance": 5,
      "beamBlade": 5
    },
    "weaponGrowthBias": {
      "blade": 0.05,
      "hammer": 0.05,
      "lance": 0.05,
      "beamBlade": 0.05
    },
    "preferredWeapons": [
      "blade",
      "hammer",
      "lance",
      "beamBlade"
    ],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "hybridRanged": {
    "label": "射撃複合",
    "summary": "実弾・エネルギー双方の射撃兵装へ対応する汎用射撃設計。",
    "groupBias": {
      "control": 5,
      "sensor": 5,
      "compute": 3,
      "engine": 2
    },
    "growthBias": {
      "control": 0.04,
      "sensor": 0.04,
      "compute": 0.02
    },
    "reliabilityBias": 2,
    "resistanceBias": 0,
    "weaponBias": {
      "rifle": 4,
      "machineGun": 4,
      "cannon": 4,
      "laser": 4,
      "beamCannon": 4
    },
    "weaponGrowthBias": {
      "rifle": 0.04,
      "machineGun": 0.04,
      "cannon": 0.04,
      "laser": 0.04,
      "beamCannon": 0.04
    },
    "preferredWeapons": [
      "rifle",
      "machineGun",
      "cannon",
      "laser",
      "beamCannon"
    ],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "electronicWarfare": {
    "label": "電子情報戦",
    "summary": "EMP・ドローン・誘導兵装を横断する情報戦向け設計。",
    "groupBias": {
      "compute": 7,
      "sensor": 7,
      "ai": 6,
      "control": 2,
      "output": -4
    },
    "growthBias": {
      "compute": 0.06,
      "sensor": 0.06,
      "ai": 0.05
    },
    "reliabilityBias": -2,
    "resistanceBias": 2,
    "weaponBias": {
      "emp": 8,
      "drone": 7,
      "missile": 6
    },
    "weaponGrowthBias": {
      "emp": 0.08,
      "drone": 0.07,
      "missile": 0.06
    },
    "preferredWeapons": [
      "emp",
      "drone",
      "missile"
    ],
    "statVariance": 1.0,
    "growthVariance": 1.03
  },
  "adaptive": {
    "label": "適応汎用",
    "summary": "一部特化を避け、複数の条件で最低性能を落としにくい設計。",
    "groupBias": {
      "mobility": 2,
      "control": 2,
      "engine": 2,
      "sensor": 2,
      "ai": 3
    },
    "growthBias": {
      "mobility": 0.01,
      "control": 0.01,
      "engine": 0.01,
      "sensor": 0.01,
      "ai": 0.02
    },
    "reliabilityBias": 5,
    "resistanceBias": 5,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.8,
    "growthVariance": 0.84
  },
  "apex": {
    "label": "頂点追求",
    "summary": "平均値を落とさず高水準へ寄せる代わりに、成長の伸びしろをやや犠牲にする完成品志向。",
    "groupBias": {"output": 5, "mobility": 4, "control": 5, "engine": 4, "compute": 3, "sensor": 3, "ai": 3},
    "growthBias": {"output": -0.01, "mobility": -0.01, "control": -0.01, "engine": -0.01},
    "reliabilityBias": 7, "resistanceBias": 3, "weaponBias": {}, "weaponGrowthBias": {}, "preferredWeapons": [],
    "statVariance": 0.72, "growthVariance": 0.78
  },
  "glassCannon": {
    "label": "限界出力",
    "summary": "出力へ設計資源を集中し、信頼性・耐性・他系統を明確に切り捨てるピーキー設計。",
    "groupBias": {"output": 16, "engine": 5, "control": -5, "mobility": -3, "sensor": -4, "ai": -3},
    "growthBias": {"output": 0.13, "engine": 0.04, "control": -0.03},
    "reliabilityBias": -12, "resistanceBias": -5,
    "weaponBias": {"hammer": 10, "cannon": 10, "beamCannon": 10},
    "weaponGrowthBias": {"hammer": 0.11, "cannon": 0.11, "beamCannon": 0.11},
    "preferredWeapons": ["hammer", "cannon", "beamCannon"], "statVariance": 1.28, "growthVariance": 1.2, "eccentricBonus": 0.08
  },
  "ultraMobile": {
    "label": "超軽量機動",
    "summary": "耐性と機関余裕を削って駆動・反応へ振り切る高速設計。",
    "groupBias": {"mobility": 16, "control": 7, "output": -4, "engine": -6, "compute": 1},
    "growthBias": {"mobility": 0.13, "control": 0.05, "engine": -0.04},
    "reliabilityBias": -5, "resistanceBias": -7,
    "weaponBias": {"blade": 8, "lance": 9, "beamBlade": 8, "machineGun": 4},
    "weaponGrowthBias": {"blade": 0.08, "lance": 0.1, "beamBlade": 0.08},
    "preferredWeapons": ["blade", "lance", "beamBlade"], "statVariance": 1.12, "growthVariance": 1.12
  },
  "fortress": {
    "label": "要塞設計",
    "summary": "機動を大胆に捨て、機関・耐性・信頼性で崩れにくさを極端に高める。",
    "groupBias": {"output": 5, "mobility": -13, "control": 3, "engine": 12, "compute": -2, "sensor": -2, "ai": 1},
    "growthBias": {"engine": 0.09, "output": 0.04, "mobility": -0.05},
    "reliabilityBias": 10, "resistanceBias": 14,
    "weaponBias": {"hammer": 7, "cannon": 10, "beamCannon": 7, "missile": 5},
    "weaponGrowthBias": {"cannon": 0.09, "beamCannon": 0.07},
    "preferredWeapons": ["cannon", "hammer", "beamCannon"], "statVariance": 0.8, "growthVariance": 0.86
  },
  "burstAssault": {
    "label": "瞬間決戦",
    "summary": "短時間だけ最大性能を発揮することを前提に、持続余力と安定性を削った突撃設計。",
    "groupBias": {"output": 11, "mobility": 9, "control": 4, "engine": -7, "sensor": -2},
    "growthBias": {"output": 0.09, "mobility": 0.08, "engine": -0.04},
    "reliabilityBias": -8, "resistanceBias": -3,
    "weaponBias": {"hammer": 7, "lance": 10, "beamBlade": 9},
    "weaponGrowthBias": {"lance": 0.11, "beamBlade": 0.09},
    "preferredWeapons": ["lance", "beamBlade", "hammer"], "statVariance": 1.2, "growthVariance": 1.15
  },
  "lateGrowth": {
    "label": "晩成設計",
    "summary": "初期完成度を意図的に抑え、3年間の調整で化ける成長余地を残した設計。",
    "groupBias": {"output": -4, "mobility": -4, "control": -4, "engine": -4, "compute": -4, "sensor": -4, "ai": -4},
    "growthBias": {"output": 0.08, "mobility": 0.08, "control": 0.08, "engine": 0.08, "compute": 0.08, "sensor": 0.08, "ai": 0.08},
    "reliabilityBias": 0, "resistanceBias": 0, "weaponBias": {},
    "weaponGrowthBias": {"blade": 0.04, "hammer": 0.04, "lance": 0.04, "beamBlade": 0.04, "rifle": 0.04, "machineGun": 0.04, "cannon": 0.04, "laser": 0.04, "beamCannon": 0.04, "missile": 0.04, "emp": 0.04, "drone": 0.04},
    "preferredWeapons": [], "statVariance": 1.04, "growthVariance": 1.2
  },
  "dataGlass": {
    "label": "情報偏重",
    "summary": "演算・センサー・AIを突出させる代わり、出力と機関を極端に薄くした情報優先設計。",
    "groupBias": {"output": -10, "mobility": -2, "control": 2, "engine": -8, "compute": 14, "sensor": 14, "ai": 11},
    "growthBias": {"compute": 0.11, "sensor": 0.11, "ai": 0.09, "output": -0.04},
    "reliabilityBias": -5, "resistanceBias": -3,
    "weaponBias": {"rifle": 5, "laser": 6, "missile": 8, "emp": 10, "drone": 10},
    "weaponGrowthBias": {"missile": 0.07, "emp": 0.1, "drone": 0.1},
    "preferredWeapons": ["emp", "drone", "missile"], "statVariance": 1.14, "growthVariance": 1.12
  },
  "countermeasure": {
    "label": "対策特化",
    "summary": "攻めの最高値より耐性・判断・観測を優先し、相手の得意分野を受け止める設計。",
    "groupBias": {"output": -5, "mobility": 0, "control": 4, "engine": 5, "compute": 3, "sensor": 6, "ai": 6},
    "growthBias": {"control": 0.03, "sensor": 0.05, "ai": 0.05},
    "reliabilityBias": 7, "resistanceBias": 12,
    "weaponBias": {"rifle": 3, "missile": 4, "emp": 5},
    "weaponGrowthBias": {"emp": 0.06, "missile": 0.04},
    "preferredWeapons": ["emp", "missile", "rifle"], "statVariance": 0.8, "growthVariance": 0.88
  },
  "weaponSavant": {
    "label": "兵装サヴァン",
    "summary": "機体本体は平均的だが、特定兵装だけ異常な適性と成長余地を持つ専門系列。",
    "groupBias": {"control": 2, "compute": 1}, "growthBias": {"control": 0.01},
    "reliabilityBias": 0, "resistanceBias": 0, "weaponBias": {}, "weaponGrowthBias": {}, "preferredWeapons": [],
    "statVariance": 0.96, "growthVariance": 1.05, "eccentricBonus": 0.12
  },
  "overengineered": {
    "label": "過剰設計",
    "summary": "必要性能を大きく上回る余裕と再現性を確保する代わり、機動と成長効率を犠牲にする。",
    "groupBias": {"output": 6, "mobility": -5, "control": 5, "engine": 8, "compute": 3, "sensor": 2, "ai": 2},
    "growthBias": {"output": -0.01, "control": -0.01, "engine": -0.01},
    "reliabilityBias": 13, "resistanceBias": 8, "weaponBias": {"cannon": 5, "beamCannon": 5, "hammer": 4},
    "weaponGrowthBias": {}, "preferredWeapons": ["cannon", "beamCannon", "hammer"], "statVariance": 0.62, "growthVariance": 0.75
  },
  "minimalist": {
    "label": "最小構成",
    "summary": "余分な機能を削り、少数の能力だけを高効率に成立させる簡素化設計。",
    "groupBias": {"output": 1, "mobility": 3, "control": 5, "engine": 1, "compute": -4, "sensor": -3, "ai": -3},
    "growthBias": {"mobility": 0.03, "control": 0.04},
    "reliabilityBias": 9, "resistanceBias": 1, "weaponBias": {"blade": 4, "rifle": 4, "machineGun": 3},
    "weaponGrowthBias": {"blade": 0.04, "rifle": 0.04}, "preferredWeapons": ["blade", "rifle"], "statVariance": 0.7, "growthVariance": 0.82
  },
  "massProduction": {
    "label": "量産標準",
    "summary": "大量生産と運用互換性を優先し、突出より均質さを取る。",
    "groupBias": { "control": 2, "engine": 2 },
    "growthBias": {},
    "reliabilityBias": 6,
    "resistanceBias": 1,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.78,
    "growthVariance": 0.86
  },
  "budget": {
    "label": "廉価量産",
    "summary": "必要十分な性能へ絞り、初期性能を少し落として製造性と扱いやすさを優先する。",
    "groupBias": { "output": -3, "mobility": -2, "control": -1, "engine": -1, "compute": -3, "sensor": -2, "ai": -2 },
    "growthBias": { "control": 0.02, "engine": 0.02 },
    "reliabilityBias": 3,
    "resistanceBias": 0,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.82,
    "growthVariance": 0.9
  },
  "flagship": {
    "label": "フラッグシップ",
    "summary": "採算よりブランドを優先し、全体水準を高くまとめた看板設計。",
    "groupBias": { "output": 4, "mobility": 4, "control": 4, "engine": 4, "compute": 4, "sensor": 4, "ai": 4 },
    "growthBias": { "output": 0.015, "mobility": 0.015, "control": 0.015, "engine": 0.015, "compute": 0.015, "sensor": 0.015, "ai": 0.015 },
    "reliabilityBias": 4,
    "resistanceBias": 2,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "retro": {
    "label": "復刻設計",
    "summary": "旧世代の単純な構造を現代技術で再構成し、物理性能と扱いやすさを取り戻す。",
    "groupBias": { "output": 5, "mobility": 1, "control": 2, "engine": 4, "compute": -5, "sensor": -3, "ai": -4 },
    "growthBias": { "output": 0.03, "engine": 0.03, "compute": -0.02, "ai": -0.02 },
    "reliabilityBias": 5,
    "resistanceBias": 2,
    "weaponBias": { "blade": 3, "hammer": 3, "lance": 3, "rifle": 2, "cannon": 2 },
    "weaponGrowthBias": { "blade": 0.03, "hammer": 0.03, "lance": 0.03 },
    "preferredWeapons": ["blade", "hammer", "lance"],
    "statVariance": 0.9,
    "growthVariance": 0.92
  },
  "growthProject": {
    "label": "育成前提",
    "summary": "完成状態で納入せず、調整・学習・改修によって三年間で完成する余白を残す。",
    "groupBias": { "output": -5, "mobility": -5, "control": -5, "engine": -5, "compute": -5, "sensor": -5, "ai": -5 },
    "growthBias": { "output": 0.075, "mobility": 0.075, "control": 0.075, "engine": 0.075, "compute": 0.075, "sensor": 0.075, "ai": 0.075 },
    "reliabilityBias": 0,
    "resistanceBias": 0,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 1.0,
    "growthVariance": 1.14
  },
  "aiAnomaly": {
    "label": "AI異常特化",
    "summary": "戦闘AIと情報処理へ極端に資源を寄せ、機械側を判断系へ従属させる。",
    "groupBias": { "output": -6, "mobility": -4, "control": 1, "engine": -5, "compute": 8, "sensor": 5, "ai": 16 },
    "growthBias": { "compute": 0.05, "sensor": 0.03, "ai": 0.10, "output": -0.025, "engine": -0.02 },
    "reliabilityBias": -5,
    "resistanceBias": -2,
    "weaponBias": { "drone": 7, "emp": 5, "missile": 3 },
    "weaponGrowthBias": { "drone": 0.07, "emp": 0.05 },
    "preferredWeapons": ["drone", "emp"],
    "statVariance": 1.05,
    "growthVariance": 1.08
  },
  "lottery": {
    "label": "高個体差高性能",
    "summary": "平均値より当たり個体の突出を優先し、製造ばらつきを意図的に残す。",
    "groupBias": { "output": 2, "mobility": 2, "control": 2, "engine": 2, "compute": 2, "sensor": 2, "ai": 2 },
    "growthBias": { "output": 0.015, "mobility": 0.015, "control": 0.015, "engine": 0.015, "compute": 0.015, "sensor": 0.015, "ai": 0.015 },
    "reliabilityBias": -5,
    "resistanceBias": 0,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 1.38,
    "growthVariance": 1.3,
    "eccentricBonus": 0.05
  },
  "counterDesign": {
    "label": "対抗設計",
    "summary": "競合機の典型的な強みを解析し、観測・制御・対応判断から相手の得意形を崩す。",
    "groupBias": { "control": 5, "compute": 3, "sensor": 7, "ai": 4, "output": -2 },
    "growthBias": { "control": 0.035, "sensor": 0.05, "ai": 0.03 },
    "reliabilityBias": 1,
    "resistanceBias": 1,
    "weaponBias": { "rifle": 2, "missile": 3, "emp": 4 },
    "weaponGrowthBias": { "emp": 0.04 },
    "preferredWeapons": ["emp", "missile"],
    "statVariance": 0.95,
    "growthVariance": 1.0
  },
  "longSeller": {
    "label": "ロングセラー",
    "summary": "長期の運用実績で細かな欠点を潰し、派手さより再現性と整備性を優先する。",
    "groupBias": { "output": 1, "mobility": 1, "control": 2, "engine": 2, "compute": 1, "sensor": 1, "ai": 1 },
    "growthBias": {},
    "reliabilityBias": 8,
    "resistanceBias": 2,
    "weaponBias": {},
    "weaponGrowthBias": {},
    "preferredWeapons": [],
    "statVariance": 0.7,
    "growthVariance": 0.8
  }
};

export const SERIES_DEFINITIONS = [
  {
    "id": "kirishima-takachiho",
    "manufacturerId": "kirishima",
    "seriesNumber": 1,
    "nameKana": "タカチホ",
    "nameLatin": "TAKACHIHO",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "mobility": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "kirishima-asama",
    "manufacturerId": "kirishima",
    "seriesNumber": 2,
    "nameKana": "アサマ",
    "nameLatin": "ASAMA",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "control": 2,
      "output": 2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "kirishima-ibuki",
    "manufacturerId": "kirishima",
    "seriesNumber": 3,
    "nameKana": "イブキ",
    "nameLatin": "IBUKI",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "output": -1,
      "engine": -1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 0.95
  },
  {
    "id": "kirishima-aso",
    "manufacturerId": "kirishima",
    "seriesNumber": 4,
    "nameKana": "アソ",
    "nameLatin": "ASO",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "sensor": -1,
      "control": -1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "kirishima-daisen",
    "manufacturerId": "kirishima",
    "seriesNumber": 5,
    "nameKana": "ダイセン",
    "nameLatin": "DAISEN",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "control": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "kirishima-ontake",
    "manufacturerId": "kirishima",
    "seriesNumber": 6,
    "nameKana": "オンタケ",
    "nameLatin": "ONTAKE",
    "archetypeId": "control",
    "groupAdjustments": {
      "control": 1,
      "ai": 2
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "kirishima-tateyama",
    "manufacturerId": "kirishima",
    "seriesNumber": 7,
    "nameKana": "タテヤマ",
    "nameLatin": "TATEYAMA",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "control": -1,
      "engine": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "machineGun": 2
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "kirishima-tsukuba",
    "manufacturerId": "kirishima",
    "seriesNumber": 8,
    "nameKana": "ツクバ",
    "nameLatin": "TSUKUBA",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "compute": 2,
      "output": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": 2
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "kirishima-hiei",
    "manufacturerId": "kirishima",
    "seriesNumber": 9,
    "nameKana": "ヒエイ",
    "nameLatin": "HIEI",
    "archetypeId": "engine",
    "groupAdjustments": {
      "ai": -2,
      "mobility": -1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "kirishima-rokko",
    "manufacturerId": "kirishima",
    "seriesNumber": 10,
    "nameKana": "ロッコ",
    "nameLatin": "ROKKO",
    "archetypeId": "precision",
    "groupAdjustments": {
      "output": -1,
      "mobility": -1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "kirishima-koya",
    "manufacturerId": "kirishima",
    "seriesNumber": 11,
    "nameKana": "コウヤ",
    "nameLatin": "KOYA",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "compute": 2,
      "control": 2
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "kirishima-bandai",
    "manufacturerId": "kirishima",
    "seriesNumber": 12,
    "nameKana": "バンダイ",
    "nameLatin": "BANDAI",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "mobility": 2,
      "control": -2
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "machineGun": 2
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "kirishima-chokai",
    "manufacturerId": "kirishima",
    "seriesNumber": 13,
    "nameKana": "チョウカイ",
    "nameLatin": "CHOKAI",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "control": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "kirishima-zao",
    "manufacturerId": "kirishima",
    "seriesNumber": 14,
    "nameKana": "ザオウ",
    "nameLatin": "ZAO",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "sensor": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "kirishima-yari",
    "manufacturerId": "kirishima",
    "seriesNumber": 15,
    "nameKana": "ヤリ",
    "nameLatin": "YARI",
    "archetypeId": "ai",
    "groupAdjustments": {
      "output": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "kirishima-hotaka",
    "manufacturerId": "kirishima",
    "seriesNumber": 16,
    "nameKana": "ホタカ",
    "nameLatin": "HOTAKA",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "control": 2,
      "compute": -1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": 2
    },
    "availabilityWeight": 0.87
  },
  {
    "id": "kirishima-hakusan",
    "manufacturerId": "kirishima",
    "seriesNumber": 17,
    "nameKana": "ハクサン",
    "nameLatin": "HAKUSAN",
    "archetypeId": "missile",
    "groupAdjustments": {
      "engine": -2,
      "ai": 2
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "kirishima-kitadake",
    "manufacturerId": "kirishima",
    "seriesNumber": 18,
    "nameKana": "キタダケ",
    "nameLatin": "KITADAKE",
    "archetypeId": "compute",
    "groupAdjustments": {
      "output": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "kirishima-kaikoma",
    "manufacturerId": "kirishima",
    "seriesNumber": 19,
    "nameKana": "カイコマ",
    "nameLatin": "KAIKOMA",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "engine": 1,
      "control": -2
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "kirishima-kuju",
    "manufacturerId": "kirishima",
    "seriesNumber": 20,
    "nameKana": "クジュウ",
    "nameLatin": "KUJU",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "ai": 1,
      "sensor": 2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "mizuho-sakura",
    "manufacturerId": "mizuho",
    "seriesNumber": 1,
    "nameKana": "サクラ",
    "nameLatin": "SAKURA",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "sensor": 1,
      "engine": 1
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "mizuho-botan",
    "manufacturerId": "mizuho",
    "seriesNumber": 2,
    "nameKana": "ボタン",
    "nameLatin": "BOTAN",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "sensor": 1,
      "output": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "mizuho-rindou",
    "manufacturerId": "mizuho",
    "seriesNumber": 3,
    "nameKana": "リンドウ",
    "nameLatin": "RINDOU",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "sensor": -1,
      "ai": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "mizuho-kiku",
    "manufacturerId": "mizuho",
    "seriesNumber": 4,
    "nameKana": "キク",
    "nameLatin": "KIKU",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "compute": -2,
      "engine": 1
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "mizuho-tsubaki",
    "manufacturerId": "mizuho",
    "seriesNumber": 5,
    "nameKana": "ツバキ",
    "nameLatin": "TSUBAKI",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "output": 2,
      "mobility": 1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "mizuho-ume",
    "manufacturerId": "mizuho",
    "seriesNumber": 6,
    "nameKana": "ウメ",
    "nameLatin": "UME",
    "archetypeId": "control",
    "groupAdjustments": {
      "sensor": -2,
      "ai": -2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.91
  },
  {
    "id": "mizuho-ayame",
    "manufacturerId": "mizuho",
    "seriesNumber": 7,
    "nameKana": "アヤメ",
    "nameLatin": "AYAME",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "sensor": 1,
      "ai": 1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "mizuho-asagao",
    "manufacturerId": "mizuho",
    "seriesNumber": 8,
    "nameKana": "アサガオ",
    "nameLatin": "ASAGAO",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "output": -1,
      "sensor": -1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "machineGun": 2
    },
    "availabilityWeight": 1.18
  },
  {
    "id": "mizuho-yuri",
    "manufacturerId": "mizuho",
    "seriesNumber": 9,
    "nameKana": "ユリ",
    "nameLatin": "YURI",
    "archetypeId": "ai",
    "groupAdjustments": {
      "compute": -1,
      "output": -1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "mizuho-hagi",
    "manufacturerId": "mizuho",
    "seriesNumber": 10,
    "nameKana": "ハギ",
    "nameLatin": "HAGI",
    "archetypeId": "engine",
    "groupAdjustments": {
      "sensor": 1,
      "compute": 1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "mizuho-nadeshiko",
    "manufacturerId": "mizuho",
    "seriesNumber": 11,
    "nameKana": "ナデシコ",
    "nameLatin": "NADESHIKO",
    "archetypeId": "precision",
    "groupAdjustments": {
      "output": 2,
      "engine": -2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "mizuho-sumire",
    "manufacturerId": "mizuho",
    "seriesNumber": 12,
    "nameKana": "スミレ",
    "nameLatin": "SUMIRE",
    "archetypeId": "missile",
    "groupAdjustments": {
      "ai": 2,
      "engine": 2
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "mizuho-higanbana",
    "manufacturerId": "mizuho",
    "seriesNumber": 13,
    "nameKana": "ヒガンバナ",
    "nameLatin": "HIGANBANA",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "output": -1,
      "control": -1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "mizuho-momo",
    "manufacturerId": "mizuho",
    "seriesNumber": 14,
    "nameKana": "モモ",
    "nameLatin": "MOMO",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "control": -1,
      "engine": -2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "blade": -1
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "mizuho-nanohana",
    "manufacturerId": "mizuho",
    "seriesNumber": 15,
    "nameKana": "ナノハナ",
    "nameLatin": "NANOHANA",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "ai": -2,
      "control": -2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "mizuho-ajisai",
    "manufacturerId": "mizuho",
    "seriesNumber": 16,
    "nameKana": "アジサイ",
    "nameLatin": "AJISAI",
    "archetypeId": "compute",
    "groupAdjustments": {
      "compute": 1,
      "mobility": -2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "mizuho-kikyo",
    "manufacturerId": "mizuho",
    "seriesNumber": 17,
    "nameKana": "キキョウ",
    "nameLatin": "KIKYO",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "compute": 1,
      "control": 1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "mizuho-shakuyaku",
    "manufacturerId": "mizuho",
    "seriesNumber": 18,
    "nameKana": "シャクヤク",
    "nameLatin": "SHAKUYAKU",
    "archetypeId": "drone",
    "groupAdjustments": {
      "mobility": 2,
      "ai": 2
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "mizuho-fuyo",
    "manufacturerId": "mizuho",
    "seriesNumber": 19,
    "nameKana": "フヨウ",
    "nameLatin": "FUYO",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "compute": -2,
      "output": -1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "mizuho-yukiyanagi",
    "manufacturerId": "mizuho",
    "seriesNumber": 20,
    "nameKana": "ユキヤナギ",
    "nameLatin": "YUKIYANAGI",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "engine": -2,
      "control": -2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "gogaku-hisui",
    "manufacturerId": "gogaku",
    "seriesNumber": 1,
    "nameKana": "ヒスイ",
    "nameLatin": "HISUI",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "mobility": -1,
      "output": -2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "gogaku-suisho",
    "manufacturerId": "gogaku",
    "seriesNumber": 2,
    "nameKana": "スイショウ",
    "nameLatin": "SUISHO",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "sensor": -1,
      "output": 1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "gogaku-kokuyo",
    "manufacturerId": "gogaku",
    "seriesNumber": 3,
    "nameKana": "コクヨウ",
    "nameLatin": "KOKUYO",
    "archetypeId": "engine",
    "groupAdjustments": {
      "ai": 2,
      "mobility": -2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "gogaku-kohaku",
    "manufacturerId": "gogaku",
    "seriesNumber": 4,
    "nameKana": "コハク",
    "nameLatin": "KOHAKU",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "ai": -2,
      "compute": -1
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "gogaku-kongo",
    "manufacturerId": "gogaku",
    "seriesNumber": 5,
    "nameKana": "コンゴウ",
    "nameLatin": "KONGO",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "engine": -1,
      "mobility": 1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "gogaku-ruri",
    "manufacturerId": "gogaku",
    "seriesNumber": 6,
    "nameKana": "ルリ",
    "nameLatin": "RURI",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "sensor": -2,
      "output": 2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "gogaku-menou",
    "manufacturerId": "gogaku",
    "seriesNumber": 7,
    "nameKana": "メノウ",
    "nameLatin": "MENOU",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "engine": -2,
      "sensor": -1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "gogaku-zakuro",
    "manufacturerId": "gogaku",
    "seriesNumber": 8,
    "nameKana": "ザクロ",
    "nameLatin": "ZAKURO",
    "archetypeId": "control",
    "groupAdjustments": {
      "sensor": 1,
      "output": -1
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "gogaku-gekko",
    "manufacturerId": "gogaku",
    "seriesNumber": 9,
    "nameKana": "ゲッコウ",
    "nameLatin": "GEKKO",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "mobility": -2,
      "output": -2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "gogaku-hotaru",
    "manufacturerId": "gogaku",
    "seriesNumber": 10,
    "nameKana": "ホタル",
    "nameLatin": "HOTARU",
    "archetypeId": "missile",
    "groupAdjustments": {
      "output": 1,
      "sensor": 1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "gogaku-denki",
    "manufacturerId": "gogaku",
    "seriesNumber": 11,
    "nameKana": "デンキ",
    "nameLatin": "DENKI",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "ai": -1,
      "engine": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "gogaku-kiseki",
    "manufacturerId": "gogaku",
    "seriesNumber": 12,
    "nameKana": "キセキ",
    "nameLatin": "KISEKI",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "mobility": 2,
      "engine": -1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.95
  },
  {
    "id": "gogaku-sekiei",
    "manufacturerId": "gogaku",
    "seriesNumber": 13,
    "nameKana": "セキエイ",
    "nameLatin": "SEKIEI",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "compute": 2,
      "sensor": 2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "gogaku-shocho",
    "manufacturerId": "gogaku",
    "seriesNumber": 14,
    "nameKana": "ショウチョウ",
    "nameLatin": "SHOCHO",
    "archetypeId": "precision",
    "groupAdjustments": {
      "output": -1,
      "sensor": 1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "gogaku-socho",
    "manufacturerId": "gogaku",
    "seriesNumber": 15,
    "nameKana": "ソウチョウ",
    "nameLatin": "SOCHO",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "output": -1,
      "sensor": -2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "gogaku-ransho",
    "manufacturerId": "gogaku",
    "seriesNumber": 16,
    "nameKana": "ランショウ",
    "nameLatin": "RANSHO",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "ai": -2,
      "mobility": 2
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "machineGun": -1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "gogaku-kokuen",
    "manufacturerId": "gogaku",
    "seriesNumber": 17,
    "nameKana": "クロウン",
    "nameLatin": "KOKUEN",
    "archetypeId": "emp",
    "groupAdjustments": {
      "sensor": 1,
      "control": -1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 0.9
  },
  {
    "id": "gogaku-unmo",
    "manufacturerId": "gogaku",
    "seriesNumber": 18,
    "nameKana": "ウンモ",
    "nameLatin": "UNMO",
    "archetypeId": "drone",
    "groupAdjustments": {
      "sensor": 2,
      "engine": 2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "gogaku-hokai",
    "manufacturerId": "gogaku",
    "seriesNumber": 19,
    "nameKana": "ホウカイ",
    "nameLatin": "HOKAI",
    "archetypeId": "compute",
    "groupAdjustments": {
      "ai": -2,
      "control": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "gogaku-ryokuren",
    "manufacturerId": "gogaku",
    "seriesNumber": 20,
    "nameKana": "リョクレン",
    "nameLatin": "RYOKUREN",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "compute": 1,
      "ai": -2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "yashima-shiranui",
    "manufacturerId": "yashima",
    "seriesNumber": 1,
    "nameKana": "シラヌイ",
    "nameLatin": "SHIRANUI",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "mobility": -2,
      "compute": 2
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "yashima-arashi",
    "manufacturerId": "yashima",
    "seriesNumber": 2,
    "nameKana": "アラシ",
    "nameLatin": "ARASHI",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "compute": -1,
      "output": -2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "yashima-raimei",
    "manufacturerId": "yashima",
    "seriesNumber": 3,
    "nameKana": "ライメイ",
    "nameLatin": "RAIMEI",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "output": -1,
      "sensor": -2
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "yashima-shigure",
    "manufacturerId": "yashima",
    "seriesNumber": 4,
    "nameKana": "シグレ",
    "nameLatin": "SHIGURE",
    "archetypeId": "engine",
    "groupAdjustments": {
      "engine": 1,
      "control": 1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "yashima-kasumi",
    "manufacturerId": "yashima",
    "seriesNumber": 5,
    "nameKana": "カスミ",
    "nameLatin": "KASUMI",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "compute": 1,
      "sensor": -1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "yashima-hayate",
    "manufacturerId": "yashima",
    "seriesNumber": 6,
    "nameKana": "ハヤテ",
    "nameLatin": "HAYATE",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "control": 2,
      "engine": 2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "yashima-kogarashi",
    "manufacturerId": "yashima",
    "seriesNumber": 7,
    "nameKana": "コガラシ",
    "nameLatin": "KOGARASHI",
    "archetypeId": "ai",
    "groupAdjustments": {
      "engine": -1,
      "ai": 2
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "yashima-yuudachi",
    "manufacturerId": "yashima",
    "seriesNumber": 8,
    "nameKana": "ユウダチ",
    "nameLatin": "YUUDACHI",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "compute": -2,
      "engine": -1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "yashima-fubuki",
    "manufacturerId": "yashima",
    "seriesNumber": 9,
    "nameKana": "フブキ",
    "nameLatin": "FUBUKI",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "mobility": 1,
      "engine": 1
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "yashima-inazuma",
    "manufacturerId": "yashima",
    "seriesNumber": 10,
    "nameKana": "イナズマ",
    "nameLatin": "INAZUMA",
    "archetypeId": "missile",
    "groupAdjustments": {
      "mobility": 2,
      "sensor": -1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "yashima-kirisame",
    "manufacturerId": "yashima",
    "seriesNumber": 11,
    "nameKana": "キリサメ",
    "nameLatin": "KIRISAME",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "compute": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "yashima-murasame",
    "manufacturerId": "yashima",
    "seriesNumber": 12,
    "nameKana": "ムラサメ",
    "nameLatin": "MURASAME",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "control": -2,
      "mobility": -2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "yashima-harukaze",
    "manufacturerId": "yashima",
    "seriesNumber": 13,
    "nameKana": "ハルカゼ",
    "nameLatin": "HARUKAZE",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "mobility": -1,
      "sensor": -1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "blade": -1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "yashima-nagi",
    "manufacturerId": "yashima",
    "seriesNumber": 14,
    "nameKana": "ナギ",
    "nameLatin": "NAGI",
    "archetypeId": "control",
    "groupAdjustments": {
      "sensor": 2,
      "control": 1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "yashima-hakuro",
    "manufacturerId": "yashima",
    "seriesNumber": 15,
    "nameKana": "ハクロ",
    "nameLatin": "HAKURO",
    "archetypeId": "drone",
    "groupAdjustments": {
      "control": 1,
      "sensor": 1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "yashima-kagerou",
    "manufacturerId": "yashima",
    "seriesNumber": 16,
    "nameKana": "カゲロウ",
    "nameLatin": "KAGEROU",
    "archetypeId": "emp",
    "groupAdjustments": {
      "compute": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "yashima-seiran",
    "manufacturerId": "yashima",
    "seriesNumber": 17,
    "nameKana": "セイラン",
    "nameLatin": "SEIRAN",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "output": 2,
      "engine": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "yashima-shiokaze",
    "manufacturerId": "yashima",
    "seriesNumber": 18,
    "nameKana": "シオカゼ",
    "nameLatin": "SHIOKAZE",
    "archetypeId": "precision",
    "groupAdjustments": {
      "compute": 1,
      "output": 1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "yashima-tsuyu",
    "manufacturerId": "yashima",
    "seriesNumber": 19,
    "nameKana": "ツユ",
    "nameLatin": "TSUYU",
    "archetypeId": "compute",
    "groupAdjustments": {
      "output": -1,
      "compute": 1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "yashima-yonagi",
    "manufacturerId": "yashima",
    "seriesNumber": 20,
    "nameKana": "ヨナギ",
    "nameLatin": "YONAGI",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "sensor": 2,
      "compute": -2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "hokushin-subaru",
    "manufacturerId": "hokushin",
    "seriesNumber": 1,
    "nameKana": "スバル",
    "nameLatin": "SUBARU",
    "archetypeId": "precision",
    "groupAdjustments": {
      "compute": 1,
      "ai": 1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "hokushin-hokuto",
    "manufacturerId": "hokushin",
    "seriesNumber": 2,
    "nameKana": "ホクト",
    "nameLatin": "HOKUTO",
    "archetypeId": "control",
    "groupAdjustments": {
      "compute": -2,
      "ai": 1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "hokushin-myojo",
    "manufacturerId": "hokushin",
    "seriesNumber": 3,
    "nameKana": "ミョウジョウ",
    "nameLatin": "MYOJO",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "output": -2,
      "ai": -1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "hokushin-orihime",
    "manufacturerId": "hokushin",
    "seriesNumber": 4,
    "nameKana": "オリヒメ",
    "nameLatin": "ORIHIME",
    "archetypeId": "compute",
    "groupAdjustments": {
      "engine": 2,
      "mobility": -1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "hokushin-hikoboshi",
    "manufacturerId": "hokushin",
    "seriesNumber": 5,
    "nameKana": "ヒコボシ",
    "nameLatin": "HIKOBOSHI",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "engine": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "hokushin-tenro",
    "manufacturerId": "hokushin",
    "seriesNumber": 6,
    "nameKana": "テンロウ",
    "nameLatin": "TENRO",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "mobility": -2,
      "output": 2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 1.18
  },
  {
    "id": "hokushin-ginga",
    "manufacturerId": "hokushin",
    "seriesNumber": 7,
    "nameKana": "ギンガ",
    "nameLatin": "GINGA",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "ai": 1,
      "control": 2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "hokushin-suisei",
    "manufacturerId": "hokushin",
    "seriesNumber": 8,
    "nameKana": "スイセイ",
    "nameLatin": "SUISEI",
    "archetypeId": "ai",
    "groupAdjustments": {
      "ai": 1,
      "engine": 1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "hokushin-ryusei",
    "manufacturerId": "hokushin",
    "seriesNumber": 9,
    "nameKana": "リュウセイ",
    "nameLatin": "RYUSEI",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "ai": 1,
      "sensor": 2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "hokushin-akatsuki",
    "manufacturerId": "hokushin",
    "seriesNumber": 10,
    "nameKana": "アカツキ",
    "nameLatin": "AKATSUKI",
    "archetypeId": "missile",
    "groupAdjustments": {
      "output": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "hokushin-yoizuki",
    "manufacturerId": "hokushin",
    "seriesNumber": 11,
    "nameKana": "ヨイヅキ",
    "nameLatin": "YOIZUKI",
    "archetypeId": "emp",
    "groupAdjustments": {
      "mobility": -2,
      "output": 1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "hokushin-shinsei",
    "manufacturerId": "hokushin",
    "seriesNumber": 12,
    "nameKana": "シンセイ",
    "nameLatin": "SHINSEI",
    "archetypeId": "drone",
    "groupAdjustments": {
      "output": -2,
      "control": -2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "hokushin-kyokusei",
    "manufacturerId": "hokushin",
    "seriesNumber": 13,
    "nameKana": "キョクセイ",
    "nameLatin": "KYOKUSEI",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "output": -2,
      "sensor": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "hokushin-hakucho",
    "manufacturerId": "hokushin",
    "seriesNumber": 14,
    "nameKana": "ハクチョウ",
    "nameLatin": "HAKUCHO",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "engine": 1,
      "sensor": 1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "hokushin-andromeda",
    "manufacturerId": "hokushin",
    "seriesNumber": 15,
    "nameKana": "アンドロメダ",
    "nameLatin": "ANDROMEDA",
    "archetypeId": "engine",
    "groupAdjustments": {
      "sensor": -2,
      "control": 2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "hokushin-cassiopeia",
    "manufacturerId": "hokushin",
    "seriesNumber": 16,
    "nameKana": "カシオペア",
    "nameLatin": "CASSIOPEIA",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "engine": 1,
      "control": 2
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "hokushin-orion",
    "manufacturerId": "hokushin",
    "seriesNumber": 17,
    "nameKana": "オリオン",
    "nameLatin": "ORION",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "output": 1,
      "engine": 1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "hokushin-pegasus",
    "manufacturerId": "hokushin",
    "seriesNumber": 18,
    "nameKana": "ペガサス",
    "nameLatin": "PEGASUS",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "sensor": 2,
      "mobility": 2
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "blade": 1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "hokushin-altair",
    "manufacturerId": "hokushin",
    "seriesNumber": 19,
    "nameKana": "アルタイル",
    "nameLatin": "ALTAIR",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "output": -1,
      "compute": 2
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "hokushin-vega",
    "manufacturerId": "hokushin",
    "seriesNumber": 20,
    "nameKana": "ベガ",
    "nameLatin": "VEGA",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "engine": -2,
      "output": 2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "shinonome-ruri",
    "manufacturerId": "shinonome",
    "seriesNumber": 1,
    "nameKana": "ルリ",
    "nameLatin": "RURI",
    "archetypeId": "compute",
    "groupAdjustments": {
      "ai": 1,
      "control": -2
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "shinonome-kurenai",
    "manufacturerId": "shinonome",
    "seriesNumber": 2,
    "nameKana": "クレナイ",
    "nameLatin": "KURENAI",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "compute": -1,
      "sensor": -2
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "shinonome-shirogane",
    "manufacturerId": "shinonome",
    "seriesNumber": 3,
    "nameKana": "シロガネ",
    "nameLatin": "SHIROGANE",
    "archetypeId": "ai",
    "groupAdjustments": {
      "engine": 2,
      "control": 2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "shinonome-konpeki",
    "manufacturerId": "shinonome",
    "seriesNumber": 4,
    "nameKana": "コンペキ",
    "nameLatin": "KONPEKI",
    "archetypeId": "electronicWarfare",
    "groupAdjustments": {
      "mobility": -2,
      "control": 1
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "shinonome-moegi",
    "manufacturerId": "shinonome",
    "seriesNumber": 5,
    "nameKana": "モエギ",
    "nameLatin": "MOEGI",
    "archetypeId": "emp",
    "groupAdjustments": {
      "sensor": 1,
      "output": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "shinonome-yamabuki",
    "manufacturerId": "shinonome",
    "seriesNumber": 6,
    "nameKana": "ヤマブキ",
    "nameLatin": "YAMABUKI",
    "archetypeId": "drone",
    "groupAdjustments": {
      "control": 1,
      "mobility": -1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "shinonome-asagi",
    "manufacturerId": "shinonome",
    "seriesNumber": 7,
    "nameKana": "アサギ",
    "nameLatin": "ASAGI",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "compute": -1,
      "output": 1
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "shinonome-gunjo",
    "manufacturerId": "shinonome",
    "seriesNumber": 8,
    "nameKana": "グンジョウ",
    "nameLatin": "GUNJO",
    "archetypeId": "missile",
    "groupAdjustments": {
      "output": -1,
      "control": 2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "shinonome-sumi",
    "manufacturerId": "shinonome",
    "seriesNumber": 9,
    "nameKana": "スミ",
    "nameLatin": "SUMI",
    "archetypeId": "precision",
    "groupAdjustments": {
      "mobility": 2,
      "output": 2
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "shinonome-fuji",
    "manufacturerId": "shinonome",
    "seriesNumber": 10,
    "nameKana": "フジ",
    "nameLatin": "FUJI",
    "archetypeId": "control",
    "groupAdjustments": {
      "mobility": -1,
      "ai": 1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "shinonome-kaki",
    "manufacturerId": "shinonome",
    "seriesNumber": 11,
    "nameKana": "カキ",
    "nameLatin": "KAKI",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "sensor": -2,
      "engine": 1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "shinonome-kobai",
    "manufacturerId": "shinonome",
    "seriesNumber": 12,
    "nameKana": "コウバイ",
    "nameLatin": "KOBAI",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "sensor": 2,
      "compute": -1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "shinonome-usuzumi",
    "manufacturerId": "shinonome",
    "seriesNumber": 13,
    "nameKana": "ウスズミ",
    "nameLatin": "USUZUMI",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "sensor": 1,
      "engine": 2
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "machineGun": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "shinonome-toki",
    "manufacturerId": "shinonome",
    "seriesNumber": 14,
    "nameKana": "トキ",
    "nameLatin": "TOKI",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "mobility": -2,
      "output": -1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "shinonome-ai",
    "manufacturerId": "shinonome",
    "seriesNumber": 15,
    "nameKana": "アイ",
    "nameLatin": "AI",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "engine": -2,
      "control": -2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": 2
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "shinonome-hiiro",
    "manufacturerId": "shinonome",
    "seriesNumber": 16,
    "nameKana": "ヒイロ",
    "nameLatin": "HIIRO",
    "archetypeId": "engine",
    "groupAdjustments": {
      "mobility": -2,
      "control": -2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "shinonome-kinari",
    "manufacturerId": "shinonome",
    "seriesNumber": 17,
    "nameKana": "キナリ",
    "nameLatin": "KINARI",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "ai": -2,
      "sensor": -1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "shinonome-byakugun",
    "manufacturerId": "shinonome",
    "seriesNumber": 18,
    "nameKana": "ビャクグン",
    "nameLatin": "BYAKUGUN",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "engine": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "machineGun": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "shinonome-rikyu",
    "manufacturerId": "shinonome",
    "seriesNumber": 19,
    "nameKana": "リキュウ",
    "nameLatin": "RIKYU",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "output": -1,
      "compute": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "shinonome-shojo",
    "manufacturerId": "shinonome",
    "seriesNumber": 20,
    "nameKana": "ショウジョウ",
    "nameLatin": "SHOJO",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "control": -1,
      "compute": 1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "amagi-hayabusa",
    "manufacturerId": "amagi",
    "seriesNumber": 1,
    "nameKana": "ハヤブサ",
    "nameLatin": "HAYABUSA",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "engine": -1,
      "mobility": 1
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "amagi-ookami",
    "manufacturerId": "amagi",
    "seriesNumber": 2,
    "nameKana": "オオカミ",
    "nameLatin": "OOKAMI",
    "archetypeId": "control",
    "groupAdjustments": {
      "output": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "amagi-yamaneko",
    "manufacturerId": "amagi",
    "seriesNumber": 3,
    "nameKana": "ヤマネコ",
    "nameLatin": "YAMANEKO",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "mobility": -1,
      "compute": -1
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "amagi-kitsune",
    "manufacturerId": "amagi",
    "seriesNumber": 4,
    "nameKana": "キツネ",
    "nameLatin": "KITSUNE",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "sensor": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": -1
    },
    "availabilityWeight": 0.95
  },
  {
    "id": "amagi-taka",
    "manufacturerId": "amagi",
    "seriesNumber": 5,
    "nameKana": "タカ",
    "nameLatin": "TAKA",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "sensor": -2,
      "engine": -1
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "amagi-kamakiri",
    "manufacturerId": "amagi",
    "seriesNumber": 6,
    "nameKana": "カマキリ",
    "nameLatin": "KAMAKIRI",
    "archetypeId": "precision",
    "groupAdjustments": {
      "mobility": -1,
      "engine": -2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "amagi-sasori",
    "manufacturerId": "amagi",
    "seriesNumber": 7,
    "nameKana": "サソリ",
    "nameLatin": "SASORI",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "mobility": 1,
      "sensor": -1
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "hammer": 2
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "amagi-kabuto",
    "manufacturerId": "amagi",
    "seriesNumber": 8,
    "nameKana": "カブト",
    "nameLatin": "KABUTO",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "mobility": 2,
      "control": 1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "blade": -1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "amagi-shachi",
    "manufacturerId": "amagi",
    "seriesNumber": 9,
    "nameKana": "シャチ",
    "nameLatin": "SHACHI",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "control": -1,
      "compute": 2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "amagi-tsuru",
    "manufacturerId": "amagi",
    "seriesNumber": 10,
    "nameKana": "ツル",
    "nameLatin": "TSURU",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "control": -2,
      "mobility": -2
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 1.09
  },
  {
    "id": "amagi-karasu",
    "manufacturerId": "amagi",
    "seriesNumber": 11,
    "nameKana": "カラス",
    "nameLatin": "KARASU",
    "archetypeId": "ai",
    "groupAdjustments": {
      "mobility": -1,
      "sensor": 1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "amagi-tora",
    "manufacturerId": "amagi",
    "seriesNumber": 12,
    "nameKana": "トラ",
    "nameLatin": "TORA",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "control": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "amagi-shika",
    "manufacturerId": "amagi",
    "seriesNumber": 13,
    "nameKana": "シカ",
    "nameLatin": "SHIKA",
    "archetypeId": "engine",
    "groupAdjustments": {
      "compute": 2,
      "engine": 1
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.18
  },
  {
    "id": "amagi-kuma",
    "manufacturerId": "amagi",
    "seriesNumber": 14,
    "nameKana": "クマ",
    "nameLatin": "KUMA",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "control": -1,
      "ai": -2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "amagi-kamoshika",
    "manufacturerId": "amagi",
    "seriesNumber": 15,
    "nameKana": "カモシカ",
    "nameLatin": "KAMOSHIKA",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "ai": 1,
      "compute": 1
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "amagi-raicho",
    "manufacturerId": "amagi",
    "seriesNumber": 16,
    "nameKana": "ライチョウ",
    "nameLatin": "RAICHO",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "sensor": -2,
      "mobility": -1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "amagi-washi",
    "manufacturerId": "amagi",
    "seriesNumber": 17,
    "nameKana": "ワシ",
    "nameLatin": "WASHI",
    "archetypeId": "missile",
    "groupAdjustments": {
      "mobility": -2,
      "control": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "amagi-mukade",
    "manufacturerId": "amagi",
    "seriesNumber": 18,
    "nameKana": "ムカデ",
    "nameLatin": "MUKADE",
    "archetypeId": "drone",
    "groupAdjustments": {
      "output": 1,
      "engine": -2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "amagi-itachi",
    "manufacturerId": "amagi",
    "seriesNumber": 19,
    "nameKana": "イタチ",
    "nameLatin": "ITACHI",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "engine": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "amagi-kumo",
    "manufacturerId": "amagi",
    "seriesNumber": 20,
    "nameKana": "クモ",
    "nameLatin": "KUMO",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "mobility": 1,
      "control": -1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "kamishiro-izanagi",
    "manufacturerId": "kamishiro",
    "seriesNumber": 1,
    "nameKana": "イザナギ",
    "nameLatin": "IZANAGI",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "output": -1,
      "control": -2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "kamishiro-izanami",
    "manufacturerId": "kamishiro",
    "seriesNumber": 2,
    "nameKana": "イザナミ",
    "nameLatin": "IZANAMI",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "compute": 1,
      "mobility": 1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "kamishiro-amaterasu",
    "manufacturerId": "kamishiro",
    "seriesNumber": 3,
    "nameKana": "アマテラス",
    "nameLatin": "AMATERASU",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "control": 1,
      "compute": 1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "kamishiro-tsukuyomi",
    "manufacturerId": "kamishiro",
    "seriesNumber": 4,
    "nameKana": "ツクヨミ",
    "nameLatin": "TSUKUYOMI",
    "archetypeId": "compute",
    "groupAdjustments": {
      "mobility": 1,
      "sensor": 1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "kamishiro-susanoo",
    "manufacturerId": "kamishiro",
    "seriesNumber": 5,
    "nameKana": "スサノオ",
    "nameLatin": "SUSANOO",
    "archetypeId": "ai",
    "groupAdjustments": {
      "engine": 2,
      "sensor": 1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "kamishiro-yamata",
    "manufacturerId": "kamishiro",
    "seriesNumber": 6,
    "nameKana": "ヤマタ",
    "nameLatin": "YAMATA",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "compute": -1,
      "control": -2
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "kamishiro-kagutsuchi",
    "manufacturerId": "kamishiro",
    "seriesNumber": 7,
    "nameKana": "カグツチ",
    "nameLatin": "KAGUTSUCHI",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "sensor": 1,
      "mobility": 2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "kamishiro-takemikazuchi",
    "manufacturerId": "kamishiro",
    "seriesNumber": 8,
    "nameKana": "タケミカヅチ",
    "nameLatin": "TAKEMIKAZUCHI",
    "archetypeId": "electronicWarfare",
    "groupAdjustments": {
      "compute": -1,
      "sensor": 2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "kamishiro-okuninushi",
    "manufacturerId": "kamishiro",
    "seriesNumber": 9,
    "nameKana": "オオクニヌシ",
    "nameLatin": "OKUNINUSHI",
    "archetypeId": "drone",
    "groupAdjustments": {
      "control": 2,
      "output": -2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "kamishiro-sarutahiko",
    "manufacturerId": "kamishiro",
    "seriesNumber": 10,
    "nameKana": "サルタヒコ",
    "nameLatin": "SARUTAHIKO",
    "archetypeId": "emp",
    "groupAdjustments": {
      "ai": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "kamishiro-amenouzume",
    "manufacturerId": "kamishiro",
    "seriesNumber": 11,
    "nameKana": "アメノウズメ",
    "nameLatin": "AMENOUZUME",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "mobility": -2,
      "engine": -2
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "kamishiro-konohana",
    "manufacturerId": "kamishiro",
    "seriesNumber": 12,
    "nameKana": "コノハナ",
    "nameLatin": "KONOHANA",
    "archetypeId": "precision",
    "groupAdjustments": {
      "engine": 1,
      "compute": 1
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "kamishiro-ninigi",
    "manufacturerId": "kamishiro",
    "seriesNumber": 13,
    "nameKana": "ニニギ",
    "nameLatin": "NINIGI",
    "archetypeId": "control",
    "groupAdjustments": {
      "control": -1,
      "ai": 1
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.09
  },
  {
    "id": "kamishiro-toyotama",
    "manufacturerId": "kamishiro",
    "seriesNumber": 14,
    "nameKana": "トヨタマ",
    "nameLatin": "TOYOTAMA",
    "archetypeId": "missile",
    "groupAdjustments": {
      "sensor": 1,
      "mobility": 1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.9
  },
  {
    "id": "kamishiro-hachiman",
    "manufacturerId": "kamishiro",
    "seriesNumber": 15,
    "nameKana": "ハチマン",
    "nameLatin": "HACHIMAN",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "compute": -1,
      "control": 1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "kamishiro-inari",
    "manufacturerId": "kamishiro",
    "seriesNumber": 16,
    "nameKana": "イナリ",
    "nameLatin": "INARI",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "sensor": -1,
      "output": -2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "kamishiro-yatagarasu",
    "manufacturerId": "kamishiro",
    "seriesNumber": 17,
    "nameKana": "ヤタガラス",
    "nameLatin": "YATAGARASU",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "engine": 1,
      "control": -2
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "kamishiro-raijin",
    "manufacturerId": "kamishiro",
    "seriesNumber": 18,
    "nameKana": "ライジン",
    "nameLatin": "RAIJIN",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "engine": -1,
      "mobility": 2
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "lance": -1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "kamishiro-fujin",
    "manufacturerId": "kamishiro",
    "seriesNumber": 19,
    "nameKana": "フウジン",
    "nameLatin": "FUJIN",
    "archetypeId": "engine",
    "groupAdjustments": {
      "sensor": -1,
      "control": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "kamishiro-omoikane",
    "manufacturerId": "kamishiro",
    "seriesNumber": 20,
    "nameKana": "オモイカネ",
    "nameLatin": "OMOIKANE",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "engine": -2,
      "control": 2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "lancaster-rose",
    "manufacturerId": "lancaster",
    "seriesNumber": 1,
    "nameKana": "ローズ",
    "nameLatin": "ROSE",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "mobility": 2,
      "output": 1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": 2
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "lancaster-iris",
    "manufacturerId": "lancaster",
    "seriesNumber": 2,
    "nameKana": "アイリス",
    "nameLatin": "IRIS",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "engine": 2,
      "control": -2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 0.87
  },
  {
    "id": "lancaster-lily",
    "manufacturerId": "lancaster",
    "seriesNumber": 3,
    "nameKana": "リリー",
    "nameLatin": "LILY",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "control": 2,
      "sensor": -2
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "lancaster-dahlia",
    "manufacturerId": "lancaster",
    "seriesNumber": 4,
    "nameKana": "ダリア",
    "nameLatin": "DAHLIA",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "engine": 1,
      "ai": -1
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "lancaster-lotus",
    "manufacturerId": "lancaster",
    "seriesNumber": 5,
    "nameKana": "ロータス",
    "nameLatin": "LOTUS",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "mobility": -2,
      "sensor": 1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "lancaster-violet",
    "manufacturerId": "lancaster",
    "seriesNumber": 6,
    "nameKana": "ヴァイオレット",
    "nameLatin": "VIOLET",
    "archetypeId": "control",
    "groupAdjustments": {
      "control": -2,
      "output": 2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": -1
    },
    "availabilityWeight": 0.9
  },
  {
    "id": "lancaster-camellia",
    "manufacturerId": "lancaster",
    "seriesNumber": 7,
    "nameKana": "カメリア",
    "nameLatin": "CAMELLIA",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "ai": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "lancaster-aster",
    "manufacturerId": "lancaster",
    "seriesNumber": 8,
    "nameKana": "アスター",
    "nameLatin": "ASTER",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "engine": -2,
      "compute": 2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "lancaster-jasmine",
    "manufacturerId": "lancaster",
    "seriesNumber": 9,
    "nameKana": "ジャスミン",
    "nameLatin": "JASMINE",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "engine": -2,
      "sensor": -1
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": -1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "lancaster-poppy",
    "manufacturerId": "lancaster",
    "seriesNumber": 10,
    "nameKana": "ポピー",
    "nameLatin": "POPPY",
    "archetypeId": "engine",
    "groupAdjustments": {
      "sensor": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "lancaster-peony",
    "manufacturerId": "lancaster",
    "seriesNumber": 11,
    "nameKana": "ピオニー",
    "nameLatin": "PEONY",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "control": -1,
      "ai": -1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "lancaster-azalea",
    "manufacturerId": "lancaster",
    "seriesNumber": 12,
    "nameKana": "アザレア",
    "nameLatin": "AZALEA",
    "archetypeId": "ai",
    "groupAdjustments": {
      "ai": 2,
      "output": -1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "lancaster-crocus",
    "manufacturerId": "lancaster",
    "seriesNumber": 13,
    "nameKana": "クロッカス",
    "nameLatin": "CROCUS",
    "archetypeId": "precision",
    "groupAdjustments": {
      "sensor": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "lancaster-magnolia",
    "manufacturerId": "lancaster",
    "seriesNumber": 14,
    "nameKana": "マグノリア",
    "nameLatin": "MAGNOLIA",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "mobility": -2,
      "control": 2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "lancaster-verbena",
    "manufacturerId": "lancaster",
    "seriesNumber": 15,
    "nameKana": "バーベナ",
    "nameLatin": "VERBENA",
    "archetypeId": "missile",
    "groupAdjustments": {
      "ai": -1,
      "compute": 1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "lancaster-lavender",
    "manufacturerId": "lancaster",
    "seriesNumber": 16,
    "nameKana": "ラベンダー",
    "nameLatin": "LAVENDER",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "control": -1,
      "engine": 2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "lancaster-primrose",
    "manufacturerId": "lancaster",
    "seriesNumber": 17,
    "nameKana": "プリムローズ",
    "nameLatin": "PRIMROSE",
    "archetypeId": "drone",
    "groupAdjustments": {
      "ai": 1,
      "sensor": 2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "lancaster-orchid",
    "manufacturerId": "lancaster",
    "seriesNumber": 18,
    "nameKana": "オーキッド",
    "nameLatin": "ORCHID",
    "archetypeId": "compute",
    "groupAdjustments": {
      "control": -1,
      "engine": -1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "lancaster-marigold",
    "manufacturerId": "lancaster",
    "seriesNumber": 19,
    "nameKana": "マリーゴールド",
    "nameLatin": "MARIGOLD",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "sensor": 2,
      "compute": -2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "lancaster-anemone",
    "manufacturerId": "lancaster",
    "seriesNumber": 20,
    "nameKana": "アネモネ",
    "nameLatin": "ANEMONE",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "control": -2,
      "sensor": 2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "steinwald-everest",
    "manufacturerId": "steinwald",
    "seriesNumber": 1,
    "nameKana": "エベレスト",
    "nameLatin": "EVEREST",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "compute": 1,
      "mobility": -2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "steinwald-denali",
    "manufacturerId": "steinwald",
    "seriesNumber": 2,
    "nameKana": "デナリ",
    "nameLatin": "DENALI",
    "archetypeId": "engine",
    "groupAdjustments": {
      "mobility": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "steinwald-elbrus",
    "manufacturerId": "steinwald",
    "seriesNumber": 3,
    "nameKana": "エルブルス",
    "nameLatin": "ELBRUS",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "mobility": -2,
      "output": -2
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "steinwald-matterhorn",
    "manufacturerId": "steinwald",
    "seriesNumber": 4,
    "nameKana": "マッターホルン",
    "nameLatin": "MATTERHORN",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "ai": -1,
      "compute": -1
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "steinwald-olympus",
    "manufacturerId": "steinwald",
    "seriesNumber": 5,
    "nameKana": "オリンポス",
    "nameLatin": "OLYMPUS",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "compute": -2,
      "engine": -2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "steinwald-aconcagua",
    "manufacturerId": "steinwald",
    "seriesNumber": 6,
    "nameKana": "アコンカグア",
    "nameLatin": "ACONCAGUA",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "ai": 1,
      "output": 2
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "steinwald-kilimanjaro",
    "manufacturerId": "steinwald",
    "seriesNumber": 7,
    "nameKana": "キリマンジャロ",
    "nameLatin": "KILIMANJARO",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "mobility": -2,
      "compute": 1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "blade": 1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "steinwald-montblanc",
    "manufacturerId": "steinwald",
    "seriesNumber": 8,
    "nameKana": "モンブラン",
    "nameLatin": "MONTBLANC",
    "archetypeId": "control",
    "groupAdjustments": {
      "control": -2,
      "mobility": -1
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "steinwald-vesuvius",
    "manufacturerId": "steinwald",
    "seriesNumber": 9,
    "nameKana": "ベスビオ",
    "nameLatin": "VESUVIUS",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "compute": 1,
      "ai": 1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "blade": -1
    },
    "availabilityWeight": 0.87
  },
  {
    "id": "steinwald-etna",
    "manufacturerId": "steinwald",
    "seriesNumber": 10,
    "nameKana": "エトナ",
    "nameLatin": "ETNA",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "control": 1,
      "mobility": -1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "steinwald-andes",
    "manufacturerId": "steinwald",
    "seriesNumber": 11,
    "nameKana": "アンデス",
    "nameLatin": "ANDES",
    "archetypeId": "precision",
    "groupAdjustments": {
      "mobility": -2,
      "engine": -1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "steinwald-altai",
    "manufacturerId": "steinwald",
    "seriesNumber": 12,
    "nameKana": "アルタイ",
    "nameLatin": "ALTAI",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "engine": -1,
      "mobility": -2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "steinwald-ararat",
    "manufacturerId": "steinwald",
    "seriesNumber": 13,
    "nameKana": "アララト",
    "nameLatin": "ARARAT",
    "archetypeId": "missile",
    "groupAdjustments": {
      "control": -1,
      "compute": 2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.95
  },
  {
    "id": "steinwald-k2",
    "manufacturerId": "steinwald",
    "seriesNumber": 14,
    "nameKana": "ケーツー",
    "nameLatin": "K2",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "ai": 2,
      "control": 1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.87
  },
  {
    "id": "steinwald-eiger",
    "manufacturerId": "steinwald",
    "seriesNumber": 15,
    "nameKana": "アイガー",
    "nameLatin": "EIGER",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "output": 1,
      "engine": 2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "lance": -1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "steinwald-dolomite",
    "manufacturerId": "steinwald",
    "seriesNumber": 16,
    "nameKana": "ドロミテ",
    "nameLatin": "DOLOMITE",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "mobility": -2,
      "compute": -1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "steinwald-sierra",
    "manufacturerId": "steinwald",
    "seriesNumber": 17,
    "nameKana": "シエラ",
    "nameLatin": "SIERRA",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "engine": -1,
      "ai": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "steinwald-tatras",
    "manufacturerId": "steinwald",
    "seriesNumber": 18,
    "nameKana": "タトラ",
    "nameLatin": "TATRAS",
    "archetypeId": "compute",
    "groupAdjustments": {
      "sensor": -2,
      "mobility": 2
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "steinwald-ural",
    "manufacturerId": "steinwald",
    "seriesNumber": 19,
    "nameKana": "ウラル",
    "nameLatin": "URAL",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "control": -2,
      "compute": 1
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "steinwald-carpathia",
    "manufacturerId": "steinwald",
    "seriesNumber": 20,
    "nameKana": "カルパチア",
    "nameLatin": "CARPATHIA",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "mobility": -2,
      "compute": -1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "cromwell-scarlet",
    "manufacturerId": "cromwell",
    "seriesNumber": 1,
    "nameKana": "スカーレット",
    "nameLatin": "SCARLET",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "control": -2,
      "compute": 2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "cromwell-cobalt",
    "manufacturerId": "cromwell",
    "seriesNumber": 2,
    "nameKana": "コバルト",
    "nameLatin": "COBALT",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "ai": -2,
      "control": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "cromwell-ivory",
    "manufacturerId": "cromwell",
    "seriesNumber": 3,
    "nameKana": "アイボリー",
    "nameLatin": "IVORY",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "engine": -2,
      "compute": -1
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "cromwell-violet",
    "manufacturerId": "cromwell",
    "seriesNumber": 4,
    "nameKana": "ヴァイオレット",
    "nameLatin": "VIOLET",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "compute": 2,
      "engine": 2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "cromwell-crimson",
    "manufacturerId": "cromwell",
    "seriesNumber": 5,
    "nameKana": "クリムゾン",
    "nameLatin": "CRIMSON",
    "archetypeId": "control",
    "groupAdjustments": {
      "ai": -1,
      "sensor": 2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "cromwell-cerulean",
    "manufacturerId": "cromwell",
    "seriesNumber": 6,
    "nameKana": "セルリアン",
    "nameLatin": "CERULEAN",
    "archetypeId": "precision",
    "groupAdjustments": {
      "engine": 2,
      "sensor": 1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 1.18
  },
  {
    "id": "cromwell-amber",
    "manufacturerId": "cromwell",
    "seriesNumber": 7,
    "nameKana": "アンバー",
    "nameLatin": "AMBER",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "sensor": -1,
      "output": 1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "cromwell-indigo",
    "manufacturerId": "cromwell",
    "seriesNumber": 8,
    "nameKana": "インディゴ",
    "nameLatin": "INDIGO",
    "archetypeId": "compute",
    "groupAdjustments": {
      "mobility": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "cromwell-emerald",
    "manufacturerId": "cromwell",
    "seriesNumber": 9,
    "nameKana": "エメラルド",
    "nameLatin": "EMERALD",
    "archetypeId": "ai",
    "groupAdjustments": {
      "compute": 2,
      "control": -1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "cromwell-silver",
    "manufacturerId": "cromwell",
    "seriesNumber": 10,
    "nameKana": "シルバー",
    "nameLatin": "SILVER",
    "archetypeId": "engine",
    "groupAdjustments": {
      "compute": -2,
      "ai": -1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "cromwell-charcoal",
    "manufacturerId": "cromwell",
    "seriesNumber": 11,
    "nameKana": "チャコール",
    "nameLatin": "CHARCOAL",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "sensor": 1,
      "engine": -2
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "cromwell-teal",
    "manufacturerId": "cromwell",
    "seriesNumber": 12,
    "nameKana": "ティール",
    "nameLatin": "TEAL",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "compute": -1,
      "mobility": 1
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "cromwell-magenta",
    "manufacturerId": "cromwell",
    "seriesNumber": 13,
    "nameKana": "マゼンタ",
    "nameLatin": "MAGENTA",
    "archetypeId": "missile",
    "groupAdjustments": {
      "control": -2,
      "output": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 0.9
  },
  {
    "id": "cromwell-burgundy",
    "manufacturerId": "cromwell",
    "seriesNumber": 14,
    "nameKana": "バーガンディ",
    "nameLatin": "BURGUNDY",
    "archetypeId": "drone",
    "groupAdjustments": {
      "output": 2,
      "sensor": -1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "cromwell-saffron",
    "manufacturerId": "cromwell",
    "seriesNumber": 15,
    "nameKana": "サフラン",
    "nameLatin": "SAFFRON",
    "archetypeId": "emp",
    "groupAdjustments": {
      "control": -2,
      "engine": 2
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "cromwell-pearl",
    "manufacturerId": "cromwell",
    "seriesNumber": 16,
    "nameKana": "パール",
    "nameLatin": "PEARL",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "sensor": 1,
      "compute": 1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "cromwell-aqua",
    "manufacturerId": "cromwell",
    "seriesNumber": 17,
    "nameKana": "アクア",
    "nameLatin": "AQUA",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "mobility": 2,
      "engine": 2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "cromwell-maroon",
    "manufacturerId": "cromwell",
    "seriesNumber": 18,
    "nameKana": "マルーン",
    "nameLatin": "MAROON",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "control": 2,
      "output": -1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "blade": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "cromwell-ochre",
    "manufacturerId": "cromwell",
    "seriesNumber": 19,
    "nameKana": "オーカー",
    "nameLatin": "OCHRE",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "mobility": -1,
      "engine": -1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "cromwell-azure",
    "manufacturerId": "cromwell",
    "seriesNumber": 20,
    "nameKana": "アズール",
    "nameLatin": "AZURE",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "ai": 2,
      "compute": -1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "rhenium-onyx",
    "manufacturerId": "rhenium",
    "seriesNumber": 1,
    "nameKana": "オニキス",
    "nameLatin": "ONYX",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "sensor": 2,
      "output": 2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "rhenium-garnet",
    "manufacturerId": "rhenium",
    "seriesNumber": 2,
    "nameKana": "ガーネット",
    "nameLatin": "GARNET",
    "archetypeId": "precision",
    "groupAdjustments": {
      "output": 1,
      "control": -2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "rhenium-quartz",
    "manufacturerId": "rhenium",
    "seriesNumber": 3,
    "nameKana": "クォーツ",
    "nameLatin": "QUARTZ",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "ai": 1,
      "output": 1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "rhenium-sapphire",
    "manufacturerId": "rhenium",
    "seriesNumber": 4,
    "nameKana": "サファイア",
    "nameLatin": "SAPPHIRE",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "engine": 1,
      "sensor": 2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.91
  },
  {
    "id": "rhenium-ruby",
    "manufacturerId": "rhenium",
    "seriesNumber": 5,
    "nameKana": "ルビー",
    "nameLatin": "RUBY",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "output": -1,
      "engine": -2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "rhenium-emerald",
    "manufacturerId": "rhenium",
    "seriesNumber": 6,
    "nameKana": "エメラルド",
    "nameLatin": "EMERALD",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "engine": -2,
      "mobility": -2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "hammer": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "rhenium-topaz",
    "manufacturerId": "rhenium",
    "seriesNumber": 7,
    "nameKana": "トパーズ",
    "nameLatin": "TOPAZ",
    "archetypeId": "control",
    "groupAdjustments": {
      "control": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "rhenium-opal",
    "manufacturerId": "rhenium",
    "seriesNumber": 8,
    "nameKana": "オパール",
    "nameLatin": "OPAL",
    "archetypeId": "engine",
    "groupAdjustments": {
      "control": 2,
      "sensor": -1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "rhenium-amethyst",
    "manufacturerId": "rhenium",
    "seriesNumber": 9,
    "nameKana": "アメシスト",
    "nameLatin": "AMETHYST",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "control": -1,
      "engine": 1
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": 2
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "rhenium-beryl",
    "manufacturerId": "rhenium",
    "seriesNumber": 10,
    "nameKana": "ベリル",
    "nameLatin": "BERYL",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "sensor": 2,
      "compute": -2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "rhenium-tourmaline",
    "manufacturerId": "rhenium",
    "seriesNumber": 11,
    "nameKana": "トルマリン",
    "nameLatin": "TOURMALINE",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "mobility": -2,
      "output": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "rhenium-zircon",
    "manufacturerId": "rhenium",
    "seriesNumber": 12,
    "nameKana": "ジルコン",
    "nameLatin": "ZIRCON",
    "archetypeId": "emp",
    "groupAdjustments": {
      "compute": -1,
      "mobility": -2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "rhenium-peridot",
    "manufacturerId": "rhenium",
    "seriesNumber": 13,
    "nameKana": "ペリドット",
    "nameLatin": "PERIDOT",
    "archetypeId": "drone",
    "groupAdjustments": {
      "engine": 2,
      "output": -1
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "rhenium-spinel",
    "manufacturerId": "rhenium",
    "seriesNumber": 14,
    "nameKana": "スピネル",
    "nameLatin": "SPINEL",
    "archetypeId": "missile",
    "groupAdjustments": {
      "compute": 1,
      "control": 2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "rhenium-jade",
    "manufacturerId": "rhenium",
    "seriesNumber": 15,
    "nameKana": "ジェイド",
    "nameLatin": "JADE",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "compute": 1,
      "output": -1
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": -1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "rhenium-agate",
    "manufacturerId": "rhenium",
    "seriesNumber": 16,
    "nameKana": "アゲート",
    "nameLatin": "AGATE",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "mobility": -2,
      "control": -1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "rhenium-obsidian",
    "manufacturerId": "rhenium",
    "seriesNumber": 17,
    "nameKana": "オブシディアン",
    "nameLatin": "OBSIDIAN",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "ai": -1,
      "output": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "rhenium-malachite",
    "manufacturerId": "rhenium",
    "seriesNumber": 18,
    "nameKana": "マラカイト",
    "nameLatin": "MALACHITE",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "ai": -1,
      "engine": 2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "rhenium-citrine",
    "manufacturerId": "rhenium",
    "seriesNumber": 19,
    "nameKana": "シトリン",
    "nameLatin": "CITRINE",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "compute": -2,
      "output": 2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "rhenium-diamond",
    "manufacturerId": "rhenium",
    "seriesNumber": 20,
    "nameKana": "ダイヤモンド",
    "nameLatin": "DIAMOND",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "compute": 2,
      "control": -1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "hawthorne-wolf",
    "manufacturerId": "hawthorne",
    "seriesNumber": 1,
    "nameKana": "ウルフ",
    "nameLatin": "WOLF",
    "archetypeId": "ai",
    "groupAdjustments": {
      "sensor": 2,
      "engine": 1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "hawthorne-lynx",
    "manufacturerId": "hawthorne",
    "seriesNumber": 2,
    "nameKana": "リンクス",
    "nameLatin": "LYNX",
    "archetypeId": "drone",
    "groupAdjustments": {
      "output": -2,
      "mobility": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "hawthorne-viper",
    "manufacturerId": "hawthorne",
    "seriesNumber": 3,
    "nameKana": "ヴァイパー",
    "nameLatin": "VIPER",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "output": -2,
      "compute": 1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "hawthorne-falcon",
    "manufacturerId": "hawthorne",
    "seriesNumber": 4,
    "nameKana": "ファルコン",
    "nameLatin": "FALCON",
    "archetypeId": "compute",
    "groupAdjustments": {
      "sensor": 1,
      "compute": -1
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "hawthorne-mantis",
    "manufacturerId": "hawthorne",
    "seriesNumber": 5,
    "nameKana": "マンティス",
    "nameLatin": "MANTIS",
    "archetypeId": "missile",
    "groupAdjustments": {
      "compute": 2,
      "control": -2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "hawthorne-raven",
    "manufacturerId": "hawthorne",
    "seriesNumber": 6,
    "nameKana": "レイヴン",
    "nameLatin": "RAVEN",
    "archetypeId": "electronicWarfare",
    "groupAdjustments": {
      "engine": 1,
      "ai": -2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "hawthorne-panther",
    "manufacturerId": "hawthorne",
    "seriesNumber": 7,
    "nameKana": "パンサー",
    "nameLatin": "PANTHER",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "sensor": 2,
      "mobility": -2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "hawthorne-coyote",
    "manufacturerId": "hawthorne",
    "seriesNumber": 8,
    "nameKana": "コヨーテ",
    "nameLatin": "COYOTE",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "compute": -2,
      "mobility": 2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "hawthorne-orca",
    "manufacturerId": "hawthorne",
    "seriesNumber": 9,
    "nameKana": "オルカ",
    "nameLatin": "ORCA",
    "archetypeId": "control",
    "groupAdjustments": {
      "compute": -1,
      "output": 1
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "hawthorne-badger",
    "manufacturerId": "hawthorne",
    "seriesNumber": 10,
    "nameKana": "バジャー",
    "nameLatin": "BADGER",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "mobility": 1,
      "control": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "hawthorne-hawk",
    "manufacturerId": "hawthorne",
    "seriesNumber": 11,
    "nameKana": "ホーク",
    "nameLatin": "HAWK",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "output": -2,
      "mobility": -2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "hawthorne-jackal",
    "manufacturerId": "hawthorne",
    "seriesNumber": 12,
    "nameKana": "ジャッカル",
    "nameLatin": "JACKAL",
    "archetypeId": "emp",
    "groupAdjustments": {
      "control": -1,
      "sensor": 1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "hawthorne-cobra",
    "manufacturerId": "hawthorne",
    "seriesNumber": 13,
    "nameKana": "コブラ",
    "nameLatin": "COBRA",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "engine": -2,
      "control": 1
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "hawthorne-bison",
    "manufacturerId": "hawthorne",
    "seriesNumber": 14,
    "nameKana": "バイソン",
    "nameLatin": "BISON",
    "archetypeId": "precision",
    "groupAdjustments": {
      "control": 2,
      "compute": -1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "hawthorne-fox",
    "manufacturerId": "hawthorne",
    "seriesNumber": 15,
    "nameKana": "フォックス",
    "nameLatin": "FOX",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "output": -1,
      "compute": 1
    },
    "growthAdjustments": {
      "output": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "hawthorne-eagle",
    "manufacturerId": "hawthorne",
    "seriesNumber": 16,
    "nameKana": "イーグル",
    "nameLatin": "EAGLE",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "ai": 1,
      "mobility": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "hawthorne-leopard",
    "manufacturerId": "hawthorne",
    "seriesNumber": 17,
    "nameKana": "レオパード",
    "nameLatin": "LEOPARD",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "compute": 1,
      "control": -2
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "hawthorne-scorpion",
    "manufacturerId": "hawthorne",
    "seriesNumber": 18,
    "nameKana": "スコーピオン",
    "nameLatin": "SCORPION",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "mobility": 2,
      "engine": -1
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "hawthorne-hornet",
    "manufacturerId": "hawthorne",
    "seriesNumber": 19,
    "nameKana": "ホーネット",
    "nameLatin": "HORNET",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "output": 2,
      "sensor": 1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "hawthorne-owl",
    "manufacturerId": "hawthorne",
    "seriesNumber": 20,
    "nameKana": "オウル",
    "nameLatin": "OWL",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "control": -2,
      "mobility": 2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "arcadia-odin",
    "manufacturerId": "arcadia",
    "seriesNumber": 1,
    "nameKana": "オーディン",
    "nameLatin": "ODIN",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "compute": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "arcadia-ares",
    "manufacturerId": "arcadia",
    "seriesNumber": 2,
    "nameKana": "アレス",
    "nameLatin": "ARES",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "sensor": 1,
      "engine": 1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "arcadia-anubis",
    "manufacturerId": "arcadia",
    "seriesNumber": 3,
    "nameKana": "アヌビス",
    "nameLatin": "ANUBIS",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "sensor": 2,
      "output": -1
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.91
  },
  {
    "id": "arcadia-horus",
    "manufacturerId": "arcadia",
    "seriesNumber": 4,
    "nameKana": "ホルス",
    "nameLatin": "HORUS",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "ai": 2,
      "compute": -2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "arcadia-morrigan",
    "manufacturerId": "arcadia",
    "seriesNumber": 5,
    "nameKana": "モリガン",
    "nameLatin": "MORRIGAN",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "output": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "arcadia-athena",
    "manufacturerId": "arcadia",
    "seriesNumber": 6,
    "nameKana": "アテナ",
    "nameLatin": "ATHENA",
    "archetypeId": "precision",
    "groupAdjustments": {
      "engine": 2,
      "compute": -2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "arcadia-hermes",
    "manufacturerId": "arcadia",
    "seriesNumber": 7,
    "nameKana": "ヘルメス",
    "nameLatin": "HERMES",
    "archetypeId": "ai",
    "groupAdjustments": {
      "mobility": 2,
      "compute": 1
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "arcadia-apollo",
    "manufacturerId": "arcadia",
    "seriesNumber": 8,
    "nameKana": "アポロン",
    "nameLatin": "APOLLO",
    "archetypeId": "compute",
    "groupAdjustments": {
      "control": -1,
      "ai": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "arcadia-artemis",
    "manufacturerId": "arcadia",
    "seriesNumber": 9,
    "nameKana": "アルテミス",
    "nameLatin": "ARTEMIS",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "output": -2,
      "mobility": 2
    },
    "growthAdjustments": {
      "ai": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "arcadia-set",
    "manufacturerId": "arcadia",
    "seriesNumber": 10,
    "nameKana": "セト",
    "nameLatin": "SET",
    "archetypeId": "drone",
    "groupAdjustments": {
      "control": -2,
      "engine": 1
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "arcadia-ra",
    "manufacturerId": "arcadia",
    "seriesNumber": 11,
    "nameKana": "ラー",
    "nameLatin": "RA",
    "archetypeId": "emp",
    "groupAdjustments": {
      "engine": 1,
      "sensor": -2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "arcadia-freya",
    "manufacturerId": "arcadia",
    "seriesNumber": 12,
    "nameKana": "フレイヤ",
    "nameLatin": "FREYA",
    "archetypeId": "missile",
    "groupAdjustments": {
      "compute": 1,
      "sensor": 2
    },
    "growthAdjustments": {
      "ai": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "arcadia-tyr",
    "manufacturerId": "arcadia",
    "seriesNumber": 13,
    "nameKana": "テュール",
    "nameLatin": "TYR",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "mobility": 2,
      "output": 2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "arcadia-loki",
    "manufacturerId": "arcadia",
    "seriesNumber": 14,
    "nameKana": "ロキ",
    "nameLatin": "LOKI",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "engine": 2,
      "mobility": -2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "arcadia-perseus",
    "manufacturerId": "arcadia",
    "seriesNumber": 15,
    "nameKana": "ペルセウス",
    "nameLatin": "PERSEUS",
    "archetypeId": "control",
    "groupAdjustments": {
      "ai": 2,
      "output": -1
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "arcadia-hecate",
    "manufacturerId": "arcadia",
    "seriesNumber": 16,
    "nameKana": "ヘカテ",
    "nameLatin": "HECATE",
    "archetypeId": "engine",
    "groupAdjustments": {
      "mobility": -1,
      "sensor": 1
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "arcadia-vulcan",
    "manufacturerId": "arcadia",
    "seriesNumber": 17,
    "nameKana": "ヴァルカン",
    "nameLatin": "VULCAN",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "ai": -1,
      "output": 2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "arcadia-janus",
    "manufacturerId": "arcadia",
    "seriesNumber": 18,
    "nameKana": "ヤヌス",
    "nameLatin": "JANUS",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "control": -2,
      "compute": 1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "arcadia-nike",
    "manufacturerId": "arcadia",
    "seriesNumber": 19,
    "nameKana": "ニケ",
    "nameLatin": "NIKE",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "control": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "arcadia-atlas",
    "manufacturerId": "arcadia",
    "seriesNumber": 20,
    "nameKana": "アトラス",
    "nameLatin": "ATLAS",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "output": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.09
  },
  {
    "id": "solberg-sirius",
    "manufacturerId": "solberg",
    "seriesNumber": 1,
    "nameKana": "シリウス",
    "nameLatin": "SIRIUS",
    "archetypeId": "precision",
    "groupAdjustments": {
      "output": -2,
      "compute": -2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "solberg-vega",
    "manufacturerId": "solberg",
    "seriesNumber": 2,
    "nameKana": "ベガ",
    "nameLatin": "VEGA",
    "archetypeId": "compute",
    "groupAdjustments": {
      "compute": 1,
      "control": -2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "solberg-rigel",
    "manufacturerId": "solberg",
    "seriesNumber": 3,
    "nameKana": "リゲル",
    "nameLatin": "RIGEL",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "engine": 1,
      "output": 2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "solberg-altair",
    "manufacturerId": "solberg",
    "seriesNumber": 4,
    "nameKana": "アルタイル",
    "nameLatin": "ALTAIR",
    "archetypeId": "control",
    "groupAdjustments": {
      "mobility": -2,
      "compute": -2
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "solberg-polaris",
    "manufacturerId": "solberg",
    "seriesNumber": 5,
    "nameKana": "ポラリス",
    "nameLatin": "POLARIS",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "sensor": -1,
      "mobility": 2
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "solberg-deneb",
    "manufacturerId": "solberg",
    "seriesNumber": 6,
    "nameKana": "デネブ",
    "nameLatin": "DENEB",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "ai": -2,
      "compute": -2
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "machineGun": -1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "solberg-arcturus",
    "manufacturerId": "solberg",
    "seriesNumber": 7,
    "nameKana": "アルクトゥルス",
    "nameLatin": "ARCTURUS",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "compute": 1,
      "control": 1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "solberg-capella",
    "manufacturerId": "solberg",
    "seriesNumber": 8,
    "nameKana": "カペラ",
    "nameLatin": "CAPELLA",
    "archetypeId": "missile",
    "groupAdjustments": {
      "compute": 1,
      "sensor": -1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "solberg-spica",
    "manufacturerId": "solberg",
    "seriesNumber": 9,
    "nameKana": "スピカ",
    "nameLatin": "SPICA",
    "archetypeId": "emp",
    "groupAdjustments": {
      "compute": 1,
      "output": 2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "solberg-antares",
    "manufacturerId": "solberg",
    "seriesNumber": 10,
    "nameKana": "アンタレス",
    "nameLatin": "ANTARES",
    "archetypeId": "ai",
    "groupAdjustments": {
      "ai": 1,
      "output": -1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "solberg-betelgeuse",
    "manufacturerId": "solberg",
    "seriesNumber": 11,
    "nameKana": "ベテルギウス",
    "nameLatin": "BETELGEUSE",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "compute": -2,
      "mobility": -1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "solberg-procyon",
    "manufacturerId": "solberg",
    "seriesNumber": 12,
    "nameKana": "プロキオン",
    "nameLatin": "PROCYON",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "engine": -1,
      "sensor": 2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "solberg-aldebaran",
    "manufacturerId": "solberg",
    "seriesNumber": 13,
    "nameKana": "アルデバラン",
    "nameLatin": "ALDEBARAN",
    "archetypeId": "engine",
    "groupAdjustments": {
      "mobility": -2,
      "control": -2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "solberg-regulus",
    "manufacturerId": "solberg",
    "seriesNumber": 14,
    "nameKana": "レグルス",
    "nameLatin": "REGULUS",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "engine": 1,
      "compute": 1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "blade": 1
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "solberg-castor",
    "manufacturerId": "solberg",
    "seriesNumber": 15,
    "nameKana": "カストル",
    "nameLatin": "CASTOR",
    "archetypeId": "drone",
    "groupAdjustments": {
      "engine": 1,
      "output": -1
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "solberg-pollux",
    "manufacturerId": "solberg",
    "seriesNumber": 16,
    "nameKana": "ポルックス",
    "nameLatin": "POLLUX",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "compute": 1,
      "sensor": -1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "blade": 1
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "solberg-bellatrix",
    "manufacturerId": "solberg",
    "seriesNumber": 17,
    "nameKana": "ベラトリクス",
    "nameLatin": "BELLATRIX",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "control": -1,
      "sensor": -2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.03
  },
  {
    "id": "solberg-mira",
    "manufacturerId": "solberg",
    "seriesNumber": 18,
    "nameKana": "ミラ",
    "nameLatin": "MIRA",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "engine": -2,
      "compute": 1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "solberg-algol",
    "manufacturerId": "solberg",
    "seriesNumber": 19,
    "nameKana": "アルゴル",
    "nameLatin": "ALGOL",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "control": 2,
      "output": -2
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 0.82
  },
  {
    "id": "solberg-fomalhaut",
    "manufacturerId": "solberg",
    "seriesNumber": 20,
    "nameKana": "フォーマルハウト",
    "nameLatin": "FOMALHAUT",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "sensor": 1,
      "ai": 2
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "grayson-storm",
    "manufacturerId": "grayson",
    "seriesNumber": 1,
    "nameKana": "ストーム",
    "nameLatin": "STORM",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "ai": -2,
      "control": 1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "grayson-blizzard",
    "manufacturerId": "grayson",
    "seriesNumber": 2,
    "nameKana": "ブリザード",
    "nameLatin": "BLIZZARD",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "control": -1,
      "sensor": -2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "hammer": -1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "grayson-thunder",
    "manufacturerId": "grayson",
    "seriesNumber": 3,
    "nameKana": "サンダー",
    "nameLatin": "THUNDER",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "ai": 1,
      "output": 1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "grayson-cyclone",
    "manufacturerId": "grayson",
    "seriesNumber": 4,
    "nameKana": "サイクロン",
    "nameLatin": "CYCLONE",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "compute": -1,
      "output": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "blade": 2
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "grayson-typhoon",
    "manufacturerId": "grayson",
    "seriesNumber": 5,
    "nameKana": "タイフーン",
    "nameLatin": "TYPHOON",
    "archetypeId": "engine",
    "groupAdjustments": {
      "ai": 1,
      "mobility": -2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.91
  },
  {
    "id": "grayson-tempest",
    "manufacturerId": "grayson",
    "seriesNumber": 6,
    "nameKana": "テンペスト",
    "nameLatin": "TEMPEST",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "mobility": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "grayson-squall",
    "manufacturerId": "grayson",
    "seriesNumber": 7,
    "nameKana": "スコール",
    "nameLatin": "SQUALL",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "output": -1,
      "ai": -2
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "grayson-monsoon",
    "manufacturerId": "grayson",
    "seriesNumber": 8,
    "nameKana": "モンスーン",
    "nameLatin": "MONSOON",
    "archetypeId": "control",
    "groupAdjustments": {
      "engine": 1,
      "ai": 2
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "grayson-tornado",
    "manufacturerId": "grayson",
    "seriesNumber": 9,
    "nameKana": "トルネード",
    "nameLatin": "TORNADO",
    "archetypeId": "missile",
    "groupAdjustments": {
      "control": -1,
      "engine": -2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "grayson-gale",
    "manufacturerId": "grayson",
    "seriesNumber": 10,
    "nameKana": "ゲイル",
    "nameLatin": "GALE",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "control": -2,
      "mobility": -1
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "grayson-hail",
    "manufacturerId": "grayson",
    "seriesNumber": 11,
    "nameKana": "ヘイル",
    "nameLatin": "HAIL",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "mobility": 1,
      "output": -2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "grayson-frost",
    "manufacturerId": "grayson",
    "seriesNumber": 12,
    "nameKana": "フロスト",
    "nameLatin": "FROST",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "mobility": -2,
      "sensor": 2
    },
    "growthAdjustments": {
      "engine": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.82
  },
  {
    "id": "grayson-mist",
    "manufacturerId": "grayson",
    "seriesNumber": 13,
    "nameKana": "ミスト",
    "nameLatin": "MIST",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "compute": -2,
      "mobility": -1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "hammer": 2
    },
    "availabilityWeight": 0.86
  },
  {
    "id": "grayson-mirage",
    "manufacturerId": "grayson",
    "seriesNumber": 14,
    "nameKana": "ミラージュ",
    "nameLatin": "MIRAGE",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "compute": 1,
      "output": -1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 1
    },
    "availabilityWeight": 0.87
  },
  {
    "id": "grayson-lightning",
    "manufacturerId": "grayson",
    "seriesNumber": 15,
    "nameKana": "ライトニング",
    "nameLatin": "LIGHTNING",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "sensor": -2,
      "mobility": 2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.09
  },
  {
    "id": "grayson-downpour",
    "manufacturerId": "grayson",
    "seriesNumber": 16,
    "nameKana": "ダウンポア",
    "nameLatin": "DOWNPOUR",
    "archetypeId": "ai",
    "groupAdjustments": {
      "engine": -2,
      "sensor": -1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 1.09
  },
  {
    "id": "grayson-dustdevil",
    "manufacturerId": "grayson",
    "seriesNumber": 17,
    "nameKana": "ダストデビル",
    "nameLatin": "DUSTDEVIL",
    "archetypeId": "compute",
    "groupAdjustments": {
      "compute": -1,
      "control": -2
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "grayson-whiteout",
    "manufacturerId": "grayson",
    "seriesNumber": 18,
    "nameKana": "ホワイトアウト",
    "nameLatin": "WHITEOUT",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "output": -1,
      "sensor": 2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "hammer": 2
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "grayson-aurora",
    "manufacturerId": "grayson",
    "seriesNumber": 19,
    "nameKana": "オーロラ",
    "nameLatin": "AURORA",
    "archetypeId": "drone",
    "groupAdjustments": {
      "output": -1,
      "compute": 1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "grayson-heatwave",
    "manufacturerId": "grayson",
    "seriesNumber": 20,
    "nameKana": "ヒートウェーブ",
    "nameLatin": "HEATWAVE",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "engine": 1,
      "sensor": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "laplace-bayes",
    "manufacturerId": "laplace",
    "seriesNumber": 1,
    "nameKana": "ベイズ",
    "nameLatin": "BAYES",
    "archetypeId": "compute",
    "groupAdjustments": {
      "engine": 1,
      "ai": -1
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "laplace-markov",
    "manufacturerId": "laplace",
    "seriesNumber": 2,
    "nameKana": "マルコフ",
    "nameLatin": "MARKOV",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "compute": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "laplace-fourier",
    "manufacturerId": "laplace",
    "seriesNumber": 3,
    "nameKana": "フーリエ",
    "nameLatin": "FOURIER",
    "archetypeId": "ai",
    "groupAdjustments": {
      "engine": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "laplace-gauss",
    "manufacturerId": "laplace",
    "seriesNumber": 4,
    "nameKana": "ガウス",
    "nameLatin": "GAUSS",
    "archetypeId": "electronicWarfare",
    "groupAdjustments": {
      "control": 1,
      "output": 2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 0.95
  },
  {
    "id": "laplace-euler",
    "manufacturerId": "laplace",
    "seriesNumber": 5,
    "nameKana": "オイラー",
    "nameLatin": "EULER",
    "archetypeId": "emp",
    "groupAdjustments": {
      "engine": 2,
      "ai": -2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 0.85
  },
  {
    "id": "laplace-noether",
    "manufacturerId": "laplace",
    "seriesNumber": 6,
    "nameKana": "ノーター",
    "nameLatin": "NOETHER",
    "archetypeId": "drone",
    "groupAdjustments": {
      "engine": 2,
      "compute": 2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "laplace-turing",
    "manufacturerId": "laplace",
    "seriesNumber": 7,
    "nameKana": "チューリング",
    "nameLatin": "TURING",
    "archetypeId": "missile",
    "groupAdjustments": {
      "output": 2,
      "ai": 1
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "laplace-hilbert",
    "manufacturerId": "laplace",
    "seriesNumber": 8,
    "nameKana": "ヒルベルト",
    "nameLatin": "HILBERT",
    "archetypeId": "precision",
    "groupAdjustments": {
      "engine": -2,
      "mobility": -2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "laplace-cauchy",
    "manufacturerId": "laplace",
    "seriesNumber": 9,
    "nameKana": "コーシー",
    "nameLatin": "CAUCHY",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "control": -2,
      "ai": 1
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "laplace-entropy",
    "manufacturerId": "laplace",
    "seriesNumber": 10,
    "nameKana": "エントロピー",
    "nameLatin": "ENTROPY",
    "archetypeId": "control",
    "groupAdjustments": {
      "ai": -1,
      "mobility": -2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "laplace-vector",
    "manufacturerId": "laplace",
    "seriesNumber": 11,
    "nameKana": "ベクトル",
    "nameLatin": "VECTOR",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "mobility": 2,
      "control": -1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "laplace-matrix",
    "manufacturerId": "laplace",
    "seriesNumber": 12,
    "nameKana": "マトリクス",
    "nameLatin": "MATRIX",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "output": -1,
      "sensor": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "laplace-tensor",
    "manufacturerId": "laplace",
    "seriesNumber": 13,
    "nameKana": "テンソル",
    "nameLatin": "TENSOR",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "output": 1,
      "engine": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "laplace-attractor",
    "manufacturerId": "laplace",
    "seriesNumber": 14,
    "nameKana": "アトラクタ",
    "nameLatin": "ATTRACTOR",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "sensor": -1,
      "output": -2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.05
  },
  {
    "id": "laplace-orbit",
    "manufacturerId": "laplace",
    "seriesNumber": 15,
    "nameKana": "オービット",
    "nameLatin": "ORBIT",
    "archetypeId": "engine",
    "groupAdjustments": {
      "engine": -1,
      "output": -1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 0.89
  },
  {
    "id": "laplace-lambda",
    "manufacturerId": "laplace",
    "seriesNumber": 16,
    "nameKana": "ラムダ",
    "nameLatin": "LAMBDA",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "output": -2,
      "ai": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "laplace-sigma",
    "manufacturerId": "laplace",
    "seriesNumber": 17,
    "nameKana": "シグマ",
    "nameLatin": "SIGMA",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "control": -2,
      "compute": -2
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "laplace-delta",
    "manufacturerId": "laplace",
    "seriesNumber": 18,
    "nameKana": "デルタ",
    "nameLatin": "DELTA",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "compute": -1,
      "mobility": 2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "laplace-omega",
    "manufacturerId": "laplace",
    "seriesNumber": 19,
    "nameKana": "オメガ",
    "nameLatin": "OMEGA",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "ai": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "engine": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "laplace-predictor",
    "manufacturerId": "laplace",
    "seriesNumber": 20,
    "nameKana": "プレディクタ",
    "nameLatin": "PREDICTOR",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "ai": -1,
      "output": 1
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 0.96
  },
  {
    "id": "bureau13-case-01",
    "manufacturerId": "bureau13",
    "seriesNumber": 1,
    "nameKana": "ケース01",
    "nameLatin": "CASE-01",
    "archetypeId": "heavyAssault",
    "groupAdjustments": {
      "ai": -2,
      "sensor": 2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "bureau13-case-02",
    "manufacturerId": "bureau13",
    "seriesNumber": 2,
    "nameKana": "ケース02",
    "nameLatin": "CASE-02",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "ai": -1,
      "output": 2
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "bureau13-case-03",
    "manufacturerId": "bureau13",
    "seriesNumber": 3,
    "nameKana": "ケース03",
    "nameLatin": "CASE-03",
    "archetypeId": "precision",
    "groupAdjustments": {
      "control": 2,
      "output": 1
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.98
  },
  {
    "id": "bureau13-case-04",
    "manufacturerId": "bureau13",
    "seriesNumber": 4,
    "nameKana": "ケース04",
    "nameLatin": "CASE-04",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "ai": 1,
      "compute": -2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "bureau13-case-05",
    "manufacturerId": "bureau13",
    "seriesNumber": 5,
    "nameKana": "ケース05",
    "nameLatin": "CASE-05",
    "archetypeId": "ai",
    "groupAdjustments": {
      "control": 2,
      "mobility": 2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "bureau13-case-06",
    "manufacturerId": "bureau13",
    "seriesNumber": 6,
    "nameKana": "ケース06",
    "nameLatin": "CASE-06",
    "archetypeId": "engine",
    "groupAdjustments": {
      "compute": 2,
      "control": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "bureau13-case-07",
    "manufacturerId": "bureau13",
    "seriesNumber": 7,
    "nameKana": "ケース07",
    "nameLatin": "CASE-07",
    "archetypeId": "rangedPhysical",
    "groupAdjustments": {
      "compute": -2,
      "output": 2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "cannon": 2
    },
    "availabilityWeight": 0.9
  },
  {
    "id": "bureau13-case-08",
    "manufacturerId": "bureau13",
    "seriesNumber": 8,
    "nameKana": "ケース08",
    "nameLatin": "CASE-08",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "mobility": -2,
      "output": 2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "bureau13-case-09",
    "manufacturerId": "bureau13",
    "seriesNumber": 9,
    "nameKana": "ケース09",
    "nameLatin": "CASE-09",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "control": 2,
      "sensor": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "bureau13-case-10",
    "manufacturerId": "bureau13",
    "seriesNumber": 10,
    "nameKana": "ケース10",
    "nameLatin": "CASE-10",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "ai": 2,
      "engine": 2
    },
    "growthAdjustments": {
      "sensor": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "bureau13-case-11",
    "manufacturerId": "bureau13",
    "seriesNumber": 11,
    "nameKana": "ケース11",
    "nameLatin": "CASE-11",
    "archetypeId": "missile",
    "groupAdjustments": {
      "output": 1,
      "mobility": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": -1
    },
    "availabilityWeight": 0.82
  },
  {
    "id": "bureau13-case-12",
    "manufacturerId": "bureau13",
    "seriesNumber": 12,
    "nameKana": "ケース12",
    "nameLatin": "CASE-12",
    "archetypeId": "emp",
    "groupAdjustments": {
      "control": 2,
      "ai": -1
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "bureau13-case-13",
    "manufacturerId": "bureau13",
    "seriesNumber": 13,
    "nameKana": "ケース13",
    "nameLatin": "CASE-13",
    "archetypeId": "drone",
    "groupAdjustments": {
      "output": -2,
      "mobility": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "bureau13-case-14",
    "manufacturerId": "bureau13",
    "seriesNumber": 14,
    "nameKana": "ケース14",
    "nameLatin": "CASE-14",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "sensor": 1,
      "output": 1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "bureau13-case-15",
    "manufacturerId": "bureau13",
    "seriesNumber": 15,
    "nameKana": "ケース15",
    "nameLatin": "CASE-15",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "ai": -1,
      "output": 1
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "machineGun": 1
    },
    "availabilityWeight": 1.06
  },
  {
    "id": "bureau13-case-16",
    "manufacturerId": "bureau13",
    "seriesNumber": 16,
    "nameKana": "ケース16",
    "nameLatin": "CASE-16",
    "archetypeId": "compute",
    "groupAdjustments": {
      "ai": -1,
      "control": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "bureau13-case-17",
    "manufacturerId": "bureau13",
    "seriesNumber": 17,
    "nameKana": "ケース17",
    "nameLatin": "CASE-17",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "output": -1,
      "control": 2
    },
    "growthAdjustments": {
      "control": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "bureau13-case-18",
    "manufacturerId": "bureau13",
    "seriesNumber": 18,
    "nameKana": "ケース18",
    "nameLatin": "CASE-18",
    "archetypeId": "control",
    "groupAdjustments": {
      "compute": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 0.9
  },
  {
    "id": "bureau13-case-19",
    "manufacturerId": "bureau13",
    "seriesNumber": 19,
    "nameKana": "ケース19",
    "nameLatin": "CASE-19",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "compute": -1,
      "mobility": -2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "emp": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "bureau13-case-20",
    "manufacturerId": "bureau13",
    "seriesNumber": 20,
    "nameKana": "ケース20",
    "nameLatin": "CASE-20",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "compute": 1,
      "control": 2
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 1.01
  },
  {
    "id": "eidolon-phantom",
    "manufacturerId": "eidolon",
    "seriesNumber": 1,
    "nameKana": "ファントム",
    "nameLatin": "PHANTOM",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "output": -1,
      "engine": 2
    },
    "growthAdjustments": {
      "mobility": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 1.14
  },
  {
    "id": "eidolon-shade",
    "manufacturerId": "eidolon",
    "seriesNumber": 2,
    "nameKana": "シェイド",
    "nameLatin": "SHADE",
    "archetypeId": "ai",
    "groupAdjustments": {
      "control": 1,
      "compute": -2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "eidolon-echo",
    "manufacturerId": "eidolon",
    "seriesNumber": 3,
    "nameKana": "エコー",
    "nameLatin": "ECHO",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "output": 2,
      "sensor": -2
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamBlade": 1
    },
    "availabilityWeight": 1.07
  },
  {
    "id": "eidolon-mirage",
    "manufacturerId": "eidolon",
    "seriesNumber": 4,
    "nameKana": "ミラージュ",
    "nameLatin": "MIRAGE",
    "archetypeId": "compute",
    "groupAdjustments": {
      "engine": -2,
      "output": 2
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "eidolon-wraith",
    "manufacturerId": "eidolon",
    "seriesNumber": 5,
    "nameKana": "レイス",
    "nameLatin": "WRAITH",
    "archetypeId": "meleePhysical",
    "groupAdjustments": {
      "control": 2,
      "ai": -1
    },
    "growthAdjustments": {
      "sensor": -0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "eidolon-revenant",
    "manufacturerId": "eidolon",
    "seriesNumber": 6,
    "nameKana": "レヴナント",
    "nameLatin": "REVENANT",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "mobility": -2,
      "ai": -2
    },
    "growthAdjustments": {
      "control": 0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "eidolon-specter",
    "manufacturerId": "eidolon",
    "seriesNumber": 7,
    "nameKana": "スペクター",
    "nameLatin": "SPECTER",
    "archetypeId": "drone",
    "groupAdjustments": {
      "ai": -1,
      "compute": -1
    },
    "growthAdjustments": {
      "ai": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "eidolon-dream",
    "manufacturerId": "eidolon",
    "seriesNumber": 8,
    "nameKana": "ドリーム",
    "nameLatin": "DREAM",
    "archetypeId": "emp",
    "groupAdjustments": {
      "control": -1,
      "mobility": -2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "eidolon-memory",
    "manufacturerId": "eidolon",
    "seriesNumber": 9,
    "nameKana": "メモリー",
    "nameLatin": "MEMORY",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "compute": 2,
      "mobility": 1
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 1.18
  },
  {
    "id": "eidolon-persona",
    "manufacturerId": "eidolon",
    "seriesNumber": 10,
    "nameKana": "ペルソナ",
    "nameLatin": "PERSONA",
    "archetypeId": "precision",
    "groupAdjustments": {
      "engine": -2,
      "control": -2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "rifle": -1
    },
    "availabilityWeight": 1.15
  },
  {
    "id": "eidolon-anima",
    "manufacturerId": "eidolon",
    "seriesNumber": 11,
    "nameKana": "アニマ",
    "nameLatin": "ANIMA",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "sensor": 1,
      "compute": 2
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "lance": 2
    },
    "availabilityWeight": 1.02
  },
  {
    "id": "eidolon-umbra",
    "manufacturerId": "eidolon",
    "seriesNumber": 12,
    "nameKana": "アンブラ",
    "nameLatin": "UMBRA",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "engine": -2,
      "mobility": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "beamBlade": -1
    },
    "availabilityWeight": 0.93
  },
  {
    "id": "eidolon-refrain",
    "manufacturerId": "eidolon",
    "seriesNumber": 13,
    "nameKana": "リフレイン",
    "nameLatin": "REFRAIN",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "output": -1,
      "ai": 2
    },
    "growthAdjustments": {
      "mobility": -0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 0.97
  },
  {
    "id": "eidolon-remnant",
    "manufacturerId": "eidolon",
    "seriesNumber": 14,
    "nameKana": "レムナント",
    "nameLatin": "REMNANT",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "output": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.83
  },
  {
    "id": "eidolon-afterimage",
    "manufacturerId": "eidolon",
    "seriesNumber": 15,
    "nameKana": "アフターイメージ",
    "nameLatin": "AFTERIMAGE",
    "archetypeId": "missile",
    "groupAdjustments": {
      "compute": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "control": -0.02
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "missile": 1
    },
    "availabilityWeight": 0.94
  },
  {
    "id": "eidolon-hollow",
    "manufacturerId": "eidolon",
    "seriesNumber": 16,
    "nameKana": "ホロウ",
    "nameLatin": "HOLLOW",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "engine": -1,
      "sensor": -1
    },
    "growthAdjustments": {
      "sensor": -0.02
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "eidolon-mimic",
    "manufacturerId": "eidolon",
    "seriesNumber": 17,
    "nameKana": "ミミック",
    "nameLatin": "MIMIC",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "compute": -1,
      "engine": 2
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "hammer": 1
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "eidolon-doppelganger",
    "manufacturerId": "eidolon",
    "seriesNumber": 18,
    "nameKana": "ドッペル",
    "nameLatin": "DOPPELGANGER",
    "archetypeId": "control",
    "groupAdjustments": {
      "sensor": -2,
      "compute": -2
    },
    "growthAdjustments": {
      "compute": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "laser": 1
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "eidolon-lucid",
    "manufacturerId": "eidolon",
    "seriesNumber": 19,
    "nameKana": "ルシッド",
    "nameLatin": "LUCID",
    "archetypeId": "engine",
    "groupAdjustments": {
      "sensor": 1,
      "output": -1
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "laser": 2
    },
    "availabilityWeight": 0.88
  },
  {
    "id": "eidolon-somnium",
    "manufacturerId": "eidolon",
    "seriesNumber": 20,
    "nameKana": "ソムニウム",
    "nameLatin": "SOMNIUM",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "control": -2,
      "output": 1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 0.91
  },
  {
    "id": "logos-axiom",
    "manufacturerId": "logos",
    "seriesNumber": 1,
    "nameKana": "アクシオム",
    "nameLatin": "AXIOM",
    "archetypeId": "volatileExperimental",
    "groupAdjustments": {
      "sensor": -1,
      "mobility": 2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 1.17
  },
  {
    "id": "logos-nomos",
    "manufacturerId": "logos",
    "seriesNumber": 2,
    "nameKana": "ノモス",
    "nameLatin": "NOMOS",
    "archetypeId": "balanced",
    "groupAdjustments": {
      "control": 2,
      "mobility": -1
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "logos-ethos",
    "manufacturerId": "logos",
    "seriesNumber": 3,
    "nameKana": "エトス",
    "nameLatin": "ETHOS",
    "archetypeId": "highOutput",
    "groupAdjustments": {
      "mobility": 1,
      "output": -2
    },
    "growthAdjustments": {
      "output": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamCannon": 2
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "logos-pathos",
    "manufacturerId": "logos",
    "seriesNumber": 4,
    "nameKana": "パトス",
    "nameLatin": "PATHOS",
    "archetypeId": "compute",
    "groupAdjustments": {
      "sensor": 1,
      "compute": -2
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 1
    },
    "availabilityWeight": 1.16
  },
  {
    "id": "logos-mythos",
    "manufacturerId": "logos",
    "seriesNumber": 5,
    "nameKana": "ミュトス",
    "nameLatin": "MYTHOS",
    "archetypeId": "mobile",
    "groupAdjustments": {
      "ai": 2,
      "mobility": 1
    },
    "growthAdjustments": {
      "compute": 0.02
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "logos-telos",
    "manufacturerId": "logos",
    "seriesNumber": 6,
    "nameKana": "テロス",
    "nameLatin": "TELOS",
    "archetypeId": "ai",
    "groupAdjustments": {
      "mobility": 2,
      "output": 1
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": 1,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "logos-arche",
    "manufacturerId": "logos",
    "seriesNumber": 7,
    "nameKana": "アルケー",
    "nameLatin": "ARCHE",
    "archetypeId": "precision",
    "groupAdjustments": {
      "sensor": -1,
      "output": -1
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": 1
    },
    "availabilityWeight": 1.1
  },
  {
    "id": "logos-eidos",
    "manufacturerId": "logos",
    "seriesNumber": 8,
    "nameKana": "エイドス",
    "nameLatin": "EIDOS",
    "archetypeId": "rangedEnergy",
    "groupAdjustments": {
      "sensor": -1,
      "compute": -2
    },
    "growthAdjustments": {
      "output": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamCannon": 1
    },
    "availabilityWeight": 1.12
  },
  {
    "id": "logos-ousia",
    "manufacturerId": "logos",
    "seriesNumber": 9,
    "nameKana": "ウーシア",
    "nameLatin": "OUSIA",
    "archetypeId": "meleeEnergy",
    "groupAdjustments": {
      "engine": -2,
      "ai": 2
    },
    "growthAdjustments": {
      "engine": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "logos-praxis",
    "manufacturerId": "logos",
    "seriesNumber": 10,
    "nameKana": "プラクシス",
    "nameLatin": "PRAXIS",
    "archetypeId": "electronicWarfare",
    "groupAdjustments": {
      "ai": -2,
      "sensor": -2
    },
    "growthAdjustments": {
      "mobility": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 1.13
  },
  {
    "id": "logos-sophia",
    "manufacturerId": "logos",
    "seriesNumber": 11,
    "nameKana": "ソフィア",
    "nameLatin": "SOPHIA",
    "archetypeId": "hybridClose",
    "groupAdjustments": {
      "sensor": 2,
      "engine": -1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": -2,
    "weaponAdjustments": {
      "beamBlade": 2
    },
    "availabilityWeight": 0.87
  },
  {
    "id": "logos-nous",
    "manufacturerId": "logos",
    "seriesNumber": 12,
    "nameKana": "ヌース",
    "nameLatin": "NOUS",
    "archetypeId": "hybridRanged",
    "groupAdjustments": {
      "mobility": -2,
      "output": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "rifle": 2
    },
    "availabilityWeight": 1.08
  },
  {
    "id": "logos-hen",
    "manufacturerId": "logos",
    "seriesNumber": 13,
    "nameKana": "ヘン",
    "nameLatin": "HEN",
    "archetypeId": "resilient",
    "groupAdjustments": {
      "engine": -2,
      "ai": 1
    },
    "growthAdjustments": {
      "sensor": 0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "drone": 2
    },
    "availabilityWeight": 1.0
  },
  {
    "id": "logos-kairos",
    "manufacturerId": "logos",
    "seriesNumber": 14,
    "nameKana": "カイロス",
    "nameLatin": "KAIROS",
    "archetypeId": "reliable",
    "groupAdjustments": {
      "compute": -1,
      "ai": -2
    },
    "growthAdjustments": {
      "compute": -0.02
    },
    "reliabilityAdjustment": 0,
    "weaponAdjustments": {
      "emp": 2
    },
    "availabilityWeight": 0.84
  },
  {
    "id": "logos-chronos",
    "manufacturerId": "logos",
    "seriesNumber": 15,
    "nameKana": "クロノス",
    "nameLatin": "CHRONOS",
    "archetypeId": "engine",
    "groupAdjustments": {
      "compute": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "compute": -0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "cannon": 1
    },
    "availabilityWeight": 1.04
  },
  {
    "id": "logos-metron",
    "manufacturerId": "logos",
    "seriesNumber": 16,
    "nameKana": "メトロン",
    "nameLatin": "METRON",
    "archetypeId": "control",
    "groupAdjustments": {
      "mobility": 2,
      "control": -1
    },
    "growthAdjustments": {
      "output": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "lance": -1
    },
    "availabilityWeight": 0.99
  },
  {
    "id": "logos-topos",
    "manufacturerId": "logos",
    "seriesNumber": 17,
    "nameKana": "トポス",
    "nameLatin": "TOPOS",
    "archetypeId": "sensor",
    "groupAdjustments": {
      "mobility": -2,
      "control": 1
    },
    "growthAdjustments": {
      "control": -0.01
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "laser": -1
    },
    "availabilityWeight": 1.11
  },
  {
    "id": "logos-physis",
    "manufacturerId": "logos",
    "seriesNumber": 18,
    "nameKana": "フィシス",
    "nameLatin": "PHYSIS",
    "archetypeId": "missile",
    "groupAdjustments": {
      "mobility": -1,
      "control": 1
    },
    "growthAdjustments": {
      "mobility": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "missile": 2
    },
    "availabilityWeight": 0.91
  },
  {
    "id": "logos-aion",
    "manufacturerId": "logos",
    "seriesNumber": 19,
    "nameKana": "アイオン",
    "nameLatin": "AION",
    "archetypeId": "drone",
    "groupAdjustments": {
      "compute": 1,
      "engine": -1
    },
    "growthAdjustments": {
      "engine": 0.02
    },
    "reliabilityAdjustment": 2,
    "weaponAdjustments": {
      "drone": -1
    },
    "availabilityWeight": 0.92
  },
  {
    "id": "logos-aletheia",
    "manufacturerId": "logos",
    "seriesNumber": 20,
    "nameKana": "アレテイア",
    "nameLatin": "ALETHEIA",
    "archetypeId": "adaptive",
    "groupAdjustments": {
      "mobility": -1,
      "control": 2
    },
    "growthAdjustments": {
      "ai": 0.01
    },
    "reliabilityAdjustment": -1,
    "weaponAdjustments": {
      "drone": 1
    },
    "availabilityWeight": 0.94
  }
];

const LEGACY_REFIT_MAP = new Map(LEGACY_SERIES_REFIT_OVERRIDES.map((item) => [item.id, item]));
for (let index = 0; index < SERIES_DEFINITIONS.length; index += 1) {
  const base = SERIES_DEFINITIONS[index];
  if (Number(base.seriesNumber ?? 0) > 20) continue;
  const refit = LEGACY_REFIT_MAP.get(base.id);
  if (!refit) continue;
  SERIES_DEFINITIONS[index] = { ...base, ...refit };
}

const SECOND_GENERATION_REFIT_MAP = new Map(SECOND_GENERATION_REFIT_OVERRIDES.map((item) => [item.id, item]));
const SECOND_GENERATION_SERIES = EXPANDED_SERIES_DEFINITIONS.map((base) => ({ ...base, ...(SECOND_GENERATION_REFIT_MAP.get(base.id) ?? {}) }));
const THIRD_GENERATION_REFIT_MAP = new Map(THIRD_GENERATION_REFIT_OVERRIDES.map((item) => [item.id, item]));
const THIRD_GENERATION_SERIES = THIRD_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base, ...(THIRD_GENERATION_REFIT_MAP.get(base.id) ?? {}) }));
const FOURTH_GENERATION_REFIT_MAP = new Map(FOURTH_GENERATION_REFIT_OVERRIDES.map((item) => [item.id, item]));
const FOURTH_GENERATION_SERIES = FOURTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base, ...(FOURTH_GENERATION_REFIT_MAP.get(base.id) ?? {}) }));
const FIFTH_GENERATION_SERIES = FIFTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const SIXTH_GENERATION_SERIES = SIXTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const SEVENTH_GENERATION_SERIES = SEVENTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const EIGHTH_GENERATION_SERIES = EIGHTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const NINTH_GENERATION_SERIES = NINTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const TENTH_GENERATION_SERIES = TENTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const ELEVENTH_GENERATION_SERIES = ELEVENTH_WAVE_SERIES_DEFINITIONS.map((base) => ({ ...base }));
const NEW_MANUFACTURER_SERIES = NEW_MANUFACTURER_PRE_G11_SERIES.map((base) => ({ ...base }));

SERIES_DEFINITIONS.push(...NEW_MANUFACTURER_SERIES, ...SECOND_GENERATION_SERIES, ...THIRD_GENERATION_SERIES, ...FOURTH_GENERATION_SERIES, ...FIFTH_GENERATION_SERIES, ...SIXTH_GENERATION_SERIES, ...SEVENTH_GENERATION_SERIES, ...EIGHTH_GENERATION_SERIES, ...NINTH_GENERATION_SERIES, ...TENTH_GENERATION_SERIES, ...ELEVENTH_GENERATION_SERIES);


const DOCTRINE_GROUP_LABEL = { output:'出力', mobility:'駆動', control:'制御', engine:'機関', compute:'演算', sensor:'センサー', ai:'AI' };
const DOCTRINE_WEAPON_TEXT = {
  blade:['踏み込みから斬撃までの動作を短くつなぎ、姿勢を崩さず次の攻撃へ移る','微細制御と動作同期を使い、相手の挙動を読んで刃を通す位置を先に作る'],
  hammer:['瞬間出力を打撃へ集中し、重心移動と負荷制御で大振りの隙を抑える','一撃の威力だけでなく、姿勢保持とリスク判断を合わせて確実に衝撃を通す'],
  lance:['加速中の姿勢と駆動精度を保ち、直線的な突入を高い貫徹力へ変換する','行動予測で進入線を先取りし、瞬間出力を接触の一点へ集める'],
  beamBlade:['刃形成と機体動作を同期させ、熱負荷を抱え込む前に短い交戦を重ねる','動作速度と行動予測を優先し、エネルギー刃を必要な瞬間だけ最大効率で使う'],
  rifle:['測距・追跡・微細制御を一つの射撃手順へまとめ、初弾から有効打を狙う','処理速度で照準更新を早め、相手の移動先へ精度の高い射線を置く'],
  machineGun:['駆動応答と追跡を切らさず、連射中も照準修正を継続して圧力を維持する','動作速度と処理速度を連動させ、弾数ではなく追従し続ける時間で優位を作る'],
  cannon:['重心制御と瞬間出力で発射姿勢を固め、反動を次の行動へ残さない','負荷制御とリスク判断を重ね、撃つべき局面へ大火力を限定して投入する'],
  laser:['測距と追跡を絶えず更新し、短い照射を正確に重ねて熱余裕を守る','微細制御と冷却を両立させ、長時間照射より狙った箇所への収束を優先する'],
  beamCannon:['電力供給・冷却・過負荷出力を一つの発射周期として管理する','高出力射撃の前後まで負荷制御し、機体全体を一門の砲として運用する'],
  missile:['並列処理と情報統合で複数目標を整理し、誘導経路そのものに戦術性を持たせる','識別と追跡を先に確立し、発射数より有効なロックを維持することを優先する'],
  emp:['相手システムの状態を読み、干渉が最も効く瞬間へ電子攻撃を集中する','負荷耐性を確保した上で情報統合とリスク判断を使い、自機への影響を抑えて機能停止を狙う'],
  drone:['複数機の状態を並列管理し、本体の移動と無人機の展開を別々の軸で組み立てる','情報統合と識別を維持し、ドローンを火力ではなく戦場の選択肢を増やす手段として使う'],
};
const DOCTRINE_MAKER_MAP = new Map(MANUFACTURERS.map((m,i)=>[m.id,{...m,index:i}]));
function buildSeriesWeaponDoctrine(series) {
  const archetype = SERIES_ARCHETYPES[series.archetypeId] ?? {};
  const preferred = [...new Set([...(series.preferredWeapons ?? []), ...Object.entries(series.weaponAdjustments ?? {}).filter(([,v])=>Number(v)>2).map(([k])=>k), ...(archetype.preferredWeapons ?? [])])].filter(k=>WEAPON_CATEGORIES[k]).slice(0,3);
  if (!preferred.length) preferred.push(Object.keys(WEAPON_CATEGORIES)[Number(series.seriesNumber ?? 1)%Object.keys(WEAPON_CATEGORIES).length]);
  const avoided = [...new Set([...(series.avoidedWeapons ?? []), ...Object.entries(series.weaponAdjustments ?? {}).filter(([,v])=>Number(v)<-2).map(([k])=>k)])].filter(k=>WEAPON_CATEGORIES[k] && !preferred.includes(k));
  const mergedGroups={...(archetype.groupBias??{})}; for(const [k,v] of Object.entries(series.groupAdjustments??{})) mergedGroups[k]=Number(mergedGroups[k]??0)+Number(v??0);
  const groups=Object.entries(mergedGroups).sort((a,b)=>Number(b[1])-Number(a[1])).filter(([,v])=>Number(v)>0).map(([k])=>DOCTRINE_GROUP_LABEL[k]??k).slice(0,2);
  const maker=DOCTRINE_MAKER_MAP.get(series.manufacturerId); const seed=(Number(series.seriesNumber??0)+(maker?.index??0)*7)%2;
  const weaponSentences=preferred.slice(0,2).map((k,i)=>`${WEAPON_CATEGORIES[k].label}では${DOCTRINE_WEAPON_TEXT[k][(seed+i)%2]}。`);
  const opening=preferred.length>1?`主軸は${preferred.map(k=>WEAPON_CATEGORIES[k].label).join(' / ')}。兵装を同じ使い方へ寄せず、それぞれが得意な勝負の作り方を担当させる。`:`主軸は${WEAPON_CATEGORIES[preferred[0]].label}。この兵装で系列の長所を最も直接的に勝敗へ変える構成を基本とする。`;
  const groupText=groups.length?`${groups.join('・')}系の基礎能力を兵装6軸へつなぎ、単独の高数値より「基礎能力→兵装性能→実戦での使い方」が切れないことを重視する。`:'個体の成長結果に応じて基礎能力と兵装6軸の接続を選び、固定された万能構成には寄せない。';
  const avoidText=avoided.length?`一方、${avoided.slice(0,2).map(k=>WEAPON_CATEGORIES[k].label).join(' / ')}は系列の初期設計とは噛み合わせにくい。採用する場合は不足する基礎能力や兵装軸を育成・改修で補う前提になる。`:`非推奨兵装を固定せず、個体差と成長結果次第で別兵装への転向余地も残す。`;
  return `${opening}${weaponSentences.join('')}${groupText}${avoidText}`;
}

// v3.7 Japanese-label repair: older generation data sometimes stored the Latin/original
// name directly in nameKana.  Normalize the whole catalog once so both newly generated
// robots and migrated saves use a Japanese-readable series label consistently.
const KNOWN_SERIES_KANA = new Map();
for (const series of SERIES_DEFINITIONS) {
  if (series?.nameLatin && seriesJapaneseDisplayIsValid(series.nameKana)) {
    KNOWN_SERIES_KANA.set(String(series.nameLatin).toUpperCase(), String(series.nameKana));
  }
}
for (const series of SERIES_DEFINITIONS) {
  series.nameKana = localizeSeriesName(series.nameLatin, series.nameKana, KNOWN_SERIES_KANA);
}

// v4.7: rebuild doctrine text from each series' actual weapon/group profile to avoid late-generation template repetition.
for (const series of SERIES_DEFINITIONS) {
  // LIBIDO's weapon doctrine is part of each creator-authored catalogue entry; preserve it.
  if (series.manufacturerId !== 'libido') series.weaponDoctrine = buildSeriesWeaponDoctrine(series);
}


export const SERIES_GROWTH_CURVES = {
  steady:{label:'均等成長',summary:'3年間を通して安定して伸びる。',yearMultipliers:[1,1,1]},
  early:{label:'早熟型',summary:'初年度の伸びが大きく、後半は落ち着く。',yearMultipliers:[1.16,1.00,0.90]},
  middle:{label:'中盤型',summary:'2年目に調整が噛み合いやすい。',yearMultipliers:[0.94,1.16,0.98]},
  late:{label:'晩成型',summary:'3年目ほど学習効率が上がる。',yearMultipliers:[0.86,1.00,1.22]},
  finalburst:{label:'最終年爆発型',summary:'3年目に設計余力を大きく解放する。',yearMultipliers:[0.82,0.94,1.32]},
  frontloaded:{label:'完成品型',summary:'初期完成度と1年目効率が高いが、後半の伸びは控えめ。',yearMultipliers:[1.12,0.94,0.86]},
  catchup:{label:'弱点補正型',summary:'苦手グループの練習効率が高い。',yearMultipliers:[0.98,1.02,1.06],weakGroupMultiplier:1.16},
  ignition:{label:'遅延点火型',summary:'前半を準備に使い、3年目に大きく伸びる。',yearMultipliers:[0.72,0.94,1.42]},
  plateau:{label:'初期頂点型',summary:'1年目から高効率だが、後半は伸びが落ち着く。',yearMultipliers:[1.20,1.03,0.83]},
  rebound:{label:'再加速型',summary:'2年目に一度停滞し、3年目に再び伸びる。',yearMultipliers:[1.04,0.82,1.24]},
  pulse:{label:'中年次急伸型',summary:'2年目に調整が一気に噛み合うピークを持つ。',yearMultipliers:[0.84,1.30,0.88]},
  doublepeak:{label:'二段加速型',summary:'1年目と3年目に二度の伸びの山を作る。',yearMultipliers:[1.15,0.86,1.18]},
  rebuild:{label:'再構築型',summary:'2年目を再構成期間に使い、3年目に大きく伸び直す。',yearMultipliers:[0.98,0.78,1.32]},
  highplateau:{label:'高原維持型',summary:'3年間を通してやや高い育成効率を安定維持する。',yearMultipliers:[1.05,1.02,1.05]},
  fielddeepen:{label:'運用深化型',summary:'現場経験が蓄積するほど後半の育成効率が高まる。',yearMultipliers:[0.90,1.04,1.18]},
};
export const SERIES_CUSTOM_APTITUDES = {
  balanced:{label:'標準適合',summary:'パーツ効果は標準的。',positive:1,negative:1},
  modular:{label:'高モジュール適合',summary:'多くのパーツ効果を少し引き出しやすい。',positive:1.10,negative:1},
  overresponsive:{label:'過敏応答',summary:'強化も副作用も大きく出る。',positive:1.16,negative:1.16},
  conservative:{label:'保守的適合',summary:'効果は小さめだが副作用も抑える。',positive:.92,negative:.78},
  manufacturer:{label:'純正適合',summary:'同メーカー製パーツとの相性が良い。',positive:1,negative:1,sameMaker:1.15},
  trial:{label:'試供品適合',summary:'挑戦的な試供品へ大きく反応する。',positive:1.02,negative:1,challengePositive:1.18,challengeNegative:1.18},
  weapon:{label:'兵装改修適合',summary:'兵装系パーツの効果を引き出しやすい。',positive:1,negative:1,kind:{weapon:1.14}},
  structural:{label:'構造改修適合',summary:'基礎・耐性系パーツとの相性が良い。',positive:1,negative:1,kind:{base:1.10,resistance:1.14,reliability:1.08}},
  electronic:{label:'電子改修適合',summary:'演算・センサー・AI系の基礎改修に強い。',positive:1.06,negative:1,groups:{compute:1.10,sensor:1.10,ai:1.10}},
  precision:{label:'精密改修適合',summary:'改修結果の効率が安定して高い。',positive:1.08,negative:.92},
  blank:{label:'未完成素体適合',summary:'改修余白が大きく、ほぼすべての正効果を強く受ける。',positive:1.18,negative:1.04},
  weaponExtreme:{label:'単兵装改修適合',summary:'兵装パーツへの反応が極端に高い。',positive:.98,negative:1,kind:{weapon:1.28}},
  riskLab:{label:'危険試験適合',summary:'挑戦的な試供品の上振れも副作用も大きくなる。',positive:1.02,negative:1,challengePositive:1.30,challengeNegative:1.28},
  manufacturerPlus:{label:'純正深化適合',summary:'通常パーツは控えめだが同メーカー製で大きく伸びる。',positive:.98,negative:.95,sameMaker:1.28},
};
export const SERIES_INTRINSIC_TRAITS = {
 maturePlatform:{label:'成熟基盤',summary:'全体練習の吸収がわずかに安定する。',team:1.04}, lateApex:{label:'余力解放',summary:'3年目の練習効率をさらに高める。',year3:1.06}, customMonster:{label:'改修余白',summary:'カスタムを前提に余白を確保。',custom:1.04}, weaponPurist:{label:'兵装純化',summary:'現在兵装の個別練習効率が高い。',weaponTraining:1.10}, weaknessLearner:{label:'弱点学習',summary:'最も低い基礎グループを伸ばしやすい。',weak:1.10}, finishedProduct:{label:'完成品思想',summary:'序盤の練習吸収が良い。',year1:1.05}, finalYearBurst:{label:'終盤解放',summary:'3年目の育成で急伸しやすい。',year3:1.08}, precisionSeed:{label:'再現学習',summary:'練習のブレが小さい。',noise:.92}, volatileCore:{label:'変動学習',summary:'練習成果の振れ幅が大きい。',noise:1.18}, modularFrame:{label:'拡張骨格',summary:'カスタム効果を少し受けやすい。',custom:1.05}, dataDoctrine:{label:'情報連成',summary:'演算・センサー・AI練習に相乗効果。',groups:{compute:1.05,sensor:1.05,ai:1.05}}, survivalDoctrine:{label:'生存優先',summary:'機関系の育成効率が高い。',groups:{engine:1.06}}, overdriveLearning:{label:'高負荷学習',summary:'出力系の育成効率が高い。',groups:{output:1.08}}, slowForge:{label:'長期鍛造',summary:'後半ほど基礎練習効率が上がる。',year3:1.05}, adaptiveWeapons:{label:'兵装適応骨格',summary:'兵装個別練習を吸収しやすい。',weaponTraining:1.08}, autonomousMaturation:{label:'自律成熟',summary:'AI系の育成効率が高い。',groups:{ai:1.08}}, minimalResponse:{label:'最小応答',summary:'1年目の駆動練習が伸びやすい。',year1:1.04,groups:{mobility:1.05}}, trialMagnet:{label:'試供品受容',summary:'挑戦的試供品との相性を優先。',custom:1.04}, balancedCeiling:{label:'総合上限',summary:'全グループを均等に少し伸ばしやすい。',team:1.03}, eccentricLegacy:{label:'異端継承',summary:'練習成果の個体差を許容する。',noise:1.12}
};

export const SERIES_PRODUCTION_TIERS = {
  mass: { label: '主力量産', description: '市場や現場で頻繁に見かける主力系列。', defaultWeight: 1.55 },
  standard: { label: '標準生産', description: '通常の生産規模を持つ一般系列。', defaultWeight: 1.0 },
  specialized: { label: '少量・特化', description: '用途を絞った少量生産系列。', defaultWeight: 0.62 },
  experimental: { label: '実験・試験生産', description: '実証や限定用途を主目的とする希少系列。', defaultWeight: 0.34 },
  rare: { label: '限定・希少', description: '滅多に配備されない限定系列。', defaultWeight: 0.16 },
};

export const SERIES_INDIVIDUALITY_TRAITS = {
  normal: { label: '標準個体差', summary: '一般的な範囲で初期性能と成長率がばらつく。', statVariance: 1, growthVariance: 1, weaponStatVariance: 1, weaponGrowthVariance: 1, reliabilityVariance: 1, jackpotChance: 0 },
  uniform: { label: '均質ロット', summary: '初期性能・成長・信頼性のロット差が小さい。', statVariance: 0.78, growthVariance: 0.82, weaponStatVariance: 0.82, weaponGrowthVariance: 0.84, reliabilityVariance: 0.75, jackpotChance: 0 },
  stableGrowth: { label: '安定成長', summary: '初期値には差があっても成長率のばらつきが小さい。', statVariance: 1, growthVariance: 0.72, weaponStatVariance: 1, weaponGrowthVariance: 0.76, reliabilityVariance: 0.9, jackpotChance: 0 },
  statSwing: { label: '初期値大振れ', summary: '同系列でも初期性能が大きく上下する。', statVariance: 1.38, growthVariance: 1, weaponStatVariance: 1.12, weaponGrowthVariance: 1, reliabilityVariance: 1.05, jackpotChance: 0 },
  growthSwing: { label: '成長率大振れ', summary: '初期値より成長倍率の当たり外れが大きい。', statVariance: 0.98, growthVariance: 1.42, weaponStatVariance: 1, weaponGrowthVariance: 1.3, reliabilityVariance: 1, jackpotChance: 0 },
  reliabilitySwing: { label: '信頼性大振れ', summary: '同ロットでも安定性の差が大きく、扱いやすさが個体ごとに変わる。', statVariance: 1, growthVariance: 1, weaponStatVariance: 1, weaponGrowthVariance: 1, reliabilityVariance: 1.55, jackpotChance: 0 },
  weaponSwing: { label: '兵装適性大振れ', summary: '基礎能力より兵装適性・兵装成長率に強い個体差が出る。', statVariance: 0.95, growthVariance: 0.95, weaponStatVariance: 1.5, weaponGrowthVariance: 1.42, reliabilityVariance: 1, jackpotChance: 0 },
  jackpot: { label: '大当たり個体あり', summary: 'ばらつきが大きく、稀に系列平均から大きく外れた優秀個体が生まれる。', statVariance: 1.18, growthVariance: 1.18, weaponStatVariance: 1.25, weaponGrowthVariance: 1.25, reliabilityVariance: 1.2, jackpotChance: 0.045 },
};


export const SERIES_BY_MANUFACTURER = new Map();
export const SERIES_MAP = new Map(SERIES_DEFINITIONS.map((item) => [item.id, item]));
const SERIES_NUMBER_MAP = new Map(SERIES_DEFINITIONS.map((item) => [`${item.manufacturerId}:${item.seriesNumber}`, item]));
for (const series of SERIES_DEFINITIONS) {
  if (!SERIES_BY_MANUFACTURER.has(series.manufacturerId)) SERIES_BY_MANUFACTURER.set(series.manufacturerId, []);
  SERIES_BY_MANUFACTURER.get(series.manufacturerId).push(series);
}

function mergeNumberMaps(...maps) {
  const out = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map ?? {})) out[key] = Number((Number(out[key] ?? 0) + Number(value ?? 0)).toFixed(3));
  }
  return out;
}

export function getSeriesForManufacturer(manufacturerId) {
  return SERIES_BY_MANUFACTURER.get(manufacturerId) ?? [];
}

export function getSeriesDefinition(seriesId) {
  return SERIES_MAP.get(seriesId) ?? null;
}

function inferredProductionTier(series, archetype) {
  if (series?.productionTier && SERIES_PRODUCTION_TIERS[series.productionTier]) return series.productionTier;
  const weight = Number(series?.availabilityWeight ?? 1);
  if (archetype === 'apex') return 'rare';
  if (archetype === 'volatileExperimental') return 'experimental';
  if (weight >= 1.12) return 'mass';
  if (weight <= 0.68) return 'experimental';
  if (weight <= 0.86) return 'specialized';
  if (['balanced', 'reliable', 'longSeller', 'massProduction'].includes(archetype) && Number(series?.seriesNumber ?? 0) % 5 === 1) return 'mass';
  return 'standard';
}

function inferredIndividualityTrait(series, archetype) {
  if (series?.individualityTrait && SERIES_INDIVIDUALITY_TRAITS[series.individualityTrait]) return series.individualityTrait;
  if (['reliable', 'precision', 'longSeller', 'massProduction'].includes(archetype)) return 'uniform';
  if (['lateGrowth', 'growthProject'].includes(archetype)) return 'growthSwing';
  if (['weaponSavant'].includes(archetype)) return 'weaponSwing';
  if (['volatileExperimental', 'lottery'].includes(archetype)) return 'jackpot';
  if (['glassCannon', 'ultraMobile', 'dataGlass'].includes(archetype)) return 'statSwing';
  return 'normal';
}

function lineageMetadata(series) {
  const number = Number(series?.seriesNumber ?? 1);
  const rootNumber = ((Math.max(1, number) - 1) % 20) + 1;
  const predecessorNumber = Number(series?.predecessorNumber ?? (number > 20 ? number - 20 : 0)) || null;
  const root = SERIES_NUMBER_MAP.get(`${series?.manufacturerId}:${rootNumber}`) ?? null;
  const predecessor = predecessorNumber ? SERIES_NUMBER_MAP.get(`${series?.manufacturerId}:${predecessorNumber}`) ?? null : null;
  const generation = series?.eleventhGeneration || number >= 201 ? 11 : Math.max(1, Math.ceil(number / 20));
  return {
    lineageRootNumber: rootNumber,
    lineageRootId: root?.id ?? series?.id ?? null,
    lineageRootNameKana: root?.nameKana ?? series?.nameKana ?? '',
    lineageRootNameLatin: root?.nameLatin ?? series?.nameLatin ?? '',
    predecessorNumber,
    predecessorId: predecessor?.id ?? null,
    predecessorNameKana: predecessor?.nameKana ?? '',
    predecessorNameLatin: predecessor?.nameLatin ?? '',
    lineageGeneration: generation,
    lineageLabel: `${root?.nameKana ?? series?.nameKana ?? 'シリーズ'}系 / 第${generation}世代`,
  };
}

function inferredGrowthCurveId(series, archetype) {
  if (series?.growthCurveId && SERIES_GROWTH_CURVES[series.growthCurveId]) return series.growthCurveId;
  if (['lateGrowth','growthProject'].includes(archetype)) return 'late';
  if (['flagship','reliable','precision','massProduction'].includes(archetype)) return 'frontloaded';
  if (['volatileExperimental','lottery'].includes(archetype)) return 'middle';
  if (['countermeasure','counterDesign','adaptive'].includes(archetype)) return 'catchup';
  if (['glassCannon','ultraMobile','burstAssault'].includes(archetype)) return 'early';
  return 'steady';
}
function inferredCustomAptitudeId(series, archetype) {
  if (series?.customAptitudeId && SERIES_CUSTOM_APTITUDES[series.customAptitudeId]) return series.customAptitudeId;
  if (['weaponSavant','hybridClose','hybridRanged'].includes(archetype)) return 'weapon';
  if (['volatileExperimental','lottery'].includes(archetype)) return 'trial';
  if (['fortress','overengineered','resilient','heavyAssault'].includes(archetype)) return 'structural';
  if (['compute','sensor','ai','electronicWarfare','dataGlass','aiAnomaly'].includes(archetype)) return 'electronic';
  if (['precision','reliable'].includes(archetype)) return 'precision';
  if (['adaptive','growthProject','minimalist'].includes(archetype)) return 'modular';
  return 'balanced';
}
function inferredIntrinsicTraitId(series, archetype) {
  if (series?.intrinsicTraitId && SERIES_INTRINSIC_TRAITS[series.intrinsicTraitId]) return series.intrinsicTraitId;
  if (['lateGrowth','growthProject'].includes(archetype)) return 'slowForge';
  if (['weaponSavant','hybridClose','hybridRanged'].includes(archetype)) return 'adaptiveWeapons';
  if (['compute','sensor','electronicWarfare','dataGlass'].includes(archetype)) return 'dataDoctrine';
  if (['ai','aiAnomaly','drone'].includes(archetype)) return 'autonomousMaturation';
  if (['resilient','fortress'].includes(archetype)) return 'survivalDoctrine';
  if (['glassCannon','highOutput','burstAssault'].includes(archetype)) return 'overdriveLearning';
  if (['precision','reliable','massProduction'].includes(archetype)) return 'precisionSeed';
  if (['volatileExperimental','lottery'].includes(archetype)) return 'eccentricLegacy';
  if (['adaptive','countermeasure','counterDesign'].includes(archetype)) return 'weaknessLearner';
  return 'maturePlatform';
}
function localizeNarrativeText(series, lineage, value) {
  let text=String(value ?? '');
  if (!text) return text;
  const replacements=[];
  const add=(latin,kana)=>{ if(latin && kana && latin!==kana) replacements.push([String(latin),String(kana)]); };
  add(series?.nameLatin, series?.nameKana);
  add(lineage?.predecessorNameLatin, lineage?.predecessorNameKana);
  add(lineage?.lineageRootNameLatin, lineage?.lineageRootNameKana);
  const latinParts=String(series?.nameLatin ?? '').split('-').filter(Boolean);
  const kanaParts=String(series?.nameKana ?? '').split('・').filter(Boolean);
  if (latinParts.length && kanaParts.length) {
    add(latinParts[0], kanaParts[0]);
    if (latinParts.length > 1 && kanaParts.length > 1) add(latinParts.at(-1), kanaParts.at(-1));
  }
  replacements.sort((a,b)=>b[0].length-a[0].length);
  for (const [latin,kana] of replacements) text=text.replaceAll(latin,kana);
  return text;
}

function inferredAbilityTags(series, archetype, preferredWeapons, groupBias) {
  if (series?.abilityTendencyTags?.length) return series.abilityTendencyTags;
  const tags=[...preferredWeapons];
  const strongGroups=Object.entries(groupBias??{}).filter(([,v])=>Number(v)>=4).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k);
  tags.push(...strongGroups);
  if (['resilient','fortress'].includes(archetype)) tags.push('resistance');
  if (['reliable','precision','massProduction'].includes(archetype)) tags.push('reliability');
  if (['flagship','apex'].includes(archetype)) tags.push('official');
  return [...new Set(tags)];
}

export function resolveSeriesProfile(seriesLike) {
  const series = typeof seriesLike === 'string' ? getSeriesDefinition(seriesLike) : seriesLike;
  if (!series) return null;
  const archetype = SERIES_ARCHETYPES[series.archetypeId] ?? SERIES_ARCHETYPES.balanced;
  const productionTierId = inferredProductionTier(series, series.archetypeId);
  const productionTier = SERIES_PRODUCTION_TIERS[productionTierId] ?? SERIES_PRODUCTION_TIERS.standard;
  const individualityTraitId = inferredIndividualityTrait(series, series.archetypeId);
  const individuality = SERIES_INDIVIDUALITY_TRAITS[individualityTraitId] ?? SERIES_INDIVIDUALITY_TRAITS.normal;
  const lineage = lineageMetadata(series);
  const growthCurveId = inferredGrowthCurveId(series, series.archetypeId);
  const customAptitudeId = inferredCustomAptitudeId(series, series.archetypeId);
  const intrinsicTraitId = inferredIntrinsicTraitId(series, series.archetypeId);
  const preferredWeapons = [...new Set([...(archetype.preferredWeapons ?? []), ...(series.preferredWeapons ?? [])])];
  const avoidedWeapons = [...new Set(series.avoidedWeapons ?? [])].filter((weaponKey) => !preferredWeapons.includes(weaponKey));
  const localizedSummary = localizeNarrativeText(series, lineage, series.summary ?? series.concept ?? archetype.summary);
  const baseLocalizedConcept = localizeNarrativeText(series, lineage, series.concept ?? series.summary ?? archetype.summary);
  const localizedConcept = `${baseLocalizedConcept} 総合コンセプトとしては、系列固有の得意分野を兵装・特殊能力・信頼性・耐性まで同じ勝ち筋へ接続し、3年間の育成で完成形へ近づけることを重視する。初期値だけで評価せず、成長曲線とカスタム適性を含めて長所を伸ばすか弱点を補うかを選択できる設計である。比較項目が試合ごとに変化するため、単一能力の最高値よりも複数の得意項目を実戦へ持ち込めることが系列らしさになる。`.trim();
  const baseNamingConcept = localizeNarrativeText(series, lineage, series.namingConcept ?? '');
  const combinedGroupBias = mergeNumberMaps(archetype.groupBias, series.groupAdjustments);
  const groupLabels = { output:'出力', mobility:'駆動', control:'制御', engine:'機関', compute:'演算', sensor:'センサー', ai:'AI' };
  const weaponLabels = { blade:'ブレード', hammer:'ハンマー', lance:'ランス', beamBlade:'ビームブレード', rifle:'ライフル', machineGun:'マシンガン', cannon:'キャノン', laser:'レーザー', beamCannon:'ビームキャノン', missile:'ミサイル', emp:'EMP', drone:'ドローン' };
  const motifGroups = Object.entries(combinedGroupBias).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,2).map(([key])=>groupLabels[key] ?? key);
  const motifWeapons = [...new Set([...(archetype.preferredWeapons ?? []), ...(series.preferredWeapons ?? [])])].slice(0,2).map((key)=>weaponLabels[key] ?? key);
  const motifExpansion = ` 設計モチーフを能力面から見ると、${motifGroups.length ? motifGroups.join('・') : '全体の均衡'}を主要な骨格とし、${motifWeapons.length ? `${motifWeapons.join('・')}などの兵装運用` : '特定兵装へ固定しない運用'}へつながるよう各系統の配分が組まれている。さらに成長曲線「${(SERIES_GROWTH_CURVES[inferredGrowthCurveId(series, series.archetypeId)] ?? SERIES_GROWTH_CURVES.steady).label}」とカスタム適性「${(SERIES_CUSTOM_APTITUDES[inferredCustomAptitudeId(series, series.archetypeId)] ?? SERIES_CUSTOM_APTITUDES.balanced).label}」まで含めて一つの設計像としており、名称は見た目の印象だけでなく、どの能力を伸ばし、どの改修で完成させる系列なのかを読む手掛かりとして扱う。`;
  const weaponRelationExpansion = ` 兵装との関係では、${motifGroups.length ? motifGroups.join('・') : '基礎能力全般'}を兵装性能へ変換する設計を重視する。41基礎ステータスは兵装側の威力・精度・制御・応答・安定・効率と相乗し、同じ兵装値でも基礎側の組み合わせで実戦性能が変わる。育成では成長倍率・成長曲線・カスタム適性・推奨兵装まで合わせ、名称のモチーフが示す長所をどの兵装で結果へ変えるかを見ると設計意図を掴みやすい。`;
  const localizedNamingConcept = `${baseNamingConcept}${motifExpansion}${weaponRelationExpansion}`.trim();
  const baseDevelopmentBackground = localizeNarrativeText(series, lineage, series.developmentBackground ?? '');
  const localizedDevelopmentBackground = `${baseDevelopmentBackground} 開発背景では、メーカーの得意技術と世代ごとの運用要求を両立させ、試験場の最高値だけでなく三年間の育成・改修余地を残すことが重視された。兵装交換や特殊能力獲得によって完成形が変わることも想定し、固定装備専用機ではなく運用側が発展方向を選べる余白を確保している。`.trim();
  const baseEngineeringNotes = localizeNarrativeText(series, lineage, series.engineeringNotes ?? '');
  const localizedEngineeringNotes = `${baseEngineeringNotes} 設計上の癖は、得意能力へ資源を集中する代わりに一部の能力を育成側へ委ねている点に現れる。弱点を均すだけでは系列本来の伸びを薄める場合があり、得意領域を残したままカスタムパーツで最低限の穴を塞ぐと扱いやすい。特殊能力も同じ方向へ重ねるほど役割が明確になる。`.trim();
  const baseTrainingNotes = localizeNarrativeText(series, lineage, series.trainingNotes ?? '');
  const trainingExpansion = ` 育成・改修の見方では、まず現在値と伸びしろを分けて考える。基礎能力倍率は現時点の完成度、成長倍率と成長曲線は残り期間でどこまで伸ばせるか、カスタム適性はパーツ投入の効率を示すため、三者を同じ指標として扱わないことが重要である。1年目は成長倍率の高い得意項目と兵装適性を見極め、2年目は主力兵装と特殊能力の方向を揃え、3年目は残り練習回数を考えて完成度の高い項目を仕上げるのが基本となる。弱点補強は、比較で頻繁に負ける項目や信頼性・耐性の穴を最低限まで引き上げる場合に有効だが、全能力を平均化すると系列固有の強みを失いやすい。逆に長所特化は対応する兵装6軸・41基礎ステータス相乗・特殊能力が重なった時に大きな勝ち筋になるが、苦手な相手への回答役をチーム内に別途用意する必要がある。カスタムパーツは単純な数値上昇だけでなく、成長倍率や特殊能力付与まで含めて投入先を選び、同じメーカー・系列でも個体差に応じて完成形を変える。最終的には「現在の強さ」「残り期間の伸び」「兵装との相乗」「特殊能力」「信頼性・耐性」「チーム内の役割」の六点をまとめて見て、弱点修正型・長所特化型・バランス型のどこへ着地させるか判断するのがこの系列の育成指針となる。`;
  const localizedTrainingNotes = `${baseTrainingNotes}${trainingExpansion}`.trim();
  const baseWeaponDoctrine = localizeNarrativeText(series, lineage, series.weaponDoctrine ?? '');
  const doctrineRelations = BASE_SYNERGY_RULES.slice(0,6).map((rule)=>`${rule.triggerStat}→${rule.weaponAxis}`).join('、');
  const localizedWeaponDoctrine = `${baseWeaponDoctrine} 兵装ドクトリンでは、兵装側の数値だけでなく対応する基礎ステータスとの同時選出による相乗を重視する。41基礎ステータスすべてに兵装との関係があり、特殊能力も同じ兵装・軸へ寄せることで明確な勝ち筋を作れる。推奨兵装は装備制限ではなく、個体の成長倍率や獲得能力次第で別構成への換装も成立する。代表的な関係は${doctrineRelations}などである。`.trim();
  return {
    ...series,
    ...lineage,
    label: series.label ?? archetype.label,
    summary: localizedSummary,
    concept: localizedConcept,
    namingConcept: localizedNamingConcept,
    developmentBackground: localizedDevelopmentBackground,
    engineeringNotes: localizedEngineeringNotes,
    trainingNotes: localizedTrainingNotes,
    marketPosition: series.marketPosition ?? productionTier.label,
    productionTierId,
    productionTierLabel: productionTier.label,
    productionTierDescription: productionTier.description,
    effectiveAvailabilityWeight: Number(series.availabilityWeight ?? productionTier.defaultWeight),
    individualityTraitId,
    individualityLabel: individuality.label,
    individualitySummary: individuality.summary,
    individuality,
    intrinsicTraitId,
    intrinsicTrait: SERIES_INTRINSIC_TRAITS[intrinsicTraitId] ?? SERIES_INTRINSIC_TRAITS.maturePlatform,
    growthCurveId,
    growthCurve: SERIES_GROWTH_CURVES[growthCurveId] ?? SERIES_GROWTH_CURVES.steady,
    customAptitudeId,
    customAptitude: SERIES_CUSTOM_APTITUDES[customAptitudeId] ?? SERIES_CUSTOM_APTITUDES.balanced,
    abilityTendencyTags: inferredAbilityTags(series, series.archetypeId, preferredWeapons, mergeNumberMaps(archetype.groupBias, series.groupAdjustments)),
    abilityTendencyMultiplier: Number(series.abilityTendencyMultiplier ?? 1.18),
    annualVolatility: Number(series.annualVolatility ?? (productionTierId === 'experimental' || productionTierId === 'rare' ? 1.2 : productionTierId === 'mass' ? 0.82 : 1)),
    groupBias: mergeNumberMaps(archetype.groupBias, series.groupAdjustments),
    growthBias: mergeNumberMaps(archetype.growthBias, series.growthAdjustments),
    weaponBias: mergeNumberMaps(archetype.weaponBias, series.weaponAdjustments),
    weaponGrowthBias: mergeNumberMaps(archetype.weaponGrowthBias, series.weaponGrowthAdjustments),
    reliabilityBias: Number(archetype.reliabilityBias ?? 0) + Number(series.reliabilityAdjustment ?? 0),
    resistanceBias: Number(archetype.resistanceBias ?? 0) + Number(series.resistanceAdjustment ?? 0),
    preferredWeapons,
    avoidedWeapons,
    weaponDoctrine: localizedWeaponDoctrine,
    statVariance: Number(archetype.statVariance ?? 1) * Number(series.statVarianceMultiplier ?? 1) * Number(individuality.statVariance ?? 1),
    growthVariance: Number(archetype.growthVariance ?? 1) * Number(series.growthVarianceMultiplier ?? 1) * Number(individuality.growthVariance ?? 1),
    weaponStatVariance: Number(individuality.weaponStatVariance ?? 1),
    weaponGrowthVariance: Number(individuality.weaponGrowthVariance ?? 1),
    reliabilityVariance: Number(individuality.reliabilityVariance ?? 1),
    jackpotChance: Number(individuality.jackpotChance ?? 0),
    eccentricBonus: Number(archetype.eccentricBonus ?? 0) + Number(series.eccentricBonusAdjustment ?? 0),
  };
}

export function seriesByNumber(manufacturerId, number) {
  const list = getSeriesForManufacturer(manufacturerId);
  if (!list.length) return null;
  const index = Math.max(0, (Number(number || 1) - 1) % list.length);
  return list[index];
}
