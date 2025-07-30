import CustomButton from '@/components/CustomButton'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constants'
import { fetchAPI } from '@/lib/fetch'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, ScrollView, Text, View } from 'react-native'
import Modal from 'react-native-modal'
import InputField from '../../components/InputField'

const SignUp = () => {

    const { isLoaded, signUp, setActive } = useSignUp()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [varification, setVarification] = useState({
        state: 'default',
        error: "",
        code: "",
    });

    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        if (!isLoaded) return

        // Start sign-up process using email and password provided
        try {
            await signUp.create({
                emailAddress: form.email,
                password: form.password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setVarification({ ...varification, state: 'pending' })
        } catch (err: any) {
            Alert.alert("Error", err.errors[0].longMessage)
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded) return

        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code: varification.code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                //TODO: Create a database user
                await fetchAPI('/(api)/user', {
                    method: "POST",
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        clerkId: signUpAttempt.createdUserId,
                    }),
                })
                await setActive({ session: signUpAttempt.createdSessionId })
                setVarification({ ...varification, state: 'success' })
            } else {
                setVarification({ ...varification, error: "varification failed", state: 'failed' })
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err: any) {
            setVarification({ ...varification, error: err.errors[0].longMessage, state: 'failed' })
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <ScrollView className='flex-1 bg-white'>
            <View className='flex-1 bg-white'>
                <View className='relative w-full h-[250px]'>
                    <Image
                        source={images.signUpCar}
                        className='z-0 w-full h-[250px]'
                    />
                    <Text className='text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5'>Create your account</Text>
                </View>
                <View className='p-5'>
                    <InputField
                        label='Name'
                        placeholder="Enter your name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(value) => setForm({ ...form, name: value })}
                    />
                    <InputField
                        label='Email'
                        placeholder="Enter your email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(value) => setForm({ ...form, email: value })}
                    />
                    <InputField
                        label='Password'
                        placeholder="Enter your password"
                        icon={icons.lock}
                        value={form.password}
                        onChangeText={(value) => setForm({ ...form, password: value })}
                        secureTextEntry={true}
                    />
                    <CustomButton
                        title='singUp'
                        onPress={onSignUpPress}
                        className='mt-6'
                    />
                    <OAuth />
                    <Link
                        href='/sign-in'
                        className='text-lg text-center text-general-200 mt-10'
                    >
                        <Text>Already have an account?</Text>
                        <Text className='text-primary-500'>Log In</Text>
                    </Link>
                </View>
                <Modal
                    isVisible={varification.state === 'pending'}
                    onModalHide={() => setVarification({ ...varification, state: "success" })}
                >
                    <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px]'>
                        <Text className='text-2xl font-JakartaExtraBold mb-2'> Verification</Text>
                        <Text className='font-Jakarta mb-5'>We've sent a varification code to {form.email}</Text>
                        <InputField
                            label="Code"
                            icon={icons.lock}
                            placeholder='12345'
                            value={varification.code}
                            keyboardType='numeric'
                            onChangeText={(code) => setVarification({ ...varification, code })}
                        />
                        {varification.error && (
                            <Text className='text-red-500 text-sm mt-1'>
                                {varification.error}
                            </Text>
                        )}

                        <CustomButton
                            title='Verify Email'
                            onPress={onVerifyPress}
                            className='mt-5 bg-success-500'
                        />
                    </View>
                </Modal>
                <Modal isVisible={varification.state === 'success'}>
                    <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px]'>
                        <Image
                            source={images.check}
                            className='w-[110px] h-[110px] mx-auto my-5'
                        />
                        <Text className='text-3xl font-JakartaBold text-center'> Verified</Text>
                        <Text className='text-base text-gray-400 font-Jakarta text-center mt-2'>You have successfully verified your account.</Text>
                        <CustomButton
                            title="Browse Home"
                            onPress={() => router.replace("/(root)/(tabs)/home")}
                        />
                    </View>
                </Modal>
            </View>
        </ScrollView>
    )
}

export default SignUp