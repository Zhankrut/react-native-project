import { icons } from '@/constants'
import { fetchAPI } from '@/lib/fetch'
import { useSSO } from '@clerk/clerk-expo'
import * as AuthSession from 'expo-auth-session'
import React, { useCallback } from 'react'
import { Image, Text, View } from 'react-native'
import CustomButton from './CustomButton'

const OAuth = () => {
    const { startSSOFlow } = useSSO();

    const onPress = useCallback(async () => {
        try {
            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
                strategy: 'oauth_google',
                // For web, defaults to current path
                // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
                // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
                redirectUrl: AuthSession.makeRedirectUri({ scheme: "uberclone", path: '/(root)/(tabs)/home' }),
            })

            // If sign in was successful, set the active session
            if (createdSessionId) {
                if (setActive) {
                    setActive!({ session: createdSessionId })
                }

                if (signUp?.createdUserId) {
                    const res = await fetchAPI('/(api)/user', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: `${signUp.firstName} ${signUp.lastName}`,
                            email: signUp.emailAddress,
                            clerkId: signUp.createdUserId,
                        }),
                    })

                    if (!res) {
                        console.log('cannot register the user into the database :: ', res);
                    } else {
                        console.log('user successfully register into the database :: ', res);
                    }
                } else {
                    console.log(' :: cannot create the user in database.');
                }

            }


        } catch (err: any) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.log('error occured during the google oAuth :: ', err)
            return {
                success: false,
                message: err?.errors[0]?.longMessage,
            }
        }
    }, [])

    return (
        <View>
            <View className='flex flex-row justify-center items-center mt-4 gap-x-3'>
                <View className='flex-1 h-[1px] bg-general-100' />
                <Text className='text-lg'>Or</Text>
                <View className='flex-1 h-[1px] bg-general-100' />
            </View>

            <CustomButton
                title="Log In with Google"
                className='mt-5 w-full shadow-none'
                IconLeft={() => {
                    return (
                        <Image
                            source={icons.google}
                            resizeMode='contain'
                            className='w-5 h-5 mx-2'
                        />
                    )
                }}
                bgVariant='outline'
                textVariant='primary'
                onPress={onPress}
            />
        </View>
    )
}

export default OAuth