interface FeedbackModalProps {
    visivel: boolean;
    tipo?: 'sucesso' | 'erro';
    titulo: string;
    mensagem: string;
    aoFechar: () => void;
}

export function FeedbackModal({ visivel, tipo = 'sucesso', titulo, mensagem, aoFechar }: FeedbackModalProps) {
    if (!visivel) return null;

    const isSucesso = tipo === 'sucesso';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all animate-scaleUp">
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                    isSucesso ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                    {isSucesso ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                    {titulo}
                </h3>
                
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {mensagem}
                </p>

                <button
                    onClick={aoFechar}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white transition shadow-md ${
                        isSucesso 
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' 
                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                    }`}
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}

