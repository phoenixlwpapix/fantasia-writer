import React from "react";
import { X, Coins } from "lucide-react";
import { Button } from "./ui'/UIComponents";

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost: number;
  balance?: number;
  title: string;
  description: string;
}

export const CreditConfirmationModal: React.FC<CreditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cost,
  balance = 20,
  title,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-gray-100 transform transition-all scale-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Graphic */}
        <div className="bg-gray-50 p-6 flex justify-center border-b border-gray-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 relative">
            <Coins className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            <div className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              -{cost}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-serif font-bold text-primary mb-2">
              {title}
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 px-4 mb-6 border border-gray-100">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              当前余额
            </span>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gray-400" />
              <span className="font-mono font-bold text-primary">
                {balance}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full h-11 text-base shadow-lg shadow-black/5"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              确认支付 <span className="font-mono ml-1">{cost}</span> 点数
            </Button>
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-secondary hover:text-primary py-2"
            >
              再想想
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
