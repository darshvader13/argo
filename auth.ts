import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    theme: {
        colorScheme: "dark",
        logo: "/next.svg", 
    },
    callbacks: {
        authorized({ request, auth }) {
            const { pathname } = request.nextUrl
            if (pathname.startsWith("/dashboard")) return !!auth
            return true
        },
    },
})
