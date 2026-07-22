import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import type { Message } from '../store';
import { MessageSquare, Send } from 'lucide-react';

export const Information = () => {
  const { t } = useTranslation();
  const { messages, addMessage } = useStore();
  const [newText, setNewText] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      author: 'You (Admin)',
      text: newText,
      date: new Date().toISOString()
    };

    addMessage(newMessage);
    setNewText('');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px' }}>{t('informationPage.title')}</h2>
      </div>

      <div className="flex flex-col gap-4" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-secondary panel" style={{ borderStyle: 'dashed', flex: 1 }}>
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>{t('informationPage.empty')}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="panel flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0, 255, 170, 0.1)', color: '#00FFAA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {msg.author.charAt(0)}
                  </div>
                  <span className="font-bold text-sm" style={{ color: 'var(--mint)' }}>{msg.author}</span>
                </div>
                <span className="text-xs text-secondary">{formatTime(msg.date)}</span>
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.5', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handlePost} className="flex gap-2" style={{ flexShrink: 0, marginTop: '8px' }}>
        <input 
          type="text" 
          placeholder={t('informationPage.placeholder')}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          style={{ 
            flex: 1, padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' 
          }}
        />
        <button 
          type="submit" 
          disabled={!newText.trim()}
          style={{ 
            padding: '0 24px', borderRadius: '12px', background: newText.trim() ? '#00FFAA' : 'rgba(255,255,255,0.1)', 
            color: newText.trim() ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            border: 'none', cursor: newText.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease'
          }}
        >
          <Send size={18} /> <span className="hidden md:inline">{t('informationPage.postBtn')}</span>
        </button>
      </form>
    </div>
  );
};
