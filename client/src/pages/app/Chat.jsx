import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Image, Mic, ArrowLeft, Phone, Video, MoreVertical, Sparkles, Check, CheckCheck, User as UserIcon, MessageCircle, Edit2, Trash2, X, Crown, Video as VideoIcon, Phone as PhoneIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const aiSuggestions = [
  "Ask about her favorite travel destination",
  "Share a funny hiking story",
  "Suggest planning a trek together",
  "Ask about her favorite weekend getaway",
  "Share your favorite dish you've ever cooked",
  "Ask what's on her current playlist"
];

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { startCall } = useCall();
  const [searchParams] = useSearchParams();
  const initialMatchId = searchParams.get('match');

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations (matches)
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const { data } = await api.get('/matches');
      setConversations(data.matches);

      // Join all match rooms for live sidebar updates
      if (socket && data.matches.length > 0) {
        data.matches.forEach(match => {
          socket.emit('join_match', match._id);
        });
      }

      // If URL has a specific match, select it
      if (initialMatchId && !selectedChat) {
        const match = data.matches.find(m => m._id === initialMatchId);
        if (match) handleSelectChat(match);
      }
    } catch (error) {
      if (!isSilent) toast.error('Failed to load conversations');
    } finally {
      if (!isSilent) setLoading(false);
      // Pick 3 random suggestions
      const shuffled = [...aiSuggestions].sort(() => 0.5 - Math.random());
      setCurrentSuggestions(shuffled.slice(0, 3));
    }
  };

  // Select chat and load history
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const { data } = await api.get(`/messages/${chat._id}`);
      setMessages(data.messages);
      
      // Join socket room
      if (socket) {
        socket.emit('join_match', chat._id);
      }

      // Mark as read
      api.put(`/messages/match/${chat._id}/read`).catch(() => {});
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  // Socket: Listen for new incoming messages
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log('Socket reconnected, joining match rooms...');
      // Ensure all current conversations have joined rooms
      if (conversations.length > 0) {
        conversations.forEach(c => socket.emit('join_match', c._id));
      }
    };

    const handleNewMessage = (newMessage) => {
      console.log('New message received via socket:', newMessage._id, 'Type:', newMessage.type);
      
      // Update conversations sidebar first regardless of which chat is open
      setConversations(prev => {
        const conversationExists = prev.some(c => c._id === newMessage.match);
        if (conversationExists) {
          return prev.map(c => {
            if (c._id === newMessage.match) {
              return {
                ...c,
                lastMessage: newMessage,
                unreadCount: (selectedChat?._id === c._id) ? c.unreadCount : (c.unreadCount + 1)
              };
            }
            return c;
          });
        }
        // If it's a new conversation, we might need to fetch them all again
        fetchConversations();
        return prev;
      });

      // If the message belongs to the currently open chat, append it
      if (selectedChat && newMessage.match === selectedChat._id) {
        // Avoid duplication of regular messages we sent (as they are handled by fetch/optimistic update)
        // BUT 'call' messages are ONLY server-side logs, so we MUST append them even if we are the 'sender'
        const senderId = String(newMessage.sender?._id || newMessage.sender);
        const isMe = senderId === String(user._id);

        if (isMe && newMessage.type !== 'call') return;

        setMessages(prev => {
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        
        // Tell server it was read if we are not the sender
        if (!isMe) {
          api.put(`/messages/${newMessage._id}/read`).catch(() => {});
        }
      } else {
        // Notification for background messages
        toast.success(`New message from match!`, { icon: '💬', duration: 3000 });
      }
    };

    const handleMessageRead = ({ messageId, userId }) => {
      if (String(userId) === String(user._id)) return;
      setMessages(prev => prev.map(m => 
        String(m._id) === String(messageId) ? { ...m, readBy: Array.from(new Set([...(m.readBy || []), userId])) } : m
      ));
    };

    const handleMessagesRead = ({ matchId, userId }) => {
      if (String(userId) === String(user._id) || !selectedChat || String(matchId) !== String(selectedChat._id)) return;
      setMessages(prev => prev.map(m => 
        String(m.sender?._id || m.sender) === String(user._id)
          ? { ...m, readBy: Array.from(new Set([...(m.readBy || []), userId])) } 
          : m
      ));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const handleMessageEdited = (updatedMsg) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
    };

    const handleUserOnline = ({ userId }) => {
      setConversations(prev => prev.map(c => 
        String(c.otherUser?._id) === String(userId) ? { ...c, otherUser: { ...c.otherUser, isOnline: true } } : c
      ));
      if (selectedChat && String(selectedChat.otherUser?._id) === String(userId)) {
        setSelectedChat(prev => ({ ...prev, otherUser: { ...prev.otherUser, isOnline: true } }));
      }
    };

    const handleUserOffline = ({ userId }) => {
      setConversations(prev => prev.map(c => 
        String(c.otherUser?._id) === String(userId) ? { ...c, otherUser: { ...c.otherUser, isOnline: false } } : c
      ));
      if (selectedChat && String(selectedChat.otherUser?._id) === String(userId)) {
        setSelectedChat(prev => ({ ...prev, otherUser: { ...prev.otherUser, isOnline: false } }));
      }
    };

    socket.on('connect', onConnect);
    socket.on('new_message', handleNewMessage);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_read', handleMessageRead);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('connect', onConnect);
      socket.off('new_message', handleNewMessage);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_read', handleMessageRead);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket, selectedChat?._id, user._id, conversations.length]);

  const sendMessage = async (mediaData = null) => {
    if (!mediaData && !input.trim() || !selectedChat || isSending) return;
    
    setIsSending(true);
    
    if (editingMessage && !mediaData) {
      return handleUpdateMessage();
    }
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    const newMsg = { 
      _id: tempId, 
      sender: user._id, 
      content: mediaData ? '' : input, 
      type: mediaData ? mediaData.type : 'text',
      imageUrl: mediaData?.type === 'image' ? mediaData.url : null,
      videoUrl: mediaData?.type === 'video' ? mediaData.url : null,
      createdAt: new Date().toISOString(), 
      isOptimistic: true,
      readBy: [user._id] 
    };
    
    setMessages(prev => [...prev, newMsg]);
    const messageText = input;
    if (!mediaData) setInput('');
    setShowSuggestions(false);
    setShowEmojiPicker(false);

    try {
      const payload = {
        content: messageText,
        receiverId: selectedChat.otherUser._id,
        type: mediaData ? mediaData.type : 'text'
      };

      if (mediaData?.type === 'image') payload.imageUrl = mediaData.url;
      if (mediaData?.type === 'video') payload.videoUrl = mediaData.url;

      const { data } = await api.post(`/messages/${selectedChat._id}`, payload);
      setMessages(prev => prev.map(m => m._id === tempId ? { ...data.message, _id: data.message._id, wasOptimistic: true } : m));
      // Update sidebar silently
      fetchConversations(true);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return toast.error("File size must be under 10MB");
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setPendingMedia({ 
          file: file,
          preview: reader.result,
          type: type
        });
      };
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const uploadAndSendMedia = async () => {
    if (!pendingMedia) return;
    
    try {
      setIsUploading(true);
      const { data } = await api.post('/messages/upload/media', { file: pendingMedia.preview });
      const type = data.resource_type === 'video' ? 'video' : 'image';
      await sendMessage({ url: data.url, type });
      setPendingMedia(null);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'arlyon-media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput(prev => prev + emojiData.emoji);
  };

  const handleUpdateMessage = async () => {
    try {
      const messageText = input;
      const msgId = editingMessage._id;
      
      // Update locally
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, content: messageText, isEdited: true } : m));
      setEditingMessage(null);
      setInput('');

      const { data } = await api.post(`/messages/${msgId}/edit`, { content: messageText });
      setMessages(prev => prev.map(m => m._id === msgId ? data.message : m));
    } catch (error) {
      toast.error('Failed to edit message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      // Update locally
      setMessages(prev => prev.filter(m => m._id !== msgId));
      setOpenMenuId(null);
      await api.delete(`/messages/${msgId}`);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  // Mobile: back to list
  const handleBack = () => {
    setSelectedChat(null);
    setMessages([]);
    setShowEmojiPicker(false);
    setShowSuggestions(false);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] -mt-2 rounded-2xl overflow-hidden border border-white/5">
      {/* Conversation List Sidebar */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-white/5 bg-card/50 flex-col`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="font-display font-bold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-dark-400 text-sm">No conversations yet.<br/>Start matching!</div>
          ) : conversations.map(c => (
            <button key={c._id} onClick={() => handleSelectChat(c)}
              className={`flex items-center gap-2 md:gap-3 w-full px-2 md:px-4 py-3 transition-all ${selectedChat?._id === c._id ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-white/5'} overflow-hidden`}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg overflow-hidden">
                  {c.otherUser?.avatar ? (
                    (c.otherUser.avatar.startsWith('http') || c.otherUser.avatar.startsWith('data:')) ? (
                      <img src={c.otherUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      c.otherUser.avatar
                    )
                  ) : (
                    <UserIcon className="w-5 h-5 text-dark-600" />
                  )}
                </div>
                {c.otherUser?.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-medium text-sm truncate">{c.otherUser?.name}</p>
                    {c.otherUser?.isPremium && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-dark-500 whitespace-nowrap">{c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                </div>
                <p className={`text-xs truncate ${c.unreadCount > 0 ? 'text-white font-semibold' : 'text-dark-400'}`}>
                  {c.lastMessage ? (
                    c.lastMessage.type === 'call' ? (
                      <span className="flex items-center gap-1 italic">
                        {c.lastMessage.callData?.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        {c.lastMessage.callData?.status === 'missed' ? 'Missed Call' : 'Call ended'}
                      </span>
                    ) : (
                      c.lastMessage.content || (c.lastMessage.imageUrl ? '📷 Photo' : c.lastMessage.videoUrl ? '🎥 Video' : 'Message')
                    )
                  ) : 'Start chatting! 👋'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {/* Header */}
        {selectedChat ? (
        <>
          <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-white/5 glass">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Back button: mobile only */}
              <button onClick={handleBack} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg overflow-hidden">
                {selectedChat.otherUser?.avatar ? (
                  (selectedChat.otherUser.avatar.startsWith('http') || selectedChat.otherUser.avatar.startsWith('data:')) ? (
                    <img src={selectedChat.otherUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    selectedChat.otherUser.avatar
                  )
                ) : (
                  <UserIcon className="w-5 h-5 text-dark-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-medium text-sm">{selectedChat.otherUser?.name}</h3>
                  {selectedChat.otherUser?.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-green-400">{selectedChat.otherUser?.isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => {
                if (!selectedChat.otherUser?.isOnline) {
                  toast.error(`${selectedChat.otherUser?.name} is offline. They might not receive the call.`);
                }
                startCall(selectedChat.otherUser._id, 'audio', selectedChat._id, selectedChat.otherUser?.name);
              }}
              className="btn-ghost !p-2 transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (!selectedChat.otherUser?.isOnline) {
                  toast.error(`${selectedChat.otherUser?.name} is offline. They might not receive the call.`);
                }
                startCall(selectedChat.otherUser._id, 'video', selectedChat._id, selectedChat.otherUser?.name);
              }}
              className="btn-ghost !p-2 transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button className="btn-ghost !p-2 hidden md:inline-flex"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4">
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-dark-700" />
            <span className="text-xs text-dark-500 bg-dark-900 px-3">Today</span>
            <div className="flex-1 border-t border-dark-700" />
          </div>

          {messages.map((msg, i) => {
            const senderId = String(msg.sender?._id || msg.sender);
            const isMe = senderId === String(user._id);
            if (msg.type === 'call') {
              const { type, status, duration } = msg.callData || {};
              const formatDuration = (s) => {
                if (!s) return '';
                const mins = Math.floor(s / 60);
                const secs = s % 60;
                return `${mins}:${secs.toString().padStart(2, '0')}`;
              };

              return (
                <div key={msg._id} className="flex justify-center my-4">
                  <div className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 max-w-[90%] md:max-w-[80%]">
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${status === 'missed' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                      {type === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        {type === 'video' ? 'Video Call' : 'Audio Call'} 
                        <span className={`ml-2 text-[10px] uppercase tracking-wider ${status === 'missed' ? 'text-red-400' : 'text-green-400'}`}>
                          • {status}
                        </span>
                      </h4>
                      <p className="text-xs text-dark-400">
                        {status === 'missed' ? 'No answer' : `Duration: ${formatDuration(duration)}`} 
                        <span className="mx-2 text-dark-600">•</span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const messageKey = msg.isOptimistic ? msg._id : (msg.wasOptimistic ? `opt-${msg._id}` : msg._id);

            return (
              <motion.div
                key={msg._id}
                initial={msg.wasOptimistic ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex group items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {isMe && !msg.isOptimistic && (
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === msg._id ? null : msg._id)}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-dark-500 hover:text-white"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    {openMenuId === msg._id && (
                      <div className="absolute right-0 top-full mt-1 w-28 bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                        {msg.type === 'text' && !msg.imageUrl && !msg.videoUrl && (
                          <button 
                            onClick={() => { setEditingMessage(msg); setInput(msg.content); setOpenMenuId(null); }}
                            className="w-full px-3 py-2 text-left text-xs text-dark-100 hover:bg-primary/20 flex items-center gap-2"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`${msg.content ? 'max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2.5 md:py-3' : 'max-w-[75%] md:max-w-[60%] p-1.5'} rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-r from-primary to-primary-600 text-white rounded-br-md'
                    : 'bg-dark-800 text-dark-100 rounded-bl-md'
                }`}>
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="attached" 
                      className={`rounded-lg ${msg.content ? 'mb-2' : ''} max-h-48 w-auto max-w-full object-cover cursor-pointer hover:opacity-90 transition-opacity`} 
                      onClick={() => setPreviewImage(msg.imageUrl)} 
                    />
                  )}
                  {msg.videoUrl && (
                    <video 
                      src={msg.videoUrl} 
                      controls 
                      className={`rounded-lg ${msg.content ? 'mb-2' : ''} max-h-48 w-full bg-black`} 
                    />
                  )}
                  {msg.content && <p>{msg.content}</p>}
                  {!msg.content && !msg.imageUrl && !msg.videoUrl && msg.text && <p>{msg.text}</p>}
                  <div className={`flex items-center gap-2 mt-1 ${isMe ? 'justify-end' : ''} ${!msg.content ? 'px-2 pb-1' : ''}`}>
                    {msg.isEdited && <span className="text-[9px] text-white/40 italic">edited</span>}
                    <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-dark-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {isMe && (
                      (msg.readBy?.length > 1) 
                        ? <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" strokeWidth={2.5} /> 
                        : <Check className={`w-3.5 h-3.5 ${msg.isOptimistic ? 'text-white/30' : 'text-white/60'}`} strokeWidth={2.5} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Media Preview Overlay */}
        {pendingMedia && (
          <div className="absolute inset-0 z-[60] bg-dark-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-6">
            <div className="max-w-md w-full bg-dark-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-medium text-sm">Preview Attachment</h4>
                <button onClick={() => setPendingMedia(null)} className="p-1 hover:bg-white/5 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 flex items-center justify-center bg-black/40 min-h-[200px] md:min-h-[300px]">
                {pendingMedia.type === 'video' ? (
                  <video src={pendingMedia.preview} controls className="max-h-[300px] md:max-h-[400px] w-full" />
                ) : (
                  <img src={pendingMedia.preview} alt="Preview" className="max-h-[300px] md:max-h-[400px] object-contain rounded-lg" />
                )}
              </div>
              <div className="p-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setPendingMedia(null)}
                  className="flex-1 btn-ghost py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={uploadAndSendMedia}
                  disabled={isUploading}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Suggestions & Edit Mode */}
        <div className="border-t border-white/5 bg-card/30">
        {editingMessage && (
          <div className="px-3 md:px-6 py-2 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2 text-xs text-primary-300 italic">
              <Edit2 className="w-3 h-3" /> Editing message...
            </div>
            <button onClick={() => { setEditingMessage(null); setInput(''); }} className="p-1 hover:bg-white/5 rounded-full">
              <X className="w-3 h-3 text-dark-400" />
            </button>
          </div>
        )}
        {showSuggestions && !editingMessage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-3 md:px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-primary-300"><Sparkles className="w-3 h-3" /> AI Icebreakers</div>
              <button 
                onClick={() => setCurrentSuggestions([...aiSuggestions].sort(() => 0.5 - Math.random()).slice(0, 3))}
                className="text-[10px] text-dark-500 hover:text-primary-300 transition-colors"
              >
                Regenerate
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentSuggestions.map(s => (
                <button key={s} onClick={() => { setInput(s); setShowSuggestions(false); }}
                  className="flex-shrink-0 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-dark-300 hover:border-primary/30 hover:text-primary-300 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input */}
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-white/5 relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full left-2 md:left-6 mb-2 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" skinTonesDisabled searchDisabled previewConfig={{showPreview: false}} height={300} width={280} />
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
          
          <div className="flex items-center gap-1.5 md:gap-3">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`btn-ghost !p-1.5 md:!p-2 ${showEmojiPicker ? 'text-primary' : 'text-dark-400'}`}><Smile className="w-5 h-5" /></button>
            <button onClick={() => { fileInputRef.current.setAttribute('accept', 'image/*'); fileInputRef.current.click(); }} disabled={isUploading} className={`btn-ghost !p-1.5 md:!p-2 text-dark-400 ${isUploading ? 'animate-pulse' : ''}`} title="Upload Image"><Image className="w-5 h-5" /></button>
            <button onClick={() => { fileInputRef.current.setAttribute('accept', 'video/*'); fileInputRef.current.click(); }} disabled={isUploading} className={`btn-ghost !p-1.5 md:!p-2 text-dark-400 hidden md:inline-flex ${isUploading ? 'animate-pulse' : ''}`} title="Upload Video"><Video className="w-5 h-5" /></button>
            <button onClick={() => setShowSuggestions(!showSuggestions)} className={`btn-ghost !p-1.5 md:!p-2 hidden md:inline-flex ${showSuggestions ? 'text-primary' : 'text-primary-400'}`} title="AI Suggestions"><Sparkles className="w-5 h-5" /></button>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isUploading}
              placeholder={isUploading ? "Uploading..." : `Message ${selectedChat?.otherUser?.name || '...' }...`} className="flex-1 input-field text-sm !py-2 md:!py-2.5 min-w-0"
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage()} disabled={!input.trim() && (isUploading || isSending)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0">
              {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

        {/* Full Screen Image Preview Overlay */}
        {previewImage && (
          <div className="absolute inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => downloadMedia(previewImage, `arlyon-image-${Date.now()}.jpg`)} 
                className="btn-primary !px-3 !py-1.5 md:!px-4 md:!py-2 rounded-xl flex items-center gap-2 text-sm"
              >
                <Image className="w-4 h-4" /> Download
              </button>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img 
              src={previewImage} 
              alt="Preview Full" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        </>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-4 border border-white/5">
              <MessageCircle className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">Your Messages</h3>
            <p className="text-sm text-dark-400 max-w-sm">Select a conversation from the sidebar to view chat history or send a direct message.</p>
          </div>
        )}
      </div>
    </div>
  );
}
