import { useState, useRef, useEffect, useCallback } from 'react';

export default function WysiwygEditor({ value, onChange, onOpenMedia, placeholder, minHeight }) {
  const editorRef = useRef(null);
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value || '');
  const [wordCount, setWordCount] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImgInput, setShowImgInput] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  const updateWordCount = useCallback((html) => {
    const text = html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    setWordCount(text ? text.split(' ').length : 0);
  }, []);

  useEffect(() => {
    if (!showSource && editorRef.current) {
      const current = editorRef.current.innerHTML;
      if (current !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, showSource]);

  useEffect(() => {
    updateWordCount(value);
  }, [value, updateWordCount]);

  const exec = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      const html = editorRef.current.innerHTML;
      if (onChange) onChange(html);
      updateWordCount(html);
    }
  }, [onChange, updateWordCount]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (onChange) onChange(html);
      updateWordCount(html);
    }
  }, [onChange, updateWordCount]);

  const handleSourceChange = (e) => {
    setSourceHtml(e.target.value);
    if (onChange) onChange(e.target.value);
    updateWordCount(e.target.value);
  };

  const toggleSource = () => {
    if (showSource) {
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceHtml;
      }
    } else {
      setSourceHtml(editorRef.current ? editorRef.current.innerHTML : (value || ''));
    }
    setShowSource(!showSource);
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:', 'https://');
    if (url && url.trim()) {
      const text = prompt('Enter link text:', url);
      if (text) {
        exec('insertHTML', `<a href="${url.trim()}" target="_blank">${text}</a>`);
      } else {
        exec('createLink', url.trim());
      }
    }
  };

  const insertImage = (url) => {
    if (url && url.trim()) {
      exec('insertHTML', `<img src="${url.trim()}" alt="" style="max-width:100%;height:auto;border-radius:4px;margin:.5rem 0;" />`);
      setShowImgInput(false);
      setImgUrl('');
    }
  };

  const handleMediaSelect = useCallback((url) => {
    insertImage(url);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.url) handleMediaSelect(e.detail.url);
    };
    window.addEventListener('cms-media-select', handler);
    return () => window.removeEventListener('cms-media-select', handler);
  }, [handleMediaSelect]);

  const execWith = (cmd) => (e) => { e.preventDefault(); exec(cmd); };

  const toolbar = [
    { html: '<b>B</b>', cmd: 'bold', title: 'Bold (Ctrl+B)' },
    { html: '<i>I</i>', cmd: 'italic', title: 'Italic (Ctrl+I)' },
    { html: '<u>U</u>', cmd: 'underline', title: 'Underline (Ctrl+U)' },
    { html: '<span style="text-decoration:line-through">S</span>', cmd: 'strikeThrough', title: 'Strikethrough' },
    { type: 'sep' },
    { html: 'H2', cmd: 'formatBlock', val: 'h2', title: 'Heading 2' },
    { html: 'H3', cmd: 'formatBlock', val: 'h3', title: 'Heading 3' },
    { html: '❝', cmd: 'formatBlock', val: 'blockquote', title: 'Blockquote' },
    { html: '<code>&lt;/&gt;</code>', cmd: 'formatBlock', val: 'pre', title: 'Code Block' },
    { type: 'sep' },
    { html: '• List', cmd: 'insertUnorderedList', title: 'Bullet List' },
    { html: '1. List', cmd: 'insertOrderedList', title: 'Numbered List' },
    { html: '—', cmd: 'insertHorizontalRule', title: 'Horizontal Rule' },
    { type: 'sep' },
    { html: '🔗', cmd: 'link', title: 'Insert Link' },
    { html: '🔗✕', cmd: 'unlink', title: 'Remove Link' },
    { type: 'sep' },
    { html: '🖼️', cmd: 'image', title: 'Insert Image' },
    { html: '📁', cmd: 'media', title: 'Media Library' },
    { type: 'sep' },
    { html: '◀', cmd: 'undo', title: 'Undo (Ctrl+Z)' },
    { html: '▶', cmd: 'redo', title: 'Redo (Ctrl+Shift+Z)' },
  ];

  const handleToolbarAction = (item) => {
    if (item.type === 'sep') return;
    if (item.cmd === 'link') { insertLink(); return; }
    if (item.cmd === 'unlink') { exec('unlink'); return; }
    if (item.cmd === 'image') { setShowImgInput(!showImgInput); return; }
    if (item.cmd === 'media') { if (onOpenMedia) onOpenMedia('body'); return; }
    if (item.cmd === 'undo') { exec('undo'); return; }
    if (item.cmd === 'redo') { exec('redo'); return; }
    if (item.val) { exec(item.cmd, item.val); }
    else { exec(item.cmd); }
  };

  return (
    <div className="wysiwyg">
      <div className="wysiwyg-tb">
        {toolbar.map((item, i) =>
          item.type === 'sep' ? (
            <span key={i} className="wysiwyg-sep" />
          ) : (
            <button key={i} type="button" className="wysiwyg-btn"
              onClick={() => handleToolbarAction(item)}
              title={item.title}
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          )
        )}
      </div>

      {showImgInput && (
        <div className="wysiwyg-img-inp">
          <input type="text" className="ainp" value={imgUrl} onChange={e => setImgUrl(e.target.value)}
            placeholder="Image URL..." style={{ flex: 1, fontSize: '.72rem' }}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), insertImage(imgUrl))}
          />
          <button className="abtn abtn-p" onClick={() => insertImage(imgUrl)} style={{ fontSize: '.55rem', padding: '.3rem .6rem' }}>Insert</button>
          {onOpenMedia && (
            <button className="abtn abtn-o" onClick={() => onOpenMedia('body')} style={{ fontSize: '.55rem', padding: '.3rem .6rem' }}>📁 Media</button>
          )}
        </div>
      )}

      {showSource ? (
        <textarea className="wysiwyg-src" value={sourceHtml} onChange={handleSourceChange}
          style={{ minHeight: minHeight || 300 }}
          placeholder={placeholder}
        />
      ) : (
        <div
          ref={editorRef}
          className="wysiwyg-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight: minHeight || 300 }}
          data-placeholder={placeholder}
        />
      )}

      <div className="wysiwyg-st">
        <span className="wysiwyg-wc">{wordCount} words</span>
        <button className="wysiwyg-toggle" onClick={toggleSource}>
          {showSource ? '👁️ Visual' : '📝 HTML'}
        </button>
      </div>
    </div>
  );
}
