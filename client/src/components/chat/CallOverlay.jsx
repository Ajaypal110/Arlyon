import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Camera, CameraOff, User } from 'lucide-react';

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
  isVideoMuted 
}) {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const hasLocalVideo = localStream?.getVideoTracks().length > 0;
  const hasRemoteVideo = remoteStream?.getVideoTracks().length > 0;

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-dark-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-4xl aspect-video bg-dark-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col">
          
          {/* Call Status Header */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full animate-pulse ${callState === 'active' ? 'bg-green-500' : 'bg-primary'}`} />
              <span className="text-sm font-medium text-white uppercase tracking-widest text-[10px]">
                {callState === 'incoming' ? 'Incoming Call' : 
                 callState === 'dialing' ? 'Dialing...' : 
                 'Call Active'}
              </span>
            </div>
            {callState !== 'active' && (
              <h2 className="text-2xl font-display font-bold text-white mt-4 flex items-center gap-3">
                {callState === 'incoming' ? `Call from ${incomingCallData?.fromUser?.name}` : 'Ringing...'}
              </h2>
            )}
          </div>

          {/* Video Feeds */}
          <div className="flex-1 relative bg-black">
            {/* Remote Video (Main) */}
            <div className="w-full h-full flex items-center justify-center">
              {remoteStream && !isVideoMuted ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 shadow-2xl">
                    <User className="w-16 h-16 text-dark-400" />
                  </div>
                  <p className="text-dark-400 font-medium">Video Paused</p>
                </div>
              )}
            </div>

            {/* Local Video (PIP) */}
            <motion.div 
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              className="absolute bottom-6 right-6 w-48 aspect-video bg-dark-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 cursor-move"
            >
              {localStream && !isVideoMuted ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-900">
                  <CameraOff className="w-6 h-6 text-dark-500" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Controls Footer */}
          <div className="p-8 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-20">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              
              {callState === 'incoming' ? (
                <>
                  <button 
                    onClick={onAccept}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
                  >
                    <Phone className="w-7 h-7" />
                  </button>
                  <button 
                    onClick={onReject}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={onToggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <button 
                    onClick={onEnd}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
                  >
                    <PhoneOff className="w-8 h-8" />
                  </button>

                  <button 
                    onClick={onToggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
