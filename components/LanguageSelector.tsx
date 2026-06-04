"use client";

interface Props {
    selectedLanguage: SupportedLanguage;
    onLanguageChange: (lang: SupportedLanguage) => void;
}

type SupportedLanguage = "es" | "en" | "it" | "fr" | "de";

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: Props) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium uppercase">Traducir al:</span>
            <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="text-sm bg-gray-100 border-none rounded-md py-1 px-2 cursor-pointer hover:bg-gray-200 focus:ring-0 text-gray-700 font-medium"
            >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇺🇸 Inglés</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="fr">🇫🇷 Francés</option>
                <option value="de">🇩🇪 Alemán</option>
            </select>
        </div>
    );
}
