import React from 'react';
import Switch from 'antd/es/switch';
import { useI18n } from './i18n';
import type { Settings } from './model';
import './OptionsPanel.scss?scoped';

const FLAGS = [
  ['ignoreRoundingOriginalValue', '原始字面值跳过步骤舍入'], ['ignoreRoundingParams', '参数跳过步骤舍入'],
  ['stepPrecisionIgnorePercent', '百分比跳过步骤舍入'], ['tryStringToNumber', '数字字符串转为数值'],
  ['nullAsZero', '空值按 0 处理'], ['nullIfParamNotFound', '动态缺失参数返回 null'], ['returnDecimal', '返回 Decimal'],
] as const;
export default function OptionsPanel({ value, onChange }: { value: Settings; onChange(value: Settings): void }) {
  const { t } = useI18n();
  const set = (key: keyof Settings, next: string | boolean) => onChange({ ...value, [key]: next });
  return <section className="options-panel">
    <h2>{t('计算配置')}</h2>
    <div className="fields">
      <label>{t('最终精度')}<input aria-label={t('最终精度')} type="number" min="0" max="100" placeholder={t('不限制')} value={value.precision}
        onChange={(e) => set('precision', e.target.value)} /></label>
      <label>{t('步骤精度')}<select aria-label={t('步骤精度')} value={value.step} onChange={(e) => set('step', e.target.value)}>
        <option value="off">{t('关闭')}</option><option value="precision">{t('跟随最终精度（默认 2）')}</option><option value="custom">{t('指定小数位')}</option>
      </select></label>
      {value.step === 'custom' && <label>{t('步骤小数位')}<input aria-label={t('步骤小数位')} type="number" min="0" max="100"
        value={value.stepPlaces} onChange={(e) => set('stepPlaces', e.target.value)} /></label>}
      <label>{t('舍入模式')}<select aria-label={t('舍入模式')} value={value.rounding} onChange={(e) => set('rounding', e.target.value)}>
        {['HALF_UP', 'HALF_EVEN', 'HALF_DOWN', 'UP', 'DOWN', 'CEIL', 'FLOOR', 'HALF_CEIL', 'HALF_FLOOR'].map((name) =>
          <option key={name}>{name}</option>)}
      </select></label>
    </div>
    {FLAGS.map(([key, label]) => <label className="flag" key={key}><span>{t(label)}</span>
      <Switch size="small" checked={value[key]} onChange={(checked) => set(key, checked)} /></label>)}
    <p>{t('默认保留字面值与参数精度。开启“空值按 0 处理”后，缺失、未填写或关闭的参数按 0 计算；无效输入仍需修正。')}</p>
  </section>;
}
