import React, { useEffect, useMemo, useRef, useState } from 'react';
import Switch from 'antd/es/switch';
import CodeEditor from './CodeEditor';
import ParamPanel from './ParamPanel';
import OptionsPanel from './OptionsPanel';
import ResultPanel from './ResultPanel';
import ApiSidebar from './ApiSidebar';
import { analyze, calculate, DEFAULT_WORKSPACE, EXAMPLES, restoreWorkspace } from './model';
import type { Range, ResultRow, Workspace } from './model';
import { LocaleContext, preferredLocale, translate } from './i18n';
import type { Locale } from './i18n';
import './App.scss?scoped';

const STORAGE_KEY = 'formula-calc-playground-v1';
export default function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return preferredLocale(localStorage.getItem('formula-calc-locale'), navigator.language);
    } catch {
      return preferredLocale(null, navigator.language);
    }
  });
  const t = (text: string, values?: Record<string, string | number>) => translate(locale, text, values);
  const [workspace, setWorkspace] = useState<Workspace>(() => {
    try {
      return restoreWorkspace(localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_WORKSPACE;
    }
  });
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [status, setStatus] = useState(t('等待计算'));
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<Range>();
  const [help, setHelp] = useState(false);
  const apiButton = useRef<HTMLButtonElement>(null);
  const generation = useRef(0);
  const analysis = useMemo(() => analyze(workspace.expression), [workspace.expression]);
  const update = (next: Partial<Workspace>) => setWorkspace((w) => ({ ...w, ...next }));
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = translate(locale, 'Formula Calc · 在线调试');
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(locale, 'Formula Calc 在线公式调试：参数、批量计算、精度设置与逐步执行日志。'));
    try {
      localStorage.setItem('formula-calc-locale', locale);
    } catch { /* Storage is optional. */ }
  }, [locale]);
  useEffect(() => {
    if (analysis.error) {
      return;
    }
    setWorkspace((w) => {
      const drafts = Object.assign(Object.create(null), w.drafts);
      let changed = false;
      analysis.names.forEach((name) => {
        if (!Object.prototype.hasOwnProperty.call(drafts, name)) {
          drafts[name] = { type: 'number', text: '' }; changed = true;
        }
      });
      return changed ? { ...w, drafts } : w;
    });
  }, [analysis]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, workspace }));
    } catch { /* Storage is optional. */ }
    const run = ++generation.current;
    setRows([]); setError(''); setSelection(undefined);
    if (analysis.error) {
      setError(analysis.error); setStatus(translate(locale, '公式错误')); return;
    }
    setStatus(translate(locale, '等待输入完成…'));
    const timer = setTimeout(async () => {
      setStatus(translate(locale, '计算中…'));
      try {
        const results = await calculate(workspace, locale);
        if (generation.current !== run) {
          return;
        }
        setRows(results);
        const waiting = results.filter((row) => row.waiting).length;
        const failed = results.filter((row) => row.error && !row.waiting).length;
        setStatus(translate(locale, !results.length ? '空批次' : waiting ? '{count} 组等待参数'
          : failed ? '{count} 组计算错误' : '{count} 组计算完成', { count: waiting || failed || results.length }));
      } catch (e) {
        if (generation.current === run) {
          setError((e as Error).message); setStatus(translate(locale, '输入错误'));
        }
      }
    }, 300);
    return () => {
      clearTimeout(timer); generation.current = run + 1;
    };
  }, [workspace, analysis, locale]);
  const batch = workspace.mode === 'json' && workspace.json.trim().startsWith('[');

  return <LocaleContext.Provider value={locale}><div className="playground">
    <header className="page-header"><a className="brand" href="https://github.com/gxlmyacc/formula-calc">
      <span className="brand-icon">ƒ</span><span>Formula Calc <small>{t('公式调试工作台')}</small></span></a>
    <nav><select aria-label="Language / 语言" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
      <option value="zh">中文</option><option value="en">English</option>
    </select><button type="button" ref={apiButton} aria-expanded={help} aria-controls="api-sidebar"
      onClick={() => setHelp((value) => !value)}>{t('API 说明')}</button>
    <a href="https://github.com/gxlmyacc/formula-calc" target="_blank" rel="noreferrer">GitHub ↗</a></nav></header>
    <main><div className="intro"><div><h1>{t('让每一步计算，都清晰可见。')}</h1>
      <p>{t('编写公式，填入参数，实时查看结果与执行过程。')}</p></div>
    <button type="button" className="reset" onClick={() => setWorkspace(DEFAULT_WORKSPACE)}>{t('恢复默认示例')}</button></div>
    <div className="workspace"><div className="main-column">
      <section className="panel formula-panel"><header><h2>{t('公式编辑器')}</h2><div className="editor-options">
        <label>{t('引用序号')} <Switch size="small" checked={workspace.showRefs} onChange={(showRefs) => update({ showRefs })} /></label>
        <select aria-label={t('加载示例')} value="" onChange={(e) => {
          const example = EXAMPLES[Number(e.target.value)];
          update({ expression: example.expression, json: example.json, mode: 'json' });
        }}><option value="" disabled>{t('加载示例')}</option>
          {EXAMPLES.map((example, i) => <option key={example.name} value={i}>{t(example.name)}</option>)}</select>
      </div></header>
      <CodeEditor label={t('公式编辑器')} value={workspace.expression} onChange={(expression) => update({ expression })}
        parameters={workspace.mode === 'json' ? workspace.json : '{}'} names={Object.keys(workspace.drafts)}
        showRefs={workspace.showRefs} selection={selection} />
      <div className="editor-footer"><span>{t('自动计算 · 300ms')}</span><span>{t('支持百分比、条件、函数和 $n 引用')}</span></div></section>
      <section className="panel"><ResultPanel expression={workspace.expression} rows={rows} status={status} error={error} batch={batch}
        onLocate={(range) => setSelection({ ...range })} /></section>
    </div><aside className="panel side-column">
      <ParamPanel workspace={workspace} names={analysis.names} update={update} />
      <OptionsPanel value={workspace.settings} onChange={(settings) => update({ settings })} />
    </aside></div>
    </main><footer className="page-footer"><span>{t('Formula Calc · 浏览器本地计算，输入保存在当前浏览器')}</span>
      <span>React 16 · Chrome 49+</span></footer>
    <ApiSidebar visible={help} onClose={() => {
      setHelp(false); apiButton.current?.focus();
    }} />
  </div></LocaleContext.Provider>;
}
