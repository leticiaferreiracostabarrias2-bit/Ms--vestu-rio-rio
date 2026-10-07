export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-500 text-center p-4 border-t border-slate-800 mt-auto">
            <p>
                &copy; {new Date().getFullYear()} Projeto Kamikase. Todos os direitos reservados.
            </p>
        </footer>
    );
}