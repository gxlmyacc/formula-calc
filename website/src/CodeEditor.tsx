import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/javascript/javascript';
import { TokenType } from '../../src';
import { activePairAt, analyze, completionAt, parameterCandidates, signatureAt } from './model';
import { useI18n } from './i18n';
import type { Range } from './model';
import './CodeEditor.scss?scoped';

type Props = {
  value: string; onChange(value: string): void; label: string; json?: boolean; parameters?: string;
  names?: string[]; showRefs?: boolean; selection?: Range;
};

export default function CodeEditor(props: Props) {
  const { locale, t } = useI18n();
  const language = useRef(locale);
  language.current = locale;
  const container = useRef<HTMLDivElement>(null);
  const editor = useRef<CodeMirror.Editor>();
  const latest = useRef(props);
  const marks = useRef<CodeMirror.TextMarker[]>([]);
  const selectionMark = useRef<CodeMirror.TextMarker>();
  const composing = useRef(false);
  const [signature, setSignature] = useState<ReturnType<typeof signatureAt>>();
  latest.current = props;

  useEffect(() => {
    const cm = CodeMirror(container.current!, {
      value: latest.current.value,
      lineNumbers: true,
      lineWrapping: true,
      mode: latest.current.json ? { name: 'javascript', json: true } : 'null',
      tabSize: 2,
      indentUnit: 2,
      viewportMargin: 20,
      screenReaderLabel: latest.current.label,
      extraKeys: { 'Ctrl-Space': () => complete(), Tab: (instance) => instance.replaceSelection('  ') },
    });
    editor.current = cm;
    let completionTimer: ReturnType<typeof setTimeout>;

    function complete() {
      if (latest.current.json || composing.current) {
        return;
      }
      const text = cm.getValue();
      const cursor = cm.indexFromPos(cm.getCursor());
      const model = analyze(text);
      const candidates = parameterCandidates(latest.current.parameters || '{}', latest.current.names || []);
      const result = completionAt(text, cursor, candidates, model.error ? 0 : model.formula.refs.length, language.current);
      if (!result.entries.length) {
        return;
      }
      cm.showHint({
        completeSingle: false,
        hint: () => ({
          from: cm.posFromIndex(result.from),
          to: cm.posFromIndex(cursor),
          list: result.entries.map((entry) => ({
            text: entry.text,
            displayText: entry.label,
            hint(instance: CodeMirror.Editor, data: CodeMirror.Hints) {
            // Keep an already typed opening parenthesis instead of inserting a second pair.
              const next = instance.getRange(data.to, instance.posFromIndex(instance.indexFromPos(data.to) + 1));
              const insertion = entry.inside && next === '(' ? entry.name : entry.text;
              instance.replaceRange(insertion, data.from, data.to, 'complete');
              instance.setCursor(instance.posFromIndex(instance.indexFromPos(data.from) + insertion.length - (entry.inside && next !== '(' ? 1 : 0)));
            },
          })),
        })
      });
    }

    function decorate() {
      marks.current.forEach((mark) => mark.clear());
      marks.current = [];
      if (latest.current.json) {
        return;
      }
      const model = analyze(cm.getValue());
      const cursor = cm.indexFromPos(cm.getCursor());
      const activePair = activePairAt(model, cursor);
      const mark = (from: number, to: number, className: string, title?: string) => {
        marks.current.push(cm.markText(cm.posFromIndex(from), cm.posFromIndex(to), { className, title }));
      };
      if (activePair) {
        marks.current.push(cm.markText(cm.posFromIndex(activePair.from), cm.posFromIndex(activePair.to), {
          className: 'fc-active-range', startStyle: 'fc-active-start', endStyle: 'fc-active-end',
        }));
      }
      model.tokens.forEach((token) => {
        let className = '';
        let title: string | undefined;
        const pair = model.pairs.find((p) => p.from === token.index || p.to - 1 === token.index);
        if (pair) {
          className = `fc-depth-${pair.depth % 6}${pair === activePair ? ' fc-active-bracket' : ''}`;
        } else if (token.tokenType === TokenType.ttRef) {
          const target = model.pairs.find((p) => p.ref === Number(token.token.slice(1)));
          if (target) {
            title = `${token.token} → ${cm.getRange(cm.posFromIndex(target.from), cm.posFromIndex(target.to))}`;
          }
          className = target ? `fc-depth-${target.depth % 6} fc-reference` : model.error ? 'fc-reference' : 'fc-invalid-ref';
          if (target === activePair && target) {
            className += ' fc-active-reference';
          }
        } else if (token.tokenType === TokenType.ttFunc) {
          className = 'fc-function';
        } else if (token.tokenType === TokenType.ttName) {
          className = 'fc-param';
        } else if (token.tokenType === TokenType.ttString) {
          className = 'fc-string';
        } else if ([TokenType.ttNumber, TokenType.ttBool, TokenType.ttNull, TokenType.ttNaN].includes(token.tokenType)) {
          className = 'fc-literal';
        }
        if (className) {
          mark(token.index, token.index + token.length, className, title);
        }
      });
      if (latest.current.showRefs && !model.error) {
        model.pairs.forEach((pair) => {
          if (!pair.ref) {
            return;
          }
          const badge = document.createElement('span');
          badge.className = `fc-ref-badge fc-depth-${pair.depth % 6}`;
          badge.textContent = String(pair.ref);
          badge.setAttribute('aria-hidden', 'true');
          badge.title = `$${pair.ref}`;
          marks.current.push(cm.setBookmark(cm.posFromIndex(pair.from + 1), { widget: badge, insertLeft: true }));
        });
      }
      setSignature(signatureAt(cm.getValue(), cursor, language.current));
    }

    const changed = () => {
      latest.current.onChange(cm.getValue()); decorate();
    };
    const input = (_cm: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
      clearTimeout(completionTimer);
      if (change.text.join('').match(/[\w$\u0080-\uffff.]$/)) {
        completionTimer = setTimeout(complete, 100);
      }
    };
    const wrapper = cm.getWrapperElement();
    const startComposition = () => {
      composing.current = true; cm.closeHint();
    };
    const endComposition = () => {
      composing.current = false;
    };
    wrapper.addEventListener('compositionstart', startComposition);
    wrapper.addEventListener('compositionend', endComposition);
    cm.on('change', changed);
    cm.on('cursorActivity', decorate);
    cm.on('inputRead', input);
    decorate();
    return () => {
      clearTimeout(completionTimer);
      cm.off('change', changed); cm.off('cursorActivity', decorate); cm.off('inputRead', input);
      wrapper.removeEventListener('compositionstart', startComposition);
      wrapper.removeEventListener('compositionend', endComposition);
      cm.closeHint(); wrapper.remove(); editor.current = undefined;
    };
  }, [props.json]);

  useEffect(() => {
    const cm = editor.current;
    if (cm && cm.getValue() !== props.value) {
      cm.setValue(props.value);
    }
  }, [props.value]);
  useEffect(() => {
    // Moving the cursor triggers decoration refresh after the reference switch changes.
    const cm = editor.current;
    if (cm) {
      cm.setOption('screenReaderLabel', props.label);
      cm.closeHint();
      CodeMirror.signal(cm, 'cursorActivity', cm);
    }
  }, [props.showRefs, props.label, locale]);
  useEffect(() => {
    const cm = editor.current;
    selectionMark.current?.clear();
    if (!cm || !props.selection) {
      return;
    }
    const { from, to } = props.selection;
    cm.setCursor(cm.posFromIndex(from));
    selectionMark.current = cm.markText(cm.posFromIndex(from), cm.posFromIndex(to), { className: 'fc-trace-selection' });
    cm.scrollIntoView({ from: cm.posFromIndex(from), to: cm.posFromIndex(to) }, 40);
    cm.focus();
  }, [props.selection]);

  return <div className={`code-editor ${props.json ? 'json-editor' : ''}`}>
    <div ref={container} />
    {!props.json && <div className="signature" aria-live="polite">
      {signature ? <><b>{signature.name}</b>(
        {signature.args.map((argument, i) => <React.Fragment key={argument}>
          {i > 0 && ', '}<span className={i === signature.argument ? 'current-argument' : ''}>{argument}</span>
        </React.Fragment>)}) <span className="description">{signature.description}</span></>
        : t('输入函数或参数名称自动补全 · Ctrl+Space 显示候选 · $n 引用普通括号')}
    </div>}
  </div>;
}
