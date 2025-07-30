import CustomButton from '@/components/CustomButton';
import DriverCard from '@/components/DriverCard';
import RideLayout from '@/components/RideLayout';
import { useDriverStore } from '@/store';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';

const ConfirmRide = () => {
    const {drivers, selectedDriver, setSelectedDriver} = useDriverStore();
    return (
        <RideLayout title='Confirm Ride'snapPoints={["65%","85%"]}>
            <FlatList
                data={drivers}
                renderItem={({item}) => (
                    <DriverCard 
                        item={item} 
                        selected={selectedDriver!}
                        setSelected={() => setSelectedDriver(item.id!)}
                    />
                )}
                ListFooterComponent={() => (
                    <View className='mx-5 mt-10'>
                        <CustomButton 
                        title='select ride'
                        onPress={() => router.push('/(root)/book-ride')}
                        />
                    </View>
                )}
            />
        </RideLayout>
    )
}

export default ConfirmRide;