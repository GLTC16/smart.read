import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

export function useTTS(content: string | string[]) {
    const { isPlaying, setIsPlaying, ttsPosition, setTtsPosition, selectedVoice } = useStore();
    const [sentences, setSentences] = useState<string[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Split content into sentences
    useEffect(() => {
        let s: string[] = [];
        if (Array.isArray(content)) {
            s = content;
        } else if (content) {
            // Simple sentence splitting (can be improved with Intl.Segmenter)
            s = content.match(/[^.!?]+[.!?]+|\s*$/g)?.map(t => t.trim()).filter(Boolean) || [];
        }
        setSentences(s);
    }, [content]);

    // Handle Playback
    useEffect(() => {
        if (!isPlaying) {
            window.speechSynthesis.cancel();
            return;
        }

        if (sentences.length === 0 || ttsPosition >= sentences.length) {
            if (ttsPosition >= sentences.length && sentences.length > 0) {
                setIsPlaying(false); // Stop when done
                setTtsPosition(0); // Reset or stay at end?
            }
            return;
        }

        const text = sentences[ttsPosition];
        const u = new SpeechSynthesisUtterance(text);
        utteranceRef.current = u;

        // Apply voice
        if (selectedVoice) {
            const voiceObj = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice);
            if (voiceObj) u.voice = voiceObj;
        }

        u.onend = () => {
            setTtsPosition(ttsPosition + 1);
        };

        u.onerror = (e) => {
            console.error("TTS Error", e);
            setIsPlaying(false);
        };

        window.speechSynthesis.speak(u);

        return () => {
            // Cleanup? If unmounts, cancel. But useEffect depends on ttsPosition, so it runs per sentence.
            // We cancel only if isPlaying becomes false (handled above).
            // But if ttsPosition changes, we want the previous one to stop? 
            // No, ttsPosition change triggers this effect => starts separate speak() call? 
            // window.speechSynthesis queues them. We should cancel before speaking new one to be precise.
        };
    }, [isPlaying, ttsPosition, sentences, selectedVoice, setIsPlaying, setTtsPosition]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return { sentences };
}
