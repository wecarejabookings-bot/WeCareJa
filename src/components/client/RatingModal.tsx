import React, { useState } from 'react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { Star, CheckCircle2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmitRating: (bookingId: string, rating: number, comment: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitRating
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual & Polite', 'Sterile Technique']);

  if (!isOpen) return null;

  const tags = [
    'Punctual & Polite',
    'Sterile Technique',
    'Gentle & Reassuring',
    'Excellent Vitals Check',
    'Clear Medication Explanations',
    'Comforting Presence'
  ];

  const toggleTag = (tag: string) => {
    soundFX.playPop();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSelectStar = (star: number) => {
    setRating(star);
    soundFX.playStarRatingHover(star);
    if (star === 5) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#FFD166', '#FFB703', '#FB8500', '#C77DFF']
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playVisitCompleted();
    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#F59E0B', '#10B981', '#FFD166', '#4CC9F0', '#9D4EDD']
    });
    const combinedComment = selectedTags.length > 0
      ? `${selectedTags.join(', ')}. ${comment}`
      : comment;
    onSubmitRating(booking.id, rating, combinedComment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/15 p-6 text-white">
        <div className="text-center pb-4 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 text-[#C77DFF] flex items-center justify-center mx-auto mb-3 border-2 border-purple-400/30">
            <Heart className="w-8 h-8 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Visit Closeout &amp; Rating</span>
          <h3 className="text-xl font-black text-white mt-1">Rate Your We Care Nurse</h3>
          <p className="text-xs text-slate-300 mt-1">
            How was your homecare visit with <strong className="text-white">{booking.nurseName || 'your Nurse'}</strong>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Star Rating Control */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleSelectStar(star)}
                  onMouseEnter={() => {
                    setHoverRating(star);
                    soundFX.playStarRatingHover(star);
                  }}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-200 mt-2">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional Care' :
               rating === 4 ? '⭐⭐⭐⭐ Great Experience' :
               rating === 3 ? '⭐⭐⭐ Satisfactory' :
               rating === 2 ? '⭐⭐ Needs Improvement' : '⭐ Unsatisfactory'}
            </span>
          </div>

          {/* Quick Tag Highlights */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              What went well during this home visit?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      isSelected
                        ? 'bg-[#1E1B4B] text-white shadow-md shadow-purple-950/50 border border-purple-400/40'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Review */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Add Personal Testimonial / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Nurse was on time, gentle with dressing, and explained the medication clearly..."
              className="w-full p-3 rounded-2xl border border-white/15 bg-white/5 focus:bg-white/10 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/40 focus:outline-none transition"
            />
          </div>

          {/* Clinical Notes Reminder */}
          {booking.clinicalNotes && (
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-300" />
              <span>
                Clinical notes have been recorded and saved in your patient health log.
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/15 text-slate-300 font-bold text-xs hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-purple-950/50"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
