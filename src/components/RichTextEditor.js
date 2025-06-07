import React, { useState, useRef, useEffect } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Nhập mô tả..." }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // Set initial value only once when component mounts
  useEffect(() => {
    if (editorRef.current && value && !isUpdatingRef.current) {
      editorRef.current.textContent = value;
    }
  }, []); // Empty dependency array - only run on mount

  // Update editor content only when value changes from outside (not from user input)
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentContent = editorRef.current.textContent || '';
      if (currentContent !== value && value !== undefined) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const cursorOffset = range ? range.startOffset : 0;
        const container = range ? range.startContainer : null;

        // Update content
        editorRef.current.textContent = value || '';

        // Restore cursor position
        try {
          if (container && container.parentNode === editorRef.current) {
            const newRange = document.createRange();
            const newOffset = Math.min(cursorOffset, container.textContent.length);
            newRange.setStart(container, newOffset);
            newRange.setEnd(container, newOffset);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } catch (error) {
          // Silently fail if cursor restoration doesn't work
        }
      }
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        editorRef.current.focus();
      }
      updateContent();
    } catch (error) {
      console.warn('Command execution failed:', command, error);
    }
  };

  const updateContent = () => {
    if (editorRef.current && onChange) {
      try {
        isUpdatingRef.current = true;
        const textContent = editorRef.current.textContent || editorRef.current.innerText || '';
        onChange(textContent); // Send plain text
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 10);
      } catch (error) {
        console.warn('Content update failed:', error);
        isUpdatingRef.current = false;
      }
    }
  };

  const handleKeyDown = (e) => {
    // Handle shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  const handleInput = (e) => {
    updateContent();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  const toolbarItems = [
    { command: 'bold', icon: '𝐁', title: 'Đậm (Ctrl+B)' },
    { command: 'italic', icon: '𝐼', title: 'Nghiêng (Ctrl+I)' },
    { command: 'underline', icon: '𝐔', title: 'Gạch chân (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: '• ', title: 'Danh sách' },
    { command: 'insertOrderedList', icon: '1.', title: 'Danh sách số' },
  ];

  return (
    <div className={`rich-text-editor ${isExpanded ? 'expanded' : ''}`}>
      {isExpanded && (
        <div className="editor-toolbar">
          {toolbarItems.map((item, index) => (
            <button
              key={index}
              type="button"
              className="toolbar-button"
              onClick={() => execCommand(item.command)}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
          <div className="toolbar-divider"></div>
          <button
            type="button"
            className="toolbar-button"
            onClick={() => execCommand('removeFormat')}
            title="Xóa định dạng"
          >
            ✕
          </button>
        </div>
      )}
      
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsExpanded(true)}
        onBlur={(e) => {
          // Only collapse if clicking outside the entire editor
          setTimeout(() => {
            try {
              if (e?.currentTarget && document.activeElement && !e.currentTarget.contains(document.activeElement)) {
                setIsExpanded(false);
              }
            } catch (error) {
              // Safely collapse on any error
              setIsExpanded(false);
            }
          }, 100);
        }}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      <div className="editor-footer">
        <span className="editor-hint">
          {isExpanded ? 'Ctrl+B (đậm), Ctrl+I (nghiêng), Ctrl+U (gạch chân)' : 'Nhấp để mở rộng trình soạn thảo'}
        </span>
        <span className="character-count">
          {editorRef.current ? (editorRef.current.textContent || '').length : 0}/1000
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor; 