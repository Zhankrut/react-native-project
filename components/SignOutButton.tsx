import { icons } from '@/constants'
import { useClerk } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Image, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
    // Use `useClerk()` to access the `signOut()` function
    const { signOut } = useClerk()
    const handleSignOut = async () => {
        try {
            await signOut()
            // Redirect to your desired page
            router.replace('/(auth)/sign-in');
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }
    return (
        <TouchableOpacity onPress={handleSignOut}>
            <Image
                source={icons.out}
                className='w-6 h-6 mr-[50px]'
            />
        </TouchableOpacity>
    )
}