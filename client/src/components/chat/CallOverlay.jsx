import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, 
  Camera, CameraOff, User, Minimize2, Maximize2, MoreVertical 
} from 'lucide-react';

// Helper component to handle video stream attachment reliably
const VideoBox = ({ stream, isMuted, className, isLocal, autoPlay = true, playsInline = true }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('Attaching stream to VideoBox:', stream.id);
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // If muted (video muted), we hide the video element but keep it mounted or show a placeholder
  // BUT the crucial part is that the AUDIO for the remote stream should NOT depend on this component's mount state
  // if it's reused. 

  if (!stream || isMuted) {
    return (
      <div className={`flex items-center justify-center bg-dark-800 ${className}`}>
        {isMuted ? <CameraOff className="w-8 h-8 text-dark-500" /> : <User className="w-10 h-10 text-dark-500" />}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      playsInline={playsInline}
      muted={isLocal} // Only mute local stream to avoid audio feedback/echo
      className={className}
    />
  );
};

export default function CallOverlay({ 
  callState, 
  incomingCallData,
  onAccept, 
  onReject, 
  onEnd, 
  localStream, 
  remoteStream, 
  onToggleAudio, 
  onToggleVideo, 
  isAudioMuted, 
  isVideoMuted,
  isMinimized,
  onMinimize,
  onMaximize
}) {
  const remoteAudioRef = useRef();

  // Persistent audio attachment for the remote person
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      console.log('Attaching remote audio stream');
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === 'idle') return null;

  return (
    <>
      {/* Persistent Hidden Audio Element for Remote Stream */}
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />

      {/* Full Screen Overlay */}
      <AnimatePresence mode="wait">
        {!isMinimized && (
          <motion.div
            key="full-call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-950 flex items-center justify-center"
          >
            <div className="w-full h-full relative flex flex-col overflow-hidden">
              {/* Header Controls */}
              {callState === 'active' && (
                <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-center">
                  <button 
                    onClick={onMinimize}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-white uppercase tracking-widest">Live Call</span>
                  </div>
                  <div className="w-12 h-12" />
                </div>
              )}

              {/* Video Feeds (Full Screen) */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <div className="w-full h-full overflow-hidden">
                  {callState === 'active' || (callState === 'dialing' && remoteStream) ? (
                    <VideoBox 
                      stream={remoteStream} 
                      isMuted={isVideoMuted} 
                      isLocal={false}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-900 flex flex-col items-center justify-center gap-6">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 shadow-3xl">
                        <User className="w-20 h-20 text-dark-400" />
                      </div>
                      <div className="text-center px-4">
                        <h2 className="text-2xl font-bold text-white mb-2 truncate max-w-xs mx-auto">
                          {callState === 'incoming' ? incomingCallData?.fromUser?.name : 'User'}
                        </h2>
                        <p className="text-dark-400">
                          {callState === 'incoming' ? 'Incoming Video Call...' : 
                          callState === 'dialing' ? 'Ringing...' : 'No Video Feed'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Self View (PIP) */}
                {(callState === 'active' || callState === 'dialing') && (
                  <motion.div 
                    drag
                    dragMomentum={false}
                    className="absolute top-24 right-8 w-48 md:w-64 aspect-[3/4] bg-dark-800 rounded-3xl overflow-hidden border border-white/10 shadow-3xl z-20 cursor-move"
                    style={{ touchAction: 'none' }}
                  >
                    <VideoBox 
                      stream={localStream} 
                      isMuted={isVideoMuted} 
                      isLocal={true}
                      className="w-full h-full object-cover" 
                    />
                  </motion.div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-12 left-0 right-0 z-30">
                <div className="flex items-center justify-center gap-6 md:gap-8">
                  {callState === 'incoming' ? (
                    <>
                      <button onClick={onReject} className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl"><PhoneOff className="w-8 h-8" /></button>
                      <button onClick={onAccept} className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl animate-bounce"><Phone className="w-8 h-8" /></button>
                    </>
                  ) : (
                    <div className="px-8 py-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-6 md:gap-10">
                      <button onClick={onToggleAudio} className={`p-4 rounded-full transition-all ${isAudioMuted ? 'bg-red-500 text-white' : 'p-4 hover:bg-white/10 text-white'}`}>
                        {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      <button onClick={onEnd} className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-105">
                        <PhoneOff className="w-8 h-8" />
                      </button>
                      <button onClick={onToggleVideo} className={`p-4 rounded-full transition-all ${isVideoMuted ? 'bg-red-500 text-white' : 'p-4 hover:bg-white/10 text-white'}`}>
                        {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized View */}
      <AnimatePresence>
        {isMinimized && callState === 'active' && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed bottom-20 right-6 w-40 h-56 bg-dark-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-[110] cursor-move group"
          >
            <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex flex-col items-center justify-center gap-3">
              <button onClick={onMaximize} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"><Maximize2 className="w-5 h-5" /></button>
              <button onClick={onEnd} className="p-2 bg-red-500 rounded-full hover:bg-red-600 text-white"><PhoneOff className="w-5 h-5" /></button>
            </div>
            
            <VideoBox stream={remoteStream} isMuted={isVideoMuted} isLocal={false} className="w-full h-full object-cover" />
            
            <div className="absolute top-2 right-2 w-12 h-16 bg-black rounded-lg border border-white/5 overflow-hidden shadow-lg">
              <VideoBox stream={localStream} isMuted={isVideoMuted} isLocal={true} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
