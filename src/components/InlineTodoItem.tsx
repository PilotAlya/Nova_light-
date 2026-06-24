import React, { useState, useRef, useEffect } from 'react';

interface TodoItemProps {
  id: string;
  initialText: string;
  isCompleted: boolean;
  onUpdateText: (id: string, newText: string) => void;
  onToggleComplete: (id: string) => void;
}

export const InlineTodoItem: React.FC<TodoItemProps> = ({
  id,
  initialText,
  isCompleted,
  onUpdateText,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== initialText) {
      onUpdateText(id, text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setText(initialText);
      setIsEditing(false);
    }
  };

  return (
    <div style={todoRowStyle}>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={() => onToggleComplete(id)}
        style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
      />
      
      {isEditing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={inputStyle}
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          style={{
            ...textStyle,
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
          }}
          title="Нажмите дважды для изменения"
        >
          {text}
        </span>
      )}
    </div>
  );
};

const todoRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  backgroundColor: 'var(--bg-surface)',
  borderBottom: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
};

const textStyle: React.CSSProperties = {
  fontSize: '14px',
  cursor: 'pointer',
  flexGrow: 1,
  padding: '4px 0',
};

const inputStyle: React.CSSProperties = {
  fontSize: '14px',
  flexGrow: 1,
  border: 'none',
  borderBottom: '2px solid var(--color-accent)',
  outline: 'none',
  padding: '2px 0',
  color: 'var(--text-primary)',
  backgroundColor: 'transparent',
};
