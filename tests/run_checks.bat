@echo off
setlocal
cd /d %~dp0\..
for /r js %%f in (*.js) do node --check "%%f" || exit /b 1
node tests\smoke.test.js || exit /b 1
node tests\content_balance.test.js || exit /b 1
node tests\effect_coverage.test.js || exit /b 1
node tests\balance22_audit.test.js || exit /b 1
node tests\expansion23_systems.test.js || exit /b 1
node tests\expansion24_systems.test.js || exit /b 1
node tests\expansion26_systems.test.js || exit /b 1
node tests\expansion27_systems.test.js || exit /b 1
node tests\expansion28_balance_audit.test.js || exit /b 1
node tests\expansion29_adaptive.test.js || exit /b 1
node tests\boss_balance.test.js || exit /b 1
node tests\boss_reward_integration.test.js || exit /b 1
node tests\chapter2_systems.test.js || exit /b 1
node tests\chapter3_systems.test.js || exit /b 1
node tests\expansion08_systems.test.js || exit /b 1
node tests\boss2_balance.test.js || exit /b 1
node tests\expansion09_systems.test.js || exit /b 1
node tests\expansion10_systems.test.js || exit /b 1
node tests\expansion11_systems.test.js || exit /b 1
node tests\expansion12_systems.test.js || exit /b 1
node tests\expansion13_systems.test.js || exit /b 1
node tests\expansion14_systems.test.js || exit /b 1
node tests\expansion17_systems.test.js || exit /b 1
node tests\expansion18_systems.test.js || exit /b 1
node tests\expansion19_systems.test.js || exit /b 1
node tests\expansion20_systems.test.js || exit /b 1
node tests\boss4_reward_integration.test.js || exit /b 1
node tests\reset_controls.test.js || exit /b 1
node tests\boss3_balance.test.js || exit /b 1
node tests\boss4_balance.test.js || exit /b 1
node tests\static_ui.test.js || exit /b 1
node tests\system_guide.test.js || exit /b 1
node tests\guide_detail.test.js || exit /b 1
node tests\web_deploy.test.js || exit /b 1
node tests\mobile_ui.test.js || exit /b 1
node tests\modal_overflow.test.js || exit /b 1
node tests\alchemy.test.js || exit /b 1
echo All checks passed.
