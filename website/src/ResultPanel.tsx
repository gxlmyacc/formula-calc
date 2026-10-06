import React, { useEffect, useState } from 'react';
import { useI18n } from './i18n';
import { traceContext } from './model';
import type { Range, ResultRow } from './model';
import './ResultPanel.scss?scoped';

type Props = { expression: string; rows: ResultRow[]; status: string; error: string; batch: boolean; onLocate(range: Range): void };
export default function ResultPanel({ expression, rows, status, error, batch, onLocate }: Props) {
  const { t } = useI18n();
  const [selected, select] = useState(0);
  useEffect(() => {
    select(0);
  }, [rows]);
  const row = rows[selected];
  return <section className="result-panel">
    <header><h2>{t('计算结果')}</h2><span className={`status ${error ? 'error' : ''}`} role="status">{error || status}</span></header>
    {batch && rows.length > 0 && <div className="batch-results">
      {rows.map((item, i) => <button type="button" key={item.index} className={i === selected ? 'selected' : ''} onClick={() => select(i)}>
        <span>{t('第 {count} 组', { count: i + 1 })}</span><code>{item.error || item.value}</code>
      </button>)}
    </div>}
    {row && <div className={`result-value ${row.error ? 'error-value' : ''}`}>
      <small>{row.error ? t(row.waiting ? '等待参数' : '计算错误') : row.type}</small>
      <pre>{row.error || row.value}</pre>
    </div>}
    {!row && <div className="empty">{t(error ? '修正输入后将自动计算。' : status === t('空批次') ? '参数数组为空，没有需要计算的数据。' : '结果将在这里显示。')}</div>}
    <div className="trace-header"><h3>{t('执行步骤')} <small>{row?.traces.length || 0}</small></h3><span>{t('点击定位原始表达式')}</span></div>
    {row?.traces.length ? <ol className="traces">
      {row.traces.map((trace, i) => {
        const context = traceContext(expression, trace);
        return <li key={i}>
          <button type="button" onClick={() => {
            if (context.active) {
              onLocate(trace);
            }
          }} aria-label={t('定位步骤 {count}', { count: i + 1 })}>
            <span className="step">{String(i + 1).padStart(2, '0')}</span><div className="trace-body">
              <pre className="expression">{context.before}{context.active && <mark>{context.active}</mark>}{context.after}</pre>
              {!context.active && <div className="dynamic-expression">{t('动态公式片段')}：<code>{trace.expression}</code></div>}
              <div className="trace-value"><code>{trace.calculation
                ? <>{trace.calculation}<span className="result-arrow"> = </span></>
                : !trace.conversions && <span className="result-arrow">→ </span>}
              {trace.conversions ? trace.conversions.join(' → ') : trace.value}</code>
              <span>{trace.finalPrecision ? t('最终精度') : trace.type} · {trace.line}:{trace.column}</span></div>
            </div>
          </button>
        </li>;
      })}
    </ol> : <p className="empty-trace">{t('计算执行后会显示实际经过的节点；未执行的条件分支不会出现在日志中。')}</p>}
  </section>;
}
