import React, { useRef, useState } from 'react';
import Drawer from 'antd/es/drawer';
import { useI18n } from './i18n';
import { getApiEntries, searchApi } from './api';
import type { ApiTab } from './api';
import './ApiSidebar.scss?scoped';

export default function ApiSidebar({ visible, onClose }: { visible: boolean; onClose(): void }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<ApiTab>('operators');
  const [query, setQuery] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const entries = searchApi(getApiEntries(tab, locale), query);
  const categories = Array.from(new Set(entries.map((entry) => entry.category)));
  return <div className="api-sidebar">
    <Drawer visible={visible} onClose={onClose} placement="right" width={520} closable={false} keyboard getContainer={false}
      afterVisibleChange={(open) => {
        if (open) {
          search.current?.focus();
        }
      }}>
      {visible && <section className="api-content" id="api-sidebar" role="dialog" aria-modal="true" aria-label={t('API 说明')}>
        <header><h2>{t('API 说明')}</h2><button type="button" onClick={onClose} aria-label={t('关闭 API 说明')}>×</button></header>
        <div className="api-tools">
          <input ref={search} type="search" value={query} aria-label={t('搜索名称、符号或功能说明')}
            placeholder={t('搜索名称、符号或功能说明')} onChange={(e) => setQuery(e.target.value)} />
          <div className="api-tabs" role="tablist" aria-label={t('API 说明')} onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              return;
            }
            event.preventDefault();
            const next = event.key === 'Home' ? 'operators' : event.key === 'End' ? 'functions'
              : tab === 'operators' ? 'functions' : 'operators';
            setTab(next);
            event.currentTarget.querySelector<HTMLButtonElement>(`#api-${next}-tab`)?.focus();
          }}>
            {(['operators', 'functions'] as const).map((name) => <button type="button" key={name} role="tab"
              id={`api-${name}-tab`} tabIndex={tab === name ? 0 : -1} aria-selected={tab === name}
              aria-controls="api-entries" onClick={() => setTab(name)}>
              {t(name === 'operators' ? '运算符' : '函数')}
            </button>)}
          </div>
        </div>
        <div className="api-entries" id="api-entries" role="tabpanel" aria-labelledby={`api-${tab}-tab`}>
          {!entries.length && <p className="api-empty">{t('没有匹配的 API')}</p>}
          {categories.map((category) => <section className="api-category" key={category}>
            <h3>{category}</h3>
            {entries.filter((entry) => entry.category === category).map((entry) => <article key={entry.name}>
              <code>{entry.name}</code><p>{entry.description}</p><pre>{entry.signature}</pre>
            </article>)}
          </section>)}
          <section className="api-notes"><h3>{t('使用提示')}</h3>
            <p>{t('支持 + - * / // % ^、比较、条件表达式和内置函数。2.01% 是百分比，a % b 是取余。字符串使用双引号，带空格的参数名使用单引号。')}</p>
            <p>{t('普通括号从左到右编号，$1 引用第一个括号的结果。函数调用括号不编号。相同颜色表示对应关系；输入 $ 可以选择有效引用。')}</p>
            <p>{t('全局 stepPrecision 控制步骤舍入，自定义函数可配置 useStepPrecision: false。arithmetic 控制数值处理，与步骤舍入分别配置。')}</p>
            <h3>{t('单次与批量计算')}</h3>
            <p>{t('JSON 顶层对象计算一次，对象数组逐组计算；嵌套数组可以作为 sum(values) 的参数。JSON 模式沿用库的路径规则，如 user.discount。动态 eval 字符串中的参数不自动展开。')}</p>
            <p>{t('表单数字使用 Decimal 保留输入精度。JSON 数字遵循 JavaScript JSON.parse；超长数字请使用字符串并开启“数字字符串转为数值”。')}</p>
            <h3>{t('代码调用')}</h3><pre>{[
              "import formulaCalc from 'formula-calc';", '',
              "formulaCalc('price * quantity', {",
              '  params: [{ price: 100, quantity: 2 },',
              '           { price: 200, quantity: 3 }],',
              '  stepPrecision: 2,', '  precision: 2,',
              '  onTrace(item, value) {',
              '    console.log(item.origText, value);',
              '  },', '}); // [200, 600]',
            ].join('\n')}</pre>
          </section>
        </div>
      </section>}
    </Drawer>
  </div>;
}
