#!/usr/bin/env python3
"""Register a new effect in both catalogs. Rendering must be implemented separately.
Usage: python devtools/add_effect.py effect-id 加工名
"""
import json,re,sys
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('Usage: python devtools/add_effect.py effect-id 加工名')
ident,name=sys.argv[1:]
if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',ident) or len(name)<2:raise SystemExit('Invalid ID/name')
root=Path(__file__).resolve().parent.parent
manifest_file=root/'effect_extensions.json'
manifest=json.loads(manifest_file.read_text(encoding='utf-8'))
if ident in [e['id'] for e in manifest['effects']]:raise SystemExit('ID already exists')
main_file=root/'index.html';editor_file=root/'fx_trial_preview.html'
main=main_file.read_text(encoding='utf-8');editor=editor_file.read_text(encoding='utf-8')
if f'id:"{ident}"' in main or f'["{ident}"' in editor:raise SystemExit('ID already registered')
# Add new pair to a dedicated extension list. Rendering uses the extension dispatcher.
anchor='const MK477_APPROVED='
if anchor not in editor:raise SystemExit('Editor registry anchor missing')
entry=f' {{id:"{ident}",name:"{name}",category:"追加加工"}},\n'
main=main.replace('const CARD_VISUAL_EFFECTS=[','const CARD_VISUAL_EFFECTS=[\n'+entry,1)
# Extra catalog is separate from original 10 to avoid breaking the existing renderer index.
marker='const fxCategories='
if marker not in editor:raise SystemExit('Editor catalog anchor missing')
extra=f'const MK_EXTRA_EFFECTS = [["{ident}","{name}"]];\n'
if 'const MK_EXTRA_EFFECTS = ' in editor:
    editor=editor.replace('const MK_EXTRA_EFFECTS = [','const MK_EXTRA_EFFECTS = [["'+ident+'","'+name+'"],',1)
else:
    editor=editor.replace(marker,extra+marker,1)
    editor=editor.replace("const fxOptionSource=Array.from($('type').options)", "for(const [id,name] of MK_EXTRA_EFFECTS){if(Array.from($('type').options).some(o=>o.value===id))throw new Error('Duplicate ID: '+id);$('type').add(new Option(name,id))}\nconst fxOptionSource=Array.from($('type').options)",1)
    editor=editor.replace('function render(idOverride,skipDetail=false){','function render(idOverride,skipDetail=false){if(MK_EXTRA_EFFECTS.some(e=>e[0]===(idOverride||$(\'type\').value))){throw new Error("新加工の描画処理が未実装です: "+(idOverride||$(\'type\').value))}',1)
manifest['effects'].append({'id':ident,'name':name,'category':'追加加工','renderer':'TODO'})
main_file.write_text(main,encoding='utf-8');editor_file.write_text(editor,encoding='utf-8')
manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Registered in both catalogs. NEXT: implement renderer, replace TODO, run validator and browser test.')
