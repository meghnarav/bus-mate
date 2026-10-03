import React, { useState } from 'react';
import { Share2, Copy, Check, Users } from 'lucide-react';

interface GroupInviteModalProps {
  inviteCode: string;
  groupId: string;
  onClose: () => void;
}

const GroupInviteModal: React.FC<GroupInviteModalProps> = ({ inviteCode, onClose }) => {
  const [copied, setCopied] = useState(false);
  const inviteLink = `https://busmate.vit.ac.in/join/${inviteCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto text-indigo-600">
          <Users size={24} />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Invite Friends</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Share this link with up to 5 friends to reserve seats together. They have 15 minutes to join.
        </p>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between mb-6">
          <span className="font-mono text-gray-700 truncate mr-3 text-sm">{inviteLink}</span>
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-600" />}
          </button>
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mb-3 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200">
          <Share2 size={18} /> Share Link
        </button>
        
        <button 
          onClick={onClose}
          className="w-full bg-transparent hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupInviteModal;
