// lib/translations.ts
// Complete i18n dictionary for SmartRead UI — 8 languages

export type UILanguage = 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';

export const SUPPORTED_UI_LANGUAGES: { code: UILanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

type TranslationKeys = {
    // Landing
    heroTitle: string;
    tagline1: string;
    tagline2: string;
    heroSubtitle: string;
    dragTitle: string;
    dragTitleActive: string;
    dragSubtitle: string;
    clickToSelect: string;
    featureNoInstall: string;
    featureNoInstallDesc: string;
    featureTranslate: string;
    featureTranslateDesc: string;
    featurePrivate: string;
    featurePrivateDesc: string;
    badgeAITranslation: string;
    footerNote: string;

    // Reader / BottomBar
    page: string;
    reading: string;
    previousPage: string;
    nextPage: string;
    zoomIn: string;
    zoomOut: string;
    closeBook: string;
    tableOfContents: string;

    // Sidebar
    contents: string;
    noTocAvailable: string;

    // Translation Tooltip
    translating: string;
    copyTranslation: string;
    translationError: string;
    translationUnavailable: string;

    // PageCounter
    pageOf: string;      // "Page {current} of {total}"
    chapterOf: string;   // "Chapter {current} of {total}"

    // Errors
    pdfLoadError: string;
    txtLoadError: string;
    loadingPdf: string;
    loadingEpub: string;
    readingFile: string;
    loadingDocument: string;
};

const translations: Record<UILanguage, TranslationKeys> = {
    en: {
        heroTitle: 'SmartRead',
        tagline1: 'Read faster.',
        tagline2: 'Understand better.',
        heroSubtitle: 'The smart reader for students. Upload your book, select any word and translate it instantly.',
        dragTitle: 'Drag your book here',
        dragTitleActive: 'Drop your book here!',
        dragSubtitle: 'or',
        clickToSelect: 'click to select a file',
        featureNoInstall: 'No installations',
        featureNoInstallDesc: 'Read PDF, EPUB and TXT directly in your browser. Fully offline.',
        featureTranslate: 'Instant translation',
        featureTranslateDesc: 'Select any word or phrase and get its translation instantly.',
        featurePrivate: '100% private',
        featurePrivateDesc: 'Your files never leave your device. Zero servers.',
        badgeAITranslation: 'AI Translation',
        footerNote: 'SmartRead v2.0 — Your files never leave your device.',
        page: 'PAGE',
        reading: 'READING',
        previousPage: 'Previous Page',
        nextPage: 'Next Page',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        closeBook: 'Close book',
        tableOfContents: 'Table of Contents',
        contents: 'Contents',
        noTocAvailable: 'No table of contents available.',
        translating: 'Translating…',
        copyTranslation: 'Copy translation',
        translationError: 'Could not translate the text.',
        translationUnavailable: 'Translation unavailable right now. Try again later.',
        pdfLoadError: 'Could not load the PDF. Check that the file is not corrupted.',
        txtLoadError: 'Error loading the file. Please try again.',
        loadingPdf: 'Loading PDF viewer…',
        loadingEpub: 'Loading EPUB…',
        readingFile: 'Reading file…',
        loadingDocument: 'Loading document…',
        pageOf: 'Page {current} of {total}',
        chapterOf: 'Chapter {current} of {total}',
    },
    es: {
        heroTitle: 'SmartRead',
        tagline1: 'Lee más rápido.',
        tagline2: 'Entiende mejor.',
        heroSubtitle: 'El lector inteligente para estudiantes. Sube tu libro, selecciona cualquier palabra y tradúcela al instante.',
        dragTitle: 'Arrastra tu libro aquí',
        dragTitleActive: '¡Suelta aquí tu libro!',
        dragSubtitle: 'o',
        clickToSelect: 'haz clic para seleccionar',
        featureNoInstall: 'Sin instalaciones',
        featureNoInstallDesc: 'Lee PDF, EPUB y TXT directamente en tu navegador. Todo offline.',
        featureTranslate: 'Traducción instantánea',
        featureTranslateDesc: 'Selecciona cualquier palabra o frase y obtén su traducción al instante.',
        featurePrivate: '100% privado',
        featurePrivateDesc: 'Tus archivos nunca salen de tu dispositivo. Zero servidores.',
        badgeAITranslation: 'Traducción IA',
        footerNote: 'SmartRead v2.0 — Tus archivos nunca salen de tu dispositivo.',
        page: 'PÁGINA',
        reading: 'LEYENDO',
        previousPage: 'Página anterior',
        nextPage: 'Página siguiente',
        zoomIn: 'Acercar',
        zoomOut: 'Alejar',
        closeBook: 'Cerrar libro',
        tableOfContents: 'Tabla de Contenidos',
        contents: 'Contenido',
        noTocAvailable: 'Sin tabla de contenidos disponible.',
        translating: 'Traduciendo…',
        copyTranslation: 'Copiar traducción',
        translationError: 'Error al traducir el texto.',
        translationUnavailable: 'No se pudo traducir en este momento. Intenta más tarde.',
        pdfLoadError: 'No se pudo cargar el PDF. Verifica que el archivo no esté dañado.',
        txtLoadError: 'Error al cargar el archivo. Por favor, inténtalo de nuevo.',
        loadingPdf: 'Cargando visor PDF…',
        loadingEpub: 'Cargando EPUB…',
        readingFile: 'Leyendo archivo…',
        loadingDocument: 'Cargando documento…',
        pageOf: 'Página {current} de {total}',
        chapterOf: 'Capítulo {current} de {total}',
    },
    it: {
        heroTitle: 'SmartRead',
        tagline1: 'Leggi più veloce.',
        tagline2: 'Comprendi meglio.',
        heroSubtitle: 'Il lettore intelligente per studenti. Carica il tuo libro, seleziona qualsiasi parola e traducila istantaneamente.',
        dragTitle: 'Trascina il tuo libro qui',
        dragTitleActive: 'Rilascia il libro qui!',
        dragSubtitle: 'o',
        clickToSelect: 'clicca per selezionare',
        featureNoInstall: 'Nessuna installazione',
        featureNoInstallDesc: 'Leggi PDF, EPUB e TXT direttamente nel browser. Tutto offline.',
        featureTranslate: 'Traduzione istantanea',
        featureTranslateDesc: 'Seleziona qualsiasi parola o frase e ottieni la traduzione istantaneamente.',
        featurePrivate: '100% privato',
        featurePrivateDesc: 'I tuoi file non lasciano mai il tuo dispositivo. Zero server.',
        badgeAITranslation: 'Traduzione IA',
        footerNote: 'SmartRead v2.0 — I tuoi file non lasciano mai il tuo dispositivo.',
        page: 'PAGINA',
        reading: 'LETTURA',
        previousPage: 'Pagina precedente',
        nextPage: 'Pagina successiva',
        zoomIn: 'Zoom avanti',
        zoomOut: 'Zoom indietro',
        closeBook: 'Chiudi libro',
        tableOfContents: 'Indice',
        contents: 'Contenuto',
        noTocAvailable: 'Nessun indice disponibile.',
        translating: 'Traduzione in corso…',
        copyTranslation: 'Copia traduzione',
        translationError: 'Impossibile tradurre il testo.',
        translationUnavailable: 'Traduzione non disponibile. Riprova più tardi.',
        pdfLoadError: 'Impossibile caricare il PDF. Verifica che il file non sia corrotto.',
        txtLoadError: 'Errore nel caricamento del file. Riprova.',
        loadingPdf: 'Caricamento visore PDF…',
        loadingEpub: 'Caricamento EPUB…',
        readingFile: 'Lettura file…',
        loadingDocument: 'Caricamento documento…',
        pageOf: 'Pagina {current} di {total}',
        chapterOf: 'Capitolo {current} di {total}',
    },
    fr: {
        heroTitle: 'SmartRead',
        tagline1: 'Lisez plus vite.',
        tagline2: 'Comprenez mieux.',
        heroSubtitle: 'Le lecteur intelligent pour étudiants. Téléchargez votre livre, sélectionnez un mot et traduisez-le instantanément.',
        dragTitle: 'Glissez votre livre ici',
        dragTitleActive: 'Déposez votre livre ici !',
        dragSubtitle: 'ou',
        clickToSelect: 'cliquez pour sélectionner',
        featureNoInstall: 'Sans installation',
        featureNoInstallDesc: 'Lisez PDF, EPUB et TXT directement dans votre navigateur. Tout hors ligne.',
        featureTranslate: 'Traduction instantanée',
        featureTranslateDesc: 'Sélectionnez un mot ou une phrase et obtenez sa traduction instantanément.',
        featurePrivate: '100% privé',
        featurePrivateDesc: 'Vos fichiers ne quittent jamais votre appareil. Zéro serveur.',
        badgeAITranslation: 'Traduction IA',
        footerNote: 'SmartRead v2.0 — Vos fichiers ne quittent jamais votre appareil.',
        page: 'PAGE',
        reading: 'LECTURE',
        previousPage: 'Page précédente',
        nextPage: 'Page suivante',
        zoomIn: 'Zoom avant',
        zoomOut: 'Zoom arrière',
        closeBook: 'Fermer le livre',
        tableOfContents: 'Table des matières',
        contents: 'Contenu',
        noTocAvailable: 'Aucune table des matières disponible.',
        translating: 'Traduction en cours…',
        copyTranslation: 'Copier la traduction',
        translationError: 'Impossible de traduire le texte.',
        translationUnavailable: 'Traduction indisponible. Réessayez plus tard.',
        pdfLoadError: 'Impossible de charger le PDF. Vérifiez que le fichier n\'est pas corrompu.',
        txtLoadError: 'Erreur lors du chargement. Veuillez réessayer.',
        loadingPdf: 'Chargement du lecteur PDF…',
        loadingEpub: 'Chargement EPUB…',
        readingFile: 'Lecture du fichier…',
        loadingDocument: 'Chargement du document…',
        pageOf: 'Page {current} sur {total}',
        chapterOf: 'Chapitre {current} sur {total}',
    },
    de: {
        heroTitle: 'SmartRead',
        tagline1: 'Schneller lesen.',
        tagline2: 'Besser verstehen.',
        heroSubtitle: 'Der intelligente Reader für Studierende. Lade dein Buch hoch, wähle ein Wort aus und übersetze es sofort.',
        dragTitle: 'Ziehe dein Buch hierher',
        dragTitleActive: 'Lass dein Buch hier fallen!',
        dragSubtitle: 'oder',
        clickToSelect: 'klicke zum Auswählen',
        featureNoInstall: 'Keine Installation',
        featureNoInstallDesc: 'Lies PDF, EPUB und TXT direkt im Browser. Komplett offline.',
        featureTranslate: 'Sofortige Übersetzung',
        featureTranslateDesc: 'Wähle ein Wort oder einen Satz aus und erhalte sofort die Übersetzung.',
        featurePrivate: '100% privat',
        featurePrivateDesc: 'Deine Dateien verlassen nie dein Gerät. Null Server.',
        badgeAITranslation: 'KI-Übersetzung',
        footerNote: 'SmartRead v2.0 — Deine Dateien verlassen nie dein Gerät.',
        page: 'SEITE',
        reading: 'LESEN',
        previousPage: 'Vorherige Seite',
        nextPage: 'Nächste Seite',
        zoomIn: 'Vergrößern',
        zoomOut: 'Verkleinern',
        closeBook: 'Buch schließen',
        tableOfContents: 'Inhaltsverzeichnis',
        contents: 'Inhalt',
        noTocAvailable: 'Kein Inhaltsverzeichnis verfügbar.',
        translating: 'Übersetzung läuft…',
        copyTranslation: 'Übersetzung kopieren',
        translationError: 'Text konnte nicht übersetzt werden.',
        translationUnavailable: 'Übersetzung derzeit nicht möglich. Versuche es später.',
        pdfLoadError: 'PDF konnte nicht geladen werden. Prüfe, ob die Datei beschädigt ist.',
        txtLoadError: 'Fehler beim Laden der Datei. Bitte versuche es erneut.',
        loadingPdf: 'PDF-Viewer wird geladen…',
        loadingEpub: 'EPUB wird geladen…',
        readingFile: 'Datei wird gelesen…',
        loadingDocument: 'Dokument wird geladen…',
        pageOf: 'Seite {current} von {total}',
        chapterOf: 'Kapitel {current} von {total}',
    },
    pt: {
        heroTitle: 'SmartRead',
        tagline1: 'Leia mais rápido.',
        tagline2: 'Entenda melhor.',
        heroSubtitle: 'O leitor inteligente para estudantes. Carregue seu livro, selecione qualquer palavra e traduza instantaneamente.',
        dragTitle: 'Arraste seu livro aqui',
        dragTitleActive: 'Solte seu livro aqui!',
        dragSubtitle: 'ou',
        clickToSelect: 'clique para selecionar',
        featureNoInstall: 'Sem instalação',
        featureNoInstallDesc: 'Leia PDF, EPUB e TXT diretamente no navegador. Tudo offline.',
        featureTranslate: 'Tradução instantânea',
        featureTranslateDesc: 'Selecione qualquer palavra ou frase e obtenha a tradução instantaneamente.',
        featurePrivate: '100% privado',
        featurePrivateDesc: 'Seus arquivos nunca saem do seu dispositivo. Zero servidores.',
        badgeAITranslation: 'Tradução IA',
        footerNote: 'SmartRead v2.0 — Seus arquivos nunca saem do seu dispositivo.',
        page: 'PÁGINA',
        reading: 'LENDO',
        previousPage: 'Página anterior',
        nextPage: 'Próxima página',
        zoomIn: 'Aumentar zoom',
        zoomOut: 'Diminuir zoom',
        closeBook: 'Fechar livro',
        tableOfContents: 'Índice',
        contents: 'Conteúdo',
        noTocAvailable: 'Nenhum índice disponível.',
        translating: 'Traduzindo…',
        copyTranslation: 'Copiar tradução',
        translationError: 'Não foi possível traduzir o texto.',
        translationUnavailable: 'Tradução indisponível. Tente novamente mais tarde.',
        pdfLoadError: 'Não foi possível carregar o PDF. Verifique se o arquivo não está corrompido.',
        txtLoadError: 'Erro ao carregar o arquivo. Tente novamente.',
        loadingPdf: 'Carregando visualizador PDF…',
        loadingEpub: 'Carregando EPUB…',
        readingFile: 'Lendo arquivo…',
        loadingDocument: 'Carregando documento…',
        pageOf: 'Página {current} de {total}',
        chapterOf: 'Capítulo {current} de {total}',
    },
    ja: {
        heroTitle: 'SmartRead',
        tagline1: 'もっと速く読む。',
        tagline2: 'もっとよく理解する。',
        heroSubtitle: '学生のためのスマートリーダー。本をアップロードして、任意の単語を選択し、瞬時に翻訳します。',
        dragTitle: 'ここに本をドラッグ',
        dragTitleActive: 'ここにドロップ！',
        dragSubtitle: 'または',
        clickToSelect: 'クリックして選択',
        featureNoInstall: 'インストール不要',
        featureNoInstallDesc: 'PDF、EPUB、TXTをブラウザで直接読めます。完全オフライン。',
        featureTranslate: '即時翻訳',
        featureTranslateDesc: '任意の単語やフレーズを選択して、瞬時に翻訳を取得。',
        featurePrivate: '100%プライベート',
        featurePrivateDesc: 'ファイルがデバイスの外に出ることはありません。サーバーゼロ。',
        badgeAITranslation: 'AI翻訳',
        footerNote: 'SmartRead v2.0 — ファイルがデバイスの外に出ることはありません。',
        page: 'ページ',
        reading: '読書中',
        previousPage: '前のページ',
        nextPage: '次のページ',
        zoomIn: 'ズームイン',
        zoomOut: 'ズームアウト',
        closeBook: '本を閉じる',
        tableOfContents: '目次',
        contents: '目次',
        noTocAvailable: '目次はありません。',
        translating: '翻訳中…',
        copyTranslation: '翻訳をコピー',
        translationError: 'テキストを翻訳できませんでした。',
        translationUnavailable: '現在翻訳できません。後でお試しください。',
        pdfLoadError: 'PDFを読み込めませんでした。ファイルが破損していないか確認してください。',
        txtLoadError: 'ファイルの読み込みエラー。もう一度お試しください。',
        loadingPdf: 'PDFビューアを読み込み中…',
        loadingEpub: 'EPUBを読み込み中…',
        readingFile: 'ファイルを読み込み中…',
        loadingDocument: 'ドキュメントを読み込み中…',
        pageOf: '{total}ページ中{current}ページ',
        chapterOf: '{total}章中{current}章',
    },
    zh: {
        heroTitle: 'SmartRead',
        tagline1: '阅读更快。',
        tagline2: '理解更好。',
        heroSubtitle: '学生的智能阅读器。上传你的书籍，选择任意单词，即时翻译。',
        dragTitle: '将书籍拖到这里',
        dragTitleActive: '将书籍放在这里！',
        dragSubtitle: '或',
        clickToSelect: '点击选择文件',
        featureNoInstall: '无需安装',
        featureNoInstallDesc: '直接在浏览器中阅读PDF、EPUB和TXT。完全离线。',
        featureTranslate: '即时翻译',
        featureTranslateDesc: '选择任意单词或短语，即时获取翻译。',
        featurePrivate: '100%隐私',
        featurePrivateDesc: '您的文件永远不会离开您的设备。零服务器。',
        badgeAITranslation: 'AI翻译',
        footerNote: 'SmartRead v2.0 — 您的文件永远不会离开您的设备。',
        page: '页面',
        reading: '阅读中',
        previousPage: '上一页',
        nextPage: '下一页',
        zoomIn: '放大',
        zoomOut: '缩小',
        closeBook: '关闭书籍',
        tableOfContents: '目录',
        contents: '目录',
        noTocAvailable: '无可用目录。',
        translating: '翻译中…',
        copyTranslation: '复制翻译',
        translationError: '无法翻译该文本。',
        translationUnavailable: '翻译暂时不可用。请稍后再试。',
        pdfLoadError: '无法加载PDF。请检查文件是否损坏。',
        txtLoadError: '文件加载错误。请重试。',
        loadingPdf: '正在加载PDF查看器…',
        loadingEpub: '正在加载EPUB…',
        readingFile: '正在读取文件…',
        loadingDocument: '正在加载文档…',
        pageOf: '第{current}页，共{total}页',
        chapterOf: '第{current}章，共{total}章',
    },
};

export default translations;

/**
 * Detects the user's browser language and maps it to a supported UILanguage.
 * Falls back to 'en' if the language is not supported.
 */
export function detectBrowserLanguage(): UILanguage {
    if (typeof navigator === 'undefined') return 'en';
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase() ?? 'en';
    const supported: UILanguage[] = ['es', 'en', 'it', 'fr', 'de', 'pt', 'ja', 'zh'];
    return supported.includes(browserLang as UILanguage) ? (browserLang as UILanguage) : 'en';
}
