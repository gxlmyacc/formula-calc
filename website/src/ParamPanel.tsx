import React from 'react';
import Switch from 'antd/es/switch';
import { useI18n } from './i18n';
import CodeEditor from './CodeEditor';
import type { Draft, Workspace, ValueType } from './model';
import './ParamPanel.scss?scoped';

type Props = { workspace: Workspace; names: string[]; update(next: Partial<Workspace>): void };
export default function ParamPanel({ workspace: w, names, update }: Props) {
  const { t } = useI18n();
  const setDraft = (name: string, draft: Draft) => update({ drafts: { ...w.drafts, [name]: draft } });
  const format = () => {
    try {
      update({ json: JSON.stringify(JSON.parse(w.json), null, 2) });
    } catch { /* Error is shown by the calculation panel. */ }
  };
  return <section className="param-panel">
    <header><h2>{t('参数')} <small>{names.length}</small></h2><div className="mode-switch" role="group" aria-label={t('参数输入方式')}>
      <button type="button" className={w.mode === 'form' ? 'active' : ''} onClick={() => update({ mode: 'form' })}>{t('表单')}</button>
      <button type="button" className={w.mode === 'json' ? 'active' : ''} onClick={() => update({ mode: 'json' })}>{t('JSON / 批量')}</button>
    </div></header>
    {w.mode === 'json' && <>
      <div className="json-toolbar">
        <p className="hint">{t('对象计算一次，对象数组逐组计算。保留原始结构及值类型。')}</p>
        <button type="button" className="format" onClick={format}>{t('格式化 JSON')}</button>
      </div>
      <CodeEditor label={t('JSON 参数')} json value={w.json} onChange={(json) => update({ json })} />
    </>}
    {!names.length && <p className="hint">{t('当前公式没有参数；输入变量后会自动生成列表。')}</p>}
    <div className="parameter-list">
      {names.map((name) => {
        const draft = w.drafts[name] || { type: 'number' as const, text: '' };
        const enabled = w.enabled[name] !== false;
        return <div className={`parameter ${enabled ? '' : 'disabled'}`} key={name}>
          <div className="parameter-name"><code>{name}</code>
            <Switch size="small" checked={enabled} aria-label={t('启用参数 {name}', { name })}
              onChange={(value) => update({ enabled: { ...w.enabled, [name]: value } })} /></div>
          {w.mode === 'form' && <div className="parameter-input">
            <select aria-label={t('{name} 类型', { name })} disabled={!enabled} value={draft.type}
              onChange={(e) => setDraft(name, { type: e.target.value as ValueType, text: e.target.value === 'boolean' ? 'true' : '' })}>
              <option value="number">{t('数字')}</option><option value="string">{t('字符串')}</option><option value="boolean">{t('布尔值')}</option>
              <option value="null">null</option><option value="json">{t('JSON 数组 / 对象')}</option>
            </select>
            {draft.type === 'boolean' ? <select aria-label={t('{name} 值', { name })} disabled={!enabled} value={draft.text}
              onChange={(e) => setDraft(name, { ...draft, text: e.target.value })}><option>true</option><option>false</option></select>
              : <input aria-label={t('{name} 值', { name })} value={draft.type === 'null' ? 'null' : draft.text}
                placeholder={t(draft.type === 'json' ? '[1, 2, 3] 或 {"a": 1}' : '请输入值')}
                disabled={!enabled || draft.type === 'null'} onChange={(e) => setDraft(name, { ...draft, text: e.target.value })} />}
          </div>}
        </div>;
      })}
    </div>
  </section>;
}
