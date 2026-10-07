import { LoginForm } from "../Loginform";

export function Login(){
    return(
        <div className="w-full max-w-md mx-auto py-12">
            <div className="md-8">
                <h2 className="text-4-xl font-extra-bold text-cyan-400 mb-2">
                    Central MS² Cash Flow
                </h2>
                <LoginForm/>
            </div>

        </div>
    )
}