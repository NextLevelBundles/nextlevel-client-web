import { auth } from "@/auth";
import { redirect, RedirectType } from "next/navigation";

export default async function Onboarding() {
    const session = await auth();

    const groups = session?.['cognito:groups'] || [];
    const customerId = session?.['custom:customerId'];

    if(customerId && groups.includes('Customer')) {
        redirect('/', RedirectType.replace)
    }

    console.log(session);
    return (
        <html>
            <body className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-4">Welcome to NextLevel!</h1>
                    <p className="mb-6">Lets get you set up with your account.</p>
                    {/* Add your onboarding form or components here */}
                </div>
            </body>
        </html>
    )
}