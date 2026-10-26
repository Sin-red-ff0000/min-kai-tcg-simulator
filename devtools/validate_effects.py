#!/usr/bin/env python3
"""Check registration in main app, editor, and manifest. Run: python devtools/validate_effects.py"""
import json,re,sys
from pathlib import Path
base=Path(__file__).resolve().parent.parent
manifest=json.loads((base/'effect_extensions.json').read_text(encoding='utf-8'))
main=(base/'index.html').read_text(encoding='utf-8')
editor=(base/'fx_trial_preview.html').read_text(encoding='utf-8')
entries=manifest['effects']
ids=[x['id'] for x in entries]
names=[x['name'] for x in entries]
errors=[]
if len(ids)!=len(set(ids)):errors.append('duplicate IDs in manifest')
if len(names)!=len(set(names)):errors.append('duplicate names in manifest')
if any(not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',i) for i in ids):errors.append('invalid IDs')
if any(len(n)<2 for n in names):errors.append('invalid names')
for x in entries:
    ident,name=x['id'],x['name']
    if not re.search(r'\bid\s*:\s*["\']'+re.escape(ident)+r'["\']',main):errors.append('missing main ID '+ident)
    if f'["{ident}","{name}"]' not in editor:errors.append('missing editor pair '+ident)
    if x['renderer'] not in editor:errors.append('missing renderer '+ident)
if len(entries)!=10:errors.append('expected 10 approved effects')
if errors:
    print('FAIL:\n'+'\n'.join(' - '+x for x in errors))
    sys.exit(1)
print(f'PASS: {len(entries)} approved effects registered in both app and editor')
